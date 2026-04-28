import { NextResponse } from "next/server";
import { redis, getWorker } from "@/lib/redis";
import { getAdminSessionFromCookies } from "@/lib/admin-session";

export async function GET() {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys = await redis.keys("worker:*");
  const workers: Array<{
    id: string;
    name: string;
    restaurantId: string;
    paymentMethodType?: string;
  }> = [];

  for (const key of keys) {
    const id = key.startsWith("worker:") ? key.slice("worker:".length) : key;
    const w = await getWorker(id);
    if (w?.id) {
      workers.push({
        id: w.id,
        name: w.name,
        restaurantId: w.restaurantId,
        paymentMethodType: w.paymentMethodType,
      });
    }
  }

  workers.sort((a, b) => a.name.localeCompare(b.name));
  return NextResponse.json({ workers });
}
