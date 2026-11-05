import { menuData } from "@/store/menu";
import { isValidOrderItem, toCents, type OrderItem } from "@/lib/order-pricing";

export class OrderValidationError extends Error {}
export const INVALID_FULFILMENT_NOTICE = "Bitte Abholung oder Lieferung auswählen.";

export function validateFulfilment(type: unknown) {
  if (type !== "pickup" && type !== "delivery") {
    throw new OrderValidationError(INVALID_FULFILMENT_NOTICE);
  }
}

/** Resolve the existing homepage IDs and menu modifier IDs against our catalog.
 * Never accept the browser's product name or price as authoritative. */
export function resolveOrderItems(value: unknown): OrderItem[] {
  if (!Array.isArray(value) || !value.length || value.length > 100) {
    throw new OrderValidationError("Ungültiger Warenkorb.");
  }
  return value.map((entry) => {
    if (!isValidOrderItem(entry) || typeof entry.id !== "string") {
      throw new OrderValidationError("Ungültiger Artikel.");
    }
    const product = menuData.flatMap((section) => section.items)
      .find((item) => entry.id === item.id || (entry.id as string).startsWith(`${item.id}-`));
    if (!product) throw new OrderValidationError("Artikel nicht gefunden.");
    let name = product.name;
    let price = product.price;
    if (entry.id !== product.id) {
      const [milkId, ...extraIds] = entry.id.slice(product.id.length + 1).split("-");
      const ids = extraIds.filter(Boolean);
      const milk = product.options?.[0]?.values.find((option) => option.id === milkId);
      if ((product.options?.length && !milk) || (!product.options?.length && milkId !== "normal") || new Set(ids).size !== ids.length) {
        throw new OrderValidationError("Ungültige Artikelauswahl.");
      }
      const extras = product.extras.filter((extra) => ids.includes(extra.id));
      if (extras.length !== ids.length) throw new OrderValidationError("Ungültige Extras.");
      if (milk) { name += ` (${milk.name})`; price += milk.price; }
      if (extras.length) name += " + " + extras.map((extra) => extra.name).join(", ");
      price += extras.reduce((sum, extra) => sum + extra.price, 0);
    }
    if (toCents(entry.price) !== toCents(price)) {
      throw new OrderValidationError("Der Artikelpreis hat sich geändert. Bitte aktualisiere deinen Warenkorb.");
    }
    return { id: entry.id, name, price, qty: entry.qty };
  });
}

export function validateCustomer(value: unknown) {
  if (!value || typeof value !== "object") throw new OrderValidationError("Bitte Kontaktdaten angeben.");
  const form = value as Record<string, unknown>;
  const text = (key: string, max: number, required = true) => {
    const value = form[key];
    if ((!required && (value === undefined || value === ""))) return "";
    if (typeof value !== "string" || value.trim().length > max || (required && !value.trim())) {
      throw new OrderValidationError("Bitte gültige Kontaktdaten angeben.");
    }
    return value.trim();
  };
  const email = text("email", 254);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new OrderValidationError("Ungültige E-Mail.");
  return { name: text("name", 150), phone: text("phone", 50), email, comment: text("comment", 500, false), address: "" };
}
