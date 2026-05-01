'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { branding } from '@/lib/branding';
import { useLogout } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';

const NAV: { href: string; label: string }[] = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/marketplace', label: 'Find staff' },
  { href: '/dashboard/services', label: 'My shifts' },
  { href: '/dashboard/payouts', label: branding.payoutNounPlural },
  { href: '/dashboard/payees', label: branding.payeePlural },
  { href: '/dashboard/transactions', label: 'Activity' },
  { href: '/dashboard/payer', label: 'Account' },
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
    <header className="sticky top-0 z-30 border-b bg-card">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="h-16 flex items-center justify-between gap-6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <ToothMark />
            <span className="text-lg font-extrabold tracking-tight">
              {branding.productName}
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {email}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={isSubmitting}
              className="font-semibold rounded-full"
            >
              {isSubmitting ? 'Signing out…' : 'Sign out'}
            </Button>
          </div>
        </div>

        <nav className="-mb-px flex gap-1 overflow-x-auto">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${
                  active
                    ? 'text-foreground border-primary font-bold'
                    : 'text-muted-foreground border-transparent hover:text-foreground hover:border-border font-semibold'
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

function ToothMark() {
  return (
    <span
      aria-hidden
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <path d="M7.5 3C5.6 3 4 4.6 4 6.5c0 1.4.4 2.6.9 3.7.5 1.2.7 2.4.6 3.7l-.2 4.4c-.1 1.4 1 2.7 2.5 2.7 1.4 0 2.4-1.1 2.5-2.5l.3-3.5c.1-1 .9-1.7 1.9-1.7s1.8.7 1.9 1.7l.3 3.5c.1 1.4 1.1 2.5 2.5 2.5 1.5 0 2.6-1.3 2.5-2.7l-.2-4.4c-.1-1.3.1-2.5.6-3.7.5-1.1.9-2.3.9-3.7C20 4.6 18.4 3 16.5 3c-1.3 0-2.5.6-3.3 1.5L12 5.7l-1.2-1.2C10 3.6 8.8 3 7.5 3Z" />
      </svg>
    </span>
  );
}
