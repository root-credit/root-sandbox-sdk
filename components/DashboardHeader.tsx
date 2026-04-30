'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { branding } from '@/lib/branding';
import { useLogout } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';

const NAV: { href: string; label: string }[] = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/marketplace', label: 'Marketplace' },
  { href: '/dashboard/domains', label: 'My domains' },
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
    <header className="sticky top-0 z-30 border-b bg-card">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="h-16 flex items-center justify-between gap-6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground text-base font-extrabold">
              {branding.productName.charAt(0)}
            </div>
            <span className="text-lg font-extrabold tracking-tight">{branding.productName}</span>
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
