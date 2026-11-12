import { supabaseAdmin } from "@/lib/supabase-admin";
import type { Coupon } from "@/lib/order-pricing";

export const ERET10_CODE = "ERET10";
export const ERET10_COUPON: Coupon = {
  code: ERET10_CODE,
  type: "percent",
  value: 10,
};

const PROMOTION_ENDED_MESSAGE =
  "Die ERET10-Aktion ist leider nicht mehr verfügbar.";
const FIRST_ORDER_MESSAGE =
  "ERET10 gilt nur für die erste Online-Bestellung und einmal pro Kunde.";

type PromotionResult = {
  created?: boolean;
  eligible?: boolean;
  order?: Record<string, unknown>;
  reason?: string;
};

export class Eret10ValidationError extends Error {}

export function requireEret10RequestId(value: unknown) {
  if (
    typeof value !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  ) {
    throw new Eret10ValidationError("Ungültige Bestellanfrage. Bitte versuche es erneut.");
  }
  return value;
}

export function isEret10(code: unknown) {
  return typeof code === "string" && code.trim().toUpperCase() === ERET10_CODE;
}

function promotionMessage(reason?: string) {
  if (reason === "sold_out" || reason === "inactive" || reason === "not_configured") {
    return PROMOTION_ENDED_MESSAGE;
  }
  if (reason === "not_first_order" || reason === "already_reserved") {
    return FIRST_ORDER_MESSAGE;
  }
  if (reason === "temporarily_reserved") {
    return "Alle verfügbaren ERET10-Plätze sind momentan reserviert. Bitte versuche es in einigen Minuten erneut.";
  }
  return "ERET10 konnte nicht angewendet werden.";
}

function requireIdentity(email: unknown, phone: unknown) {
  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    typeof phone !== "string" ||
    phone.trim().length < 3
  ) {
    throw new Eret10ValidationError(
      "Bitte gib zuerst eine gültige E-Mail-Adresse und Telefonnummer ein."
    );
  }
  return { email: email.trim(), phone: phone.trim() };
}

async function rpc(name: string, args: Record<string, unknown>) {
  const { data, error } = await supabaseAdmin.rpc(name, args);
  if (error) {
    const reason = [
      "sold_out",
      "inactive",
      "not_configured",
      "not_first_order",
      "already_reserved",
      "temporarily_reserved",
    ]
      .find((value) => error.message.includes(`ERET10_${value.toUpperCase()}`));
    throw new Eret10ValidationError(promotionMessage(reason));
  }
  return data as PromotionResult | null;
}

export async function checkEret10Eligibility(email: unknown, phone: unknown) {
  const identity = requireIdentity(email, phone);
  const result = await rpc("eret10_check_eligibility", {
    p_email: identity.email,
    p_phone: identity.phone,
  });
  if (!result?.eligible) {
    throw new Eret10ValidationError(promotionMessage(result?.reason));
  }
  return ERET10_COUPON;
}

export async function reserveEret10({
  email,
  phone,
  reservationId,
  expiresAt,
}: {
  email: unknown;
  phone: unknown;
  reservationId: string;
  expiresAt: string;
}) {
  const identity = requireIdentity(email, phone);
  await rpc("reserve_eret10", {
    p_email: identity.email,
    p_phone: identity.phone,
    p_reservation_id: reservationId,
    p_expires_at: expiresAt,
  });
  return ERET10_COUPON;
}

export async function cancelEret10Reservation(reservationId: string) {
  const { error } = await supabaseAdmin.rpc("cancel_eret10_reservation", {
    p_reservation_id: reservationId,
  });
  if (error) {
    console.error("ERET10 reservation cancellation failed", { code: error.code });
  }
}

export async function attachEret10StripeSession(
  reservationId: string,
  stripeSessionId: string
) {
  await rpc("attach_eret10_stripe_session", {
    p_reservation_id: reservationId,
    p_stripe_session_id: stripeSessionId,
  });
}

export async function cancelEret10StripeReservation(stripeSessionId: string) {
  const { error } = await supabaseAdmin.rpc("cancel_eret10_stripe_reservation", {
    p_stripe_session_id: stripeSessionId,
  });
  if (error) {
    console.error("ERET10 Stripe reservation cancellation failed", { code: error.code });
  }
}

export async function acceptEret10CashOrder({
  email,
  phone,
  requestId,
  order,
}: {
  email: unknown;
  phone: unknown;
  requestId: string;
  order: Record<string, unknown>;
}) {
  const identity = requireIdentity(email, phone);
  const result = await rpc("accept_eret10_cash_order", {
    p_email: identity.email,
    p_phone: identity.phone,
    p_request_id: requestId,
    p_order: order,
  });
  if (!result?.order) throw new Error("ERET10 order could not be saved");
  return { created: result.created === true, order: result.order };
}

export async function acceptEret10StripeOrder({
  reservationId,
  stripeSessionId,
  order,
}: {
  reservationId: string;
  stripeSessionId: string;
  order: Record<string, unknown>;
}) {
  const result = await rpc("accept_eret10_stripe_order", {
    p_reservation_id: reservationId,
    p_stripe_session_id: stripeSessionId,
    p_order: order,
  });
  if (!result?.order) throw new Error("ERET10 Stripe order could not be saved");
  return { created: result.created === true, order: result.order };
}
