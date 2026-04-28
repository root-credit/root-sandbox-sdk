import Link from 'next/link';
import { SignupForm } from '@/components/SignupForm';

export default function SignupPage() {
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
            <h1 className="text-3xl font-bold mb-2">Create Your Account</h1>
            <p className="text-gray-600">Start paying tips in 5 seconds</p>
          </div>

          <SignupForm />

          <p className="mt-6 text-center text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
