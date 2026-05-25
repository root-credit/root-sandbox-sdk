import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/DashboardShell';
import { getCurrentSession } from '@/lib/session';
import { DashboardClient } from '@/components/DashboardClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <DashboardShell email={session.payerEmail}>
      <DashboardClient />
    </DashboardShell>
  );
}
