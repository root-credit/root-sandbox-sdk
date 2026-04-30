import Link from 'next/link';
import { branding } from '@/lib/branding';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Top promo bar */}
      <div className="bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-6 py-2 text-center text-xs sm:text-sm font-medium">
          New customers — pay your team in seconds with {branding.productName}.{' '}
          <Link href="/signup" className="underline underline-offset-4 hover:text-primary">
            Get started
          </Link>
        </div>
      </div>

      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground text-base font-extrabold">
              {branding.productName.charAt(0)}
            </div>
            <span className="text-lg font-extrabold tracking-tight">{branding.productName}</span>
          </div>
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-foreground">
            <a href="#modules" className="hover:text-primary transition-colors">Modules</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">How it works</a>
            <a href="#trust" className="hover:text-primary transition-colors">Enterprise ready</a>
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
        {/* Bold teal banner background block */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-x-0 top-0 h-[70%] bg-primary/15" />
          <div className="absolute -top-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-[20rem] w-[20rem] rounded-full bg-accent/40 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-7xl px-6 py-20 md:py-28 grid gap-12 md:grid-cols-2 items-center">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-primary-foreground">
              Powered by Root
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-balance leading-[1.02] text-foreground">
              {branding.tagline.split(' ').slice(0, -1).join(' ')}{' '}
              <span className="relative inline-block">
                <span className="relative z-10">{branding.tagline.split(' ').slice(-1)[0]}</span>
                <span className="absolute inset-x-0 bottom-1 h-3 bg-primary -z-0" aria-hidden />
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty max-w-lg">
              {branding.productName} unifies payroll, workforce management, and real-time employee
              disbursements into one secure platform — so your team stays engaged and your operations
              run seamlessly.
            </p>
            <ul className="flex flex-col gap-3 text-base text-foreground font-medium">
              <li className="flex items-center gap-3">
                <Check />
                Real-time wage processing and settlement
              </li>
              <li className="flex items-center gap-3">
                <Check />
                Multi-payout method support (bank + card)
              </li>
              <li className="flex items-center gap-3">
                <Check />
                Automated reconciliation and full audit trails
              </li>
            </ul>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                size="lg"
                className="bg-foreground text-background hover:bg-foreground/90 font-bold rounded-full px-7 h-12 text-base"
                asChild
              >
                <Link href="/signup">Open an account</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-7 h-12 text-base font-bold border-2 border-foreground hover:bg-foreground hover:text-background"
                asChild
              >
                <Link href="/login">Sign in to console</Link>
              </Button>
            </div>
          </div>

          <Card className="border-2 shadow-xl rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-extrabold tracking-tight">Sign in</CardTitle>
              <CardDescription className="text-base">
                Sign in to your {branding.productName} console to manage payouts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <Link
                  href="/login"
                  className="inline-flex w-full items-center justify-center rounded-full bg-foreground text-background h-12 px-5 text-sm font-bold transition-colors hover:bg-foreground/90"
                >
                  Sign in to console
                </Link>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground font-semibold">New here?</span>
                  </div>
                </div>
                <Link
                  href="/signup"
                  className="inline-flex w-full items-center justify-center rounded-full border-2 border-foreground h-12 px-5 text-sm font-bold transition-colors hover:bg-foreground hover:text-background"
                >
                  Create an account
                </Link>
                <p className="text-xs text-muted-foreground text-center">
                  Sandbox environment — no real money is moved.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="border-t bg-secondary py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Workforce Operations</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-balance leading-[1.05]">
              Everything you need for integrated workforce management.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-lg">
              Three core modules. One unified ledger. Connected to your payroll, your team, and the payment rails.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ModuleCard
              code="PAY"
              title="Payroll Management"
              features={['Real-time wage processing', 'Multi-payout method support', 'Automated reconciliation', 'Full audit trails']}
            />
            <ModuleCard
              code="EMP"
              title="Employee Hub"
              features={['Workforce directory', 'Self-service portals', 'Direct deposit management', 'Tax document management']}
            />
            <ModuleCard
              code="OPS"
              title="Operations Console"
              features={['Organizational dashboard', 'Advanced reporting', 'Webhook event streaming', 'Role-based access control']}
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Implementation</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-balance leading-[1.05]">
              From setup to settled — in three movements.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Step n="01" title="Onboard your organization" body="Create a payer account, link an ACH-funding bank account, and add your team with their preferred payout rail." />
            <Step n="02" title="Enter the payout" body="At shift close, key in the run sheet. The platform validates totals against the team and your liquidity in real time." />
            <Step n="03" title="One click. Funds land." body="Press process — payouts settle to bank or card in seconds. Receipts and webhooks stream into your ledger." />
          </div>
        </div>
      </section>

      {/* Trust / CTA */}
      <section id="trust" className="bg-foreground text-background py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Enterprise ready</p>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-balance mb-5 leading-[1.05]">
            Bank-grade security. Real-time settlement.
          </h2>
          <p className="text-lg text-background/80 leading-relaxed max-w-xl mx-auto mb-8">
            {branding.productName} rides on Root&apos;s secure payment infrastructure — wrapped in a console
            designed for operators, not spreadsheets.
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
            © {new Date().getFullYear()} {branding.productName} · Powered by Root &middot; Sandbox environment.{' '}
            <Link href="/admin" className="underline underline-offset-2 hover:text-foreground">
              Admin console
            </Link>
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

function ModuleCard({ code, title, features }: { code: string; title: string; features: string[] }) {
  return (
    <div className="group rounded-2xl border-2 bg-card p-7 transition-all hover:border-foreground hover:shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <span className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-extrabold tracking-tight text-primary-foreground">
          {code}
        </span>
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Module</span>
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
