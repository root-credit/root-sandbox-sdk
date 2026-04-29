'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { branding } from '@/lib/branding';

export default function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Hero — nav lives inside the dark surface so it can never overlap content */}
      <header className="relative isolate overflow-hidden bg-ink text-white">
        {/* deep navy with teal accent gradient backdrop */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse at 80% -10%, rgba(6,182,212,0.15), transparent 55%), radial-gradient(ellipse at 0% 110%, rgba(8,145,178,0.12), transparent 60%), #0F172A',
          }}
        />
        {/* subtle grid */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        {/* Navigation row */}
        <nav className="relative z-10">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 h-16 sm:h-20 flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2.5 text-white">
              <Monogram />
              <span className="font-display text-lg tracking-tightest">{branding.productName}</span>
            </Link>
            <div className="hidden md:flex items-center gap-8 text-[13px] text-white/65">
              <a href="#stack" className="hover:text-white transition-smooth">Modules</a>
              <a href="#how" className="hover:text-white transition-smooth">How it works</a>
              <a href="#trust" className="hover:text-white transition-smooth">Enterprise ready</a>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/login"
                className="px-3 sm:px-4 py-2 text-sm text-white/85 hover:text-white transition-smooth"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="px-3 sm:px-4 py-2 text-sm font-medium rounded-md bg-cyan-500 text-ink hover:bg-cyan-400 transition-smooth"
              >
                Get started
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero content — 12-col grid, no absolute positioning */}
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-12 pb-20 sm:pt-16 sm:pb-24 lg:pt-24 lg:pb-32">
          <div
            className={`grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center transition-smooth duration-700 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
          >
            {/* Copy column */}
            <div className="lg:col-span-7 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/15 bg-white/5 backdrop-blur">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span className="text-[11px] tracking-[0.18em] uppercase text-white/80">
                  Workforce Operations · Enterprise-Ready
                </span>
              </div>

              <h1 className="mt-7 font-display tracking-tightest text-[2.75rem] sm:text-6xl lg:text-7xl leading-[1.02] text-balance">
                {branding.tagline.split(' ').slice(0, -1).join(' ')}{' '}
                <em className="not-italic text-cyan-400">
                  {branding.tagline.split(' ').slice(-1)[0]}
                </em>
              </h1>

              <p className="mt-6 text-base sm:text-lg text-white/65 leading-relaxed max-w-xl">
                {branding.productName} unifies payroll, workforce management, and real-time employee disbursements into one secure platform — so your team stays engaged and your operations run seamlessly.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-white text-ink font-medium text-sm tracking-tight hover:bg-neutral-100 transition-smooth shadow-lg-custom"
                >
                  Launch your command center
                  <ArrowRight />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md border border-white/20 text-white text-sm hover:bg-white/5 transition-smooth"
                >
                  Sign in to console
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] tracking-[0.18em] uppercase text-white/40">
                <span>Powered by Root</span>
                <span className="h-px w-8 bg-white/20" />
                <span>Bank-grade security</span>
                <span className="h-px w-8 bg-white/20" />
                <span>Real-time settlement</span>
              </div>
            </div>

            {/* Live operations card column — properly positioned in the grid, hidden on mobile */}
            <div className="hidden lg:block lg:col-span-5">
              <LiveOperationsCard />
            </div>
          </div>
        </div>
      </header>

      {/* Modules section */}
      <section id="stack" className="relative py-24 lg:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end mb-12 lg:mb-16">
            <div className="lg:col-span-8">
              <p className="text-eyebrow mb-3">Workforce Operations</p>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-tightest leading-[1.05] text-balance">
                Everything you need for integrated workforce management.
              </h2>
            </div>
            <p className="lg:col-span-4 text-sm text-neutral-500 max-w-sm leading-relaxed">
              Three core modules. One unified ledger. Connected to your payroll, your team, and the payment rails.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            <ModuleReceipt
              code="PAY"
              title="Payroll Management"
              status="Active · Live"
              features={[
                'Real-time wage processing',
                'Multi-payout method support',
                'Automated reconciliation',
                'Full audit trails',
              ]}
            />
            <ModuleReceipt
              code="EMP"
              title={`${branding.payeeSingular} Hub`}
              status="Active · Live"
              features={[
                'Workforce directory',
                'Self-service portals',
                'Direct deposit management',
                'Tax document management',
              ]}
            />
            <ModuleReceipt
              code="OPS"
              title="Operations Console"
              status="Active · Live"
              features={[
                'Organizational dashboard',
                'Advanced reporting',
                'Webhook event streaming',
                'Role-based access control',
              ]}
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how"
        className="relative py-24 lg:py-28 bg-surface-2 border-y border-neutral-200"
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="max-w-2xl mb-12 lg:mb-16">
            <p className="text-eyebrow mb-3">Implementation</p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-tightest leading-[1.05] text-balance">
              From setup to settled — in three movements.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12">
            <Step
              n="01"
              title={`Configure your ${branding.payerSingular.toLowerCase()}`}
              body={`Set up your organization, link your corporate funding account, and add your workforce with their preferred payment methods.`}
            />
            <Step
              n="02"
              title="Sync your directory"
              body={`Connect your HRIS or manually manage your employee roster. ${branding.productName} validates everything in real time.`}
            />
            <Step
              n="03"
              title="Process & settle"
              body="Execute payroll or disbursements — funds settle to bank or card instantly. Full visibility, every step of the way."
            />
          </div>
        </div>
      </section>

      {/* Trust */}
      <section id="trust" className="py-24 lg:py-28">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 lg:px-10 text-center">
          <p className="text-eyebrow mb-4">Built for enterprise</p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-tightest leading-[1.05] text-balance">
            Workforce technology that scales with you.
          </h2>
          <p className="mt-6 text-neutral-500 leading-relaxed max-w-xl mx-auto">
            {branding.productName} rides on Root&apos;s secure payment infrastructure — wrapped in a command center built for HR teams at any scale.
          </p>

          <div className="mt-10">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-md bg-ink text-white text-sm font-medium hover:bg-ink-soft transition-smooth shadow-md-custom"
            >
              Open your console
              <ArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-surface">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-8 sm:py-10 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2.5">
            <Monogram dark />
            <span className="font-display text-base tracking-tightest">{branding.productName}</span>
          </div>
          <p className="text-xs text-neutral-500 text-center sm:text-right">
            © {new Date().getFullYear()} {branding.productName} · Enterprise workforce operations.{' '}
            <Link
              href="/admin"
              className="text-neutral-400 hover:text-neutral-600 underline-offset-2 ml-2"
            >
              Admin console
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ---------- decorative subcomponents ---------- */

function Monogram({ dark = false }: { dark?: boolean }) {
  return (
    <span
      className={`inline-flex items-center justify-center w-8 h-8 rounded-md font-display text-base ${
        dark
          ? 'bg-ink text-cyan-500 border border-neutral-200'
          : 'bg-white/10 text-cyan-400 border border-white/15'
      }`}
      aria-hidden
    >
      {branding.productName.charAt(0)}
    </span>
  );
}

function ArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ModuleReceipt({
  code,
  title,
  status,
  features,
}: {
  code: string;
  title: string;
  status: string;
  features: string[];
}) {
  return (
    <div className="relative bg-surface border border-neutral-200 rounded-lg p-6 lg:p-7 transition-smooth hover:-translate-y-0.5 hover:shadow-lg-custom">
      <div className="flex items-center justify-between mb-5">
        <span className="font-display text-2xl tracking-tightest">{code}</span>
        <span className="text-[10px] tracking-[0.18em] uppercase text-neutral-400">
          Module
        </span>
      </div>
      <div className="gold-rule mb-5" />

      <h3 className="text-lg font-medium tracking-tight mb-4">{title}</h3>

      <ul className="space-y-1.5 mb-6">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-neutral-600">
            <span className="mt-2 w-1 h-1 rounded-full bg-cyan-500 flex-none" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase text-cyan-600">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
        {status}
      </div>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div>
      <div className="font-display text-3xl text-cyan-600 tracking-tightest">{n}</div>
      <div className="mt-2 mb-4 h-px bg-neutral-300/60" />
      <h3 className="text-lg font-medium tracking-tight mb-2">{title}</h3>
      <p className="text-sm text-neutral-600 leading-relaxed">{body}</p>
    </div>
  );
}

function LiveOperationsCard() {
  return (
    <div className="relative">
      <div className="rounded-xl bg-white text-ink shadow-lg-custom border border-white/10 overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between border-b border-neutral-200">
          <span className="font-display text-sm">{branding.productName} Operations</span>
          <span className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.18em] uppercase text-success">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Live
          </span>
        </div>

        <div className="grid grid-cols-2 gap-px bg-neutral-100">
          <Stat label="Active employees" value="2,847" />
          <Stat label="Payroll processed" value="$892K" accent />
          <Stat label="Settled" value="18 / 20" />
          <Stat label="Avg processing" value="2.3s" />
        </div>

        <div className="px-5 py-4 border-t border-neutral-200 space-y-2">
          <Row name="Sarah Mitchell" amount="+ $2,450.00" status="paid" />
          <Row name="James Chen" amount="+ $1,875.50" status="paid" />
          <Row name="Priya Patel" amount="+ $2,120.25" status="processing" />
        </div>
      </div>

      {/* faux glow with teal */}
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-2xl"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(6,182,212,0.20), transparent 60%)',
        }}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-white px-5 py-4">
      <div className="text-[10px] tracking-[0.18em] uppercase text-neutral-500">
        {label}
      </div>
      <div
        className={`font-display text-xl mt-1 tracking-tightest ${
          accent ? 'text-cyan-600' : 'text-ink'
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function Row({
  name,
  amount,
  status,
}: {
  name: string;
  amount: string;
  status: 'paid' | 'processing';
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-neutral-700">{name}</span>
      <div className="flex items-center gap-3">
        <span className="font-mono-tab text-neutral-700">{amount}</span>
        <span
          className={`text-[10px] tracking-[0.18em] uppercase ${
            status === 'paid' ? 'text-success' : 'text-neutral-400'
          }`}
        >
          {status}
        </span>
      </div>
    </div>
  );
}
