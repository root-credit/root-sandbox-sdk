'use client';

import { useEffect, useState } from 'react';
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
import { Plus, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PayeesPage() {
  const router = useRouter();
  const { session } = useSession();
  const payerId = session?.payerId ?? null;
  const { payees, isLoading, error: loadError, refresh, setPayees } = usePayees(payerId);
  const { removePayee } = useRemovePayee();
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (session === undefined) router.push('/login');
  }, [session, router]);

  async function handleDelete(payeeId: string) {
    if (!payerId) return;
    if (!confirm(`Are you sure you want to delete this ${branding.payeeSingular.toLowerCase()}?`)) return;
    try {
      await removePayee(payerId, payeeId);
      setPayees(payees.filter((p) => p.id !== payeeId));
    } catch {
      // error handled silently; toast could be added
    }
  }

  if (!session) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader email={session.payerEmail} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-6 lg:px-10 py-8">
        <div className="mb-6 flex items-end justify-between gap-6 flex-wrap">
          <div>
            <nav className="text-xs text-muted-foreground flex items-center gap-1.5 mb-3">
              <Link href="/dashboard" className="hover:text-foreground transition-colors">Console</Link>
              <span>/</span>
              <span className="text-foreground">{branding.payeePlural}</span>
            </nav>
            <h1 className="text-2xl font-semibold tracking-tight">{branding.payeePlural}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage the people you pay and the payout rail attached to each.
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Add {branding.payeeSingular.toLowerCase()}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add {branding.payeeSingular.toLowerCase()}</DialogTitle>
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
          <div className="rounded-md border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-6">
            {loadError}
          </div>
        )}

        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold tracking-tight">{branding.payeePlural}</h2>
              {!isLoading && (
                <span className="text-xs text-muted-foreground">({payees.length})</span>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              Loading {branding.payeePlural.toLowerCase()}…
            </div>
          ) : payees.length === 0 ? (
            <div className="p-16 flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">No {branding.payeePlural.toLowerCase()} yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add your first {branding.payeeSingular.toLowerCase()} to start running {branding.payoutNounPlural.toLowerCase()}.
                </p>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="mt-1">
                    <Plus className="h-4 w-4" />
                    Add your first {branding.payeeSingular.toLowerCase()}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add {branding.payeeSingular.toLowerCase()}</DialogTitle>
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
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Rail</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payees.map((payee) => (
                  <TableRow key={payee.id}>
                    <TableCell className="font-medium">{payee.name}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">{payee.email}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">{payee.phone}</TableCell>
                    <TableCell>
                      <Badge
                        variant={payee.paymentMethodType === 'bank_account' ? 'secondary' : 'success'}
                      >
                        {payee.paymentMethodType === 'bank_account' ? 'Bank account' : 'Debit card'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={() => handleDelete(payee.id)}
                        className="text-xs text-muted-foreground hover:text-destructive font-medium transition-colors"
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
