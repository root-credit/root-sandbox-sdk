import Link from 'next/link';
import { branding } from '@/lib/branding';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Top promo bar — GoDaddy-style narrow utility band */}
      <div className="bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-6 py-2 text-center text-xs sm:text-sm font-medium">
          Got a domain to sell? Open an {branding.productName} account in seconds.{' '}
          <Link href="/signup" className="underline underline-offset-4 hover:text-primary">
            Get started
          </Link>
        </div>
      </div>

      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground text-base font-extrabold">
              {branding.productName.charAt(0)}
            </div>
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
              GAG wallet
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
          <div className="absolute inset-x-0 top-0 h-[70%] bg-primary/15" />
          <div className="absolute -top-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-[20rem] w-[20rem] rounded-full bg-accent/40 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-7xl px-6 py-20 md:py-28 grid gap-12 md:grid-cols-2 items-center">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-primary-foreground">
              Domain Marketplace
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-balance leading-[1.02] text-foreground">
              Buy domains. Sell domains.{' '}
              <span className="relative inline-block">
                <span className="relative z-10">Cash out instantly.</span>
                <span className="absolute inset-x-0 bottom-1 h-3 bg-primary -z-0" aria-hidden />
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty max-w-lg">
              {branding.productName} pairs a Good as Gold wallet with a creator-friendly marketplace
              — list domains for sale, buy from other accounts, and cash out to your bank or debit
              card whenever you&apos;re ready.
            </p>
            <ul className="flex flex-col gap-3 text-base text-foreground font-medium">
              <li className="flex items-center gap-3">
                <Check />
                Fund your GAG wallet with one ACH pull
              </li>
              <li className="flex items-center gap-3">
                <Check />
                Sell any domain you own — set the price, we route the buyers
              </li>
              <li className="flex items-center gap-3">
                <Check />
                {branding.payoutVerb} to a {branding.funderShortLabel.toLowerCase()} or debit card
              </li>
            </ul>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                size="lg"
                className="bg-foreground text-background hover:bg-foreground/90 font-bold rounded-full px-7 h-12 text-base"
                asChild
              >
                <Link href="/signup">Open an {branding.payerSingular.toLowerCase()}</Link>
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

          {/* Hero showcase card — mock domain marketplace tile */}
          <div className="relative">
            <div className="absolute -top-6 -left-6 h-24 w-24 rounded-2xl bg-accent rotate-6 -z-10" aria-hidden />
            <div className="rounded-2xl border-2 bg-card shadow-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <span className="inline-flex items-center justify-center rounded-full bg-primary/15 text-primary px-3 py-1 text-[11px] font-bold uppercase tracking-widest">
                  Trending now
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Marketplace
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <DomainTile name="cloudwave.io" price="$1,990" badge="Tech" />
                <DomainTile name="midnightcredit.com" price="$5,450" badge="Finance" featured />
                <DomainTile name="evergreen.shop" price="$3,200" badge="Business" />
              </div>
              <div className="mt-5 flex items-center justify-between rounded-xl bg-foreground text-background px-4 py-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-widest text-background/60">
                    GAG wallet
                  </div>
                  <div className="text-2xl font-extrabold font-mono tabular-nums">$1,250.00</div>
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
              Three steps. Zero spreadsheets.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-lg">
              Spin up an {branding.payerSingular.toLowerCase()}, fund your Good as Gold wallet, and start trading.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Step
              n="01"
              title="Fund your GAG wallet"
              body={`Link a ${branding.funderShortLabel.toLowerCase()} and pull funds via ACH into your Good as Gold wallet — your in-platform balance.`}
            />
            <Step
              n="02"
              title="List or buy a domain"
              body="Mark any domain you own for sale at your asking price, or browse the marketplace and buy with one click using your wallet balance."
            />
            <Step
              n="03"
              title={`${branding.payoutVerb} when you're ready`}
              body={`Move funds out of your wallet to a ${branding.funderShortLabel.toLowerCase()} or debit card. ${branding.payoutNoun} settles fast.`}
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
              Built for domain investors who hate friction.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              code="GAG"
              title="Good as Gold wallet"
              features={[
                'Single in-app balance for buying and selling',
                'Funded via ACH pulls from your linked bank',
                'Real-time updates as offers settle',
                'No idle reconciliation — moves are instant',
              ]}
            />
            <FeatureCard
              code="MKT"
              title="Open marketplace"
              features={[
                'Browse every domain listed by other accounts',
                'Filter by category, price, or traffic score',
                'Buy with wallet balance — no card needed',
                'Self-listings appear in seconds',
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
      <section id="wallet" className="bg-foreground text-background py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">
            Good as Gold
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-balance mb-5 leading-[1.05]">
            One wallet. Every move. Always settled.
          </h2>
          <p className="text-lg text-background/80 leading-relaxed max-w-xl mx-auto mb-8">
            The GAG wallet is the heart of {branding.productName}. Buy domains from it, receive
            sales into it, cash out from it — all on one ledger, all sandbox-safe.
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
            <div className="flex h-7 w-7 items-center justify-center rounded bg-primary text-primary-foreground text-xs font-extrabold">
              {branding.productName.charAt(0)}
            </div>
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

function DomainTile({
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
      className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 transition-colors ${
        featured ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-foreground/30'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="inline-flex items-center justify-center rounded-md bg-primary/15 text-primary text-[10px] font-bold uppercase tracking-widest px-2 py-1">
          {badge}
        </span>
        <span className="font-mono font-bold truncate">{name}</span>
      </div>
      <span className="font-mono font-extrabold tabular-nums text-sm">{price}</span>
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
    <div className="group rounded-2xl border-2 bg-card p-7 transition-all hover:border-foreground hover:shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <span className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-extrabold tracking-tight text-primary-foreground">
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
        {n}
      </div>
      <h3 className="text-xl font-extrabold tracking-tight mb-2">{title}</h3>
      <p className="text-base text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}
