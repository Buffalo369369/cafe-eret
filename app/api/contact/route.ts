import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    console.log("NEW MESSAGE:");
    console.log(name, email, message);

    // пока просто лог (потом подключим email)
    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json({ success: false });
  }
}