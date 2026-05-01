import Link from 'next/link';
import Image from 'next/image';
import { branding } from '@/lib/branding';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Top promo bar */}
      <div className="bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-6 py-2 text-center text-xs sm:text-sm font-medium">
          Hosts earn an average of $924/mo on {branding.productName}.{' '}
          <Link href="/signup" className="underline underline-offset-4 hover:text-primary">
            Become a host
          </Link>
        </div>
      </div>

      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-card/90">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo />
            <span className="text-xl font-extrabold tracking-tight text-primary">
              {branding.productName.toLowerCase()}
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
              Wallet
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="font-bold rounded-full" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-full px-5 shadow-sm"
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
          <div className="absolute inset-x-0 top-0 h-[55%] bg-accent/40" />
          <div className="absolute -top-32 -right-32 h-[26rem] w-[26rem] rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-[20rem] w-[20rem] rounded-full bg-accent/60 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-7xl px-6 py-16 md:py-24 grid gap-12 md:grid-cols-2 items-center">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-primary-foreground shadow-sm">
              Stays · Hosting · Payouts
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-balance leading-[1.02] text-foreground">
              Book stays. Host trips.{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-primary">Cash out instantly.</span>
                <span
                  className="absolute inset-x-0 bottom-1 h-3 bg-accent -z-0"
                  aria-hidden
                />
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty max-w-lg">
              {branding.productName} pairs a member wallet with a real-world short-term rental
              marketplace. Top up, book the place you love, host your own — and {branding.payoutVerb.toLowerCase()}{' '}
              to your bank or debit card the moment a stay completes.
            </p>
            <ul className="flex flex-col gap-3 text-base text-foreground font-medium">
              <li className="flex items-center gap-3">
                <Check />
                Top up your wallet with one ACH pull
              </li>
              <li className="flex items-center gap-3">
                <Check />
                Book any stay — funds release on check-in
              </li>
              <li className="flex items-center gap-3">
                <Check />
                {branding.payoutVerb} to a {branding.funderShortLabel.toLowerCase()} or debit card
              </li>
            </ul>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-full px-7 h-12 text-base shadow-sm"
                asChild
              >
                <Link href="/signup">Become a {branding.payerSingular.toLowerCase()}</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-7 h-12 text-base font-bold border bg-card hover:bg-secondary"
                asChild
              >
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>

          {/* Hero showcase: stay photo + booking card */}
          <div className="relative">
            <div
              className="absolute -top-6 -left-6 h-24 w-24 rounded-2xl bg-primary/15 rotate-6 -z-10"
              aria-hidden
            />
            <div className="rounded-3xl overflow-hidden border bg-card shadow-2xl">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src="/images/hero-stay.jpg"
                  alt="A modern wooden cabin retreat surrounded by pine trees, bathed in warm afternoon light"
                  fill
                  priority
                  sizes="(min-width: 768px) 45vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-card/95 backdrop-blur px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-foreground shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Featured stay
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-card/95 backdrop-blur px-3 py-1.5 text-xs font-bold text-foreground shadow-sm">
                    <Star /> 4.97
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Asheville, NC
                    </p>
                    <h3 className="text-lg font-extrabold tracking-tight truncate">
                      Pinecrest cabin retreat
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-extrabold font-mono tabular-nums">$214</p>
                    <p className="text-xs text-muted-foreground">/ night</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4 text-xs font-semibold text-muted-foreground">
                  <span className="rounded-lg bg-secondary px-2 py-1.5 text-center">2 guests</span>
                  <span className="rounded-lg bg-secondary px-2 py-1.5 text-center">1 bed</span>
                  <span className="rounded-lg bg-secondary px-2 py-1.5 text-center">Wi-Fi</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-foreground text-background px-4 py-3">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-background/60">
                      Member wallet
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
            <p className="mt-4 text-lg text-muted-foreground max-w-lg leading-relaxed">
              Spin up a {branding.payerSingular.toLowerCase()} account, fund your wallet, and start
              booking or hosting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Step
              n="01"
              title="Top up your wallet"
              body={`Link a ${branding.funderShortLabel.toLowerCase()} and pull funds via ACH into your ${branding.productName} wallet — your in-platform balance.`}
            />
            <Step
              n="02"
              title="Book or host a stay"
              body="Browse listings and book with one tap, or list your own place — confirmed bookings settle directly into your wallet on check-in."
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
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
              Features
            </p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-balance leading-[1.05]">
              Built for guests and hosts who hate friction.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              code="WAL"
              title={`${branding.productName} wallet`}
              features={[
                'Single in-app balance for booking and hosting',
                'Funded via ACH pulls from your linked bank',
                'Real-time updates as bookings settle',
                'No idle reconciliation — moves are instant',
              ]}
            />
            <FeatureCard
              code="MKT"
              title="Open marketplace"
              features={[
                'Browse stays from hosts around the country',
                'Filter by location, price, or guest rating',
                'Book with wallet balance — no card juggling',
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
            {branding.productName} wallet
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-balance mb-5 leading-[1.05]">
            One wallet. Every booking. Always settled.
          </h2>
          <p className="text-lg text-background/80 leading-relaxed max-w-xl mx-auto mb-8">
            The {branding.productName} wallet is the heart of the platform. Book stays from it,
            receive host earnings into it, cash out from it — all on one ledger, all sandbox-safe.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-full px-7 h-12 text-base shadow-sm"
              asChild
            >
              <Link href="/signup">Open your console</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-7 h-12 text-base font-bold border bg-transparent text-background hover:bg-background hover:text-foreground"
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
            <span className="text-sm font-bold text-primary">
              {branding.productName.toLowerCase()}
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

function Logo({ small }: { small?: boolean }) {
  // Stylized Airbnb-esque "Bélo"-inspired mark in primary (Rausch).
  return (
    <span
      aria-hidden
      className={`flex items-center justify-center text-primary ${
        small ? 'h-6 w-6' : 'h-9 w-9'
      }`}
    >
      <svg viewBox="0 0 32 32" fill="currentColor" className="h-full w-full">
        <path d="M16 2c-1.4 0-2.7.7-3.4 2L2.6 21.7c-1.2 2.1-1.2 4.6 0 6.7C3.8 30.5 6 32 8.5 32c1.5 0 3-.5 4.2-1.5L16 28.1l3.3 2.4c1.2 1 2.7 1.5 4.2 1.5 2.5 0 4.7-1.5 5.9-3.6 1.2-2.1 1.2-4.6 0-6.7L19.4 4c-.7-1.3-2-2-3.4-2zm0 4 9.6 17.3c.5.9.5 2 0 2.9-.5.9-1.4 1.4-2.4 1.4-.7 0-1.4-.2-2-.7L16 23.6l-5.2 3.3c-.6.5-1.3.7-2 .7-1 0-1.9-.5-2.4-1.4-.5-.9-.5-2 0-2.9L16 6z" />
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

function Star() {
  return (
    <svg
      className="h-3.5 w-3.5 text-primary"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 15l-5.3 2.6 1-5.8L1.5 7.7l5.9-.9z" />
    </svg>
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
    <div className="group rounded-2xl border bg-card p-7 transition-all hover:border-foreground/30 hover:shadow-lg">
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
    <div className="rounded-2xl border bg-card p-7 hover:border-foreground/30 hover:shadow-md transition-all">
      <div className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground h-12 w-12 text-lg font-extrabold mb-4">
        {n}
      </div>
      <h3 className="text-xl font-extrabold tracking-tight mb-2">{title}</h3>
      <p className="text-base text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}
