export type OrderItem = {
  id?: string | number;
  name: string;
  price: number;
  qty: number;
};

export type Coupon = {
  code: string;
  type: "fixed" | "percent";
  value: number;
};

export type OrderPricing = {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  subtotalCents: number;
  deliveryFeeCents: number;
  discountCents: number;
  totalCents: number;
};

export function toCents(value: number) {
  return Math.round(value * 100);
}

export function centsToEuros(value: number) {
  return value / 100;
}

/**
 * Coupons intentionally apply to menu items only, never to the delivery fee.
 * Keeping this calculation pure makes it safe to reuse in the checkout UI and
 * in every server-side payment path.
 */
export function calculateOrderPricing({
  items,
  deliveryFee = 0,
  coupon,
}: {
  items: OrderItem[];
  deliveryFee?: number;
  coupon?: Coupon | null;
}): OrderPricing {
  const subtotalCents = items.reduce(
    (sum, item) => sum + toCents(item.price) * item.qty,
    0
  );
  const deliveryFeeCents = Math.max(toCents(deliveryFee), 0);

  let discountCents = 0;
  if (coupon?.type === "percent") {
    discountCents = Math.round(subtotalCents * (coupon.value / 100));
  } else if (coupon?.type === "fixed") {
    discountCents = toCents(coupon.value);
  }

  discountCents = Math.min(Math.max(discountCents, 0), subtotalCents);

  const totalCents = Math.max(
    subtotalCents + deliveryFeeCents - discountCents,
    0
  );

  return {
    subtotal: centsToEuros(subtotalCents),
    deliveryFee: centsToEuros(deliveryFeeCents),
    discount: centsToEuros(discountCents),
    total: centsToEuros(totalCents),
    subtotalCents,
    deliveryFeeCents,
    discountCents,
    totalCents,
  };
}

export function isValidOrderItem(value: unknown): value is OrderItem {
  if (!value || typeof value !== "object") return false;

  const item = value as Partial<OrderItem>;
  return (
    typeof item.name === "string" &&
    item.name.trim().length > 0 &&
    typeof item.price === "number" &&
    Number.isFinite(item.price) &&
    item.price > 0 &&
    item.price <= 500 &&
    typeof item.qty === "number" &&
    Number.isInteger(item.qty) &&
    item.qty > 0 &&
    item.qty <= 100
  );
}

export function buildOrderItems({
  items,
  deliveryFee,
  coupon,
  discount,
}: {
  items: OrderItem[];
  deliveryFee: number;
  coupon?: Coupon | null;
  discount: number;
}) {
  const orderItems = items.map(({ id, name, price, qty }) => ({
    ...(id === undefined ? {} : { id }),
    name,
    price,
    qty,
  }));

  if (deliveryFee > 0) {
    orderItems.push({ name: "🚚 Lieferung", price: deliveryFee, qty: 1 });
  }

  if (coupon && discount > 0) {
    orderItems.push({
      name: `🎁 Gutschein: ${coupon.code}`,
      price: -discount,
      qty: 1,
    });
  }

  return orderItems;
}
