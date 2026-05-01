import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { EmployeeLoginForm } from '@/components/EmployeeLoginForm';
import { getCurrentEmployeeSession } from '@/lib/employee-actions';
import { branding } from '@/lib/branding';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: `Employee sign-in · ${branding.productName}`,
};

export default async function EmployeeLoginPage() {
  const session = await getCurrentEmployeeSession();
  if (session) redirect('/employee');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b-2">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-black tracking-tight">
                G
              </span>
            </div>
            <span className="font-black tracking-tight text-lg">
              {branding.productName}
            </span>
          </Link>
          <Link
            href="/login"
            className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            Are you the employer? Sign in
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <div className="mx-auto w-full max-w-md px-6 lg:px-10 py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to home
          </Link>

          <div className="rounded-3xl border-2 bg-card p-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-foreground mb-5">
              <Sparkles className="h-3 w-3" />
              Employee sign-in
            </span>
            <h1 className="text-3xl font-black tracking-tight">
              Set up direct deposit
            </h1>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Your employer added you on {branding.productName}. Sign in with the
              email they used and pick how you&apos;d like to receive your pay —
              bank account or debit card.
            </p>

            <div className="mt-6">
              <EmployeeLoginForm />
            </div>

            <div className="mt-6 pt-6 border-t-2">
              <p className="text-xs text-muted-foreground leading-relaxed">
                No account yet? Ask your employer to add you to their{' '}
                {branding.productName} team. Once they do, sign in here with the
                same email.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
