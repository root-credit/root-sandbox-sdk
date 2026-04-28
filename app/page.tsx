'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top nav */}
      <nav className="absolute top-0 inset-x-0 z-30">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 text-white">
            <Monogram />
            <span className="font-display text-lg tracking-tightest">Roosterwise</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-[13px] text-white/70">
            <a href="#stack" className="hover:text-white transition-smooth">Stack</a>
            <a href="#how" className="hover:text-white transition-smooth">How it works</a>
            <a href="#trust" className="hover:text-white transition-smooth">Trust</a>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-4 py-2 text-sm text-white/85 hover:text-white transition-smooth"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-medium rounded-md bg-white text-ink hover:bg-gold-soft transition-smooth"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative isolate overflow-hidden bg-ink text-white">
        {/* warm gradient backdrop */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse at 80% -10%, rgba(212,160,23,0.22), transparent 55%), radial-gradient(ellipse at 0% 100%, rgba(180,83,9,0.18), transparent 60%), #0A0A0A',
          }}
        />
        {/* fine grid overlay */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-36 pb-28 md:pt-44 md:pb-36">
          <div
            className={`max-w-3xl transition-smooth duration-700 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
          >
            <div className="inline-flex items-center gap-2 mb-8 px-3 py-1 rounded-full border border-white/15 bg-white/5 backdrop-blur">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-bright" />
              <span className="text-[11px] tracking-[0.18em] uppercase text-white/80">
                Gratuity Management · Live
              </span>
            </div>

            <h1 className="font-display tracking-tightest text-5xl md:text-7xl lg:text-[5.25rem] leading-[1.02] text-balance">
              Tips paid the moment <br className="hidden md:block" />
              the shift <em className="not-italic text-gold-bright">ends.</em>
            </h1>

            <p className="mt-7 text-base md:text-lg text-white/70 max-w-xl leading-relaxed">
              Roosterwise unifies tipping, payroll, and payments into one controlled platform —
              so your team gets paid in seconds and your books reconcile themselves.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-white text-ink font-medium text-sm tracking-tight hover:bg-gold-soft transition-smooth shadow-lg-custom"
              >
                Open an account
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md border border-white/20 text-white text-sm hover:bg-white/5 transition-smooth"
              >
                Sign in to console
              </Link>
            </div>

            <div className="mt-14 flex items-center gap-5 text-[11px] tracking-[0.18em] uppercase text-white/40">
              <span>Powered by Root</span>
              <span className="h-px w-10 bg-white/20" />
              <span>Bank-grade security</span>
              <span className="h-px w-10 bg-white/20 hidden sm:block" />
              <span className="hidden sm:inline">Real-time settlement</span>
            </div>
          </div>

          {/* Live ticket card on the right (decorative, mirrors roosterwise live POS card) */}
          <div className="hidden lg:block absolute right-10 xl:right-20 top-40 w-[360px]">
            <LiveTicketCard />
          </div>
        </div>
      </header>

      {/* Module receipts section */}
      <section id="stack" className="relative py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <p className="text-eyebrow mb-3">The Stack</p>
              <h2 className="font-display text-4xl md:text-5xl tracking-tightest text-balance">
                Everything you need for end-of-shift money movement.
              </h2>
            </div>
            <p className="hidden md:block text-sm text-neutral-500 max-w-xs">
              Three core modules. One ledger. Wired to your bank, your team, and the Root payment rails.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ModuleReceipt
              code="TIP"
              title="Gratuity Management"
              status="ACTIVE · LIVE"
              features={[
                'Instant tip distribution',
                'Tip pooling protocol',
                'Per-shift run sheets',
                'Full audit trails',
              ]}
            />
            <ModuleReceipt
              code="PAY"
              title="Worker Payouts"
              status="ACTIVE · LIVE"
              features={[
                'Real-time wage access',
                'Bank account or debit card',
                'Same-day ACH fallback',
                'No credit check required',
              ]}
            />
            <ModuleReceipt
              code="OPS"
              title="Treasury & Reconciliation"
              status="ACTIVE · LIVE"
              features={[
                'Subaccount funding via ACH',
                'One-page transaction ledger',
                'Webhook event streaming',
                'Roles & shared passwords',
              ]}
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative py-24 md:py-28 bg-surface-2 border-y border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="max-w-2xl mb-14">
            <p className="text-eyebrow mb-3">How it works</p>
            <h2 className="font-display text-4xl md:text-5xl tracking-tightest text-balance">
              From shift close to settled tips — in three movements.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <Step
              n="01"
              title="Onboard your house"
              body="Create a restaurant, link an ACH-funding bank account, and add your team with their preferred payout rail."
            />
            <Step
              n="02"
              title="Enter the tip-out"
              body="At shift close, key in the run sheet. Roosterwise validates totals against the team and your liquidity in real time."
            />
            <Step
              n="03"
              title="One click. Funds land."
              body="Press process — payouts settle to bank or card in seconds. Receipts and webhooks stream into your ledger."
            />
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section id="trust" className="py-24 md:py-28">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 text-center">
          <p className="text-eyebrow mb-4">Built for hospitality at scale</p>
          <h2 className="font-display text-4xl md:text-5xl tracking-tightest text-balance">
            Enterprise rails, with the warmth of an independent house.
          </h2>
          <p className="mt-6 text-neutral-500 max-w-2xl mx-auto leading-relaxed">
            Roosterwise rides on Root&apos;s secure payment infrastructure — the same rails used by
            major financial institutions — wrapped in a console designed for a host stand, not a CFO suite.
          </p>

          <div className="mt-12 flex justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-md bg-ink text-white text-sm font-medium hover:bg-ink-soft transition-smooth shadow-md-custom"
            >
              Open your console
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-surface">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <Monogram dark />
            <span className="font-display text-base tracking-tightest">Roosterwise</span>
          </div>
          <p className="text-xs text-neutral-500">
            © {new Date().getFullYear()} Roosterwise · Modern hospitality finance.{' '}
            <Link href="/admin" className="text-neutral-400 hover:text-neutral-600 underline-offset-2 ml-2">
              Admin console
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ---------- decorative subcomponents (visual only) ---------- */

function Monogram({ dark = false }: { dark?: boolean }) {
  return (
    <span
      className={`inline-flex items-center justify-center w-8 h-8 rounded-md font-display text-base ${
        dark
          ? 'bg-ink text-gold-bright border border-neutral-200'
          : 'bg-gold-bright/15 text-gold-bright border border-white/15'
      }`}
      aria-hidden
    >
      R
    </span>
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
    <div className="relative group">
      <div className="bg-surface border border-neutral-200 rounded-lg p-7 transition-smooth hover:-translate-y-0.5 hover:shadow-lg-custom">
        <div className="flex items-center justify-between mb-6">
          <span className="font-display text-2xl tracking-tightest">{code}</span>
          <span className="text-[10px] tracking-[0.18em] uppercase text-neutral-400">
            Module Receipt
          </span>
        </div>
        <div className="gold-rule mb-6" />

        <p className="text-eyebrow mb-2">Module</p>
        <h3 className="text-lg font-medium tracking-tight mb-5">{title}</h3>

        <p className="text-eyebrow mb-2">Features</p>
        <ul className="space-y-1.5 mb-6">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-neutral-600">
              <span className="mt-2 w-1 h-1 rounded-full bg-gold flex-none" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase text-gold">
          <span className="w-1.5 h-1.5 rounded-full bg-gold-bright" />
          {status}
        </div>
      </div>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div>
      <div className="font-display text-3xl text-gold tracking-tightest">{n}</div>
      <div className="mt-2 mb-4 h-px bg-neutral-300/60" />
      <h3 className="text-lg font-medium tracking-tight mb-2">{title}</h3>
      <p className="text-sm text-neutral-600 leading-relaxed">{body}</p>
    </div>
  );
}

function LiveTicketCard() {
  return (
    <div className="relative">
      <div className="rounded-xl bg-white text-ink shadow-lg-custom border border-white/10 overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <span className="font-display text-sm">Roosterwise Console</span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.18em] uppercase text-success">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Live
          </span>
        </div>

        <div className="grid grid-cols-2 gap-px bg-neutral-100">
          <Stat label="Tonight's tip pool" value="$1,482.50" />
          <Stat label="Avg per server" value="$74.12" accent />
          <Stat label="Settled" value="18 / 20" />
          <Stat label="Median latency" value="4.2s" />
        </div>

        <div className="px-5 py-4 border-t border-neutral-200 space-y-2">
          <Row name="Maria L." amount="+ $84.50" status="paid" />
          <Row name="Devon T." amount="+ $72.00" status="paid" />
          <Row name="Sasha P." amount="+ $61.25" status="processing" />
        </div>
      </div>

      {/* faux glow */}
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-2xl"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(212,160,23,0.25), transparent 60%)',
        }}
      />
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-white px-5 py-4">
      <div className="text-[10px] tracking-[0.18em] uppercase text-neutral-500">{label}</div>
      <div
        className={`font-display text-xl mt-1 tracking-tightest ${
          accent ? 'text-gold' : 'text-ink'
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
