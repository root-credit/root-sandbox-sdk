import Link from 'next/link';
import { branding } from '@/lib/branding';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Top promo bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 py-2 text-center text-xs sm:text-sm font-medium">
          Have a spare room or vacation property? Start hosting with {branding.productName} today.{' '}
          <Link href="/signup" className="underline underline-offset-4 hover:opacity-80">
            Become a host
          </Link>
        </div>
      </div>

      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="https://logo.clearbit.com/airbnb.com"
              alt={branding.productName}
              height={28}
              width={28}
              className="h-7 w-auto"
            />
            <span className="text-lg font-bold tracking-tight text-foreground">{branding.productName}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-foreground">
            <a href="#how-it-works" className="hover:text-primary transition-colors">
              How it works
            </a>
            <a href="#features" className="hover:text-primary transition-colors">
              Features
            </a>
            <a href="#wallet" className="hover:text-primary transition-colors">
              {branding.walletName}
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="font-bold" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-full px-5"
              asChild
            >
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-x-0 top-0 h-[70%] bg-primary/10" />
          <div className="absolute -top-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-[20rem] w-[20rem] rounded-full bg-accent/30 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-7xl px-6 py-20 md:py-28 grid gap-12 md:grid-cols-2 items-center">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-primary-foreground">
              Short-Term Rentals
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-balance leading-[1.02] text-foreground">
              List your space. Book unique stays.{' '}
              <span className="relative inline-block">
                <span className="relative z-10">Get paid instantly.</span>
                <span className="absolute inset-x-0 bottom-1 h-3 bg-primary/30 -z-0" aria-hidden />
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty max-w-lg">
              {branding.productName} pairs the {branding.walletName} with a host-friendly marketplace
              — list properties for rent, book unique stays, and {branding.payoutVerb.toLowerCase()} to your bank or debit
              card whenever you&apos;re ready.
            </p>
            <ul className="flex flex-col gap-3 text-base text-foreground font-medium">
              <li className="flex items-center gap-3">
                <Check />
                Fund your {branding.walletName} with one ACH pull
              </li>
              <li className="flex items-center gap-3">
                <Check />
                List any property — set your nightly rate, we connect you with guests
              </li>
              <li className="flex items-center gap-3">
                <Check />
                {branding.payoutVerb} to a {branding.funderShortLabel.toLowerCase()} or debit card
              </li>
            </ul>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-full px-7 h-12 text-base"
                asChild
              >
                <Link href="/signup">Become a host</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-7 h-12 text-base font-bold border-2 border-foreground hover:bg-foreground hover:text-background"
                asChild
              >
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>

          {/* Hero showcase card — property listing tile */}
          <div className="relative">
            <div className="absolute -top-6 -left-6 h-24 w-24 rounded-2xl bg-accent rotate-6 -z-10" aria-hidden />
            <div className="rounded-3xl border-2 bg-card shadow-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <span className="inline-flex items-center justify-center rounded-full bg-primary/15 text-primary px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest">
                  Featured stays
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Explore
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <PropertyTile name="Modern Loft in SoHo" price="$189" badge="NYC" />
                <PropertyTile name="Beachfront Villa" price="$450" badge="Malibu" featured />
                <PropertyTile name="Cozy Mountain Cabin" price="$125" badge="Aspen" />
              </div>
              <div className="mt-5 flex items-center justify-between rounded-2xl bg-primary text-primary-foreground px-4 py-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-widest text-primary-foreground/70">
                    {branding.walletName}
                  </div>
                  <div className="text-2xl font-extrabold font-mono tabular-nums">$1,250.00</div>
                </div>
                <span className="rounded-full bg-primary-foreground text-primary px-3 py-1.5 text-xs font-bold uppercase tracking-widest">
                  Live
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t bg-muted py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
              How it works
            </p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-balance leading-[1.05] text-foreground">
              Three steps. Start earning.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-lg">
              Create an account, fund your {branding.walletName}, and start hosting or booking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Step
              n="01"
              title={`Fund your ${branding.walletName}`}
              body={`Link a ${branding.funderShortLabel.toLowerCase()} and pull funds via ACH into your ${branding.walletName} — your in-platform balance.`}
            />
            <Step
              n="02"
              title="List or book a stay"
              body="Add your property with a nightly rate, or browse the marketplace and book with one click using your wallet balance."
            />
            <Step
              n="03"
              title={`${branding.payoutVerb} when you're ready`}
              body={`Move your earnings from the wallet to a ${branding.funderShortLabel.toLowerCase()} or debit card. ${branding.payoutNoun}s settle fast.`}
            />
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section id="features" className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Features</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-balance leading-[1.05]">
              Built for hosts who value simplicity.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              code="WAL"
              title={branding.walletName}
              features={[
                'Single in-app balance for hosting and booking',
                'Funded via ACH pulls from your linked bank',
                'Real-time updates as bookings settle',
                'No idle reconciliation — moves are instant',
              ]}
            />
            <FeatureCard
              code="MKT"
              title="Property marketplace"
              features={[
                'Browse every property listed by other hosts',
                'Filter by location, price, or amenities',
                'Book with wallet balance — no card needed',
                'Your listings appear in seconds',
              ]}
            />
            <FeatureCard
              code="OUT"
              title={branding.payoutNoun}
              features={[
                `Send funds to a ${branding.funderShortLabel.toLowerCase()} or debit card`,
                `Manage every ${branding.payeeSingular.toLowerCase()} from one screen`,
                'Bank-grade security on every transfer',
                'Full activity ledger with receipts',
              ]}
            />
          </div>
        </div>
      </section>

      {/* Wallet / CTA */}
      <section id="wallet" className="bg-primary text-primary-foreground py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary-foreground/70 mb-4">
            {branding.walletName}
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-balance mb-5 leading-[1.05]">
            One wallet. Every booking. Always settled.
          </h2>
          <p className="text-lg text-primary-foreground/80 leading-relaxed max-w-xl mx-auto mb-8">
            The {branding.walletName} is the heart of {branding.productName}. Book stays from it, receive
            earnings into it, {branding.payoutVerb.toLowerCase()} from it — all on one ledger, all sandbox-safe.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold rounded-full px-7 h-12 text-base"
              asChild
            >
              <Link href="/signup">Open your dashboard</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-7 h-12 text-base font-bold border-2 border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              asChild
            >
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img
              src="https://logo.clearbit.com/airbnb.com"
              alt={branding.productName}
              height={28}
              width={28}
              className="h-7 w-auto"
            />
            <span className="text-sm font-bold text-foreground">{branding.productName}</span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {'© '}
            {new Date().getFullYear()} {branding.productName} · Powered by Root · Sandbox
            environment.
          </p>
        </div>
      </footer>
    </main>
  );
}

