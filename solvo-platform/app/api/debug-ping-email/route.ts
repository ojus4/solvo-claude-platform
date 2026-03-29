import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email/send";

export async function GET() {
  try {
    // We hardcode your verified email here just to test the connection
    const result = await sendWelcomeEmail({
      to: "ojus.ghosh3@gmail.com",
      fullName: "Ojus (Ping Test)",
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ message: "Ping Successful! Check your inbox." });
  } catch (error) {
    return NextResponse.json({ error: "Ping Failed" }, { status: 500 });
  }
}