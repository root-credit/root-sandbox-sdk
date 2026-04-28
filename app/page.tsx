'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="text-2xl font-bold text-primary">Roosterwise</div>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="px-6 py-2 text-foreground hover:text-primary transition-colors"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24">
        <div className={`text-center max-w-2xl transition-all duration-1000 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance leading-tight">
            <span className="text-primary">5-Second</span> Tip Payouts
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-8 text-balance">
            Empower your restaurant workers with instant tip access. Disburse end-of-day tips in seconds, not days.
          </p>

          {/* Key Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 mt-16">
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold mb-2">Instant Payouts</h3>
              <p className="text-gray-600">Pay tips to workers in 5 seconds, not days</p>
            </div>

            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-3xl mb-3">🔐</div>
              <h3 className="text-lg font-semibold mb-2">Bank-Grade Security</h3>
              <p className="text-gray-600">Powered by Root&apos;s secure payment infrastructure</p>
            </div>

            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-semibold mb-2">One-Click Payouts</h3>
              <p className="text-gray-600">Manage all worker payouts from a single dashboard</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-primary text-white text-lg font-semibold rounded-lg hover:bg-primary-dark transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 border-2 border-primary text-primary text-lg font-semibold rounded-lg hover:bg-primary hover:text-white transition-colors"
            >
              Login
            </Link>
          </div>

          {/* Security Note */}
          <p className="mt-12 text-sm text-gray-500">
            Roosterwise uses Root&apos;s secure payment infrastructure. Your data is encrypted and protected.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-6 text-center text-gray-600 text-sm">
        <p>&copy; 2024 Roosterwise. Built for restaurants, by payment experts.</p>
      </footer>
    </div>
  );
}
