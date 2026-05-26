import Link from 'next/link';
import { branding } from '@/lib/branding';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Top promo bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 py-2 text-center text-xs sm:text-sm font-medium">
          Start trading crypto in minutes.{' '}
          <Link href="/signup" className="underline underline-offset-4 hover:opacity-80">
            Get started
          </Link>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="https://logo.clearbit.com/coinbase.com"
              height={24}
              width={24}
              alt=""
              className="object-contain"
            />
            <span
              className="text-xl font-extrabold tracking-tight"
              style={{ letterSpacing: '-0.03em', color: '#0052FF' }}
            >
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
            <a href="#wallet" className="hover:text-primary transition-colors">
              {branding.walletName}
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="font-bold text-foreground hover:bg-card" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl px-5"
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
          <div className="absolute -top-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-[20rem] w-[20rem] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-7xl px-6 py-20 md:py-28 grid gap-12 md:grid-cols-2 items-center">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-primary-foreground">
              Crypto Exchange
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-balance leading-[1.02] text-foreground">
              Buy crypto. Sell crypto.{' '}
              <span className="text-primary">Cash out instantly.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty max-w-lg">
              {branding.productName} pairs a {branding.walletName} with a simple trading interface
              — buy BTC, ETH, SOL, USDC, and cash out to your bank or debit card whenever you&apos;re ready.
            </p>
            <ul className="flex flex-col gap-3 text-base text-foreground font-medium">
              <li className="flex items-center gap-3">
                <Check />
                Fund your {branding.walletName} with one ACH pull
              </li>
              <li className="flex items-center gap-3">
                <Check />
                Buy and sell BTC, ETH, SOL, and USDC
              </li>
              <li className="flex items-center gap-3">
                <Check />
                {branding.payoutVerb} to a {branding.funderShortLabel.toLowerCase()} or debit card
              </li>
            </ul>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl px-7 h-12 text-base"
                asChild
              >
                <Link href="/signup">Open an {branding.payerSingular.toLowerCase()}</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl px-7 h-12 text-base font-bold border-2 border-border text-foreground hover:bg-card"
                asChild
              >
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>

          {/* Hero showcase card — crypto prices */}
          <div className="relative">
            <div className="absolute -top-6 -left-6 h-24 w-24 rounded-2xl bg-primary/20 rotate-6 -z-10" aria-hidden />
            <div className="rounded-2xl border border-border bg-card shadow-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <span className="inline-flex items-center justify-center rounded-full bg-primary/20 text-primary px-3 py-1 text-[11px] font-bold uppercase tracking-widest">
                  Live prices
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Market
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <CryptoTile symbol="BTC" name="Bitcoin" price="$67,234.50" change="+2.4%" positive />
                <CryptoTile symbol="ETH" name="Ethereum" price="$3,456.78" change="+1.8%" positive />
                <CryptoTile symbol="SOL" name="Solana" price="$142.56" change="-0.5%" />
                <CryptoTile symbol="USDC" name="USD Coin" price="$1.00" change="0.0%" positive />
              </div>
              <div className="mt-5 flex items-center justify-between rounded-xl bg-primary text-primary-foreground px-4 py-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-widest text-primary-foreground/70">
                    {branding.walletName}
                  </div>
                  <div className="text-2xl font-extrabold font-mono tabular-nums">$1,250.00</div>
                </div>
                <span className="rounded-full bg-primary-foreground/20 text-primary-foreground px-3 py-1.5 text-xs font-bold uppercase tracking-widest">
                  Live
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-border bg-card py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
              How it works
            </p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-balance leading-[1.05]">
              Three steps. Zero complexity.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-lg">
              Open an {branding.payerSingular.toLowerCase()}, fund your {branding.walletName}, and start trading.
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
              title="Buy or sell crypto"
              body="Buy BTC, ETH, SOL, or USDC with your balance, or sell your holdings back into USD."
            />
            <Step
              n="03"
              title={`${branding.payoutVerb} when you're ready`}
              body={`Move funds out of your ${branding.walletName} to a ${branding.funderShortLabel.toLowerCase()} or debit card. ${branding.payoutNoun} settles fast.`}
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
              Built for crypto traders who value simplicity.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              code="BAL"
              title={branding.walletName}
              features={[
                'Single in-app balance for buying and selling',
                'Funded via ACH pulls from your linked bank',
                'Real-time updates as trades settle',
                'No idle reconciliation — moves are instant',
              ]}
            />
            <FeatureCard
              code="TRD"
              title="Crypto trading"
              features={[
                'Buy BTC, ETH, SOL, and USDC instantly',
                'See live spot prices before you trade',
                'Sell holdings back to your cash balance',
                'Simple, transparent pricing',
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
            One balance. Every trade. Always settled.
          </h2>
          <p className="text-lg text-primary-foreground/80 leading-relaxed max-w-xl mx-auto mb-8">
            The {branding.walletName} is the heart of {branding.productName}. Buy crypto from it, sell
            crypto into it, cash out from it — all on one ledger, all sandbox-safe.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold rounded-xl px-7 h-12 text-base"
              asChild
            >
              <Link href="/signup">Open your console</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl px-7 h-12 text-base font-bold border-2 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              asChild
            >
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img
              src="https://logo.clearbit.com/coinbase.com"
              height={20}
              width={20}
              alt=""
              className="object-contain"
            />
            <span
              className="text-sm font-extrabold"
              style={{ letterSpacing: '-0.03em', color: '#0052FF' }}
            >
              {branding.productName}
            </span>
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

function CryptoTile({
  symbol,
  name,
  price,
  change,
  positive,
}: {
  symbol: string;
  name: string;
  price: string;
  change: string;
  positive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3 bg-background hover:border-primary/50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <span className="inline-flex items-center justify-center rounded-lg bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest px-2 py-1.5 w-12">
          {symbol}
        </span>
        <span className="font-semibold text-foreground">{name}</span>
      </div>
      <div className="text-right">
        <div className="font-mono font-bold tabular-nums text-sm text-foreground">{price}</div>
        <div className={`text-xs font-semibold ${positive ? 'text-accent' : 'text-destructive'}`}>
          {change}
        </div>
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
    <div className="group rounded-2xl border border-border bg-card p-7 transition-all hover:border-primary/50 hover:shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <span className="inline-flex items-center justify-center rounded-lg bg-primary px-3 py-1.5 text-sm font-extrabold tracking-tight text-primary-foreground">
          {code}
        </span>
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Module
        </span>
      </div>
      <h3 className="text-2xl font-extrabold tracking-tight mb-4 text-foreground">{title}</h3>
      <ul className="space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
            <Check />
            <span className="leading-snug">{f}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground">
        <span className="h-2 w-2 rounded-full bg-accent" />
        Active · Live
      </div>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border p-7 bg-background hover:border-primary/50 transition-colors">
      <div className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground h-12 w-12 text-lg font-extrabold mb-4">
        {n}
      </div>
      <h3 className="text-xl font-extrabold tracking-tight mb-2 text-foreground">{title}</h3>
      <p className="text-base text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}
