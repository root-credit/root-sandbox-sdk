'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { branding } from '@/lib/branding';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      {/* Global Navigation */}
      <header className="fixed top-0 w-full z-50 bg-surface-black/95 backdrop-blur-frosted border-b border-white/5">
        <nav className="max-w-7xl mx-auto px-6 lg:px-10 h-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white">
            <Monogram />
            <span className="text-nav-link font-semibold">{branding.productName}</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-nav-link text-white/70 hover:text-white transition-smooth">Features</a>
            <a href="#how" className="text-nav-link text-white/70 hover:text-white transition-smooth">How it works</a>
            <a href="#trust" className="text-nav-link text-white/70 hover:text-white transition-smooth">Trust</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-nav-link text-white/70 hover:text-white transition-smooth">
              Sign in
            </Link>
            <Button variant="primary-pill" asChild>
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section - Full bleed light tile */}
      <section className="pt-40 pb-24 md:py-40 px-6 lg:px-10 bg-canvas">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <p className="text-caption text-body-muted uppercase tracking-wide mb-4">Enterprise Fintech</p>
            <h1 className="text-hero-display text-balance mb-6">
              {branding.productName}: Enterprise Financial Control for Hospitality
            </h1>
            <p className="text-lead text-body-muted mb-8">
              Unify tipping, payroll, and procurement across multiple locations. Get your team paid in seconds while your books reconcile automatically—built for enterprise hospitality.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Button variant="primary-pill" asChild>
                <Link href="/signup">Open an account</Link>
              </Button>
              <Button variant="secondary-pill" asChild>
                <a href="#features">Learn more</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Dark tile */}
      <section id="features" className="py-24 md:py-32 px-6 lg:px-10 -mx-6 lg:mx-0 bg-surface-dark-1 text-body-on-dark">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="text-caption text-body-muted/70 uppercase tracking-wide mb-4">The Platform</p>
            <h2 className="text-display-lg text-balance mb-4">
              Complete financial operations for multi-location hospitality.
            </h2>
            <p className="text-lead text-body-muted/80 max-w-2xl">
              Three core modules. One unified ledger. Integrated with your bank, your staff, and enterprise compliance rails.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon="💳"
              title="Tip Distribution"
              desc="Instant tip settlement across locations, flexible pooling, shift reconciliation, and full audit trails."
            />
            <FeatureCard
              icon="📦"
              title="Procurement Settlement"
              desc="Vendor payment automation, multi-account ACH routing, scheduled processing, and real-time liquidity tracking."
            />
            <FeatureCard
              icon="📊"
              title="Treasury & Compliance"
              desc="Multi-location subaccounts, real-time ledger, webhook streaming, and role-based access control."
            />
          </div>
        </div>
      </section>

      {/* How It Works - Parchment tile */}
      <section id="how" className="py-24 md:py-32 px-6 lg:px-10 bg-canvas-parchment">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="text-caption text-body-muted uppercase tracking-wide mb-4">How It Works</p>
            <h2 className="text-display-lg text-balance">
              From onboarding to scaled operations — three core steps.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              num="01"
              title="Connect Venue Bank"
              desc="Link your operating account and establish funding for multi-location settlements. Compliance happens automatically."
            />
            <StepCard
              num="02"
              title="Import Staff & Suppliers"
              desc="Add service staff and vendor accounts with preferred payout rails. Set permissions per location or role."
            />
            <StepCard
              num="03"
              title="Automate Payouts"
              desc="Schedule tip distributions and invoice settlements. One platform, all locations, real-time visibility."
            />
          </div>
        </div>
      </section>

      {/* Trust Section - Dark tile */}
      <section id="trust" className="py-24 md:py-32 px-6 lg:px-10 -mx-6 lg:mx-0 bg-surface-dark-2 text-body-on-dark">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-caption text-body-muted/70 uppercase tracking-wide mb-4">Enterprise-Grade Fintech</p>
          <h2 className="text-display-lg text-balance mb-6">
            Bank-level security with hospitality expertise.
          </h2>
          <p className="text-lead text-body-muted/80 mb-16">
            {branding.productName} combines regulated payment infrastructure with deep industry knowledge—designed by operators, for operators running multi-location enterprises.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TrustCard icon="🔐" title="Bank-Grade Security" desc="Industry-standard encryption and compliance frameworks" />
            <TrustCard icon="⚡" title="Instant Settlements" desc="Real-time payouts to bank accounts and cards" />
            <TrustCard icon="📈" title="Full Transparency" desc="Complete audit trails and transaction history" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 lg:px-10 bg-canvas border-t border-neutral-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
            <div className="flex items-center gap-2">
              <Monogram />
              <span className="text-body-strong">{branding.productName}</span>
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-dense-link text-body-muted hover:text-ink transition-smooth">Privacy</a>
              <a href="#" className="text-dense-link text-body-muted hover:text-ink transition-smooth">Terms</a>
              <a href="#" className="text-dense-link text-body-muted hover:text-ink transition-smooth">Contact</a>
            </div>
          </div>
          <div className="border-t border-neutral-200 pt-8">
            <p className="text-fine-print text-body-muted">
              © 2026 {branding.productName}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Monogram() {
  return (
    <div className="w-8 h-8 bg-gradient-to-br from-blue-primary to-blue-primary/80 rounded-lg flex items-center justify-center">
      <span className="text-white font-semibold text-xs">R</span>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="bg-surface-dark-2 rounded-lg p-8">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-body-strong mb-3">{title}</h3>
      <p className="text-body text-body-muted/80">{desc}</p>
    </div>
  );
}

function StepCard({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div>
      <p className="text-display-md text-body-muted mb-3">{num}</p>
      <h3 className="text-body-strong mb-3">{title}</h3>
      <p className="text-body text-body-muted">{desc}</p>
    </div>
  );
}

function TrustCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="bg-surface-dark-3 rounded-lg p-8">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-body-strong mb-3 text-body-on-dark">{title}</h3>
      <p className="text-body text-body-muted/80">{desc}</p>
    </div>
  );
}
