import Link from 'next/link';
import { branding } from '@/lib/branding';
import { Button } from '@/components/ui/button';
import {
  Briefcase,
  CalendarPlus,
  Clock,
  MapPin,
  ShieldCheck,
  Wallet,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Top promo bar */}
      <div className="bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-6 py-2 text-center text-xs sm:text-sm font-medium">
          Need a hygienist tomorrow? Hire by the hour on {branding.productName}.{' '}
          <Link href="/signup" className="underline underline-offset-4 hover:text-primary">
            Get started
          </Link>
        </div>
      </div>

      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <ToothMark />
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
              Wallet
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="font-bold" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button
              size="sm"
              className="bg-foreground text-background hover:bg-foreground/90 font-bold rounded-full px-5"
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
          <div className="absolute -top-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-primary/25 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-[20rem] w-[20rem] rounded-full bg-accent/40 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-7xl px-6 py-20 md:py-28 grid gap-12 md:grid-cols-2 items-center">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-primary-foreground">
              Dental temp staffing
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-balance leading-[1.02] text-foreground">
              Staff your chair.{' '}
              <span className="relative inline-block">
                <span className="relative z-10">Pay by the hour.</span>
                <span className="absolute inset-x-0 bottom-1 h-3 bg-primary -z-0" aria-hidden />
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty max-w-lg">
              {branding.productName} pairs an in-app wallet with a marketplace of dental
              hygienists, assistants, and front-desk pros — fund once, hire on demand, and
              withdraw earnings whenever you&apos;re ready.
            </p>
            <ul className="flex flex-col gap-3 text-base text-foreground font-medium">
              <li className="flex items-center gap-3">
                <Check />
                Fund your wallet with one ACH pull
              </li>
              <li className="flex items-center gap-3">
                <Check />
                Hire posted shifts — settles instantly to the staffer&apos;s wallet
              </li>
              <li className="flex items-center gap-3">
                <Check />
                {branding.payoutVerb} earnings to a {branding.funderShortLabel.toLowerCase()} or debit card
              </li>
            </ul>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                size="lg"
                className="bg-foreground text-background hover:bg-foreground/90 font-bold rounded-full px-7 h-12 text-base"
                asChild
              >
                <Link href="/signup">Open a {branding.payerSingular.toLowerCase()} account</Link>
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

          {/* Hero showcase — mock shift marketplace tile */}
          <div className="relative">
            <div className="absolute -top-6 -left-6 h-24 w-24 rounded-2xl bg-accent rotate-6 -z-10" aria-hidden />
            <div className="rounded-2xl border-2 bg-card shadow-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <span className="inline-flex items-center justify-center rounded-full bg-primary/15 text-primary px-3 py-1 text-[11px] font-bold uppercase tracking-widest">
                  Available now
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Marketplace
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <ShiftTile
                  role="Dental Hygienist"
                  rate="$58/hr"
                  hours="8h"
                  city="Austin, TX"
                  featured
                />
                <ShiftTile role="Dental Assistant" rate="$36/hr" hours="6h" city="Plano, TX" />
                <ShiftTile role="Front Desk" rate="$28/hr" hours="8h" city="San Antonio, TX" />
              </div>
              <div className="mt-5 flex items-center justify-between rounded-xl bg-foreground text-background px-4 py-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-widest text-background/60">
                    {branding.productName} wallet
                  </div>
                  <div className="text-2xl font-extrabold font-mono tabular-nums">$2,480.00</div>
                </div>
                <span className="rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-xs font-bold uppercase tracking-widest">
                  Live
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
              Three steps. Zero phone tag.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-lg">
              Open an account, fund your wallet, and start filling chairs — or post the days
              you can work and let practices hire you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Step
              n="01"
              title="Fund your wallet"
              body={`Link a ${branding.funderShortLabel.toLowerCase()} and pull funds via ACH into your ${branding.productName} wallet — your in-app balance.`}
            />
            <Step
              n="02"
              title="Hire or post a shift"
              body="Browse open shifts and hire instantly with your wallet. Or post the days you can cover at your hourly rate."
            />
            <Step
              n="03"
              title={`${branding.payoutVerb} when you're ready`}
              body={`Move earnings out of your wallet to a ${branding.funderShortLabel.toLowerCase()} or debit card. ${branding.payoutNoun} settles fast.`}
            />
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section id="features" className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
              Features
            </p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-balance leading-[1.05]">
              Built for dental practices and the pros they hire.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Wallet className="h-5 w-5" />}
              code="WAL"
              title={`${branding.productName} wallet`}
              features={[
                'Single in-app balance for hiring and earning',
                'Funded via ACH pulls from your linked bank',
                'Real-time updates as bookings settle',
                'Auto-provisioned the moment you sign up',
              ]}
            />
            <FeatureCard
              icon={<Briefcase className="h-5 w-5" />}
              code="MKT"
              title="Open shift marketplace"
              features={[
                'Browse every open shift posted by other members',
                'Filter by role, location, or hourly rate',
                'Hire with one tap — wallet covers the booking',
                'Self-listings appear in seconds',
              ]}
            />
            <FeatureCard
              icon={<ShieldCheck className="h-5 w-5" />}
              code="OUT"
              title={branding.payoutNoun}
              features={[
                `Send earnings to a ${branding.funderShortLabel.toLowerCase()} or debit card`,
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
            One wallet, every move
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-balance mb-5 leading-[1.05]">
            Hire. Earn. Withdraw. All on one ledger.
          </h2>
          <p className="text-lg text-background/80 leading-relaxed max-w-xl mx-auto mb-8">
            The {branding.productName} wallet is the heart of every member account. Hire from it,
            receive bookings into it, withdraw out of it — sandbox-safe and audit-ready.
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
            <ToothMark size="sm" />
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

function ToothMark({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'h-7 w-7' : 'h-9 w-9';
  return (
    <span
      aria-hidden
      className={`inline-flex ${dim} items-center justify-center rounded-xl bg-primary text-primary-foreground`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'}
      >
        <path d="M7.5 3C5.6 3 4 4.6 4 6.5c0 1.4.4 2.6.9 3.7.5 1.2.7 2.4.6 3.7l-.2 4.4c-.1 1.4 1 2.7 2.5 2.7 1.4 0 2.4-1.1 2.5-2.5l.3-3.5c.1-1 .9-1.7 1.9-1.7s1.8.7 1.9 1.7l.3 3.5c.1 1.4 1.1 2.5 2.5 2.5 1.5 0 2.6-1.3 2.5-2.7l-.2-4.4c-.1-1.3.1-2.5.6-3.7.5-1.1.9-2.3.9-3.7C20 4.6 18.4 3 16.5 3c-1.3 0-2.5.6-3.3 1.5L12 5.7l-1.2-1.2C10 3.6 8.8 3 7.5 3Z" />
      </svg>
    </span>
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

function ShiftTile({
  role,
  rate,
  hours,
  city,
  featured,
}: {
  role: string;
  rate: string;
  hours: string;
  city: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 transition-colors ${
        featured ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-foreground/30'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="inline-flex items-center justify-center rounded-md bg-primary/15 text-primary text-[10px] font-bold uppercase tracking-widest px-2 py-1">
          {role.split(' ')[0]}
        </span>
        <div className="min-w-0">
          <div className="font-bold truncate text-sm">{role}</div>
          <div className="text-[11px] text-muted-foreground font-semibold flex items-center gap-2">
            <Clock className="h-3 w-3" />
            {hours}
            <MapPin className="h-3 w-3 ml-1" />
            {city}
          </div>
        </div>
      </div>
      <span className="font-mono font-extrabold tabular-nums text-sm">{rate}</span>
    </div>
  );
}

function FeatureCard({
  code,
  title,
  features,
  icon,
}: {
  code: string;
  title: string;
  features: string[];
  icon: React.ReactNode;
}) {
  return (
    <div className="group rounded-2xl border-2 bg-card p-7 transition-all hover:border-foreground hover:shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <span className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-extrabold tracking-tight text-primary-foreground gap-1.5">
          {icon}
          {code}
        </span>
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
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

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl border-2 p-7 bg-card hover:border-foreground transition-colors">
      <div className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground h-12 w-12 text-lg font-extrabold mb-4">
        <CalendarPlus className="hidden" />
        {n}
      </div>
      <h3 className="text-xl font-extrabold tracking-tight mb-2">{title}</h3>
      <p className="text-base text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}
