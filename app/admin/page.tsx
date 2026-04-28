import Link from 'next/link';
import { AdminPanel } from '@/components/AdminPanel';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-primary font-semibold hover:underline">
            ← Roosterwise
          </Link>
          <span className="text-sm text-gray-500">Demo admin</span>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin console</h1>
        <p className="text-gray-600 mb-10 text-sm">
          Sandbox-only utilities and Redis cleanup. Not for production without hardening.
        </p>
        <AdminPanel />
      </main>
    </div>
  );
}
