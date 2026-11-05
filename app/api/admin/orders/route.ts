import { isAdminAuthorized } from "@/lib/admin-auth";
import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: Request) {
  if (!isAdminAuthorized(req.headers.get("authorization"))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
