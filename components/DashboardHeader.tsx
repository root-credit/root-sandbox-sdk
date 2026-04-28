'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { branding } from '@/lib/branding';
import { useLogout } from '@/lib/hooks/useAuth';

const NAV: { href: string; label: string }[] = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/payouts', label: 'Payouts' },
  { href: '/dashboard/payees', label: branding.payeePlural },
  { href: '/dashboard/transactions', label: 'Transactions' },
  { href: '/dashboard/merchant', label: branding.merchantSingular },
];

export function DashboardHeader({ email }: { email: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, isSubmitting } = useLogout();

  async function handleLogout() {
    await logout();
    router.push('/');
  }

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname?.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-30 bg-surface/85 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="h-16 flex items-center justify-between gap-6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-ink text-gold-bright font-display border border-neutral-200">
              {branding.productName.charAt(0)}
            </span>
            <span className="font-display text-lg tracking-tightest">{branding.productName}</span>
            <span className="hidden md:inline-flex ml-3 px-2 py-0.5 rounded text-[10px] tracking-[0.18em] uppercase text-neutral-500 border border-neutral-200">
              Console
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-500 px-3 py-1.5 rounded-md bg-neutral-100 border border-neutral-200">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              <span className="font-mono-tab">{email}</span>
            </div>
            <button
              onClick={handleLogout}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm rounded-md border border-neutral-200 hover:border-ink hover:bg-neutral-100 transition-smooth disabled:opacity-50"
            >
              {isSubmitting ? 'Signing out…' : 'Sign out'}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <nav className="-mb-px flex gap-1 overflow-x-auto">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3.5 py-3 text-sm whitespace-nowrap transition-smooth border-b-2 ${
                  active
                    ? 'text-ink border-gold-bright font-medium'
                    : 'text-neutral-500 border-transparent hover:text-ink hover:border-neutral-300'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
