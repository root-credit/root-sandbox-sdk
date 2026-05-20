import Link from 'next/link';
import { branding } from '@/lib/branding';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Top promo bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 py-2.5 text-center text-sm font-medium">
          Fast, safe, social payments. Join millions who use {branding.productName}.{' '}
          <Link href="/signup" className="underline underline-offset-4 hover:opacity-80">
            Get started free
          </Link>
        </div>
      </div>

      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <VenmoLogo />
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-foreground">
            <a href="#how-it-works" className="hover:text-primary transition-colors">
              How it works
            </a>
            <a href="#features" className="hover:text-primary transition-colors">
              Features
            </a>
            <a href="#wallet" className="hover:text-primary transition-colors">
              Your wallet
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="font-semibold" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-full px-5"
              asChild
            >
              <Link href="/signup">Get {branding.productName}</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-primary">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-primary-foreground/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-[24rem] w-[24rem] rounded-full bg-accent/20 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-7xl px-6 py-20 md:py-28 grid gap-12 md:grid-cols-2 items-center">
          <div className="flex flex-col gap-6 text-primary-foreground">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-foreground/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wide">
              Social Payments
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-balance leading-[1.02]">
              Pay. Get paid.{' '}
              <span className="text-accent">Instantly.</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 leading-relaxed text-pretty max-w-lg">
              {branding.productName} makes it easy to send and receive money with friends and family.
              Split dinner, pay rent, or send a gift — all from your phone.
            </p>
            <ul className="flex flex-col gap-3 text-base font-medium">
              <li className="flex items-center gap-3">
                <Check />
                Send money to anyone with a username
              </li>
              <li className="flex items-center gap-3">
                <Check />
                Receive payments instantly to your wallet
              </li>
              <li className="flex items-center gap-3">
                <Check />
                {branding.payoutVerb} to your bank or debit card
              </li>
            </ul>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                size="lg"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold rounded-full px-7 h-12 text-base"
                asChild
              >
                <Link href="/signup">Sign up free</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-7 h-12 text-base font-bold border-2 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link href="/login">Log in</Link>
              </Button>
            </div>
          </div>

          {/* Hero showcase card — mock transaction feed */}
          <div className="relative">
            <div className="absolute -top-4 -left-4 h-20 w-20 rounded-2xl bg-accent/50 rotate-6 -z-10" aria-hidden />
            <div className="rounded-3xl border-2 border-primary-foreground/20 bg-card shadow-2xl p-6 text-foreground">
              <div className="flex items-center justify-between mb-5">
                <span className="text-sm font-bold text-muted-foreground">Recent activity</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-accent">
                  <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                  Live
                </span>
              </div>
              <div className="flex flex-col gap-3">
                <TransactionTile name="Sarah M." amount="+$45.00" note="Dinner last night" incoming />
                <TransactionTile name="Mike R." amount="-$25.00" note="Concert tickets" />
                <TransactionTile name="Emma L." amount="+$120.00" note="Rent share" incoming />
              </div>
              <div className="mt-5 flex items-center justify-between rounded-2xl bg-primary text-primary-foreground px-5 py-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-primary-foreground/60">
                    {branding.walletName}
                  </div>
                  <div className="text-3xl font-extrabold font-mono tabular-nums">$1,847.50</div>
                </div>
                <span className="rounded-full bg-primary-foreground/20 px-3 py-1.5 text-xs font-bold uppercase tracking-widest">
                  Wallet
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t bg-background py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
              How it works
            </p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-balance leading-[1.05]">
              Send money in seconds.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-lg">
              Whether you&apos;re splitting a bill or paying back a friend, {branding.productName} makes it simple.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Step
              n="01"
              title="Add funds to your wallet"
              body={`Link your ${branding.funderShortLabel.toLowerCase()} and instantly transfer money into your ${branding.productName} wallet.`}
            />
            <Step
              n="02"
              title="Send to friends"
              body="Enter their username and the amount. Add a note about what it's for — simple as that."
            />
            <Step
              n="03"
              title={`${branding.payoutVerb} anytime`}
              body={`Transfer your balance to your ${branding.funderShortLabel.toLowerCase()} or debit card whenever you want.`}
            />
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section id="features" className="py-20 md:py-24 bg-secondary">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Features</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-balance leading-[1.05]">
              Everything you need to manage money with friends.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon="wallet"
              title="Your wallet"
              features={[
                'Single balance for sending and receiving',
                'Funded via your linked bank account',
                'Real-time updates on every transaction',
                'Secure and protected',
              ]}
            />
            <FeatureCard
              icon="send"
              title="Send money"
              features={[
                'Pay anyone with a username',
                'Add notes and memos to payments',
                'Instant transfers between wallets',
                'Split expenses with groups',
              ]}
            />
            <FeatureCard
              icon="cashout"
              title={branding.payoutNoun}
              features={[
                `Transfer to your ${branding.funderShortLabel.toLowerCase()} for free`,
                'Instant transfer to debit card',
                'Manage all your payout methods',
                'Full transaction history',
              ]}
            />
          </div>
        </div>
      </section>

      {/* Wallet / CTA */}
      <section id="wallet" className="bg-foreground text-background py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">
            Your wallet
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-balance mb-5 leading-[1.05]">
            One place for all your payments.
          </h2>
          <p className="text-lg text-background/70 leading-relaxed max-w-xl mx-auto mb-8">
            Your {branding.walletName} holds your funds. Send money from it, receive
            payments into it, cash out from it — everything in one place.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-full px-7 h-12 text-base"
              asChild
            >
              <Link href="/signup">Create your account</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-7 h-12 text-base font-bold border-2 border-background/30 bg-transparent text-background hover:bg-background hover:text-foreground"
              asChild
            >
              <Link href="/login">Log in</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <VenmoLogo />
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

function VenmoLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground text-lg font-extrabold">
        V
      </div>
      <span className="text-xl font-extrabold tracking-tight text-primary">
        {branding.productName}
      </span>
    </div>
  );
}

function Check() {
  return (
    <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-primary-foreground/20">
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

function TransactionTile({
  name,
  amount,
  note,
  incoming,
}: {
  name: string;
  amount: string;
  note: string;
  incoming?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
          {name.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">{name}</p>
          <p className="text-xs text-muted-foreground truncate">{note}</p>
        </div>
      </div>
      <span className={`font-mono font-bold text-sm ${incoming ? 'text-accent' : 'text-foreground'}`}>
        {amount}
      </span>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  features,
}: {
  icon: 'wallet' | 'send' | 'cashout';
  title: string;
  features: string[];
}) {
  return (
    <div className="group rounded-2xl border-2 bg-card p-7 transition-all hover:border-primary hover:shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <span className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 text-primary">
          {icon === 'wallet' && <WalletIcon />}
          {icon === 'send' && <SendIcon />}
          {icon === 'cashout' && <CashoutIcon />}
        </span>
      </div>
      <h3 className="text-2xl font-extrabold tracking-tight mb-4">{title}</h3>
      <ul className="space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-none" />
            <span className="leading-snug">{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function WalletIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function CashoutIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl border-2 p-7 bg-card hover:border-primary transition-colors">
      <div className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground h-12 w-12 text-lg font-extrabold mb-4">
        {n}
      </div>
      <h3 className="text-xl font-extrabold tracking-tight mb-2">{title}</h3>
      <p className="text-base text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}
