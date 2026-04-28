import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromCookies } from "@/lib/admin-session";
import {
  clearAllWorkersData,
  removeWorkerById,
  clearAllRestaurantSessions,
  clearAllTransactions,
  clearAllRestaurantBankFields,
} from "@/lib/redis-admin";
import { setStoredLoginPassword } from "@/lib/app-settings";

type Operation =
  | "clear_all_workers"
  | "remove_worker"
  | "clear_sessions_and_transactions"
  | "clear_bank_fields"
  | "set_shared_login_password";

export async function POST(request: NextRequest) {
  const admin = await getAdminSessionFromCookies();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const operation = body.operation as Operation;
  if (!operation) {
    return NextResponse.json({ error: "Missing operation" }, { status: 400 });
  }

  try {
    switch (operation) {
      case "clear_all_workers": {
        const r = await clearAllWorkersData();
        return NextResponse.json({
          ok: true,
          message: "All worker records cleared.",
          deletedKeys: r.deletedKeys,
        });
      }
      case "remove_worker": {
        const workerId =
          typeof body.workerId === "string" ? body.workerId.trim() : "";
        if (!workerId) {
          return NextResponse.json({ error: "workerId required" }, { status: 400 });
        }
        const removed = await removeWorkerById(workerId);
        if (!removed) {
          return NextResponse.json({ error: "Worker not found" }, { status: 404 });
        }
        return NextResponse.json({
          ok: true,
          message: `Worker ${workerId} removed.`,
        });
      }
      case "clear_sessions_and_transactions": {
        let deletedKeys = 0;
        deletedKeys += (await clearAllRestaurantSessions()).deletedKeys;
        deletedKeys += (await clearAllTransactions()).deletedKeys;
        return NextResponse.json({
          ok: true,
          message: "Sessions and transactions cleared.",
          deletedKeys,
        });
      }
      case "clear_bank_fields": {
        const r = await clearAllRestaurantBankFields();
        return NextResponse.json({
          ok: true,
          message: "Bank tokens removed from restaurant records.",
          updated: r.updated,
        });
      }
      case "set_shared_login_password": {
        const password =
          typeof body.password === "string" ? body.password : "";
        if (password.length < 8) {
          return NextResponse.json(
            { error: "Password must be at least 8 characters" },
            { status: 400 }
          );
        }
        await setStoredLoginPassword(password);
        return NextResponse.json({
          ok: true,
          message:
            "Shared app login password updated. All restaurant users must use this password.",
        });
      }
      default:
        return NextResponse.json({ error: "Unknown operation" }, { status: 400 });
    }
  } catch (e) {
    console.error("[admin operations]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Operation failed" },
      { status: 500 }
    );
  }
}
