import Link from 'next/link';
import { branding } from '@/lib/branding';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card/95 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Mark className="h-8 w-8 text-primary" />
            <span className="text-xl font-extrabold tracking-tight text-primary">
              {branding.productName.toLowerCase()}
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-foreground">
            <a href="#how-it-works" className="hover:text-primary transition-colors">
              How it works
            </a>
            <a href="#stay" className="hover:text-primary transition-colors">
              Find a stay
            </a>
            <a href="#host" className="hover:text-primary transition-colors">
              Host your home
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="font-bold rounded-full" asChild>
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
          <div className="absolute -top-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -bottom-20 -left-24 h-[20rem] w-[20rem] rounded-full bg-accent/40 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-7xl px-6 py-20 md:py-24 grid gap-12 md:grid-cols-2 items-center">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-1.5 text-xs font-bold uppercase tracking-wide">
              Belong anywhere
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-balance leading-[1.02] text-foreground">
              Find your stay.{' '}
              <span className="text-primary">Host your space.</span>{' '}
              Get paid instantly.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty max-w-lg">
              Open an {branding.payerSingular.toLowerCase()} in seconds. Activate your{' '}
              {branding.productName} wallet, list a home, or book a place to stay — all settled
              wallet-to-wallet.
            </p>
            <ul className="flex flex-col gap-3 text-base text-foreground font-medium">
              <li className="flex items-center gap-3">
                <Check />
                Fund your {branding.productName} wallet with one ACH pull
              </li>
              <li className="flex items-center gap-3">
                <Check />
                List your home for any window — guests book in one tap
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
                <Link href="/signup">Open an {branding.payerSingular.toLowerCase()}</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-7 h-12 text-base font-bold border hover:bg-secondary"
                asChild
              >
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>

          {/* Hero showcase — featured stays grid */}
          <div className="relative">
            <div className="absolute -top-8 -left-8 h-24 w-24 rounded-2xl bg-accent rotate-6 -z-10" aria-hidden />
            <div className="grid grid-cols-2 gap-4">
              <FeaturedStay
                seed="malibu-cliffside"
                title="Cliffside cabin"
                location="Malibu, CA"
                price="$420"
                tag="Trending"
              />
              <FeaturedStay
                seed="brooklyn-loft"
                title="Sunlit loft"
                location="Brooklyn, NY"
                price="$185"
                tag="New"
                offset
              />
              <FeaturedStay
                seed="asheville-cottage"
                title="Forest cottage"
                location="Asheville, NC"
                price="$140"
                tag="Cozy"
                offset
              />
              <FeaturedStay
                seed="tulum-villa"
                title="Tulum villa"
                location="Tulum, MX"
                price="$310"
                tag="Beach"
              />
            </div>
            <div className="mt-5 rounded-2xl bg-foreground text-background px-5 py-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-background/60">
                  {branding.productName} wallet
                </div>
                <div className="text-2xl font-extrabold font-mono tabular-nums">$1,250.00</div>
              </div>
              <span className="rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-xs font-bold uppercase tracking-widest">
                Live
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t bg-secondary/40 py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
              How it works
            </p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-balance leading-[1.05]">
              Three steps from sign-up to first stay.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-lg">
              Open an {branding.payerSingular.toLowerCase()}, fund your wallet, and start hosting
              or booking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Step
              n="01"
              title={`Activate your ${branding.productName} wallet`}
              body={`Link a ${branding.funderShortLabel.toLowerCase()} and pull funds via ACH into your wallet — your in-app balance for every stay.`}
            />
            <Step
              n="02"
              title="Book a stay or list your home"
              body="Browse homes other accounts are renting and book in one tap, or open your space to guests for any date window."
            />
            <Step
              n="03"
              title={`${branding.payoutVerb} earnings any time`}
              body={`Move funds from your wallet to a ${branding.funderShortLabel.toLowerCase()} or debit card whenever you're ready.`}
            />
          </div>
        </div>
      </section>

      {/* Stay / Host */}
      <section id="stay" className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6 grid gap-8 lg:grid-cols-2">
          <FeatureCard
            tag="Travel"
            title="Find your next stay"
            features={[
              'Browse homes hosted by every account on the platform',
              'Filter by city or host handle',
              'Reserve with wallet balance — no card on file needed',
              'See every booking in your Trips ledger',
            ]}
            ctaHref="/signup"
            ctaLabel="Find a stay"
          />
          <FeatureCard
            id="host"
            tag="Host"
            title="Open your home to guests"
            features={[
              'List a home with title, location, and a check-in window',
              'Guests book with their wallet — funds settle instantly',
              'Remove a listing any time it’s still unbooked',
              'Track gross earnings on your hosting dashboard',
            ]}
            ctaHref="/signup"
            ctaLabel="Become a host"
            tinted
          />
        </div>
      </section>

      {/* Wallet / CTA */}
      <section className="bg-foreground text-background py-20 md:py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">
            One wallet
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-balance mb-5 leading-[1.05]">
            Every booking. Every payout. Always settled.
          </h2>
          <p className="text-lg text-background/80 leading-relaxed max-w-xl mx-auto mb-8">
            The {branding.productName} wallet is the heart of your console. Book stays from it,
            receive guest payments into it, {branding.payoutVerb.toLowerCase()} from it — all on
            one ledger, all sandbox-safe.
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
          <div className="flex items-center gap-2">
            <Mark className="h-6 w-6 text-primary" />
            <span className="text-sm font-bold text-primary">{branding.productName.toLowerCase()}</span>
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

