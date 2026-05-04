import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const session_id = searchParams.get("session_id");

  if (!session_id) {
    return NextResponse.json({ paid: false });
  }

  const session = await stripe.checkout.sessions.retrieve(session_id);

  return NextResponse.json({
    paid: session.payment_status === "paid",
  });
}