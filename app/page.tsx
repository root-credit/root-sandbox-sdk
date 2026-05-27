import Link from 'next/link';
import { branding } from '@/lib/branding';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Top promo bar */}
      <div className="bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-6 py-2 text-center text-xs sm:text-sm font-medium">
          Banking made easy. No hidden fees, no minimum balance.{' '}
          <Link href="/signup" className="underline underline-offset-4 hover:text-primary">
            Get started free
          </Link>
        </div>
      </div>

      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span style={{ fontWeight: 800, fontSize: '20px', letterSpacing: '-0.03em', color: '#1A1A1A' }}>
              {branding.productName}
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-foreground">
            <a href="#how-it-works" className="hover:text-primary transition-colors">
              How it works
            </a>
            <a href="#features" className="hover:text-primary transition-colors">
              Features
            </a>
            <a href="#savings" className="hover:text-primary transition-colors">
              Savings
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
      <section className="relative overflow-hidden bg-background">
        <div className="mx-auto w-full max-w-7xl px-6 py-20 md:py-28 grid gap-12 md:grid-cols-2 items-center">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-primary-foreground">
              Online Banking
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-balance leading-[1.02] text-foreground">
              Your money.{' '}
              <span className="relative inline-block">
                <span className="relative z-10">Your way.</span>
                <span className="absolute inset-x-0 bottom-1 h-3 bg-primary/30 -z-0" aria-hidden />
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty max-w-lg">
              {branding.productName} is the banking app that has your back. No hidden fees, 
              no minimum balance, and get paid up to 2 days early with direct deposit.
            </p>
            <ul className="flex flex-col gap-3 text-base text-foreground font-medium">
              <li className="flex items-center gap-3">
                <Check />
                No monthly fees or minimum balance
              </li>
              <li className="flex items-center gap-3">
                <Check />
                Get paid up to 2 days early
              </li>
              <li className="flex items-center gap-3">
                <Check />
                Earn 2.00% APY on savings
              </li>
            </ul>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-full px-7 h-12 text-base"
                asChild
              >
                <Link href="/signup">Open a {branding.productName} account</Link>
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

          {/* Hero showcase card — Chime account preview */}
          <div className="relative">
            <div className="rounded-2xl border bg-card shadow-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <span className="inline-flex items-center justify-center rounded-full bg-primary/15 text-foreground px-3 py-1 text-[11px] font-bold uppercase tracking-widest">
                  Your accounts
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Dashboard
                </span>
              </div>
              
              {/* Spending Account Card */}
              <div className="rounded-xl bg-primary p-4 mb-3">
                <div className="text-[11px] font-bold uppercase tracking-widest text-primary-foreground/80">
                  {branding.walletName}
                </div>
                <div className="text-3xl font-extrabold font-mono tabular-nums text-primary-foreground mt-1">
                  $2,450.00
                </div>
              </div>
              
              {/* Savings Account */}
              <div className="rounded-xl border bg-background p-4 mb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                      {branding.savingsName}
                    </div>
                    <div className="text-2xl font-extrabold font-mono tabular-nums mt-1">
                      $5,200.00
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      APY
                    </div>
                    <div className="text-lg font-extrabold text-primary">2.00%</div>
                  </div>
                </div>
              </div>
              
              {/* Quick action */}
              <div className="flex items-center justify-between rounded-xl bg-card border p-3">
                <span className="text-sm font-semibold">Move money</span>
                <span className="text-xs font-bold text-primary">Spending → Savings</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t bg-card py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
              How it works
            </p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-balance leading-[1.05]">
              Banking that works for you.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-lg">
              Open a {branding.productName} account in minutes and start managing your money smarter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Step
              n="01"
              title="Open your account"
              body="Sign up in under 2 minutes. No credit check, no minimum deposit required to get started."
            />
            <Step
              n="02"
              title="Set up direct deposit"
              body="Get paid up to 2 days early when you set up direct deposit. Your money, faster."
            />
            <Step
              n="03"
              title="Save automatically"
              body="Turn on Auto-Save and watch your savings grow with every paycheck. Earn 2.00% APY."
            />
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section id="features" className="py-20 md:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Features</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-balance leading-[1.05]">
              Everything you need. Nothing you don&apos;t.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              code="SPD"
              title={branding.walletName}
              features={[
                'No monthly fees or minimums',
                'Get paid up to 2 days early',
                'Fee-free overdraft up to $200',
                '60,000+ fee-free ATMs',
              ]}
            />
            <FeatureCard
              code="SAV"
              title={branding.savingsName}
              features={[
                'Earn 2.00% APY on your balance',
                'Automatic savings with round-ups',
                'No minimum balance required',
                'Move money instantly',
              ]}
            />
            <FeatureCard
              code="OUT"
              title="Cash Out"
              features={[
                `${branding.payoutVerb} to any linked bank account`,
                'Instant transfers to debit card',
                'Bank-grade security',
                'Full transaction history',
              ]}
            />
          </div>
        </div>
      </section>

      {/* Savings / CTA */}
      <section id="savings" className="bg-primary py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary-foreground/80 mb-4">
            {branding.savingsName}
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-balance mb-5 leading-[1.05] text-primary-foreground">
            Make your money work harder.
          </h2>
          <p className="text-lg text-primary-foreground/90 leading-relaxed max-w-xl mx-auto mb-8">
            Earn 2.00% APY on your savings with no minimum balance. Set up Auto-Save and watch 
            your money grow automatically with every paycheck.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              className="bg-background text-foreground hover:bg-background/90 font-bold rounded-full px-7 h-12 text-base"
              asChild
            >
              <Link href="/signup">Start saving today</Link>
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
      <footer className="border-t bg-background">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '-0.03em', color: '#1A1A1A' }}>
              {branding.productName}
            </span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {'© '}
            {new Date().getFullYear()} {branding.productName} · Sandbox environment · Banking services provided by Bancorp Bank.
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
    <div className="group rounded-2xl border bg-card p-7 transition-all hover:border-foreground hover:shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <span className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-extrabold tracking-tight text-primary-foreground">
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
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl border p-7 bg-background hover:border-foreground transition-colors">
      <div className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground h-12 w-12 text-lg font-extrabold mb-4">
        {n}
      </div>
      <h3 className="text-xl font-extrabold tracking-tight mb-2">{title}</h3>
      <p className="text-base text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}
