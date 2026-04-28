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
      <nav className="border-b border-gray-200 bg-background sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">
              R
            </div>
            <span className="text-xl font-bold text-foreground">Roosterwise</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-smooth shadow-sm-custom"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 md:py-32">
        <div className={`text-center max-w-3xl transition-smooth duration-1000 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {/* Badge */}
          <div className="mb-8 inline-block">
            <div className="px-3 py-1 bg-primary-light bg-opacity-10 border border-primary-light border-opacity-20 rounded-full">
              <p className="text-sm font-medium text-primary">New way to pay tips</p>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 text-balance leading-tight tracking-tight">
            Tips in <span className="text-primary">5 seconds</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-gray-600 mb-12 text-balance leading-relaxed max-w-2xl mx-auto">
            Empower your restaurant team with instant tip payouts. No waiting. No complications. Just fast, secure payments.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/signup"
              className="px-8 py-3.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-smooth shadow-md-custom hover:shadow-lg-custom"
            >
              Start Free →
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 border-2 border-gray-300 text-foreground font-semibold rounded-lg hover:border-primary hover:bg-gray-50 transition-smooth"
            >
              Sign In
            </Link>
          </div>

          {/* Trust Badge */}
          <p className="text-xs md:text-sm text-gray-500 font-medium">
            Powered by Root's secure payment infrastructure
          </p>
        </div>
      </main>

      {/* Features Section */}
      <section className="bg-gray-50 py-20 md:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why restaurants choose Roosterwise
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Built for the modern restaurant, with the security enterprise needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm-custom hover:shadow-md-custom transition-smooth hover:border-primary hover:border-opacity-30">
              <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Lightning Fast</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Payouts settle in 5 seconds. Your team gets paid before they leave for the day.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm-custom hover:shadow-md-custom transition-smooth hover:border-primary hover:border-opacity-30">
              <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Bank-Grade Security</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Enterprise-level encryption and compliance. Your data is protected 24/7.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm-custom hover:shadow-md-custom transition-smooth hover:border-primary hover:border-opacity-30">
              <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Simple Dashboard</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                One-click payouts for all workers. View history and manage everything effortlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-white text-xs font-bold">
                R
              </div>
              <span className="font-bold text-foreground">Roosterwise</span>
            </div>
            <p className="text-sm text-gray-600">
              © 2024 Roosterwise. Bringing instant payouts to restaurants everywhere.{' '}
              <Link href="/admin" className="text-gray-400 hover:text-gray-600 underline-offset-2">
                Demo admin
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
