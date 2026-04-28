import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  deleteAdminSessionToken,
} from "@/lib/admin-session";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (token) {
    await deleteAdminSessionToken(token);
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
