'use client';

import { useEffect, useState } from 'react';
import { branding } from '@/lib/branding';
import {
  useAdminAuth,
  useAdminOperations,
  useAdminPayees,
} from '@/lib/hooks/useAdmin';

const inputClass =
  'w-full px-3.5 py-2.5 bg-background text-foreground rounded-md border border-input ' +
  'placeholder:text-muted-foreground ' +
  'focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/20 transition-colors';

const labelClass =
  'block text-[11px] tracking-[0.14em] uppercase text-muted-foreground mb-2';

const sectionEyebrow =
  'text-[11px] tracking-[0.18em] uppercase text-muted-foreground font-medium';

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

  // const refreshAuth = auth.refresh;
  // useEffect(() => {
  //   let cancelled = false;
  //   refreshAuth().then((ok) => {
  //     if (!cancelled && ok) refreshPayees();
  //   });
  //   return () => {
  //     cancelled = true;
  //   };
  // }, [refreshAuth, refreshPayees]);

  useEffect(() => {
    let cancelled = false;
  
    auth.refresh()
      .then((ok) => {
        if (!cancelled && ok) refreshPayees();
      })
      .catch((err) => {
        if (!cancelled) console.error('Session check failed:', err);
      });
  
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <div className="min-h-[40vh] flex items-center justify-center text-sm text-muted-foreground">
        <Spinner /> <span className="ml-2">Checking admin session…</span>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="max-w-md">
        <div className="bg-card border rounded-lg p-8 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Admin sign-in</p>
          <h2 className="font-semibold tracking-tight text-2xl mb-3">
            Operator credentials
          </h2>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Uses fixed admin credentials (hardcoded — nothing stored in Redis).
            Email{' '}
            <code className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded">
              admin@root.credit
            </code>{' '}
            / password in{' '}
            <code className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded">
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
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-md bg-primary text-primary-foreground text-sm font-medium tracking-tight hover:bg-primary/90 transition-colors disabled:opacity-50"
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
          <h2 className="font-semibold tracking-tight text-2xl mt-1">
            Sandbox controls
          </h2>
        </div>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm rounded-md border hover:border-foreground hover:bg-muted transition-colors"
        >
          Log out
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {message && <Message message={message} />}

      <Section
        title="Master reset (Upstash)"
        description={
          <>
            Runs Redis{' '}
            <code className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded">
              FLUSHDB
            </code>{' '}
            on this database: removes all payer/payee/session/transaction records,
            shared login hash, and any other keys. Admin login is unchanged (cookie only).
            Use a dedicated Upstash DB for this app in production.
          </>
        }
        tone="danger"
      >
        <button
          type="button"
          disabled={busy !== null}
          onClick={() =>
            confirmThen(
              'This runs FLUSHDB and deletes EVERY key in this Upstash Redis database.',
              () => runOperation('flush_entire_database'),
            )
          }
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50"
        >
          {busy === 'flush_entire_database' ? (
            <>
              <Spinner /> Flushing database…
            </>
          ) : (
            'Erase entire Redis database'
          )}
        </button>
      </Section>

      <Section
        title={branding.payeePlural}
        description={`Clear every payee record and ${branding.payerSingular.toLowerCase()} index sets in Redis.`}
        tone="danger"
      >
        <button
          type="button"
          disabled={busy !== null}
          onClick={() =>
            confirmThen(
              `This deletes ALL ${branding.payeePlural.toLowerCase()} for ALL ${branding.payerPlural.toLowerCase()}.`,
              () => runOperation('clear_all_payees')
            )
          }
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50"
        >
          {busy === 'clear_all_payees' ? <><Spinner /> Clearing…</> : `Clear all ${branding.payeePlural.toLowerCase()}`}
        </button>

        <div className="pt-5 mt-5 border-t">
          <p className="text-sm font-medium text-foreground mb-1">
            Remove one {branding.payeeSingular.toLowerCase()}
          </p>
          <p className="text-sm text-muted-foreground mb-3">
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
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors disabled:opacity-50"
            >
              {busy === 'remove_payee' ? <><Spinner /> Removing…</> : `Remove ${branding.payeeSingular.toLowerCase()}`}
            </button>
          </div>
        </div>
      </Section>

      <Section
        title="Sessions & transactions"
        description={`Clears ${branding.payerSingular.toLowerCase()} user sessions and payout transaction history in Redis. Does not remove ${branding.payerPlural.toLowerCase()} or ${branding.payeePlural.toLowerCase()}.`}
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
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors disabled:opacity-50"
        >
          {busy === 'clear_sessions_and_transactions' ? <><Spinner /> Clearing…</> : 'Clear sessions & transactions'}
        </button>
      </Section>

      <Section
        title={`Bank tokens (${branding.payerPlural.toLowerCase()})`}
        description={
          <>
            Removes <code className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded">bankAccountToken</code>{' '}
            from each {branding.payerSingular.toLowerCase()} record (does not call Root APIs).
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
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {busy === 'clear_bank_fields' ? <><Spinner /> Clearing…</> : 'Clear bank data'}
        </button>
      </Section>

      <Section
        title="Shared app login password"
        description={
          <>
            All {branding.payerSingular.toLowerCase()} accounts use one shared password (stored hashed in Redis).
            Until you set one here, the default is{' '}
            <code className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded">
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
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
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
      className={`bg-card border rounded-lg p-6 shadow-sm ${
        tone === 'danger' ? 'border-destructive/20' : 'border-border'
      }`}
    >
      <h3 className="font-semibold tracking-tight text-lg mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{description}</p>
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
          ? 'bg-green-50 border-green-200 text-green-700'
          : 'bg-red-50 border-red-200 text-red-700'
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