function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M16 2c2.5 0 4.6 1.7 5.5 4 .5 1.4 1.1 2.7 1.7 4 1.4 2.9 3 5.6 4.4 8.5 1 2 1.4 4.2.6 6.4-1 2.7-3.4 4.4-6.3 4.6-2.6.2-4.7-1-6.4-2.8-1.7 1.8-3.8 3-6.4 2.8-2.9-.2-5.3-1.9-6.3-4.6-.8-2.2-.4-4.4.6-6.4 1.4-2.9 3-5.6 4.4-8.5.6-1.3 1.2-2.6 1.7-4C11.4 3.7 13.5 2 16 2Zm0 4.4c-1.2 0-2 .9-2.5 2.1-.5 1.3-1 2.5-1.7 3.7-1.4 2.7-2.9 5.3-4.2 8-.6 1.2-.7 2.4-.2 3.6.6 1.5 2 2.4 3.7 2.4 1.6 0 3-.7 4.3-2-.6-.8-1.1-1.7-1.6-2.6-.7-1.4-.4-3 .8-3.9 1.2-1 3-.9 4.1.2 1.1 1.1 1.2 2.9.2 4.1-.5.6-.9 1.3-1.4 2-.1.1-.1.2 0 .3 1.3 1.2 2.7 1.9 4.3 1.9 1.7 0 3.1-.9 3.7-2.4.5-1.2.4-2.4-.2-3.6-1.3-2.7-2.8-5.3-4.2-8-.7-1.2-1.2-2.4-1.7-3.7-.5-1.2-1.3-2.1-2.5-2.1Z" />
    </svg>
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

function FeaturedStay({
  seed,
  title,
  location,
  price,
  tag,
  offset,
}: {
  seed: string;
  title: string;
  location: string;
  price: string;
  tag: string;
  offset?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border bg-card overflow-hidden hover:shadow-xl transition-all ${
        offset ? 'mt-6' : ''
      }`}
    >
      <div className="relative aspect-square bg-muted overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://picsum.photos/seed/${seed}/600/600`}
          alt={`${title} in ${location}`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <span className="absolute top-2 left-2 rounded-full bg-background/95 backdrop-blur px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest border">
          {tag}
        </span>
      </div>
      <div className="px-3 py-3">
        <div className="text-sm font-extrabold tracking-tight truncate">{title}</div>
        <div className="text-xs text-muted-foreground font-semibold truncate">{location}</div>
        <div className="text-sm font-bold mt-1.5">
          <span className="font-mono tabular-nums">{price}</span>{' '}
          <span className="text-muted-foreground font-normal">/ night</span>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  id,
  tag,
  title,
  features,
  ctaHref,
  ctaLabel,
  tinted,
}: {
  id?: string;
  tag: string;
  title: string;
  features: string[];
  ctaHref: string;
  ctaLabel: string;
  tinted?: boolean;
}) {
  return (
    <div
      id={id}
      className={`rounded-3xl p-8 md:p-10 border ${
        tinted ? 'bg-primary text-primary-foreground border-primary' : 'bg-card'
      }`}
    >
      <span
        className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest mb-4 ${
          tinted ? 'bg-primary-foreground/15 text-primary-foreground' : 'bg-primary/10 text-primary'
        }`}
      >
        {tag}
      </span>
      <h3 className="text-3xl font-extrabold tracking-tight mb-5">{title}</h3>
      <ul className="space-y-3 mb-7">
        {features.map((f) => (
          <li
            key={f}
            className={`flex items-start gap-3 text-sm leading-snug ${
              tinted ? 'text-primary-foreground/90' : 'text-foreground'
            }`}
          >
            <span
              className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-none ${
                tinted ? 'bg-primary-foreground' : 'bg-primary'
              }`}
            />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Button
        className={`rounded-full font-bold h-11 px-6 ${
          tinted
            ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        }`}
        asChild
      >
        <Link href={ctaHref}>{ctaLabel}</Link>
      </Button>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl border p-7 bg-card hover:shadow-md transition-all">
      <div className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground h-12 w-12 text-lg font-extrabold mb-4">
        {n}
      </div>
      <h3 className="text-xl font-extrabold tracking-tight mb-2">{title}</h3>
      <p className="text-base text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}
