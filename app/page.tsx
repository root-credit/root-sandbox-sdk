import Link from 'next/link';
import { branding } from '@/lib/branding';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Announcement bar */}
      <div className="bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-6 py-2 text-center text-xs sm:text-sm font-medium">
          Run payroll in minutes, not hours. Try {branding.productName} free for 30 days.{' '}
          <Link href="/signup" className="underline underline-offset-4 hover:text-primary">
            Start free trial
          </Link>
        </div>
      </div>

      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span style={{ fontWeight: 800, fontSize: '20px', letterSpacing: '-0.03em', color: '#2D2D3A' }}>
              Gusto
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
              Payroll wallet
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="font-bold" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-lg px-5"
              asChild
            >
              <Link href="/signup">Start free trial</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-background">
        <div className="mx-auto w-full max-w-7xl px-6 py-20 md:py-28 grid gap-12 md:grid-cols-2 items-center">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-lg bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-primary-foreground">
              Payroll & HR
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-balance leading-[1.02] text-foreground">
              Payroll that{' '}
              <span className="text-primary">runs itself.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty max-w-lg">
              {branding.productName} handles payroll, taxes, and direct deposits so you can focus on running your business. Add employees, set their salary, and run payroll in three clicks.
            </p>
            <ul className="flex flex-col gap-3 text-base text-foreground font-medium">
              <li className="flex items-center gap-3">
                <Check />
                Run payroll in minutes
              </li>
              <li className="flex items-center gap-3">
                <Check />
                Direct deposit to any bank or debit card
              </li>
              <li className="flex items-center gap-3">
                <Check />
                Full payroll history and receipts
              </li>
            </ul>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-lg px-7 h-12 text-base"
                asChild
              >
                <Link href="/signup">Start free trial</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-lg px-7 h-12 text-base font-bold border-2 border-foreground hover:bg-foreground hover:text-background"
                asChild
              >
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>

          {/* Hero showcase card — Payroll preview */}
          <div className="relative">
            <div className="rounded-2xl border-2 bg-card shadow-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Next payroll
                </span>
                <span className="inline-flex items-center justify-center rounded-lg bg-card border px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Scheduled
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <EmployeeRow name="Sarah M." dept="Engineering" amount="$2,400.00" />
                <EmployeeRow name="Mike R." dept="Design" amount="$1,800.00" />
                <EmployeeRow name="Emma L." dept="Operations" amount="$1,600.00" />
              </div>
              <div className="mt-5 flex items-center justify-between rounded-xl bg-primary text-primary-foreground px-4 py-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-widest text-primary-foreground/70">
                    {branding.walletName}
                  </div>
                  <div className="text-2xl font-extrabold font-mono tabular-nums">$1,250.00</div>
                </div>
                <span className="rounded-lg bg-primary-foreground text-primary px-3 py-1.5 text-xs font-bold uppercase tracking-widest">
                  Live
                </span>
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
              Three steps. Zero spreadsheets.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-lg">
              Spin up an account, fund your {branding.walletName}, and run your first payroll.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Step
              n="01"
              title={`Fund your ${branding.walletName}`}
              body={`Link a business bank account and pull funds via ACH into your ${branding.walletName} — your payroll balance.`}
            />
            <Step
              n="02"
              title="Add your employees"
              body="Enter each employee's name, email, and weekly salary. They log in and choose their payout method."
            />
            <Step
              n="03"
              title="Run payroll"
              body="Click Run payroll and funds move instantly from your wallet to each employee's bank account or debit card."
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
              Built for small businesses that value their time.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              code="WAL"
              title={branding.walletName}
              features={[
                'Single balance for payroll runs',
                'Funded via ACH from your business bank',
                'Real-time updates as payroll settles',
                'No idle reconciliation',
              ]}
            />
            <FeatureCard
              code="PAY"
              title="Payroll"
              features={[
                'Add unlimited employees',
                'Set weekly salaries',
                'Direct deposit to bank or debit card',
                'Full gross-to-net visibility',
              ]}
            />
            <FeatureCard
              code="OUT"
              title="Employee payouts"
              features={[
                'Bank account (standard ACH)',
                'Debit card (instant payout)',
                'Employee sets their own preference',
                'Full payroll history with receipts',
              ]}
            />
          </div>
        </div>
      </section>

      {/* Wallet / CTA */}
      <section id="wallet" className="bg-foreground text-background py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">
            {branding.walletName}
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-balance mb-5 leading-[1.05]">
            One wallet. Every payday. Always on time.
          </h2>
          <p className="text-lg text-background/80 leading-relaxed max-w-xl mx-auto mb-8">
            The {branding.walletName} is the heart of your payroll. Fund it, run payroll from it, and every employee gets paid — all on one ledger, sandbox-safe.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-lg px-7 h-12 text-base"
              asChild
            >
              <Link href="/signup">Start free trial</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-lg px-7 h-12 text-base font-bold border-2 border-background bg-transparent text-background hover:bg-background hover:text-foreground"
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
            <span style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '-0.03em', color: '#2D2D3A' }}>
              Gusto
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

function EmployeeRow({
  name,
  dept,
  amount,
}: {
  name: string;
  dept: string;
  amount: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border-2 px-4 py-3 bg-background">
      <div className="flex items-center gap-3 min-w-0">
        <span className="font-bold">{name}</span>
        <span className="text-muted-foreground text-sm">—</span>
        <span className="text-muted-foreground text-sm">{dept}</span>
      </div>
      <span className="font-mono font-extrabold tabular-nums text-sm">{amount}</span>
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
        <span className="inline-flex items-center justify-center rounded-lg bg-primary px-3 py-1.5 text-sm font-extrabold tracking-tight text-primary-foreground">
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
    <div className="rounded-2xl border-2 p-7 bg-background hover:border-foreground transition-colors">
      <div className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground h-12 w-12 text-lg font-extrabold mb-4">
        {n}
      </div>
      <h3 className="text-xl font-extrabold tracking-tight mb-2">{title}</h3>
      <p className="text-base text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}
