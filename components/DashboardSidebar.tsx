'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { branding } from '@/lib/branding';
import { WiseLogo } from '@/components/WiseLogo';
import { 
  Home, 
  CreditCard, 
  ArrowLeftRight, 
  Send, 
  Users, 
  BarChart3 
} from 'lucide-react';

const NAV: { href: string; label: string; icon: React.ReactNode }[] = [
  { href: '/dashboard', label: 'Home', icon: <Home className="h-5 w-5" /> },
  { href: '/dashboard/cards', label: 'Cards', icon: <CreditCard className="h-5 w-5" /> },
  { href: '/dashboard/transactions', label: 'Transactions', icon: <ArrowLeftRight className="h-5 w-5" /> },
  { href: '/dashboard/marketplace', label: 'Payments', icon: <Send className="h-5 w-5" /> },
  { href: '/dashboard/payees', label: branding.payeePlural, icon: <Users className="h-5 w-5" /> },
  { href: '/dashboard/insights', label: 'Insights', icon: <BarChart3 className="h-5 w-5" /> },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname?.startsWith(href);
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-background">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center px-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <WiseLogo size={28} />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  active
                    ? 'bg-[#F4F4F4] text-foreground'
                    : 'text-muted-foreground hover:bg-[#F4F4F4] hover:text-foreground'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
