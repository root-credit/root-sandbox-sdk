import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromCookies } from "@/lib/admin-session";
import {
  clearAllPayeesData,
  removePayeeById,
  clearAllOperatorSessions,
  clearAllTransactions,
  clearAllPayerBankFields,
  flushEntireDatabase,
} from "@/lib/redis-admin";
import { setStoredLoginPassword } from "@/lib/app-settings";

type Operation =
  | "clear_all_payees"
  | "remove_payee"
  | "clear_sessions_and_transactions"
  | "clear_bank_fields"
  | "set_shared_login_password"
  | "flush_entire_database";

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
      case "clear_all_payees": {
        const r = await clearAllPayeesData();
        return NextResponse.json({
          ok: true,
          message: "All payee records cleared.",
          deletedKeys: r.deletedKeys,
        });
      }
      case "remove_payee": {
        const payeeId =
          typeof body.payeeId === "string" ? body.payeeId.trim() : "";
        if (!payeeId) {
          return NextResponse.json(
            { error: "payeeId required" },
            { status: 400 }
          );
        }
        const removed = await removePayeeById(payeeId);
        if (!removed) {
          return NextResponse.json(
            { error: "Payee not found" },
            { status: 404 }
          );
        }
        return NextResponse.json({
          ok: true,
          message: `Payee ${payeeId} removed.`,
        });
      }
      case "clear_sessions_and_transactions": {
        let deletedKeys = 0;
        deletedKeys += (await clearAllOperatorSessions()).deletedKeys;
        deletedKeys += (await clearAllTransactions()).deletedKeys;
        return NextResponse.json({
          ok: true,
          message: "Sessions and transactions cleared.",
          deletedKeys,
        });
      }
      case "clear_bank_fields": {
        const r = await clearAllPayerBankFields();
        return NextResponse.json({
          ok: true,
          message: "Bank tokens removed from payer records.",
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
            "Shared app login password updated. All payer users must use this password.",
        });
      }
      case "flush_entire_database": {
        await flushEntireDatabase();
        return NextResponse.json({
          ok: true,
          message:
            "Upstash database emptied (FLUSHDB). All keys in this Redis DB were deleted.",
        });
      }
      default:
        return NextResponse.json(
          { error: "Unknown operation" },
          { status: 400 }
        );
    }
  } catch (e) {
    console.error("[admin operations]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Operation failed" },
      { status: 500 }
    );
  }
}
