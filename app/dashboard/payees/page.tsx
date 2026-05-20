'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, CreditCard, Building } from 'lucide-react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { PayeeForm } from '@/components/PayeeForm';
import { branding } from '@/lib/branding';
import { useSession } from '@/lib/hooks/useSession';
import { usePayees } from '@/lib/hooks/usePayees';
import { useRemovePayee } from '@/lib/hooks/useCreatePayee';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function PayeesPage() {
  const router = useRouter();
  const { session } = useSession();
  useEffect(() => { if (session === undefined) router.push('/login'); }, [session, router]);

  const payerId = session?.payerId ?? null;
  const { payees, isLoading, error: loadError, refresh, setPayees } = usePayees(payerId);
  const { removePayee } = useRemovePayee();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!session) return null;

  async function handleDelete(payeeId: string) {
    if (!payerId) return;
    if (!confirm(`Remove this ${branding.payeeSingular.toLowerCase()}?`)) return;
    try {
      await removePayee(payerId, payeeId);
      setPayees(payees.filter((p) => p.id !== payeeId));
    } catch {
      // toast handled inside hook layer
    }
  }

  const bankAccounts = payees.filter((p) => p.paymentMethodType === 'bank_account');
  const debitCards = payees.filter((p) => p.paymentMethodType !== 'bank_account');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader email={session.payerEmail} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-6 lg:px-10 py-8">
        <nav className="text-xs text-muted-foreground flex items-center gap-1.5 mb-3">
          <Link href="/dashboard" className="hover:text-foreground transition-colors font-semibold">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground font-bold">{branding.payeePlural}</span>
        </nav>

        <div className="mb-8 flex items-end justify-between gap-6 flex-wrap">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">{branding.payeePlural}</h1>
            <p className="text-base text-muted-foreground mt-2 max-w-xl">
              Manage your bank accounts and debit cards for {branding.payoutVerb.toLowerCase()}.
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-5">
                <Plus className="h-4 w-4" />
                Add {branding.payeeSingular.toLowerCase()}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-extrabold tracking-tight">
                  Add {branding.payeeSingular.toLowerCase()}
                </DialogTitle>
              </DialogHeader>
              <PayeeForm
                payerId={session.payerId}
                onSuccess={() => {
                  setDialogOpen(false);
                  refresh();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {loadError && (
          <div className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive mb-6">
            {loadError}
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="rounded-2xl border bg-card p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Bank accounts
              </p>
              <p className="text-2xl font-extrabold font-mono tabular-nums">
                {bankAccounts.length}
              </p>
            </div>
          </div>
          <div className="rounded-2xl border bg-card p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-accent-foreground">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Debit cards
              </p>
              <p className="text-2xl font-extrabold font-mono tabular-nums">
                {debitCards.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b px-6 py-4">
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold tracking-tight">{branding.payeePlural}</h2>
              {!isLoading && (
                <span className="text-xs text-muted-foreground font-bold">
                  ({payees.length})
                </span>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-sm text-muted-foreground font-semibold">
              Loading {branding.payeePlural.toLowerCase()}...
            </div>
          ) : payees.length === 0 ? (
            <div className="p-16 flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <CreditCard className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-extrabold">
                  No {branding.payeePlural.toLowerCase()} yet
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add a bank account or debit card to {branding.payoutVerb.toLowerCase()}.
                </p>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="mt-1 rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="h-4 w-4" />
                    Add your first {branding.payeeSingular.toLowerCase()}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-extrabold tracking-tight">
                      Add {branding.payeeSingular.toLowerCase()}
                    </DialogTitle>
                  </DialogHeader>
                  <PayeeForm
                    payerId={session.payerId}
                    onSuccess={() => {
                      setDialogOpen(false);
                      refresh();
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold uppercase tracking-widest text-[10px]">
                    Name
                  </TableHead>
                  <TableHead className="font-bold uppercase tracking-widest text-[10px]">
                    Email
                  </TableHead>
                  <TableHead className="font-bold uppercase tracking-widest text-[10px]">
                    Phone
                  </TableHead>
                  <TableHead className="font-bold uppercase tracking-widest text-[10px]">
                    Type
                  </TableHead>
                  <TableHead className="text-right font-bold uppercase tracking-widest text-[10px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payees.map((payee) => (
                  <TableRow key={payee.id}>
                    <TableCell className="font-bold">{payee.name}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {payee.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {payee.phone}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          payee.paymentMethodType === 'bank_account' ? 'secondary' : 'success'
                        }
                        className="font-bold"
                      >
                        {payee.paymentMethodType === 'bank_account'
                          ? 'Bank account'
                          : 'Debit card'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={() => handleDelete(payee.id)}
                        className="text-xs text-muted-foreground hover:text-destructive font-bold transition-colors uppercase tracking-widest"
                      >
                        Remove
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </main>
    </div>
  );
}
