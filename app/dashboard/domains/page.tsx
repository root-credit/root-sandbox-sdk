'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Building2, Plus, Calendar, MapPin, X, Home } from 'lucide-react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useDomainStore } from '@/components/DomainStoreProvider';
import { useSession } from '@/lib/hooks/useSession';
import { branding } from '@/lib/branding';
import { dollarsToCents, formatMoney } from '@/lib/types/payments';
import type { OwnedDomainRecord } from '@/lib/godaddy-actions';
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

export default function MyPropertiesPage() {
  const router = useRouter();
  const { session } = useSession();
  useEffect(() => { if (session === undefined) router.push('/login'); }, [session, router]);

  const { ownedDomains, isDomainsLoading, transferIn, listForSale, unlist } = useDomainStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [propertyName, setPropertyName] = useState('');
  const [propertyLocation, setPropertyLocation] = useState('');
  const [createBusy, setCreateBusy] = useState(false);

  const [listingProperty, setListingProperty] = useState<OwnedDomainRecord | null>(null);
  const [listingPrice, setListingPrice] = useState('');
  const [listingLocation, setListingLocation] = useState('');
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableTo, setAvailableTo] = useState('');
  const [listingBusy, setListingBusy] = useState(false);

  if (!session) return null;

  const listed = ownedDomains.filter((d) => d.listingPriceCents !== undefined);
  const unlisted = ownedDomains.filter((d) => d.listingPriceCents === undefined);

  async function handleCreate() {
    if (createBusy) return;
    setCreateBusy(true);
    try {
      const result = await transferIn(propertyName, { location: propertyLocation });
      if (result.ok) {
        toast.success(`Property "${result.domain?.name ?? ''}" created successfully.`);
        setCreateOpen(false);
        setPropertyName('');
        setPropertyLocation('');
      } else {
        toast.error(result.reason);
      }
    } finally {
      setCreateBusy(false);
    }
  }

  function openListing(property: OwnedDomainRecord) {
    setListingProperty(property);
    setListingPrice(
      property.listingPriceCents !== undefined
        ? (property.listingPriceCents / 100).toFixed(2)
        : '',
    );
    setListingLocation(property.location || '');
    setAvailableFrom(property.availableFrom || '');
    setAvailableTo(property.availableTo || '');
  }

  async function handleConfirmListing() {
    if (!listingProperty || listingBusy) return;
    const dollars = parseFloat(listingPrice);
    if (!Number.isFinite(dollars) || dollars <= 0) {
      toast.error('Enter a valid nightly rate.');
      return;
    }
    const cents = dollarsToCents(dollars);
    setListingBusy(true);
    try {
      const result = await listForSale(listingProperty.name, cents, {
        location: listingLocation,
        nightlyRateCents: cents,
        availableFrom,
        availableTo,
      });
      if (result.ok) {
        toast.success(`"${listingProperty.name}" listed for ${formatMoney(cents)}/night.`);
        setListingProperty(null);
        setListingPrice('');
        setListingLocation('');
        setAvailableFrom('');
        setAvailableTo('');
      } else {
        toast.error(result.reason);
      }
    } finally {
      setListingBusy(false);
    }
  }

  async function handleUnlist(property: OwnedDomainRecord) {
    const result = await unlist(property.name);
    if (result.ok) {
      toast.success(`"${property.name}" removed from listings.`);
    } else {
      toast.error(result.reason);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader email={session.payerEmail} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-6 lg:px-10 py-8">
        <Breadcrumb here="My Properties" />

        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Properties</h1>
            <p className="text-base text-muted-foreground mt-2 max-w-xl">
              Manage your listings. Set nightly rates and availability to attract {branding.payerPlural.toLowerCase()}.
            </p>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="rounded-full font-semibold bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-5"
          >
            <Plus className="h-4 w-4" />
            List a property
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCard label="My properties" value={String(ownedDomains.length)} />
          <StatCard label="Listed for rent" value={String(listed.length)} />
          <StatCard
            label="Total nightly value"
            value={formatMoney(listed.reduce((sum, d) => sum + (d.listingPriceCents ?? 0), 0))}
          />
        </div>

        {isDomainsLoading ? (
          <LoadingState />
        ) : ownedDomains.length === 0 ? (
          <EmptyState onCreate={() => setCreateOpen(true)} />
        ) : (
          <div className="space-y-8">
            {listed.length > 0 && (
              <Section
                title="Listed for rent"
                desc="Visible to guests. Unlist anytime."
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {listed.map((d) => (
                    <PropertyRow
                      key={d.id}
                      property={d}
                      onList={() => openListing(d)}
                      onUnlist={() => handleUnlist(d)}
                    />
                  ))}
                </div>
              </Section>
            )}
            {unlisted.length > 0 && (
              <Section title="Not listed" desc="Set a nightly rate to make available for booking.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {unlisted.map((d) => (
                    <PropertyRow
                      key={d.id}
                      property={d}
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

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight">
              List a property
            </DialogTitle>
            <DialogDescription>
              Add your property details. You can set availability and pricing after creation.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="property-name">Property name</Label>
              <Input
                id="property-name"
                placeholder="Modern Loft in Downtown"
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
                disabled={createBusy}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="property-location">Location</Label>
              <Input
                id="property-location"
                placeholder="New York, NY"
                value={propertyLocation}
                onChange={(e) => setPropertyLocation(e.target.value)}
                disabled={createBusy}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setCreateOpen(false)}
              className="rounded-full font-semibold"
              disabled={createBusy}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createBusy}
              className="rounded-full font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {createBusy ? 'Creating...' : 'Add property'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={listingProperty !== null}
        onOpenChange={(open) => {
          if (!open) {
            setListingProperty(null);
            setListingPrice('');
            setListingLocation('');
            setAvailableFrom('');
            setAvailableTo('');
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight">
              {listingProperty?.listingPriceCents !== undefined ? 'Update listing' : 'Set up listing'}
            </DialogTitle>
            <DialogDescription>
              <span className="font-semibold text-foreground">{listingProperty?.name}</span>{' '}
              will be visible to all {branding.payerPlural.toLowerCase()} looking to book.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="listing-price">Nightly rate (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">
                  $
                </span>
                <Input
                  id="listing-price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="150.00"
                  value={listingPrice}
                  onChange={(e) => setListingPrice(e.target.value)}
                  className="pl-7 font-mono"
                  disabled={listingBusy}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="listing-location">Location</Label>
              <Input
                id="listing-location"
                placeholder="New York, NY"
                value={listingLocation}
                onChange={(e) => setListingLocation(e.target.value)}
                disabled={listingBusy}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="available-from">Available from</Label>
                <Input
                  id="available-from"
                  type="date"
                  value={availableFrom}
                  onChange={(e) => setAvailableFrom(e.target.value)}
                  disabled={listingBusy}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="available-to">Available to</Label>
                <Input
                  id="available-to"
                  type="date"
                  value={availableTo}
                  onChange={(e) => setAvailableTo(e.target.value)}
                  disabled={listingBusy}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setListingProperty(null)}
              className="rounded-full font-semibold"
              disabled={listingBusy}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmListing}
              disabled={listingBusy}
              className="rounded-full font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {listingBusy
                ? 'Saving...'
                : listingProperty?.listingPriceCents !== undefined
                  ? 'Update listing'
                  : 'List property'}
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
      <Link href="/dashboard" className="hover:text-foreground transition-colors font-medium">
        Dashboard
      </Link>
      <span>/</span>
      <span className="text-foreground font-semibold">{here}</span>
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
    <div className="rounded-2xl border bg-card p-5 flex flex-col gap-2">
      <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="text-2xl font-bold font-mono tabular-nums">{value}</div>
    </div>
  );
}

function PropertyRow({
  property,
  onList,
  onUnlist,
}: {
  property: OwnedDomainRecord;
  onList: () => void;
  onUnlist: () => void;
}) {
  const isListed = property.listingPriceCents !== undefined;
  return (
    <div className="rounded-2xl border bg-card p-5 flex flex-col gap-3 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Home className="h-4 w-4 text-muted-foreground flex-none" />
            <h3 className="text-lg font-bold tracking-tight truncate">
              {property.name}
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
            {property.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {property.location}
              </span>
            )}
            <span>
              Listed{' '}
              {new Date(property.registeredAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
        {isListed ? (
          <Badge variant="success" className="shrink-0 font-semibold">
            <Calendar className="h-3 w-3" />
            Available
          </Badge>
        ) : (
          <Badge variant="secondary" className="shrink-0 font-semibold">
            Draft
          </Badge>
        )}
      </div>
      {isListed && (
        <div className="rounded-xl bg-primary/5 border border-primary/10 px-4 py-3">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Nightly rate
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums">
            {formatMoney(property.listingPriceCents ?? 0)}
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-2 mt-1">
        <Button
          onClick={onList}
          className="rounded-full font-semibold bg-primary text-primary-foreground hover:bg-primary/90 h-9"
          size="sm"
        >
          <Calendar className="h-3.5 w-3.5" />
          {isListed ? 'Update listing' : 'Set up listing'}
        </Button>
        {isListed && (
          <Button
            onClick={onUnlist}
            variant="outline"
            className="rounded-full font-semibold border h-9"
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

function LoadingState() {
  return (
    <div className="rounded-2xl border bg-card p-16 flex flex-col items-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
        <Building2 className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">Loading your properties...</p>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-2xl border bg-card p-16 flex flex-col items-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
        <Building2 className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <p className="text-lg font-bold">No properties yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          List your first property to start hosting.
        </p>
      </div>
      <Button
        onClick={onCreate}
        className="rounded-full font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <Plus className="h-4 w-4" />
        List your first property
      </Button>
    </div>
  );
}