function Check() {
  return (
    <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-primary">
      <svg
        className="h-3 w-3 text-primary-foreground"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M2.5 6.5L5 9l4.5-5.5" />
      </svg>
    </span>
  );
}

function PropertyTile({
  name,
  price,
  badge,
  featured,
}: {
  name: string;
  price: string;
  badge: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-2xl border-2 px-4 py-3 transition-colors ${
        featured ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-foreground/30'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="inline-flex items-center justify-center rounded-full bg-primary/15 text-primary text-[10px] font-bold uppercase tracking-widest px-2.5 py-1">
          {badge}
        </span>
        <span className="font-semibold truncate">{name}</span>
      </div>
      <div className="text-right shrink-0">
        <span className="font-mono font-extrabold tabular-nums text-sm">{price}</span>
        <span className="text-xs text-muted-foreground">/night</span>
      </div>
    </div>
  );
}

function FeatureCard({
  code,
  title,
  features,
}: {
  code: string;
  title: string;
  features: string[];
}) {
  return (
    <div className="group rounded-3xl border-2 bg-card p-7 transition-all hover:border-primary hover:shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <span className="inline-flex items-center justify-center rounded-full bg-primary px-3 py-1.5 text-sm font-extrabold tracking-tight text-primary-foreground">
          {code}
        </span>
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Feature
        </span>
      </div>
      <h3 className="text-2xl font-extrabold tracking-tight mb-4">{title}</h3>
      <ul className="space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
            <Check />
            <span className="leading-snug">{f}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground">
        <span className="h-2 w-2 rounded-full bg-primary" />
        Active · Live
      </div>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="rounded-3xl border-2 p-7 bg-card hover:border-primary transition-colors">
      <div className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground h-12 w-12 text-lg font-extrabold mb-4">
        {n}
      </div>
      <h3 className="text-xl font-extrabold tracking-tight mb-2">{title}</h3>
      <p className="text-base text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}
