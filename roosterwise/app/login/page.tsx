import Link from 'next/link';
import { LoginForm } from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Simple Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <Link href="/" className="text-2xl font-bold text-primary">
          Roosterwise
        </Link>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-gray-600">Login to your Roosterwise account</p>
          </div>

          <LoginForm />

          <p className="mt-6 text-center text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-primary font-semibold hover:underline">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
