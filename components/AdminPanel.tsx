'use client';

import { useEffect, useState } from 'react';
import { branding } from '@/lib/branding';
import {
  useAdminAuth,
  useAdminOperations,
  useAdminPayees,
} from '@/lib/hooks/useAdmin';

const inputClass =
  'w-full px-3.5 py-2.5 bg-surface text-foreground rounded-md border border-neutral-200 ' +
  'placeholder:text-neutral-400 transition-smooth ' +
  'focus:outline-none focus:border-gold focus:ring-[3px] focus:ring-gold-bright/25';

const labelClass =
  'block text-[11px] tracking-[0.14em] uppercase text-neutral-500 mb-2';

const sectionEyebrow =
  'text-[11px] tracking-[0.18em] uppercase text-neutral-500 font-medium';

export function AdminPanel() {
  const auth = useAdminAuth();
  const { payees, refresh: refreshPayees, setPayees } = useAdminPayees();
  const ops = useAdminOperations();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPayeeId, setSelectedPayeeId] = useState('');
  const [newSharedPassword, setNewSharedPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null,
  );

  const authorized = auth.authorized;
  const busy = auth.isSubmitting ? 'login' : ops.busy;

  useEffect(() => {
    auth.refresh().then((ok) => {
      if (ok) refreshPayees();
    });
  }, [auth, refreshPayees]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const ok = await auth.login(email, password);
    if (ok) {
      await refreshPayees();
      setPassword('');
      setMessage({ type: 'ok', text: 'Signed in to admin.' });
    } else if (auth.error) {
      setMessage({ type: 'err', text: auth.error });
    }
  }

  async function logout() {
    await auth.logout();
    setPayees([]);
    setMessage({ type: 'ok', text: 'Logged out.' });
  }

  async function runOperation(
    operation: string,
    extra?: Record<string, unknown>,
  ): Promise<boolean> {
    setMessage(null);
    const result = await ops.run(operation, extra);
    if (result.ok) {
      setMessage({ type: 'ok', text: result.message || 'Done.' });
      await refreshPayees();
      return true;
    }
    setMessage({ type: 'err', text: result.message || 'Failed' });
    return false;
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
      <div className="min-h-[40vh] flex items-center justify-center text-sm text-neutral-500">
        <Spinner /> <span className="ml-2">Checking admin session…</span>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="max-w-md">
        <div className="bg-surface border border-neutral-200 rounded-lg p-8 shadow-sm-custom">
          <p className="text-eyebrow mb-1">Admin sign-in</p>
          <h2 className="font-display text-2xl tracking-tightest mb-3">
            Operator credentials
          </h2>
          <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
            Uses fixed admin credentials (hardcoded — nothing stored in Redis).
            Email{' '}
            <code className="font-mono-tab text-[11px] bg-neutral-100 px-1.5 py-0.5 rounded">
              admin@root.credit
            </code>{' '}
            / password in{' '}
            <code className="font-mono-tab text-[11px] bg-neutral-100 px-1.5 py-0.5 rounded">
              lib/admin-session.ts
            </code>
            .
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                className={inputClass}
                placeholder="admin@root.credit"
                required
              />
            </div>
            <div>
              <label className={labelClass}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className={inputClass}
                required
              />
            </div>
            {message && <Message message={message} />}
            <button
              type="submit"
              disabled={busy !== null}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-md bg-ink text-white text-sm font-medium tracking-tight hover:bg-ink-soft transition-smooth disabled:opacity-50"
            >
              {busy === 'login' ? (
                <>
                  <Spinner /> Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className={sectionEyebrow}>Operations</p>
          <h2 className="font-display text-2xl tracking-tightest mt-1">
            Sandbox controls
          </h2>
        </div>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm rounded-md border border-neutral-200 hover:border-ink hover:bg-neutral-100 transition-smooth"
        >
          Log out
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {message && <Message message={message} />}

      <Section
        title={branding.payeePlural}
        description={`Clear every payee record and ${branding.merchantSingular.toLowerCase()} index sets in Redis.`}
        tone="danger"
      >
        <button
          type="button"
          disabled={busy !== null}
          onClick={() =>
            confirmThen(
              `This deletes ALL ${branding.payeePlural.toLowerCase()} for ALL ${branding.merchantPlural.toLowerCase()}.`,
              () => runOperation('clear_all_payees')
            )
          }
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-error text-white text-sm font-medium hover:opacity-90 transition-smooth disabled:opacity-50"
        >
          {busy === 'clear_all_payees' ? <><Spinner /> Clearing…</> : `Clear all ${branding.payeePlural.toLowerCase()}`}
        </button>

        <div className="pt-5 mt-5 border-t border-neutral-150">
          <p className="text-sm font-medium text-foreground mb-1">
            Remove one {branding.payeeSingular.toLowerCase()}
          </p>
          <p className="text-sm text-neutral-500 mb-3">
            Targeted removal of a single {branding.payeeSingular.toLowerCase()} by ID.
          </p>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[240px]">
              <label className={labelClass}>{branding.payeeSingular}</label>
              <select
                value={selectedPayeeId}
                onChange={(e) => setSelectedPayeeId(e.target.value)}
                className={inputClass}
              >
                <option value="">Select {branding.payeeSingular.toLowerCase()}…</option>
                {payees.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id.slice(0, 8)}…)
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              disabled={busy !== null || !selectedPayeeId}
              onClick={() =>
                confirmThen(
                  `This removes one ${branding.payeeSingular.toLowerCase()} from Redis.`,
                  () => runOperation('remove_payee', { payeeId: selectedPayeeId })
                )
              }
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-warning text-white text-sm font-medium hover:opacity-90 transition-smooth disabled:opacity-50"
            >
              {busy === 'remove_payee' ? <><Spinner /> Removing…</> : `Remove ${branding.payeeSingular.toLowerCase()}`}
            </button>
          </div>
        </div>
      </Section>

      <Section
        title="Sessions & transactions"
        description={`Clears ${branding.merchantSingular.toLowerCase()} user sessions and payout transaction history in Redis. Does not remove ${branding.merchantPlural.toLowerCase()} or ${branding.payeePlural.toLowerCase()}.`}
      >
        <button
          type="button"
          disabled={busy !== null}
          onClick={() =>
            confirmThen(
              'This logs everyone out and clears transaction lists.',
              () => runOperation('clear_sessions_and_transactions')
            )
          }
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-warning text-white text-sm font-medium hover:opacity-90 transition-smooth disabled:opacity-50"
        >
          {busy === 'clear_sessions_and_transactions' ? <><Spinner /> Clearing…</> : 'Clear sessions & transactions'}
        </button>
      </Section>

      <Section
        title={`Bank tokens (${branding.merchantPlural.toLowerCase()})`}
        description={
          <>
            Removes <code className="font-mono-tab text-[11px] bg-neutral-100 px-1.5 py-0.5 rounded">bankAccountToken</code>{' '}
            from each {branding.merchantSingular.toLowerCase()} record (does not call Root APIs).
          </>
        }
      >
        <button
          type="button"
          disabled={busy !== null}
          onClick={() =>
            confirmThen('Linked bank metadata will be cleared from Redis.', () =>
              runOperation('clear_bank_fields')
            )
          }
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-info text-white text-sm font-medium hover:opacity-90 transition-smooth disabled:opacity-50"
        >
          {busy === 'clear_bank_fields' ? <><Spinner /> Clearing…</> : 'Clear bank data'}
        </button>
      </Section>

      <Section
        title="Shared app login password"
        description={
          <>
            All {branding.merchantSingular.toLowerCase()} accounts use one shared password (stored hashed in Redis).
            Until you set one here, the default is{' '}
            <code className="font-mono-tab text-[11px] bg-neutral-100 px-1.5 py-0.5 rounded">
              1234567890
            </code>.
          </>
        }
      >
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[220px]">
            <label className={labelClass}>New shared password</label>
            <input
              type="password"
              value={newSharedPassword}
              onChange={(e) => setNewSharedPassword(e.target.value)}
              placeholder="Min 8 characters"
              minLength={8}
              className={inputClass}
            />
          </div>
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
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-ink text-white text-sm font-medium hover:bg-ink-soft transition-smooth disabled:opacity-50"
          >
            {busy === 'set_shared_login_password' ? <><Spinner /> Saving…</> : 'Save shared password'}
          </button>
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  description,
  tone,
  children,
}: {
  title: string;
  description: React.ReactNode;
  tone?: 'danger';
  children: React.ReactNode;
}) {
  return (
    <section
      className={`bg-surface border rounded-lg p-6 shadow-sm-custom ${
        tone === 'danger' ? 'border-error/15' : 'border-neutral-200'
      }`}
    >
      <h3 className="font-display text-lg tracking-tightest mb-1.5">{title}</h3>
      <p className="text-sm text-neutral-500 mb-4 leading-relaxed">{description}</p>
      {children}
    </section>
  );
}

function Message({
  message,
}: {
  message: { type: 'ok' | 'err'; text: string };
}) {
  return (
    <div
      className={`px-4 py-3 rounded-md text-sm border ${
        message.type === 'ok'
          ? 'bg-success-soft border-success/20 text-success'
          : 'bg-error-soft border-error/20 text-error'
      }`}
    >
      {message.text}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
