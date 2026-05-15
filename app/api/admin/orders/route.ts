import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {

  try {

    const { data, error } =
      await supabaseAdmin

        .from("orders")

        .select("*")

        .order("created_at", {
          ascending: false,
        });

    if (error) {

      console.error(error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );

    }

    return NextResponse.json(data);

  } catch (err) {

    console.error(err);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );

  }

}