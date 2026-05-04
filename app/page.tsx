import Link from 'next/link';
import {
  CalendarCheck,
  ClipboardList,
  HardHat,
  ShieldCheck,
  Sparkles,
  Wallet,
  Zap,
} from 'lucide-react';
import { branding } from '@/lib/branding';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Top promo bar */}
      <div className="bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-6 py-2 text-center text-xs sm:text-sm font-medium">
          Need shifts staffed today?{' '}
          <Link href="/signup" className="underline underline-offset-4 hover:text-primary">
            Open a {branding.payerSingular.toLowerCase()} in two minutes
          </Link>
        </div>
      </div>

      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo />
            <span className="text-lg font-extrabold tracking-tight">{branding.productName}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-foreground">
            <a href="#how-it-works" className="hover:text-primary transition-colors">
              How it works
            </a>
            <a href="#features" className="hover:text-primary transition-colors">
              Features
            </a>
            <a href="#wallet" className="hover:text-primary transition-colors">
              Wallet & payouts
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
          <div className="absolute inset-x-0 top-0 h-[70%] bg-secondary" />
          <div className="absolute -top-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-primary/25 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-[20rem] w-[20rem] rounded-full bg-accent/60 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-7xl px-6 py-20 md:py-28 grid gap-12 md:grid-cols-2 items-center">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-primary-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              Light-industrial staffing
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-balance leading-[1.02] text-foreground">
              Staff your shifts.{' '}
              <span className="relative inline-block">
                <span className="relative z-10">Pay your crew.</span>
                <span className="absolute inset-x-0 bottom-1 h-3 bg-primary/40 -z-0" aria-hidden />
              </span>{' '}
              Same day.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty max-w-lg">
              {branding.productName} is a labor marketplace built for shift work. Open a{' '}
              {branding.payerSingular.toLowerCase()}, fund your wallet over ACH, book vetted{' '}
              {branding.payeePlural.toLowerCase()}, and run payroll the second a shift wraps.
            </p>
            <ul className="flex flex-col gap-3 text-base text-foreground font-medium">
              <li className="flex items-center gap-3">
                <Check />
                Fund your {branding.productName} wallet with one ACH pull
              </li>
              <li className="flex items-center gap-3">
                <Check />
                Book {branding.payeePlural.toLowerCase()} from a live talent marketplace
              </li>
              <li className="flex items-center gap-3">
                <Check />
                {branding.payoutVerb} to a {branding.funderShortLabel.toLowerCase()} or debit card the same day
              </li>
            </ul>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-full px-7 h-12 text-base"
                asChild
              >
                <Link href="/signup">Open a {branding.payerSingular.toLowerCase()}</Link>
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

          {/* Hero showcase: shift roster + wallet */}
          <div className="relative">
            <div
              className="absolute -top-6 -left-6 h-24 w-24 rounded-2xl bg-accent rotate-6 -z-10"
              aria-hidden
            />
            <div className="rounded-2xl border-2 bg-card shadow-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <span className="inline-flex items-center justify-center rounded-full bg-primary/15 text-primary px-3 py-1 text-[11px] font-bold uppercase tracking-widest">
                  <CalendarCheck className="h-3 w-3 mr-1" />
                  Today&apos;s roster
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Live
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <WorkerTile name="Alex Rivera" role="Warehouse · Picker" rate="$148" />
                <WorkerTile name="Priya Singh" role="Food prep · Lead" rate="$172" featured />
                <WorkerTile name="Marcus Lee" role="Forklift · OSHA-10" rate="$210" />
              </div>
              <div className="mt-5 flex items-center justify-between rounded-xl bg-foreground text-background px-4 py-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-widest text-background/60">
                    {branding.productName} wallet
                  </div>
                  <div className="text-2xl font-extrabold font-mono tabular-nums">$4,250.00</div>
                </div>
                <span className="rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-xs font-bold uppercase tracking-widest">
                  Funded
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t bg-secondary py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
              How it works
            </p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-balance leading-[1.05]">
              Three steps. Zero spreadsheets.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-lg">
              Open a {branding.payerSingular.toLowerCase()}, fund your {branding.productName} wallet,
              and start booking shift workers from the live marketplace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Step
              n="01"
              icon={<Wallet className="h-5 w-5" />}
              title={`Fund your ${branding.productName} wallet`}
              body={`Link your ${branding.funderShortLabel.toLowerCase()} and pull funds via ACH into your in-app balance — ready to cover wages.`}
            />
            <Step
              n="02"
              icon={<HardHat className="h-5 w-5" />}
              title="Book your crew"
              body="Browse vetted shift workers in the marketplace. Pick the right hands for the shift, lock them in with one tap."
            />
            <Step
              n="03"
              icon={<Zap className="h-5 w-5" />}
              title={`${branding.payoutVerb} the moment a shift wraps`}
              body={`Approve completed shifts and ${branding.payoutVerb.toLowerCase()} from your wallet to each ${branding.payeeSingular.toLowerCase()}'s ${branding.funderShortLabel.toLowerCase()} or debit card.`}
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
              Built for ops leads who run on the clock.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              code="WAL"
              title={`${branding.productName} wallet`}
              icon={<Wallet className="h-4 w-4" />}
              features={[
                'Single in-app balance for every shift you staff',
                `Funded via ACH pulls from your ${branding.funderShortLabel.toLowerCase()}`,
                'Real-time updates as bookings settle',
                'No idle reconciliation — moves are instant',
              ]}
            />
            <FeatureCard
              code="MKT"
              title="Talent marketplace"
              icon={<ClipboardList className="h-4 w-4" />}
              features={[
                'Browse every shift worker available right now',
                'Filter by role, day rate, or certifications',
                'Book directly from your wallet — no card needed',
                'Workers self-list and update availability live',
              ]}
            />
            <FeatureCard
              code="OUT"
              title={branding.payoutNounPlural}
              icon={<ShieldCheck className="h-4 w-4" />}
              features={[
                `Send wages to a ${branding.funderShortLabel.toLowerCase()} or debit card`,
                `Manage every ${branding.payeeSingular.toLowerCase()} from one screen`,
                'Bank-grade security on every transfer',
                'Full activity ledger with receipts',
              ]}
            />
          </div>
        </div>
      </section>

      {/* Wallet / CTA */}
      <section id="wallet" className="bg-foreground text-background py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">
            One wallet, one ledger
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-balance mb-5 leading-[1.05]">
            Pull funds in. Pay your crew out. Always settled.
          </h2>
          <p className="text-lg text-background/80 leading-relaxed max-w-xl mx-auto mb-8">
            The {branding.productName} wallet is the heart of the platform. ACH pulls in,
            wallet-to-wallet settles for bookings, and {branding.payoutNounPlural.toLowerCase()} out
            to your crew — all on one ledger, all sandbox-safe.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-full px-7 h-12 text-base"
              asChild
            >
              <Link href="/signup">Open your console</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-7 h-12 text-base font-bold border-2 border-background bg-transparent text-background hover:bg-background hover:text-foreground"
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
          <div className="flex items-center gap-2.5">
            <Logo small />
            <span className="text-sm font-bold">{branding.productName}</span>
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

