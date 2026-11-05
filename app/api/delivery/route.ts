import { NextResponse } from "next/server";
import { resolveDeliveryQuoteFromAddress } from "@/lib/delivery-policy";

// Keep the public quote endpoint and both order handlers on one server-side policy.
export async function POST(req: Request) {
  try {
    if (!req || typeof req !== "object" || typeof req.json !== "function") {
      return NextResponse.json({ error: "No address" }, { status: 400 });
    }

    const payload = await req.json().catch(() => null);
    const { address } = payload ?? {};
    if (!address || typeof address !== "string") {
      return NextResponse.json({ error: "No address" }, { status: 400 });
    }

    const quote = await resolveDeliveryQuoteFromAddress(address);
    if (!quote.available) {
      return NextResponse.json({
        available: false,
        message: quote.message || "Lieferung nicht verfügbar",
        fee: 0,
        distance: Number.isFinite(quote.distanceKm) ? quote.distanceKm.toFixed(2) : "",
      });
    }

    return NextResponse.json({
      available: true,
      fee: quote.fee,
      distance: quote.distanceKm.toFixed(2),
    });
  } catch (error) {
    console.error("Delivery route error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
