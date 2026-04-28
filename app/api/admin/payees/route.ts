import { NextResponse } from "next/server";
import { redis, getPayee } from "@/lib/redis";
import { getAdminSessionFromCookies } from "@/lib/admin-session";

export async function GET() {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys = await redis.keys("payee:*");
  const payees: Array<{
    id: string;
    name: string;
    merchantId: string;
    paymentMethodType?: string;
  }> = [];

  for (const key of keys) {
    const id = key.startsWith("payee:") ? key.slice("payee:".length) : key;
    const p = await getPayee(id);
    if (p?.id) {
      payees.push({
        id: p.id,
        name: p.name,
        merchantId: p.merchantId,
        paymentMethodType: p.paymentMethodType,
      });
    }
  }

  payees.sort((a, b) => a.name.localeCompare(b.name));
  return NextResponse.json({ payees });
}
