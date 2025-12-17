import { NextResponse } from "next/server";
import crypto from "crypto";

const ADMIN_COOKIE = "admin_auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const password: string | undefined = body.password;

  if (!password) {
    return NextResponse.json({ error: "Password required" }, { status: 400 });
  }

  const hash = crypto.createHash("sha256").update(password).digest("hex");
  const expected = process.env.ADMIN_PASSWORD_HASH;

  if (!expected) {
    return NextResponse.json(
      { error: "Admin password not configured" },
      { status: 500 }
    );
  }

  if (hash !== expected) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE, expected, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}

