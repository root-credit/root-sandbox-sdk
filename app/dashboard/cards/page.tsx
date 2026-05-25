import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/DashboardShell';
import { getCurrentSession } from '@/lib/session';
import { branding } from '@/lib/branding';
import { CreditCard, Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CardsPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <DashboardShell email={session.payerEmail}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Cards</h1>
        <p className="text-muted-foreground mt-1">
          Manage your {branding.productName} cards for spending worldwide.
        </p>
      </div>

      {/* Empty state */}
      <div className="rounded-lg border border-border bg-background p-12 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-[#F4F4F4] flex items-center justify-center mb-4">
          <CreditCard className="h-6 w-6 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">
          No cards yet
        </h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          Get a {branding.productName} card to spend money abroad with the real exchange rate.
        </p>
        <button
          type="button"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-full hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Order a card
        </button>
      </div>
    </DashboardShell>
  );
}
