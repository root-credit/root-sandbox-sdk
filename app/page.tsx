import Link from 'next/link';
import { branding } from '@/lib/branding';
import { Button } from '@/components/ui/button';

const CURRENCY_PAIRS = [
  { from: 'USD', to: 'EUR', rate: '0.92', flag: '🇪🇺' },
  { from: 'USD', to: 'INR', rate: '83.42', flag: '🇮🇳' },
  { from: 'USD', to: 'MXN', rate: '17.24', flag: '🇲🇽' },
  { from: 'USD', to: 'GBP', rate: '0.79', flag: '🇬🇧' },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <img 
              src="https://logo.clearbit.com/wise.com" 
              height={28}
              width={28}
              alt="Wise"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'inline';
              }}
              className="h-7 w-auto"
            />
            <span style={{ display: 'none' }} className="text-lg font-semibold text-[#9FE870]">
              {branding.productName}
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-foreground">
            <a href="#how-it-works" className="hover:text-primary transition-colors">
              How it works
            </a>
            <a href="#features" className="hover:text-primary transition-colors">
              Features
            </a>
            <a href="#rates" className="hover:text-primary transition-colors">
              Exchange rates
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="font-medium" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-full px-5"
              asChild
            >
              <Link href="/signup">Register</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-background">
        <div className="mx-auto w-full max-w-7xl px-6 py-16 md:py-24 grid gap-12 md:grid-cols-2 items-center">
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance leading-[1.1] text-foreground">
              Send money abroad.{' '}
              <span className="text-foreground">Fast, cheap, transparent.</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed text-pretty max-w-lg">
              Join over 16 million people who save money when sending abroad. With {branding.productName}, 
              you always get the real exchange rate and low, transparent fees.
            </p>
            <ul className="flex flex-col gap-3 text-base text-foreground font-medium">
              <li className="flex items-center gap-3">
                <Check />
                Send to 80+ countries worldwide
              </li>
              <li className="flex items-center gap-3">
                <Check />
                Up to 8x cheaper than banks
              </li>
              <li className="flex items-center gap-3">
                <Check />
                Most transfers arrive instantly
              </li>
            </ul>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-full px-7 h-12 text-base"
                asChild
              >
                <Link href="/signup">{branding.payoutVerb} money now</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-7 h-12 text-base font-medium border-2 border-foreground hover:bg-foreground hover:text-background"
                asChild
              >
                <Link href="/login">Log in</Link>
              </Button>
            </div>
          </div>

          {/* Hero transfer preview card */}
          <div className="relative">
            <div className="rounded-lg border border-border bg-background shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-medium text-muted-foreground">
                  You send exactly
                </span>
                <span className="text-xs font-medium text-primary">Live rate</span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="text-4xl font-bold font-mono tabular-nums">1,000.00</div>
                  <div className="text-sm text-muted-foreground mt-1">USD</div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card">
                  <span className="text-lg">🇺🇸</span>
                </div>
              </div>
              <div className="border-t border-border pt-4 mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Fee</span>
                  <span className="font-medium">- 7.48 USD</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Exchange rate</span>
                  <span className="font-medium">1 USD = 0.9185 EUR</span>
                </div>
              </div>
              <div className="rounded-lg bg-primary p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-primary-foreground/70">Recipient gets</div>
                    <div className="text-3xl font-bold font-mono tabular-nums text-primary-foreground">911.59</div>
                    <div className="text-sm text-primary-foreground/70 mt-1">EUR</div>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background/20">
                    <span className="text-2xl">🇪🇺</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Should arrive in seconds
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Currency rates */}
      <section className="border-t border-border bg-card py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {CURRENCY_PAIRS.map((pair) => (
              <div key={pair.to} className="flex items-center gap-3">
                <span className="text-2xl">{pair.flag}</span>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    1 {pair.from} = {pair.rate} {pair.to}
                  </div>
                  <div className="text-xs text-muted-foreground">Mid-market rate</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 md:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 max-w-2xl">
            <p className="text-sm font-semibold text-primary mb-3">
              How it works
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance leading-tight">
              Send money in three simple steps
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-lg">
              No hidden fees. No bad exchange rates. No surprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Step
              n="01"
              title="Add your funds"
              body="Link your bank account and fund your Wise Account Balance via ACH. Your money is secure and ready to send."
            />
            <Step
              n="02"
              title="Enter recipient details"
              body="Tell us who you're sending to. Add their name, bank account, and destination country. We support 80+ countries."
            />
            <Step
              n="03"
              title="Send instantly"
              body="Confirm the amount and we'll handle the rest. Most transfers arrive in seconds. Track every step in real-time."
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 md:py-24 bg-card">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 max-w-2xl">
            <p className="text-sm font-semibold text-primary mb-3">Features</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance leading-tight">
              Everything you need to send money abroad
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              title={branding.walletName}
              features={[
                'Hold and manage funds in USD',
                'Funded via ACH from your linked bank',
                'Send internationally anytime',
                'Real-time balance updates',
              ]}
            />
            <FeatureCard
              title="Real exchange rate"
              features={[
                'Always the mid-market rate',
                'No markups, no hidden margins',
                'See what you pay before you send',
                'Up to 8x cheaper than banks',
              ]}
            />
            <FeatureCard
              title="Fast transfers"
              features={[
                'Most transfers arrive instantly',
                'Send to 80+ countries',
                'Track your transfer in real-time',
                'Cash out to your bank anytime',
              ]}
            />
          </div>
        </div>
      </section>

      {/* Exchange rates */}
      <section id="rates" className="py-16 md:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center max-w-2xl mx-auto">
            <p className="text-sm font-semibold text-primary mb-3">Exchange rates</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance leading-tight">
              Always the real exchange rate
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Banks often hide fees in bad exchange rates. {branding.productName} gives you the real, mid-market rate.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CURRENCY_PAIRS.map((pair) => (
              <div 
                key={pair.to} 
                className="rounded-lg border border-border bg-background p-5 hover:border-primary transition-colors"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{pair.flag}</span>
                  <div>
                    <div className="font-semibold text-foreground">{pair.from} to {pair.to}</div>
                    <div className="text-xs text-muted-foreground">Mid-market rate</div>
                  </div>
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-foreground">
                  {pair.rate}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  1 {pair.from} = {pair.rate} {pair.to}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-foreground text-background py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance mb-5 leading-tight">
            Ready to send money abroad?
          </h2>
          <p className="text-lg text-background/80 leading-relaxed max-w-xl mx-auto mb-8">
            Join millions of people who trust {branding.productName} to send money abroad. 
            Fast, cheap, transparent.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-full px-7 h-12 text-base"
              asChild
            >
              <Link href="/signup">Get started for free</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-7 h-12 text-base font-medium border-2 border-background bg-transparent text-background hover:bg-background hover:text-foreground"
              asChild
            >
              <Link href="/login">Log in</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img 
              src="https://logo.clearbit.com/wise.com" 
              height={24}
              width={24}
              alt="Wise"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'inline';
              }}
              className="h-6 w-auto"
            />
            <span style={{ display: 'none' }} className="text-sm font-semibold text-[#9FE870]">
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

function FeatureCard({
  title,
  features,
}: {
  title: string;
  features: string[];
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-6 hover:border-primary transition-colors">
      <h3 className="text-xl font-semibold tracking-tight mb-4 text-foreground">{title}</h3>
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
    <div className="rounded-lg border border-border p-6 bg-background hover:border-primary transition-colors">
      <div className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground h-10 w-10 text-sm font-bold mb-4">
        {n}
      </div>
      <h3 className="text-lg font-semibold tracking-tight mb-2 text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}
