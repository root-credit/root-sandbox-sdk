'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { branding } from '@/lib/branding';
import { useLogout } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';

const NAV: { href: string; label: string }[] = [
  { href: '/dashboard', label: 'Home' },
  { href: '/dashboard/payouts', label: 'Send & Request' },
  { href: '/dashboard/transactions', label: 'Activity' },
  { href: '/dashboard/payees', label: branding.payeePlural },
  { href: '/dashboard/payer', label: branding.walletName },
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
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground text-lg font-extrabold">
              V
            </div>
            <span className="text-xl font-extrabold tracking-tight text-primary">
              {branding.productName}
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {email}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={isSubmitting}
              className="font-semibold rounded-full"
            >
              {isSubmitting ? 'Logging out...' : 'Log out'}
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
                className={`relative px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${
                  active
                    ? 'text-primary border-primary font-bold'
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
