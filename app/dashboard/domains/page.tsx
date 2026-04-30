'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Globe2, Plus, Tag, TagIcon, X } from 'lucide-react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useDomainStore } from '@/components/DomainStoreProvider';
import { useSession } from '@/lib/hooks/useSession';
import { branding } from '@/lib/branding';
import { dollarsToCents, formatMoney } from '@/lib/types/payments';
import type { OwnedDomain } from '@/lib/godaddy-mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function MyDomainsPage() {
  const router = useRouter();
  const { session } = useSession();
  useEffect(() => { if (session === undefined) router.push('/login'); }, [session, router]);

  const { ownedDomains, addOwnedDomain, listDomainForSale, unlistDomain } = useDomainStore();
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferName, setTransferName] = useState('');

  const [listingDomain, setListingDomain] = useState<OwnedDomain | null>(null);
  const [listingPrice, setListingPrice] = useState('');

  if (!session) return null;

  const listed = ownedDomains.filter((d) => d.listingPriceCents !== undefined);
  const unlisted = ownedDomains.filter((d) => d.listingPriceCents === undefined);

  function handleTransfer() {
    const name = transferName.trim().toLowerCase();
    if (!name || !/^[a-z0-9-]+\.[a-z]{2,}$/i.test(name)) {
      toast.error('Enter a valid domain like example.com');
      return;
    }
    if (ownedDomains.some((d) => d.name === name)) {
      toast.error('You already own that domain.');
      return;
    }
    const next = addOwnedDomain(name);
    if (next) {
      toast.success(`Transferred ${next.name} into your account.`);
      setTransferOpen(false);
      setTransferName('');
    }
  }

  function openListing(domain: OwnedDomain) {
    setListingDomain(domain);
    setListingPrice(
      domain.listingPriceCents !== undefined
        ? (domain.listingPriceCents / 100).toFixed(2)
        : '',
    );
  }

  function handleConfirmListing() {
    if (!listingDomain) return;
    const dollars = parseFloat(listingPrice);
    if (!Number.isFinite(dollars) || dollars <= 0) {
      toast.error('Enter a valid asking price.');
      return;
    }
    const cents = dollarsToCents(dollars);
    listDomainForSale(listingDomain.id, cents);
    toast.success(`${listingDomain.name} listed for ${formatMoney(cents)}.`);
    setListingDomain(null);
    setListingPrice('');
  }

  function handleUnlist(domain: OwnedDomain) {
    unlistDomain(domain.id);
    toast.success(`${domain.name} removed from the marketplace.`);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader email={session.payerEmail} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-6 lg:px-10 py-8">
        <Breadcrumb here="My domains" />

        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">My domains</h1>
            <p className="text-base text-muted-foreground mt-2 max-w-xl">
              Every domain you own. List one for sale, set the price, and it shows up in the
              marketplace for other {branding.payerPlural.toLowerCase()} to buy.
            </p>
          </div>
          <Button
            onClick={() => setTransferOpen(true)}
            className="rounded-full font-bold bg-foreground text-background hover:bg-foreground/90 h-11 px-5"
          >
            <Plus className="h-4 w-4" />
            Transfer in a domain
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCard label="Owned" value={String(ownedDomains.length)} />
          <StatCard label="Listed for sale" value={String(listed.length)} />
          <StatCard
            label="Total ask"
            value={formatMoney(listed.reduce((sum, d) => sum + (d.listingPriceCents ?? 0), 0))}
          />
        </div>

        {ownedDomains.length === 0 ? (
          <EmptyState onTransfer={() => setTransferOpen(true)} />
        ) : (
          <div className="space-y-8">
            {listed.length > 0 && (
              <Section
                title="Listed for sale"
                desc="Visible in the marketplace. Unlist any time."
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {listed.map((d) => (
                    <DomainRow
                      key={d.id}
                      domain={d}
                      onList={() => openListing(d)}
                      onUnlist={() => handleUnlist(d)}
                    />
                  ))}
                </div>
              </Section>
            )}
            {unlisted.length > 0 && (
              <Section title="Not listed" desc="Set an asking price to put one up for sale.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {unlisted.map((d) => (
                    <DomainRow
                      key={d.id}
                      domain={d}
                      onList={() => openListing(d)}
                      onUnlist={() => handleUnlist(d)}
                    />
                  ))}
                </div>
              </Section>
            )}
          </div>
        )}
      </main>

      {/* Transfer-in dialog */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold tracking-tight">
              Transfer in a domain
            </DialogTitle>
            <DialogDescription>
              Mocked transfer — enter the domain name you own and we&apos;ll add it to your{' '}
              {branding.payerSingular.toLowerCase()}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="transfer-name">Domain</Label>
            <Input
              id="transfer-name"
              placeholder="example.com"
              value={transferName}
              onChange={(e) => setTransferName(e.target.value)}
              className="font-mono"
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setTransferOpen(false)}
              className="rounded-full font-bold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleTransfer}
              className="rounded-full font-bold bg-foreground text-background hover:bg-foreground/90"
            >
              Add domain
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* List-for-sale dialog */}
      <Dialog
        open={listingDomain !== null}
        onOpenChange={(open) => {
          if (!open) {
            setListingDomain(null);
            setListingPrice('');
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold tracking-tight">
              {listingDomain?.listingPriceCents !== undefined ? 'Update price' : 'List for sale'}
            </DialogTitle>
            <DialogDescription>
              <span className="font-mono font-bold text-foreground">{listingDomain?.name}</span>{' '}
              will be visible to every account in the marketplace.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="listing-price">Asking price (USD)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">
                $
              </span>
              <Input
                id="listing-price"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="1000.00"
                value={listingPrice}
                onChange={(e) => setListingPrice(e.target.value)}
                className="pl-7 font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setListingDomain(null)}
              className="rounded-full font-bold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmListing}
              className="rounded-full font-bold bg-foreground text-background hover:bg-foreground/90"
            >
              {listingDomain?.listingPriceCents !== undefined ? 'Update listing' : 'List domain'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-primary">{title}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
      </div>
      {children}
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border-2 bg-card p-5 flex flex-col gap-2">
      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="text-2xl font-extrabold font-mono tabular-nums">{value}</div>
    </div>
  );
}

function DomainRow({
  domain,
  onList,
  onUnlist,
}: {
  domain: OwnedDomain;
  onList: () => void;
  onUnlist: () => void;
}) {
  const isListed = domain.listingPriceCents !== undefined;
  return (
    <div className="rounded-2xl border-2 bg-card p-5 flex flex-col gap-3 hover:border-foreground transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Globe2 className="h-4 w-4 text-muted-foreground flex-none" />
            <h3 className="text-lg font-extrabold font-mono tracking-tight break-all">
              {domain.name}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground font-semibold">
            Registered{' '}
            {new Date(domain.registeredAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
        {isListed ? (
          <Badge variant="success" className="shrink-0 font-bold">
            <TagIcon className="h-3 w-3" />
            Listed
          </Badge>
        ) : (
          <Badge variant="secondary" className="shrink-0 font-bold">
            Owned
          </Badge>
        )}
      </div>
      {isListed && (
        <div className="rounded-xl bg-primary/10 px-4 py-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Asking price
          </div>
          <div className="text-2xl font-extrabold font-mono tabular-nums">
            {formatMoney(domain.listingPriceCents ?? 0)}
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-2 mt-1">
        <Button
          onClick={onList}
          className="rounded-full font-bold bg-foreground text-background hover:bg-foreground/90 h-9"
          size="sm"
        >
          <Tag className="h-3.5 w-3.5" />
          {isListed ? 'Update price' : 'List for sale'}
        </Button>
        {isListed && (
          <Button
            onClick={onUnlist}
            variant="outline"
            className="rounded-full font-bold border-2 h-9"
            size="sm"
          >
            <X className="h-3.5 w-3.5" />
            Unlist
          </Button>
        )}
      </div>
    </div>
  );
}

function EmptyState({ onTransfer }: { onTransfer: () => void }) {
  return (
    <div className="rounded-2xl border-2 bg-card p-16 flex flex-col items-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Globe2 className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <p className="text-lg font-extrabold">No domains yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Transfer in a domain to start listing it for sale.
        </p>
      </div>
      <Button
        onClick={onTransfer}
        className="rounded-full font-bold bg-foreground text-background hover:bg-foreground/90"
      >
        <Plus className="h-4 w-4" />
        Transfer in your first domain
      </Button>
    </div>
  );
}
