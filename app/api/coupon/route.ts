import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  const { code } = await req.json();

  const { data, error } = await supabaseAdmin
    .from("coupons")
    .select("*")
    .eq("code", code.toUpperCase())
    .single();

  if (error || !data) {
    return NextResponse.json({
      valid: false,
      message: "Ungültiger Gutscheincode",
    });
  }

  if (!data.active) {
    return NextResponse.json({
      valid: false,
      message: "Gutschein ist deaktiviert",
    });
  }

  if (
    data.expires_at &&
    new Date(data.expires_at) < new Date()
  ) {
    return NextResponse.json({
      valid: false,
      message: "Gutschein ist abgelaufen",
    });
  }

  if (data.used_count >= data.usage_limit) {
    return NextResponse.json({
      valid: false,
      message: "Gutschein wurde bereits verwendet",
    });
  }

  return NextResponse.json({
    valid: true,
    coupon: {
      code: data.code,
      type: data.type,
      value: data.value,
    },
  });
}