function Logo({ small }: { small?: boolean }) {
  return (
    <div
      className={`flex items-center justify-center rounded-md bg-primary text-primary-foreground font-extrabold ${
        small ? 'h-7 w-7 text-xs' : 'h-9 w-9 text-base'
      }`}
    >
      {branding.productName.charAt(0)}
    </div>
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

function WorkerTile({
  name,
  role,
  rate,
  featured,
}: {
  name: string;
  role: string;
  rate: string;
  featured?: boolean;
}) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 transition-colors ${
        featured ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-foreground/30'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full bg-foreground text-background text-xs font-extrabold">
          {initials}
        </span>
        <div className="min-w-0">
          <div className="font-bold truncate">{name}</div>
          <div className="text-xs text-muted-foreground font-semibold truncate">{role}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Day rate
        </div>
        <div className="font-mono font-extrabold tabular-nums text-sm">{rate}</div>
      </div>
    </div>
  );
}

function FeatureCard({
  code,
  title,
  icon,
  features,
}: {
  code: string;
  title: string;
  icon: React.ReactNode;
  features: string[];
}) {
  return (
    <div className="group rounded-2xl border-2 bg-card p-7 transition-all hover:border-foreground hover:shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <span className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-extrabold tracking-tight text-primary-foreground">
          {code}
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {icon}
          Module
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

function Step({
  n,
  icon,
  title,
  body,
}: {
  n: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border-2 p-7 bg-card hover:border-foreground transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <div className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground h-12 w-12 text-lg font-extrabold">
          {n}
        </div>
        <span className="inline-flex items-center justify-center rounded-md bg-primary/15 text-primary h-9 w-9">
          {icon}
        </span>
      </div>
      <h3 className="text-xl font-extrabold tracking-tight mb-2">{title}</h3>
      <p className="text-base text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}
