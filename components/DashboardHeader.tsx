'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { branding } from '@/lib/branding';
import { useLogout } from '@/lib/hooks/useAuth';

const NAV: { href: string; label: string }[] = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/payouts', label: 'Tip Settlements' },
  { href: '/dashboard/payees', label: 'Service Staff' },
  { href: '/dashboard/transactions', label: 'Ledger' },
  { href: '/dashboard/payer', label: 'Multi-location' },
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
    <header className="sticky top-0 z-40 bg-surface-black text-body-on-dark border-b border-white/10">
      <div className="max-w-full px-6 lg:px-10">
        <div className="h-11 flex items-center justify-between gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 bg-blue-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-xs">{branding.productName.charAt(0)}</span>
            </div>
            <span className="text-nav-link font-semibold hidden sm:inline">{branding.productName}</span>
          </Link>

          <nav className="flex items-center gap-0.5 flex-1 overflow-x-auto ml-4">
            {NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 text-nav-link whitespace-nowrap transition-smooth rounded-lg text-sm ${
                    active
                      ? 'text-body-on-dark bg-white/10'
                      : 'text-body-muted/80 hover:text-body-on-dark hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            <span className="text-caption text-body-muted/70 hidden md:inline truncate">
              {email}
            </span>
            <button
              onClick={handleLogout}
              disabled={isSubmitting}
              title="Sign out"
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-body-muted/70 hover:text-body-on-dark hover:bg-white/10 transition-smooth disabled:opacity-50"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
