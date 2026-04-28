import Link from 'next/link';
import { AdminPanel } from '@/components/AdminPanel';
import { branding } from '@/lib/branding';

export default function AdminPage() {
  const monogram = branding.productName.charAt(0);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-neutral-200 bg-surface/85 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-ink text-gold-bright font-display border border-neutral-200">
              {monogram}
            </span>
            <span className="font-display text-lg tracking-tightest">{branding.productName}</span>
            <span className="ml-3 px-2 py-0.5 rounded text-[10px] tracking-[0.18em] uppercase text-neutral-500 border border-neutral-200">
              Admin
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm text-neutral-500 hover:text-ink transition-smooth"
          >
            Back to site
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 lg:px-10 py-12">
        <p className="text-eyebrow mb-3">Operator tools</p>
        <h1 className="font-display text-4xl md:text-5xl tracking-tightest">
          Admin console
        </h1>
        <p className="text-neutral-500 mt-2 max-w-xl text-sm leading-relaxed mb-10">
          Sandbox-only utilities and Redis cleanup. Not intended for production without
          additional hardening.
        </p>
        <AdminPanel />
      </main>
    </div>
  );
}
