'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getMyWalletStatus, type WalletStatus } from '@/lib/wallet-actions';
import type { Money } from '@/lib/types/payments';

/**
 * Cross-page client store for the live Gusto wallet balance.
 *
 * - Balance is fetched live from `getMyWalletStatus()` (which calls Root's
 *   subaccount ledger and computes `incoming - outgoing` server-side).
 * - Nothing is cached client-side; we re-fetch after any wallet-affecting
 *   mutation (top-up, payroll run) so the displayed number is always source-of-truth.
 */

type WalletStore = {
  walletEnabled: boolean;
  walletBalanceCents: Money | null;
  walletIncomingCents: Money | null;
  walletOutgoingCents: Money | null;
  isWalletLoading: boolean;
  refreshWallet: () => Promise<void>;
};

const WalletContext = createContext<WalletStore | null>(null);

const EMPTY: WalletStatus = {
  enabled: false,
  subaccountId: null,
  balanceCents: null,
  incomingCents: null,
  outgoingCents: null,
};

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletStatus>(EMPTY);
  const [isWalletLoading, setIsWalletLoading] = useState(true);

  const refreshWallet = useCallback(async () => {
    setIsWalletLoading(true);
    try {
      const next = await getMyWalletStatus();
      setWallet(next);
    } catch {
      setWallet(EMPTY);
    } finally {
      setIsWalletLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

  const value = useMemo<WalletStore>(
    () => ({
      walletEnabled: wallet.enabled,
      walletBalanceCents: wallet.balanceCents,
      walletIncomingCents: wallet.incomingCents,
      walletOutgoingCents: wallet.outgoingCents,
      isWalletLoading,
      refreshWallet,
    }),
    [wallet, isWalletLoading, refreshWallet],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return ctx;
}
