'use client';

import { useEffect, useState } from 'react';

type WorkerRow = {
  id: string;
  name: string;
  restaurantId: string;
  paymentMethodType?: string;
};

export function AdminPanel() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [workers, setWorkers] = useState<WorkerRow[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [newSharedPassword, setNewSharedPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );
  const [busy, setBusy] = useState<string | null>(null);

  async function refreshAuth() {
    try {
      const res = await fetch('/api/admin/me', { credentials: 'include' });
      setAuthorized(res.ok);
      if (res.ok) {
        await loadWorkers();
      }
    } catch {
      setAuthorized(false);
    }
  }

  async function loadWorkers() {
    const res = await fetch('/api/admin/workers', { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json();
    setWorkers(data.workers ?? []);
  }

  useEffect(() => {
    refreshAuth();
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setBusy('login');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Login failed');
      }
      setAuthorized(true);
      await loadWorkers();
      setPassword('');
      setMessage({ type: 'ok', text: 'Signed in to admin.' });
    } catch (err) {
      setMessage({
        type: 'err',
        text: err instanceof Error ? err.message : 'Login failed',
      });
    } finally {
      setBusy(null);
    }
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    setAuthorized(false);
    setWorkers([]);
    setMessage({ type: 'ok', text: 'Logged out.' });
  }

  async function runOperation(
    operation: string,
    extra?: Record<string, unknown>
  ): Promise<boolean> {
    setMessage(null);
    setBusy(operation);
    try {
      const res = await fetch('/api/admin/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ operation, ...extra }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setMessage({ type: 'ok', text: data.message || JSON.stringify(data) });
      await loadWorkers();
      return true;
    } catch (err) {
      setMessage({
        type: 'err',
        text: err instanceof Error ? err.message : 'Failed',
      });
      return false;
    } finally {
      setBusy(null);
    }
  }

  function confirmThen(label: string, fn: () => void) {
    if (
      typeof window !== 'undefined' &&
      !window.confirm(`Are you sure? ${label}`)
    ) {
      return;
    }
    fn();
  }

  if (authorized === null) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-gray-600">
        Checking admin session…
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-4">Admin sign-in</h2>
        <p className="text-sm text-gray-600 mb-6">
          Demo admin console — credentials are fixed unless overridden via{' '}
          <code className="text-xs bg-gray-100 px-1 rounded">ADMIN_EMAIL</code>{' '}
          / <code className="text-xs bg-gray-100 px-1 rounded">ADMIN_PASSWORD</code>.
        </p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              className="w-full border rounded-lg px-3 py-2"
              placeholder="admin@root.credit"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          {message && (
            <div
              className={`text-sm p-3 rounded-lg ${
                message.type === 'ok'
                  ? 'bg-green-50 text-green-900'
                  : 'bg-red-50 text-red-900'
              }`}
            >
              {message.text}
            </div>
          )}
          <button
            type="submit"
            disabled={busy !== null}
            className="w-full py-2 bg-gray-900 text-white rounded-lg disabled:opacity-50"
          >
            {busy === 'login' ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Operations</h2>
        <button
          type="button"
          onClick={logout}
          className="text-sm text-gray-600 underline"
        >
          Log out
        </button>
      </div>

      {message && (
        <div
          className={`text-sm p-3 rounded-lg ${
            message.type === 'ok'
              ? 'bg-green-50 text-green-900 border border-green-200'
              : 'bg-red-50 text-red-900 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <section className="border rounded-xl p-6 space-y-3 bg-white">
        <h3 className="font-semibold">Workers</h3>
        <p className="text-sm text-gray-600">
          Clear every worker record and worker index sets in Redis.
        </p>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() =>
            confirmThen('This deletes ALL workers for ALL restaurants.', () =>
              runOperation('clear_all_workers')
            )
          }
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm disabled:opacity-50"
        >
          Clear all workers
        </button>

        <div className="pt-4 border-t border-gray-100 mt-4">
          <p className="text-sm text-gray-600 mb-2">Remove one worker</p>
          <div className="flex flex-wrap gap-2 items-end">
            <select
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm min-w-[240px]"
            >
              <option value="">Select worker…</option>
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.id.slice(0, 8)}…)
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={busy !== null || !selectedWorkerId}
              onClick={() =>
                confirmThen('This removes one worker from Redis.', () =>
                  runOperation('remove_worker', { workerId: selectedWorkerId })
                )
              }
              className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm disabled:opacity-50"
            >
              Remove worker
            </button>
          </div>
        </div>
      </section>

      <section className="border rounded-xl p-6 space-y-3 bg-white">
        <h3 className="font-semibold">Session & transaction data</h3>
        <p className="text-sm text-gray-600">
          Clears restaurant user sessions and payout transaction history in Redis.
          Does not remove restaurants or workers.
        </p>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() =>
            confirmThen(
              'This logs everyone out and clears transaction lists.',
              () => runOperation('clear_sessions_and_transactions')
            )
          }
          className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm disabled:opacity-50"
        >
          Clear sessions & transactions
        </button>
      </section>

      <section className="border rounded-xl p-6 space-y-3 bg-white">
        <h3 className="font-semibold">Bank tokens (restaurants)</h3>
        <p className="text-sm text-gray-600">
          Removes <code className="text-xs">bankAccountToken</code> from each
          restaurant record (does not call Root APIs).
        </p>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() =>
            confirmThen('Linked bank metadata will be cleared from Redis.', () =>
              runOperation('clear_bank_fields')
            )
          }
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm disabled:opacity-50"
        >
          Clear bank data
        </button>
      </section>

      <section className="border rounded-xl p-6 space-y-3 bg-white">
        <h3 className="font-semibold">Shared app login password</h3>
        <p className="text-sm text-gray-600">
          All restaurant accounts use one shared password (stored hashed in Redis).
          Until you set one here, the default is{' '}
          <code className="text-xs bg-gray-100 px-1 rounded">1234567890</code>.
        </p>
        <div className="flex flex-wrap gap-2 items-end">
          <input
            type="password"
            value={newSharedPassword}
            onChange={(e) => setNewSharedPassword(e.target.value)}
            placeholder="New password (min 8 chars)"
            minLength={8}
            className="border rounded-lg px-3 py-2 flex-1 min-w-[200px]"
          />
          <button
            type="button"
            disabled={busy !== null || newSharedPassword.length < 8}
            onClick={async () => {
              const pwd = newSharedPassword;
              const ok = await runOperation('set_shared_login_password', {
                password: pwd,
              });
              if (ok) setNewSharedPassword('');
            }}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm disabled:opacity-50"
          >
            Save shared password
          </button>
        </div>
      </section>
    </div>
  );
}
