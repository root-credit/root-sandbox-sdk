import Link from 'next/link';
import { LoginForm } from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-5 bg-white sticky top-0">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">
            R
          </div>
          <span className="text-lg font-bold text-foreground">Roosterwise</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Form Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back</h1>
            <p className="text-gray-600 text-sm">Sign in to your Roosterwise account to continue</p>
          </div>

          <LoginForm />

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-gray-600 text-sm">
            New to Roosterwise?{' '}
            <Link href="/signup" className="text-primary font-semibold hover:text-primary-dark transition-smooth">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
