import { NextResponse } from "next/server";
import { saveOrder } from "@/lib/saveOrder";
import { sendOrderEmail } from "@/lib/sendOrderEmail";
import {
  buildOrderItems,
  calculateOrderPricing,
  type OrderItem,
} from "@/lib/order-pricing";
import {
  CouponValidationError,
  getValidCoupon,
  incrementCouponUsage,
} from "@/lib/coupons";
import { sendOrderTelegram } from "@/lib/sendOrderTelegram";
import {
  getOrderingAvailability,
  validateOrderTiming,
} from "@/lib/ordering-availability";
import {
  OrderValidationError,
  resolveOrderItems,
  validateCustomer,
  validateFulfilment,
} from "@/lib/order-validation";
import { resolveDeliveryQuoteFromAddress } from "@/lib/delivery-policy";

export async function POST(req: Request) {
  const now = new Date();
  const orderingAvailability = getOrderingAvailability(now);
  if (!orderingAvailability.isAvailable) {
    return NextResponse.json(
      { error: orderingAvailability.message, orderingAvailable: false },
      { status: 403 }
    );
  }

  try {
    const {
      items: requestedItems,
      form: requestedForm,
      payment,
      deliveryType,
      timeType,
      selectedTime,
      scheduleDate: requestedDate,
      coupon: couponCode,
    } = await req.json();

    if (payment !== "cash") {
      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
    }

    const timingError = validateOrderTiming({
      timeType,
      selectedTime,
      requestedDate,
      now,
    });
    if (timingError) {
      return NextResponse.json({ error: timingError }, { status: 400 });
    }
    validateFulfilment(deliveryType);
    const items = resolveOrderItems(requestedItems);
    const form = validateCustomer(requestedForm);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

    let deliveryFee = 0;
    if (deliveryType === "delivery") {
      const rawAddress = typeof requestedForm?.address === "string" ? requestedForm.address.trim() : "";
      if (!rawAddress) throw new OrderValidationError("Bitte Lieferadresse angeben.");
      const quote = await resolveDeliveryQuoteFromAddress(rawAddress);
      if (!quote.available) throw new OrderValidationError("Lieferung nicht verfügbar");
      if (subtotal < 15) throw new OrderValidationError("Mindestbestellwert für Lieferung ist 15 €");
      deliveryFee = quote.fee;
      form.address = rawAddress;
    }

    const coupon = await getValidCoupon(couponCode);
    const pricing = calculateOrderPricing({
      items: items as OrderItem[],
      deliveryFee,
      coupon,
    });
    const orderItems = buildOrderItems({
      items: items as OrderItem[],
      deliveryFee: pricing.deliveryFee,
      coupon,
      discount: pricing.discount,
    });

    const savedOrder = await saveOrder({
      customer_name: form.name,
      phone: form.phone,
      email: form.email,
      address: form.address || "",
      order_type: deliveryType || "",
      payment_method: "cash",
      items: orderItems,
      total: pricing.total,
      status: "new",
      comment: form.comment || "",
      time_type: timeType || "",
      schedule_time: selectedTime || "",
    });

    if (!savedOrder) throw new Error("Order could not be saved");

    await incrementCouponUsage(coupon);

    await Promise.allSettled([
      sendOrderEmail({
        email: form.email,
        name: form.name,
        orderNumber: savedOrder.order_number,
        items: orderItems.filter((item) => item.price >= 0),
        total: pricing.total,
        discount: pricing.discount,
        coupon: coupon?.code,
        deliveryType,
        paymentMethod: "cash",
        timeType,
        selectedTime: selectedTime || "",
        phone: form.phone,
      }),
      sendOrderTelegram({
        orderNumber: savedOrder.order_number,
        customer: form,
        paymentMethod: "cash",
        deliveryType,
        timeType,
        selectedTime,
        items: items as OrderItem[],
        pricing,
        coupon: coupon?.code,
      }),
    ]);

    return NextResponse.json({ success: true, orderNumber: savedOrder.order_number });
  } catch (error) {
    if (error instanceof CouponValidationError || error instanceof OrderValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("Order error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
