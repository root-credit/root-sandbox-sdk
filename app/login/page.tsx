import Link from 'next/link';
import Image from 'next/image';
import { LoginForm } from '@/components/LoginForm';
import { branding } from '@/lib/branding';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex">
      {/* Left side - Branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1E30CA] relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 -left-20 w-96 h-96 rounded-full border border-white/20" />
          <div className="absolute top-40 -left-10 w-72 h-72 rounded-full border border-white/20" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full border border-white/20" />
          <div className="absolute bottom-40 right-10 w-64 h-64 rounded-full border border-white/20" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div>
            <Image
              src="/root-logo.svg"
              alt="Root"
              width={140}
              height={45}
              className="brightness-0 invert"
            />
          </div>
          
          {/* Main content */}
          <div className="flex flex-col gap-8">
            <h1 className="text-4xl xl:text-5xl font-semibold text-white leading-tight text-balance">
              {branding.tagline}
            </h1>
            <p className="text-lg text-white/80 leading-relaxed max-w-md">
              The {branding.productName} operator console gives you full control over {branding.payeePlural.toLowerCase()}, payouts, and treasury — all in one place.
            </p>
            
            {/* Feature list */}
            <ul className="flex flex-col gap-4 mt-4">
              <li className="flex items-center gap-3 text-white/90">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-medium">1</span>
                <span>Median payout latency under 5 seconds</span>
              </li>
              <li className="flex items-center gap-3 text-white/90">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-medium">2</span>
                <span>Bank-grade security with Root infrastructure</span>
              </li>
              <li className="flex items-center gap-3 text-white/90">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-medium">3</span>
                <span>Full audit trail on every transaction</span>
              </li>
            </ul>
          </div>
          
          {/* Footer */}
          <div className="text-sm text-white/60">
            Powered by Root &mdash; Sandbox environment
          </div>
        </div>
      </div>
      
      {/* Right side - Login form */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Mobile header */}
        <header className="lg:hidden border-b bg-card">
          <div className="px-6 py-4 flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/root-icon.svg"
                alt="Root"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="font-semibold tracking-tight">{branding.productName}</span>
            </Link>
          </div>
        </header>
        
        {/* Form container */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Desktop logo */}
            <div className="hidden lg:flex items-center gap-3 mb-10">
              <Image
                src="/root-icon.svg"
                alt="Root"
                width={40}
                height={40}
                className="rounded-xl"
              />
              <span className="font-semibold text-lg tracking-tight">{branding.productName}</span>
            </div>
            
            {/* Welcome text */}
            <div className="mb-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#1E30CA]/10 px-3 py-1 text-xs font-medium text-[#1E30CA] mb-4">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1E30CA]" />
                Operator console
              </span>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
                Welcome back
              </h2>
              <p className="text-muted-foreground mt-2">
                Sign in with the email you used at signup.
              </p>
            </div>
            
            {/* Login form */}
            <div className="space-y-6">
              <LoginForm />
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">New here?</span>
                </div>
              </div>
              
              <Link
                href="/signup"
                className="flex w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Create a {branding.productName} account
              </Link>
            </div>
            
            {/* Mobile features */}
            <div className="lg:hidden mt-10 pt-8 border-t">
              <p className="text-sm text-muted-foreground mb-4">{branding.tagline}</p>
              <ul className="flex flex-col gap-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-[#1E30CA]" />
                  Median payout latency under 5 seconds
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-[#1E30CA]" />
                  Bank-grade security with Root infrastructure
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-[#1E30CA]" />
                  Full audit trail on every transaction
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="border-t p-6 lg:px-12">
          <p className="text-xs text-muted-foreground">
            Sandbox environment — no real money is moved.
          </p>
        </footer>
      </div>
    </main>
  );
}
