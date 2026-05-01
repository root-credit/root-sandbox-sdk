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
  bookListing as bookListingAction,
  createListing as createListingAction,
  getMarketplaceListings,
  getMyHostedListings,
  getMyTrips,
  getMyWalletStatus,
  unlistListing as unlistListingAction,
  type CreateListingInput,
  type ListingMutationResult,
  type ListingRecord,
  type WalletStatus,
} from '@/lib/airbnb-actions';
import type { Money } from '@/lib/types/payments';

/**
 * Cross-page client store for the Airbnb reskin.
 *
 * - All state is fetched live from server actions (no client-side cache,
 *   no localStorage, no bootstrap data).
 * - The Airbnb wallet balance is derived from `getMyWalletStatus()`, which calls
 *   `GET /api/subaccounts/{id}` and computes `incoming - outgoing` server-side.
 * - Marketplace + hosted listings live in Redis, so listings created by one
 *   account are visible to every other signed-in account.
 */

type ListingStore = {
  // Wallet
  walletEnabled: boolean;
  walletBalanceCents: Money | null;
  walletIncomingCents: Money | null;
  walletOutgoingCents: Money | null;
  isWalletLoading: boolean;
  refreshWallet: () => Promise<void>;

  // Listings
  hostedListings: ListingRecord[];
  marketplaceListings: ListingRecord[];
  trips: ListingRecord[];
  isListingsLoading: boolean;
  refreshListings: () => Promise<void>;

  // Mutations
  createListing: (
    input: CreateListingInput,
  ) => Promise<ListingMutationResult & { listing?: ListingRecord }>;
  unlist: (id: string) => Promise<ListingMutationResult>;
  book: (id: string) => Promise<ListingMutationResult>;
};

const ListingStoreContext = createContext<ListingStore | null>(null);

const EMPTY_WALLET: WalletStatus = {
  enabled: false,
  subaccountId: null,
  balanceCents: null,
  incomingCents: null,
  outgoingCents: null,
};

export function ListingStoreProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletStatus>(EMPTY_WALLET);
  const [isWalletLoading, setIsWalletLoading] = useState(true);

  const [hostedListings, setHostedListings] = useState<ListingRecord[]>([]);
  const [marketplaceListings, setMarketplaceListings] = useState<ListingRecord[]>([]);
  const [trips, setTrips] = useState<ListingRecord[]>([]);
  const [isListingsLoading, setIsListingsLoading] = useState(true);

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

  const refreshListings = useCallback(async () => {
    setIsListingsLoading(true);
    try {
      const [hosted, marketplace, trips] = await Promise.all([
        getMyHostedListings(),
        getMarketplaceListings(),
        getMyTrips(),
      ]);
      setHostedListings(hosted);
      setMarketplaceListings(marketplace);
      setTrips(trips);
    } catch {
      setHostedListings([]);
      setMarketplaceListings([]);
      setTrips([]);
    } finally {
      setIsListingsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshWallet();
    refreshListings();
  }, [refreshWallet, refreshListings]);

  const createListing = useCallback(
    async (input: CreateListingInput) => {
      const result = await createListingAction(input);
      if (result.ok) await refreshListings();
      return result;
    },
    [refreshListings],
  );

  const unlist = useCallback(
    async (id: string) => {
      const result = await unlistListingAction(id);
      if (result.ok) await refreshListings();
      return result;
    },
    [refreshListings],
  );

  const book = useCallback(
    async (id: string) => {
      const result = await bookListingAction(id);
      if (result.ok) {
        await Promise.all([refreshListings(), refreshWallet()]);
      }
      return result;
    },
    [refreshListings, refreshWallet],
  );

  const value = useMemo<ListingStore>(
    () => ({
      walletEnabled: wallet.enabled,
      walletBalanceCents: wallet.balanceCents,
      walletIncomingCents: wallet.incomingCents,
      walletOutgoingCents: wallet.outgoingCents,
      isWalletLoading,
      refreshWallet,
      hostedListings,
      marketplaceListings,
      trips,
      isListingsLoading,
      refreshListings,
      createListing,
      unlist,
      book,
    }),
    [
      wallet,
      isWalletLoading,
      refreshWallet,
      hostedListings,
      marketplaceListings,
      trips,
      isListingsLoading,
      refreshListings,
      createListing,
      unlist,
      book,
    ],
  );

  return (
    <ListingStoreContext.Provider value={value}>{children}</ListingStoreContext.Provider>
  );
}

export function useListingStore() {
  const ctx = useContext(ListingStoreContext);
  if (!ctx) {
    throw new Error('useListingStore must be used within a ListingStoreProvider');
  }
  return ctx;
}
