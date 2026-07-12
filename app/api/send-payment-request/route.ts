import { NextResponse } from "next/server";
import { sendPaymentRequestEmail } from "@/lib/sendPaymentRequestEmail";

export async function POST(req: Request) {
  try {
    const {
      email,
      name,
      amount,
      orderDate,
      orderTime,
    } = await req.json();

    await sendPaymentRequestEmail({
      email,
      name,
      amount,
      orderDate,
      orderTime,
    });

    return NextResponse.json({
      success: true,
    });

  } catch (err) {

    console.error(err);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}