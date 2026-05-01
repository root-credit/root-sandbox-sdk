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
  getAvailableListings,
  getMyBookings,
  getMyListings,
  getMyWalletStatus,
  relistListing as relistListingAction,
  unlistListing as unlistListingAction,
  type CreateListingInput,
  type ListingMutationResult,
  type RentalListing,
  type WalletStatus,
} from '@/lib/airbnb-actions';
import type { Money } from '@/lib/types/payments';

/**
 * Cross-page client store for the Airbnb rentals reskin.
 *
 * - All state is fetched live from server actions (no client-side cache,
 *   no localStorage, no bootstrap data).
 * - The Airbnb wallet balance is derived from `getMyWalletStatus()`, which calls
 *   `GET /api/subaccounts/{id}` and computes `incoming - outgoing` server-side.
 * - Marketplace, my listings, and my bookings live in Redis, so a listing
 *   created by one member is visible to every other signed-in member.
 */

type RentalStore = {
  // Wallet
  walletEnabled: boolean;
  walletBalanceCents: Money | null;
  walletIncomingCents: Money | null;
  walletOutgoingCents: Money | null;
  isWalletLoading: boolean;
  refreshWallet: () => Promise<void>;

  // Listings
  myListings: RentalListing[];
  availableListings: RentalListing[];
  myBookings: RentalListing[];
  isListingsLoading: boolean;
  refreshListings: () => Promise<void>;

  // Mutations
  createListing: (
    input: CreateListingInput,
  ) => Promise<ListingMutationResult & { listing?: RentalListing }>;
  unlist: (id: string) => Promise<ListingMutationResult>;
  relist: (id: string) => Promise<ListingMutationResult>;
  book: (id: string) => Promise<ListingMutationResult>;
};

const RentalStoreContext = createContext<RentalStore | null>(null);

const EMPTY_WALLET: WalletStatus = {
  enabled: false,
  subaccountId: null,
  balanceCents: null,
  incomingCents: null,
  outgoingCents: null,
};

export function RentalStoreProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletStatus>(EMPTY_WALLET);
  const [isWalletLoading, setIsWalletLoading] = useState(true);

  const [myListings, setMyListings] = useState<RentalListing[]>([]);
  const [availableListings, setAvailableListings] = useState<RentalListing[]>([]);
  const [myBookings, setMyBookings] = useState<RentalListing[]>([]);
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
      const [mine, available, bookings] = await Promise.all([
        getMyListings(),
        getAvailableListings(),
        getMyBookings(),
      ]);
      setMyListings(mine);
      setAvailableListings(available);
      setMyBookings(bookings);
    } catch {
      setMyListings([]);
      setAvailableListings([]);
      setMyBookings([]);
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

  const relist = useCallback(
    async (id: string) => {
      const result = await relistListingAction(id);
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

  const value = useMemo<RentalStore>(
    () => ({
      walletEnabled: wallet.enabled,
      walletBalanceCents: wallet.balanceCents,
      walletIncomingCents: wallet.incomingCents,
      walletOutgoingCents: wallet.outgoingCents,
      isWalletLoading,
      refreshWallet,
      myListings,
      availableListings,
      myBookings,
      isListingsLoading,
      refreshListings,
      createListing,
      unlist,
      relist,
      book,
    }),
    [
      wallet,
      isWalletLoading,
      refreshWallet,
      myListings,
      availableListings,
      myBookings,
      isListingsLoading,
      refreshListings,
      createListing,
      unlist,
      relist,
      book,
    ],
  );

  return <RentalStoreContext.Provider value={value}>{children}</RentalStoreContext.Provider>;
}

export function useRentalStore() {
  const ctx = useContext(RentalStoreContext);
  if (!ctx) {
    throw new Error('useRentalStore must be used within a RentalStoreProvider');
  }
  return ctx;
}
