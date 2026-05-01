'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { branding } from '@/lib/branding';
import { useLogout } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';

const NAV: { href: string; label: string }[] = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/marketplace', label: 'Stays' },
  { href: '/dashboard/domains', label: 'Hosting' },
  { href: '/dashboard/trips', label: 'Trips' },
  { href: '/dashboard/payouts', label: branding.payoutNounPlural },
  { href: '/dashboard/payees', label: branding.payeePlural },
  { href: '/dashboard/transactions', label: 'Activity' },
  { href: '/dashboard/payer', label: branding.payerSingular },
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
    <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="h-16 flex items-center justify-between gap-6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Logo />
            <span className="text-xl font-extrabold tracking-tight text-primary">
              {branding.productName.toLowerCase()}
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground">
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

function Logo() {
  // Stylized Airbnb-like mark — coral, simple, recognizable wordmark companion.
  return (
    <span
      aria-hidden
      className="flex h-8 w-8 items-center justify-center text-primary"
    >
      <svg viewBox="0 0 32 32" fill="currentColor" className="h-7 w-7">
        <path d="M16 2c2.5 0 4.6 1.7 5.5 4 .5 1.4 1.1 2.7 1.7 4 1.4 2.9 3 5.6 4.4 8.5 1 2 1.4 4.2.6 6.4-1 2.7-3.4 4.4-6.3 4.6-2.6.2-4.7-1-6.4-2.8-1.7 1.8-3.8 3-6.4 2.8-2.9-.2-5.3-1.9-6.3-4.6-.8-2.2-.4-4.4.6-6.4 1.4-2.9 3-5.6 4.4-8.5.6-1.3 1.2-2.6 1.7-4C11.4 3.7 13.5 2 16 2Zm0 4.4c-1.2 0-2 .9-2.5 2.1-.5 1.3-1 2.5-1.7 3.7-1.4 2.7-2.9 5.3-4.2 8-.6 1.2-.7 2.4-.2 3.6.6 1.5 2 2.4 3.7 2.4 1.6 0 3-.7 4.3-2-.6-.8-1.1-1.7-1.6-2.6-.7-1.4-.4-3 .8-3.9 1.2-1 3-.9 4.1.2 1.1 1.1 1.2 2.9.2 4.1-.5.6-.9 1.3-1.4 2-.1.1-.1.2 0 .3 1.3 1.2 2.7 1.9 4.3 1.9 1.7 0 3.1-.9 3.7-2.4.5-1.2.4-2.4-.2-3.6-1.3-2.7-2.8-5.3-4.2-8-.7-1.2-1.2-2.4-1.7-3.7-.5-1.2-1.3-2.1-2.5-2.1Z" />
      </svg>
    </span>
  );
}
