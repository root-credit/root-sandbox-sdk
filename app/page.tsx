import Link from 'next/link';
import { ArrowRight, Banknote, Users, Wallet, Zap } from 'lucide-react';
import { branding } from '@/lib/branding';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Top utility bar */}
      <div className="bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-6 py-2.5 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          New: instant tip payouts after every shift on {branding.productName}.{' '}
          <Link href="/signup" className="underline underline-offset-4 font-bold hover:text-primary">
            Get started
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
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-foreground">
            <a href="#how-it-works" className="hover:text-primary transition-colors">
              How it works
            </a>
            <a href="#features" className="hover:text-primary transition-colors">
              Features
            </a>
            <a href="#wallet" className="hover:text-primary transition-colors">
              Tip wallet
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="font-bold hidden sm:inline-flex" asChild>
              <Link href="/employee/login">I&apos;m a {branding.payeeSingular.toLowerCase()}</Link>
            </Button>
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
      <section className="relative overflow-hidden bg-secondary">
        <div className="mx-auto w-full max-w-7xl px-6 py-20 md:py-28 grid gap-14 md:grid-cols-2 items-center">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Built for hospitality
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-balance leading-[1.02] text-foreground">
              Tips, in their hands{' '}
              <span className="text-primary">tonight.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty max-w-lg">
              {branding.productName} pairs a {branding.payerSingular.toLowerCase()} wallet with one-tap
              tip payouts — fund from your operating account, list your crew, and push instant
              tips to the bank or debit card every {branding.payeeSingular.toLowerCase()} chose.
            </p>
            <ul className="flex flex-col gap-3 text-base text-foreground font-medium">
              <li className="flex items-center gap-3">
                <Check />
                Fund the {branding.productName} wallet with one ACH pull
              </li>
              <li className="flex items-center gap-3">
                <Check />
                Add your crew — servers, bartenders, runners, kitchen
              </li>
              <li className="flex items-center gap-3">
                <Check />
                Drop in tonight&apos;s tip totals and {branding.payoutVerb.toLowerCase()} instantly
              </li>
            </ul>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-full px-7 h-12 text-base"
                asChild
              >
                <Link href="/signup">
                  Onboard your {branding.payerSingular.toLowerCase()}
                  <ArrowRight className="h-4 w-4" />
                </Link>
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

          {/* Hero showcase — tonight's tip run preview card */}
          <div className="relative">
            <div className="absolute -top-6 -right-6 h-24 w-24 rounded-2xl bg-accent rotate-6 -z-10" aria-hidden />
            <div className="absolute -bottom-8 -left-6 h-20 w-20 rounded-2xl bg-primary/20 -rotate-6 -z-10" aria-hidden />
            <div className="rounded-2xl border-2 bg-card shadow-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    Tonight&apos;s tip pool · Fri close
                  </div>
                  <div className="text-3xl font-black font-mono tabular-nums mt-1">
                    $1,847.00
                  </div>
                </div>
                <span className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary px-3 py-1 text-[11px] font-bold uppercase tracking-widest">
                  Ready
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5 mb-5">
                <CrewRow name="Alex Rivera" role="Server" amount="$412.00" rail="Card" />
                <CrewRow name="Priya Shah" role="Bartender" amount="$528.00" rail="Bank" featured />
                <CrewRow name="Marcus Lee" role="Runner" amount="$284.00" rail="Card" />
                <CrewRow name="Jamie Cole" role="Kitchen" amount="$623.00" rail="Bank" />
              </div>

              <div className="flex items-center justify-between rounded-xl bg-foreground text-background px-4 py-3.5">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-widest text-background/60">
                    {branding.productName} wallet
                  </div>
                  <div className="text-xl font-black font-mono tabular-nums">$8,420.00</div>
                </div>
                <button
                  type="button"
                  className="rounded-full bg-primary text-primary-foreground px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest"
                >
                  {branding.payoutVerb}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t py-20 md:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
              How it works
            </p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-balance leading-[1.05]">
              Three steps. Zero envelopes.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-lg">
              Onboard your {branding.payerSingular.toLowerCase()}, fund your wallet, and pay your crew
              the moment last call hits — no spreadsheets, no week-long waits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Step
              n="01"
              title={`Fund your ${branding.productName} wallet`}
              body={`Link your ${branding.funderShortLabel.toLowerCase()} once, then pull funds via ACH into your ${branding.productName} wallet — your in-platform tip pool.`}
              icon={<Wallet className="h-5 w-5" />}
            />
            <Step
              n="02"
              title="Add your crew"
              body={`Add each ${branding.payeeSingular.toLowerCase()} with their role. They sign in with the same email and pick how they want to be paid — bank account or debit card.`}
              icon={<Users className="h-5 w-5" />}
            />
            <Step
              n="03"
              title="Send tonight's tips"
              body={`Drop in tonight's tip totals per ${branding.payeeSingular.toLowerCase()} and tap send. Funds land instantly — no waiting for next Friday.`}
              icon={<Zap className="h-5 w-5" />}
            />
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section id="features" className="bg-secondary py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
              Features
            </p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-balance leading-[1.05]">
              Built for the pace of the floor.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Wallet className="h-5 w-5" />}
              code="WALLET"
              title={`${branding.productName} wallet`}
              features={[
                `Funded via ACH from your ${branding.funderShortLabel.toLowerCase()}`,
                'Single in-app balance for every shift',
                'Real-time balance after every transfer',
                'No idle reconciliation — moves are instant',
              ]}
            />
            <FeatureCard
              icon={<Users className="h-5 w-5" />}
              code="CREW"
              title="Crew roster"
              features={[
                `Add ${branding.payeePlural.toLowerCase()} with their role and contact`,
                `Each ${branding.payeeSingular.toLowerCase()} signs in with their email`,
                'They pick bank or debit card payout',
                'Update or remove crew any time',
              ]}
            />
            <FeatureCard
              icon={<Banknote className="h-5 w-5" />}
              code="TIPS"
              title="Instant tip payouts"
              features={[
                `Drop in tonight's tip totals per ${branding.payeeSingular.toLowerCase()}`,
                `Routes via Root rails to each ${branding.payeeSingular.toLowerCase()}`,
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
            {branding.productName} wallet
          </p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-balance mb-5 leading-[1.05]">
            One wallet. Every shift. Tips out tonight.
          </h2>
          <p className="text-lg text-background/80 leading-relaxed max-w-xl mx-auto mb-8">
            The {branding.productName} wallet is the heart of every {branding.payerSingular.toLowerCase()}.
            Fund it from your {branding.funderShortLabel.toLowerCase()}, push tip payouts out of it,
            audit every move — all on one ledger, all sandbox-safe.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-full px-7 h-12 text-base"
              asChild
            >
              <Link href="/signup">
                Open your console
                <ArrowRight className="h-4 w-4" />
              </Link>
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
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-black">
              {branding.productName.charAt(0)}
            </span>
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

function Logo() {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-base font-black">
      {branding.productName.charAt(0)}
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

function CrewRow({
  name,
  role,
  amount,
  rail,
  featured,
}: {
  name: string;
  role: string;
  amount: string;
  rail: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 transition-colors ${
        featured ? 'border-primary bg-primary/5' : 'border-border bg-card'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground text-xs font-bold flex-none">
          {name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')}
        </span>
        <div className="min-w-0">
          <div className="font-bold truncate text-sm">{name}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {role} · {rail}
          </div>
        </div>
      </div>
      <span className="font-mono font-black tabular-nums text-sm">{amount}</span>
    </div>
  );
}

function FeatureCard({
  icon,
  code,
  title,
  features,
}: {
  icon: React.ReactNode;
  code: string;
  title: string;
  features: string[];
}) {
  return (
    <div className="group rounded-2xl border-2 bg-card p-7 transition-all hover:border-foreground hover:shadow-lg">
      <div className="flex items-center justify-between mb-5">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
          {icon}
        </span>
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          {code}
        </span>
      </div>
      <h3 className="text-2xl font-black tracking-tight mb-4">{title}</h3>
      <ul className="space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
            <Check />
            <span className="leading-snug">{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Step({
  n,
  title,
  body,
  icon,
}: {
  n: string;
  title: string;
  body: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border-2 p-7 bg-card hover:border-foreground transition-colors">
      <div className="flex items-center gap-3 mb-5">
        <span className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground h-11 w-11">
          {icon}
        </span>
        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
          Step {n}
        </span>
      </div>
      <h3 className="text-xl font-black tracking-tight mb-2">{title}</h3>
      <p className="text-base text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}
