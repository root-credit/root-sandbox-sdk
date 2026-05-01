'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Users } from 'lucide-react';
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
    if (!confirm(`Remove this ${branding.payeeSingular.toLowerCase()} from the team?`)) return;
    try {
      await removePayee(payerId, payeeId);
      setPayees(payees.filter((p) => p.id !== payeeId));
    } catch {
      // toast handled inside hook layer
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader email={session.payerEmail} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-6 lg:px-10 py-8">
        <Breadcrumb here={branding.payeePlural} />

        <div className="mb-8 flex items-end justify-between gap-6 flex-wrap">
          <div>
            <h1 className="text-4xl font-black tracking-tight">{branding.payeePlural}</h1>
            <p className="text-base text-muted-foreground mt-2 max-w-xl">
              Your team roster. Each {branding.payeeSingular.toLowerCase()} signs in with the
              email below and picks how they want to be paid — bank or debit card.
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
                <DialogTitle className="text-2xl font-black tracking-tight">
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
          <div className="rounded-xl border-2 border-destructive/25 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive mb-6">
            {loadError}
          </div>
        )}

        <div className="rounded-xl border-2 bg-secondary px-5 py-4 mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
              Employee sign-in
            </p>
            <p className="text-sm font-bold leading-snug">
              Share <code className="rounded bg-card border px-1.5 py-0.5 font-mono text-xs">/employee/login</code>{' '}
              with your team.
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-md leading-relaxed">
              Each {branding.payeeSingular.toLowerCase()} signs in with the email below to add
              or update their direct-deposit method.
            </p>
          </div>
          <Link
            href="/employee/login"
            target="_blank"
            className="inline-flex items-center rounded-full bg-foreground text-background px-4 h-9 text-xs font-bold hover:bg-foreground/90 transition-colors"
          >
            Open employee sign-in
          </Link>
        </div>

        <div className="rounded-2xl border-2 bg-card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b-2 px-6 py-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-black tracking-tight">{branding.payeePlural}</h2>
              {!isLoading && (
                <span className="text-xs text-muted-foreground font-bold">
                  ({payees.length})
                </span>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-sm text-muted-foreground font-semibold">
              Loading {branding.payeePlural.toLowerCase()}…
            </div>
          ) : payees.length === 0 ? (
            <div className="p-16 flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-black">
                  No {branding.payeePlural.toLowerCase()} yet
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add your first {branding.payeeSingular.toLowerCase()} to start running payroll.
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
                    <DialogTitle className="text-2xl font-black tracking-tight">
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
                    {branding.payeeSingular}
                  </TableHead>
                  <TableHead className="font-bold uppercase tracking-widest text-[10px]">
                    Email
                  </TableHead>
                  <TableHead className="font-bold uppercase tracking-widest text-[10px]">
                    Phone
                  </TableHead>
                  <TableHead className="font-bold uppercase tracking-widest text-[10px]">
                    Payout method
                  </TableHead>
                  <TableHead className="text-right font-bold uppercase tracking-widest text-[10px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payees.map((payee) => (
                  <TableRow key={payee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground text-xs font-black flex-none">
                          {payee.name
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase() || '?'}
                        </span>
                        <span className="font-bold">{payee.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {payee.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {payee.phone}
                    </TableCell>
                    <TableCell>
                      {!payee.paymentMethodId ? (
                        <Badge variant="outline" className="font-bold border-dashed">
                          Pending
                        </Badge>
                      ) : (
                        <Badge
                          variant={
                            payee.paymentMethodType === 'bank_account'
                              ? 'secondary'
                              : 'success'
                          }
                          className="font-bold"
                        >
                          {payee.paymentMethodType === 'bank_account'
                            ? 'Bank account'
                            : 'Debit card'}
                        </Badge>
                      )}
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

function Breadcrumb({ here }: { here: string }) {
  return (
    <nav className="text-xs text-muted-foreground flex items-center gap-1.5 mb-3">
      <Link href="/dashboard" className="hover:text-foreground transition-colors font-semibold">
        Console
      </Link>
      <span>/</span>
      <span className="text-foreground font-bold">{here}</span>
    </nav>
  );
}
