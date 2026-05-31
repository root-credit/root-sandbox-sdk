'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  getMyWalletStatus,
  type WalletStatus,
} from '@/lib/godaddy-actions';
import type { Money } from '@/lib/types/payments';

/**
 * Crypto wallet store — replaces DomainStoreProvider for the Coinbase reskin.
 * Tracks the live Coinbase Cash Balance (wallet) status.
 */

export type CryptoHolding = {
  symbol: string;
  name: string;
  amountCrypto: number;
  costBasisCents: Money;
  currentPriceCents: Money;
};

type CryptoStore = {
  // Wallet
  walletEnabled: boolean;
  walletBalanceCents: Money | null;
  walletIncomingCents: Money | null;
  walletOutgoingCents: Money | null;
  isWalletLoading: boolean;
  refreshWallet: () => Promise<void>;

  // Crypto holdings (client-side session state, mocked)
  holdings: CryptoHolding[];
  addHolding: (holding: CryptoHolding) => void;
  removeHolding: (symbol: string, amount: number) => void;
};

const CryptoStoreContext = createContext<CryptoStore | null>(null);

const EMPTY_WALLET: WalletStatus = {
  enabled: false,
  subaccountId: null,
  balanceCents: null,
  incomingCents: null,
  outgoingCents: null,
};

// Mocked spot prices in cents
export const SPOT_PRICES: Record<string, { priceCents: number; name: string }> = {
  BTC: { priceCents: 6743218, name: 'Bitcoin' },
  ETH: { priceCents: 352190, name: 'Ethereum' },
  SOL: { priceCents: 18244, name: 'Solana' },
  USDC: { priceCents: 100, name: 'USD Coin' },
};

export function CryptoStoreProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletStatus>(EMPTY_WALLET);
  const [isWalletLoading, setIsWalletLoading] = useState(true);
  const [holdings, setHoldings] = useState<CryptoHolding[]>([]);

  const refreshWallet = useCallback(async () => {
    setIsWalletLoading(true);
    try {
      const next = await getMyWalletStatus();
      setWallet(next);
    } catch {
      setWallet(EMPTY_WALLET);
    } finally {
      setIsWalletLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

  const addHolding = useCallback((holding: CryptoHolding) => {
    setHoldings((prev) => {
      const existing = prev.find((h) => h.symbol === holding.symbol);
      if (existing) {
        return prev.map((h) =>
          h.symbol === holding.symbol
            ? {
                ...h,
                amountCrypto: h.amountCrypto + holding.amountCrypto,
                costBasisCents: h.costBasisCents + holding.costBasisCents,
              }
            : h,
        );
      }
      return [...prev, holding];
    });
  }, []);

  const removeHolding = useCallback((symbol: string, amount: number) => {
    setHoldings((prev) =>
      prev
        .map((h) =>
          h.symbol === symbol
            ? { ...h, amountCrypto: Math.max(0, h.amountCrypto - amount) }
            : h,
        )
        .filter((h) => h.amountCrypto > 0),
    );
  }, []);

  const value = useMemo<CryptoStore>(
    () => ({
      walletEnabled: wallet.enabled,
      walletBalanceCents: wallet.balanceCents,
      walletIncomingCents: wallet.incomingCents,
      walletOutgoingCents: wallet.outgoingCents,
      isWalletLoading,
      refreshWallet,
      holdings,
      addHolding,
      removeHolding,
    }),
    [wallet, isWalletLoading, refreshWallet, holdings, addHolding, removeHolding],
  );

  return <CryptoStoreContext.Provider value={value}>{children}</CryptoStoreContext.Provider>;
}

export function useCryptoStore() {
  const ctx = useContext(CryptoStoreContext);
  if (!ctx) {
    throw new Error('useCryptoStore must be used within a CryptoStoreProvider');
  }
  return ctx;
}
