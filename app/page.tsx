import Link from 'next/link';
import { branding } from '@/lib/branding';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
              {branding.productName.charAt(0)}
            </div>
            <span className="font-semibold tracking-tight">{branding.productName}</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#modules" className="hover:text-foreground transition-colors">Modules</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#trust" className="hover:text-foreground transition-colors">Enterprise ready</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex items-center">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 grid gap-12 md:grid-cols-2 items-center">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Powered by Root
            </span>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-balance leading-[1.1]">
              {branding.tagline.split(' ').slice(0, -1).join(' ')}{' '}
              <span className="text-primary">{branding.tagline.split(' ').slice(-1)[0]}</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed text-pretty max-w-lg">
              {branding.productName} unifies payroll, workforce management, and real-time employee
              disbursements into one secure platform — so your team stays engaged and your operations
              run seamlessly.
            </p>
            <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-primary flex-none" />
                Real-time wage processing and settlement
              </li>
              <li className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-primary flex-none" />
                Multi-payout method support (bank + card)
              </li>
              <li className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-primary flex-none" />
                Automated reconciliation and full audit trails
              </li>
            </ul>
            <div className="flex gap-3">
              <Button asChild>
                <Link href="/signup">Open an account</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/login">Sign in to console</Link>
              </Button>
            </div>
          </div>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Sign in</CardTitle>
              <CardDescription>
                Sign in to your {branding.productName} console to manage payouts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <Link
                  href="/login"
                  className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                >
                  Sign in to console
                </Link>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">New here?</span>
                  </div>
                </div>
                <Link
                  href="/signup"
                  className="inline-flex w-full items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
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
      <section id="modules" className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Workforce Operations</p>
            <h2 className="text-3xl font-semibold tracking-tight text-balance">
              Everything you need for integrated workforce management.
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg">
              Three core modules. One unified ledger. Connected to your payroll, your team, and the payment rails.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
      <section id="how-it-works" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Implementation</p>
            <h2 className="text-3xl font-semibold tracking-tight text-balance">
              From setup to settled — in three movements.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <Step n="01" title="Onboard your organization" body="Create a payer account, link an ACH-funding bank account, and add your team with their preferred payout rail." />
            <Step n="02" title="Enter the payout" body="At shift close, key in the run sheet. The platform validates totals against the team and your liquidity in real time." />
            <Step n="03" title="One click. Funds land." body="Press process — payouts settle to bank or card in seconds. Receipts and webhooks stream into your ledger." />
          </div>
        </div>
      </section>

      {/* Trust */}
      <section id="trust" className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">Enterprise ready</p>
          <h2 className="text-3xl font-semibold tracking-tight text-balance mb-4">
            Bank-grade security. Real-time settlement.
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto mb-8">
            {branding.productName} rides on Root&apos;s secure payment infrastructure — wrapped in a console
            designed for operators, not spreadsheets.
          </p>
          <div className="flex justify-center gap-3">
            <Button asChild>
              <Link href="/signup">Open your console</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground text-xs font-semibold">
              {branding.productName.charAt(0)}
            </div>
            <span className="text-sm font-medium">{branding.productName}</span>
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

function ModuleCard({ code, title, features }: { code: string; title: string; features: string[] }) {
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl font-semibold tracking-tight">{code}</span>
        <span className="text-xs uppercase tracking-wide text-muted-foreground">Module</span>
      </div>
      <div className="h-px bg-border mb-4" />
      <h3 className="font-semibold tracking-tight mb-3">{title}</h3>
      <ul className="space-y-1.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="mt-2 h-1 w-1 rounded-full bg-primary flex-none" />
            {f}
          </li>
        ))}
      </ul>
      <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        Active · Live
      </div>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div>
      <div className="text-2xl font-semibold text-primary mb-2">{n}</div>
      <div className="h-px bg-border mb-4" />
      <h3 className="font-semibold tracking-tight mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}
