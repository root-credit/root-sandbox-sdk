import Link from 'next/link';
import { LoginForm } from '@/components/LoginForm';
import { branding } from '@/lib/branding';

export default function LoginPage() {
  const monogram = branding.productName.charAt(0);

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] bg-canvas">
      {/* Left sidebar - Dark tile */}
      <aside className="relative hidden lg:flex flex-col justify-between bg-surface-dark-1 text-body-on-dark p-12 overflow-hidden">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold text-xs">{monogram}</span>
          </div>
          <span className="text-nav-link font-semibold">{branding.productName}</span>
        </Link>

        <div className="max-w-md">
          <p className="text-caption text-body-muted/70 uppercase tracking-wide mb-6">
            Secure Access
          </p>
          <h2 className="text-display-lg text-balance mb-6">
            Enterprise access for hospitality groups.
          </h2>
          <p className="text-body text-body-muted/80 mb-12">
            Bank-grade encryption and compliance for multi-location management. Sign in with the email linked to your {branding.payerPlural.toLowerCase()} account — instant access to payouts, staff, and settlements.
          </p>

          <div className="space-y-4">
            <StatRow label="Avg settlement time" value="4.2s" />
            <StatRow label="Locations live" value="Multi" accent />
          </div>
        </div>

        <p className="text-fine-print text-body-muted/60">
          Powered by regulated payment infrastructure · Bank-grade security
        </p>
      </aside>

      {/* Right panel - Form */}
      <main className="flex flex-col bg-canvas">
        <div className="lg:hidden border-b border-neutral-200 bg-canvas px-6 py-4">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-xs">{monogram}</span>
            </div>
            <span className="text-nav-link font-semibold">{branding.productName}</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12 lg:py-20">
          <div className="w-full max-w-md">
            <p className="text-caption text-body-muted uppercase tracking-wide mb-4">Sign in</p>
            <h1 className="text-display-md text-balance mb-4">Operator login</h1>
            <p className="text-body text-body-muted mb-12">
              Sign in with the email used at signup. Each email maps to a single {branding.payerSingular.toLowerCase()} account in your console.
            </p>

            <LoginForm />

            <div className="mt-8 text-center">
              <p className="text-body text-body-muted">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-link text-blue-primary hover:text-blue-primary-focus transition-smooth">
                  Get started
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-caption text-body-muted/80">{label}</span>
      <span className={`text-body-strong ${accent ? 'text-blue-on-dark' : 'text-body-on-dark'}`}>{value}</span>
    </div>
  );
}
