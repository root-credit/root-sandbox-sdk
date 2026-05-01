'use client';

/**
 * Live-updating paystubs section for the signed-in employee.
 *
 * Why a client component:
 *   - The parent page is server-rendered, so when the employer runs payroll in
 *     a different session the employee sitting on /employee never sees the new
 *     row. This component polls the existing `getMyPaystubs` server action,
 *     revalidates on focus, and exposes a manual refresh.
 *
 * Data source:
 *   - Calls `getMyPaystubs` from `lib/employee-actions.ts` (a server action).
 *     No new fetch endpoints, no new caches — Root remains source of truth for
 *     status; Redis remains source of truth for ledger rows.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  ReceiptText,
  RefreshCw,
  Wallet,
} from 'lucide-react';
import { getMyPaystubs, type PaystubsSummary } from '@/lib/employee-actions';
import { formatMoney } from '@/lib/types/payments';
import type { Transaction } from '@/lib/types/payout';
import { Badge } from '@/components/ui/badge';

const POLL_MS = 10_000;

type Props = {
  initialData: PaystubsSummary;
  employerName: string;
};

export function EmployeePaystubsSection({ initialData, employerName }: Props) {
  const [data, setData] = useState<PaystubsSummary>(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number>(Date.now());
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setIsRefreshing(true);
    try {
      const fresh = await getMyPaystubs();
      setData(fresh);
      setLastUpdatedAt(Date.now());
    } catch {
      // Swallow — keep last good data on screen. We don't want a transient
      // network blip to wipe the table.
    } finally {
      inFlight.current = false;
      setIsRefreshing(false);
    }
  }, []);

  // Poll while the tab is visible.
  useEffect(() => {
    const tick = () => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      void refresh();
    };
    const id = window.setInterval(tick, POLL_MS);
    return () => window.clearInterval(id);
  }, [refresh]);

  // Refresh on focus / when the tab becomes visible again.
  useEffect(() => {
    const onFocus = () => void refresh();
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refresh]);

  return (
    <section className="rounded-2xl border-2 bg-card p-6 mb-8">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
            Earnings
          </p>
          <h2 className="text-xl font-black tracking-tight">My paystubs</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-md leading-relaxed">
            Every payroll run from {employerName}, with status synced live from
            Root.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-bold">
            <ReceiptText className="h-3.5 w-3.5" />
            {data.payCount} {data.payCount === 1 ? 'run' : 'runs'}
          </Badge>
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 rounded-full border-2 px-3 h-8 text-[11px] font-bold uppercase tracking-widest hover:bg-secondary transition-colors disabled:opacity-50"
            aria-label="Refresh paystubs"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            {isRefreshing ? 'Syncing' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Aggregate cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <AggregateCard
          icon={<Wallet className="h-4 w-4" />}
          label="Lifetime gross"
          value={formatMoney(data.totalGrossCents)}
          accent
        />
        <AggregateCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Paid out"
          value={formatMoney(data.paidCents)}
        />
        <AggregateCard
          icon={<Clock className="h-4 w-4" />}
          label="Pending"
          value={formatMoney(data.pendingCents)}
        />
        <AggregateCard
          icon={<CalendarClock className="h-4 w-4" />}
          label="Last paid"
          value={
            data.lastPaidAt
              ? new Date(data.lastPaidAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : '—'
          }
        />
      </div>

      {data.paystubs.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed bg-secondary px-6 py-10 text-center">
          <ReceiptText className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
          <p className="font-black text-sm">No paystubs yet</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-sm mx-auto">
            When {employerName} runs payroll, your paystubs will show up here
            automatically.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border-2 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 bg-secondary px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <div className="col-span-5">Pay date</div>
            <div className="col-span-3">Status</div>
            <div className="col-span-4 text-right">Amount</div>
          </div>
          <ul className="divide-y-2">
            {data.paystubs.map((row) => (
              <PaystubRow key={row.id} row={row} />
            ))}
          </ul>
        </div>
      )}

      <p className="mt-3 text-[11px] text-muted-foreground text-right tabular-nums">
        Updated{' '}
        {new Date(lastUpdatedAt).toLocaleTimeString(undefined, {
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
        })}
      </p>
    </section>
  );
}

function AggregateCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border-2 p-3.5 flex flex-col gap-1 ${
        accent ? 'bg-foreground text-background border-foreground' : 'bg-card'
      }`}
    >
      <div
        className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${
          accent ? 'text-background/70' : 'text-muted-foreground'
        }`}
      >
        {icon}
        {label}
      </div>
      <div className="font-mono font-black tabular-nums text-lg leading-tight">
        {value}
      </div>
    </div>
  );
}

function PaystubRow({ row }: { row: Transaction }) {
  const status = (row.status || '').toLowerCase();
  const isPaid = status === 'success' || status === 'completed';
  const isPending = status === 'pending';
  const isFailed = status === 'failed';
  const when = row.completedAt || row.createdAt;
  return (
    <li className="grid grid-cols-12 gap-4 items-center px-4 py-3 bg-card">
      <div className="col-span-5">
        <p className="font-bold text-sm leading-tight">
          {new Date(when).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
        <p className="text-[11px] text-muted-foreground font-mono mt-0.5 truncate">
          {row.rootPayoutId || row.id.slice(0, 8)}
        </p>
      </div>
      <div className="col-span-3">
        {isPaid ? (
          <Badge variant="success" className="font-bold">
            <CheckCircle2 className="h-3 w-3" />
            Paid
          </Badge>
        ) : isPending ? (
          <Badge variant="outline" className="font-bold border-dashed">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        ) : isFailed ? (
          <Badge variant="destructive" className="font-bold">
            Failed
          </Badge>
        ) : (
          <Badge variant="outline" className="font-bold capitalize">
            {row.status || 'Unknown'}
          </Badge>
        )}
      </div>
      <div className="col-span-4 text-right font-mono font-black tabular-nums">
        {formatMoney(row.amountCents)}
      </div>
    </li>
  );
}
