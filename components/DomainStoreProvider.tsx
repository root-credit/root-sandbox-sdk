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
  buyDomain as buyDomainAction,
  getMarketplaceDomains,
  getMyOwnedDomains,
  getMyWalletStatus,
  listDomainForSale as listDomainForSaleAction,
  transferInDomain,
  unlistDomain as unlistDomainAction,
  type DomainMutationResult,
  type MarketplaceDomainRecord,
  type OwnedDomainRecord,
  type WalletStatus,
} from '@/lib/godaddy-actions';
import type { Money } from '@/lib/types/payments';

/**
 * Cross-page client store for the GoDaddy reskin.
 *
 * - All state is fetched live from server actions (no client-side cache,
 *   no localStorage, no bootstrap data).
 * - The GAG wallet balance is derived from `getMyWalletStatus()`, which calls
 *   `GET /api/subaccounts/{id}` and computes `incoming - outgoing` server-side.
 * - Marketplace + owned domains live in Redis, so listings made by one payer
 *   are visible to every other signed-in payer.
 */

type DomainStore = {
  // Wallet
  walletEnabled: boolean;
  walletBalanceCents: Money | null;
  walletIncomingCents: Money | null;
  walletOutgoingCents: Money | null;
  isWalletLoading: boolean;
  refreshWallet: () => Promise<void>;

  // Domains
  ownedDomains: OwnedDomainRecord[];
  marketplaceDomains: MarketplaceDomainRecord[];
  isDomainsLoading: boolean;
  refreshDomains: () => Promise<void>;

  // Mutations
  transferIn: (
    name: string,
  ) => Promise<DomainMutationResult & { domain?: OwnedDomainRecord }>;
  listForSale: (name: string, priceCents: Money) => Promise<DomainMutationResult>;
  unlist: (name: string) => Promise<DomainMutationResult>;
  buy: (name: string) => Promise<DomainMutationResult>;
};

const DomainStoreContext = createContext<DomainStore | null>(null);

const EMPTY_WALLET: WalletStatus = {
  enabled: false,
  subaccountId: null,
  balanceCents: null,
  incomingCents: null,
  outgoingCents: null,
};

export function DomainStoreProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletStatus>(EMPTY_WALLET);
  const [isWalletLoading, setIsWalletLoading] = useState(true);

  const [ownedDomains, setOwnedDomains] = useState<OwnedDomainRecord[]>([]);
  const [marketplaceDomains, setMarketplaceDomains] = useState<MarketplaceDomainRecord[]>([]);
  const [isDomainsLoading, setIsDomainsLoading] = useState(true);

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

  const refreshDomains = useCallback(async () => {
    setIsDomainsLoading(true);
    try {
      const [owned, marketplace] = await Promise.all([
        getMyOwnedDomains(),
        getMarketplaceDomains(),
      ]);
      setOwnedDomains(owned);
      setMarketplaceDomains(marketplace);
    } catch {
      setOwnedDomains([]);
      setMarketplaceDomains([]);
    } finally {
      setIsDomainsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshWallet();
    refreshDomains();
  }, [refreshWallet, refreshDomains]);

  const transferIn = useCallback(
    async (name: string) => {
      const result = await transferInDomain(name);
      if (result.ok) await refreshDomains();
      return result;
    },
    [refreshDomains],
  );

  const listForSale = useCallback(
    async (name: string, priceCents: Money) => {
      const result = await listDomainForSaleAction(name, priceCents);
      if (result.ok) await refreshDomains();
      return result;
    },
    [refreshDomains],
  );

  const unlist = useCallback(
    async (name: string) => {
      const result = await unlistDomainAction(name);
      if (result.ok) await refreshDomains();
      return result;
    },
    [refreshDomains],
  );

  const buy = useCallback(
    async (name: string) => {
      const result = await buyDomainAction(name);
      if (result.ok) {
        await Promise.all([refreshDomains(), refreshWallet()]);
      }
      return result;
    },
    [refreshDomains, refreshWallet],
  );

  const value = useMemo<DomainStore>(
    () => ({
      walletEnabled: wallet.enabled,
      walletBalanceCents: wallet.balanceCents,
      walletIncomingCents: wallet.incomingCents,
      walletOutgoingCents: wallet.outgoingCents,
      isWalletLoading,
      refreshWallet,
      ownedDomains,
      marketplaceDomains,
      isDomainsLoading,
      refreshDomains,
      transferIn,
      listForSale,
      unlist,
      buy,
    }),
    [
      wallet,
      isWalletLoading,
      refreshWallet,
      ownedDomains,
      marketplaceDomains,
      isDomainsLoading,
      refreshDomains,
      transferIn,
      listForSale,
      unlist,
      buy,
    ],
  );

  return <DomainStoreContext.Provider value={value}>{children}</DomainStoreContext.Provider>;
}

export function useDomainStore() {
  const ctx = useContext(DomainStoreContext);
  if (!ctx) {
    throw new Error('useDomainStore must be used within a DomainStoreProvider');
  }
  return ctx;
}
