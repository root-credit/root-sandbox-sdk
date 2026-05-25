'use client';

import { useRouter } from 'next/navigation';
import { useLogout } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';

export function DashboardHeader({ email }: { email: string }) {
  const router = useRouter();
  const { logout, isSubmitting } = useLogout();

  async function handleLogout() {
    await logout();
    router.push('/');
  }

  // Get initials from email
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background">
      <div className="flex h-full items-center justify-end gap-4 px-6">
        <div className="flex items-center gap-3">
          {/* User avatar */}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4F4F4] text-sm font-semibold text-foreground">
            {initials}
          </div>
          <span className="text-sm font-medium text-foreground hidden sm:block">
            {email}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={isSubmitting}
            className="font-medium text-muted-foreground hover:text-foreground"
          >
            {isSubmitting ? 'Signing out…' : 'Sign out'}
          </Button>
        </div>
      </div>
    </header>
  );
}
