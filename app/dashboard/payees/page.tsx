'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Users } from 'lucide-react';
import { DashboardSidebar } from '@/components/DashboardSidebar';
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

export default function RecipientsPage() {
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

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="pl-64">
        <DashboardHeader email={session.payerEmail} />

        <main className="p-6">
          <div className="mb-6 flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{branding.payeePlural}</h1>
              <p className="text-muted-foreground mt-1">
                The people you send money to. Add their bank details once, send anytime.
              </p>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full font-semibold bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-5">
                  <Plus className="h-4 w-4" />
                  Add {branding.payeeSingular.toLowerCase()}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold">
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
            <div className="rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive mb-6">
              {loadError}
            </div>
          )}

          <div className="rounded-lg border border-border bg-background overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-semibold text-foreground">{branding.payeePlural}</h2>
                {!isLoading && (
                  <span className="text-xs text-muted-foreground font-medium">
                    ({payees.length})
                  </span>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-sm text-muted-foreground font-medium">
                Loading {branding.payeePlural.toLowerCase()}...
              </div>
            ) : payees.length === 0 ? (
              <div className="p-16 flex flex-col items-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F4F4F4]">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    No {branding.payeePlural.toLowerCase()} yet
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add your first {branding.payeeSingular.toLowerCase()} to start sending money.
                  </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="mt-1 rounded-full font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
                      <Plus className="h-4 w-4" />
                      Add your first {branding.payeeSingular.toLowerCase()}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold">
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
                    <TableHead className="font-medium text-[10px] uppercase tracking-widest">
                      Name
                    </TableHead>
                    <TableHead className="font-medium text-[10px] uppercase tracking-widest">
                      Email
                    </TableHead>
                    <TableHead className="font-medium text-[10px] uppercase tracking-widest">
                      Phone
                    </TableHead>
                    <TableHead className="font-medium text-[10px] uppercase tracking-widest">
                      Type
                    </TableHead>
                    <TableHead className="text-right font-medium text-[10px] uppercase tracking-widest">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payees.map((payee) => (
                    <TableRow key={payee.id}>
                      <TableCell className="font-medium">{payee.name}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {payee.email}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {payee.phone}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payee.paymentMethodType === 'bank_account' ? 'secondary' : 'success'
                          }
                          className="font-medium"
                        >
                          {payee.paymentMethodType === 'bank_account'
                            ? 'Bank account'
                            : 'Debit card'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <button
                          onClick={() => handleDelete(payee.id)}
                          className="text-xs text-muted-foreground hover:text-destructive font-medium transition-colors uppercase tracking-widest"
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
    </div>
  );
}
