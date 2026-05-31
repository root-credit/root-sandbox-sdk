import Link from 'next/link';
import { AdminPanel } from '@/components/AdminPanel';
import { branding } from '@/lib/branding';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/85 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path d="M12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C16.42 20 20 16.42 20 12C20 7.58 16.42 4 12 4ZM12 16.5C9.51 16.5 7.5 14.49 7.5 12C7.5 9.51 9.51 7.5 12 7.5C14.49 7.5 16.5 9.51 16.5 12C16.5 14.49 14.49 16.5 12 16.5Z" fill="white" />
              </svg>
            </div>
            <span className="font-semibold tracking-tight text-lg">{branding.productName}</span>
            <span className="ml-3 px-2 py-0.5 rounded text-[10px] tracking-widest uppercase text-muted-foreground border border-border">
              Admin
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to site
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 lg:px-10 py-12">
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">Operator tools</p>
        <h1 className="font-semibold tracking-tight text-4xl md:text-5xl">Admin console</h1>
        <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed mb-10">
          Sandbox-only utilities and Redis cleanup. Not intended for production without additional hardening.
        </p>
        <AdminPanel />
      </main>
    </div>
  );
}
