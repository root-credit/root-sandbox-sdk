import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/DashboardShell';
import { getCurrentSession } from '@/lib/session';
import { branding } from '@/lib/branding';
import { BarChart3, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function InsightsPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <DashboardShell email={session.payerEmail}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Insights</h1>
        <p className="text-muted-foreground mt-1">
          Track your spending and {branding.payoutNounPlural.toLowerCase()} activity.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="rounded-lg border border-border bg-background p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">
              Total sent this month
            </span>
            <ArrowUpRight className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">$0.00</div>
          <p className="text-xs text-muted-foreground mt-1">USD equivalent</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">
              Fees saved
            </span>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">$0.00</div>
          <p className="text-xs text-muted-foreground mt-1">vs. bank transfers</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">
              {branding.payoutNounPlural}
            </span>
            <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold text-foreground">0</div>
          <p className="text-xs text-muted-foreground mt-1">This month</p>
        </div>
      </div>

      {/* Chart placeholder */}
      <div className="rounded-lg border border-border bg-background p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          Activity over time
        </h2>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-[#F4F4F4] flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No activity to display yet. Start by making a transfer.
            </p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
