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
  getAvailableServices,
  getMyPostedServices,
  getMyWalletStatus,
  hireService as hireServiceAction,
  postService as postServiceAction,
  unlistService as unlistServiceAction,
  type PostServiceInput,
  type ServiceListingRecord,
  type ServiceMutationResult,
  type WalletStatus,
} from '@/lib/staffing-actions';
import type { Money } from '@/lib/types/payments';

/**
 * Cross-page client store for the Dental Dynamics reskin.
 *
 * - All state is fetched live from server actions (no client-side cache,
 *   no localStorage, no bootstrap data).
 * - The wallet balance is derived from `getMyWalletStatus()`, which calls
 *   `GET /api/subaccounts/{id}` and computes `incoming - outgoing` server-side.
 * - The shift marketplace + posted shifts live in Redis, so listings made by
 *   one member are visible to every other signed-in member.
 */

type ServiceStore = {
  // Wallet
  walletEnabled: boolean;
  walletBalanceCents: Money | null;
  walletIncomingCents: Money | null;
  walletOutgoingCents: Money | null;
  isWalletLoading: boolean;
  refreshWallet: () => Promise<void>;

  // Shifts
  postedServices: ServiceListingRecord[];
  availableServices: ServiceListingRecord[];
  isServicesLoading: boolean;
  refreshServices: () => Promise<void>;

  // Mutations
  postService: (
    input: PostServiceInput,
  ) => Promise<ServiceMutationResult & { service?: ServiceListingRecord }>;
  unlistService: (id: string) => Promise<ServiceMutationResult>;
  hireService: (id: string) => Promise<ServiceMutationResult>;
};

const ServiceStoreContext = createContext<ServiceStore | null>(null);

const EMPTY_WALLET: WalletStatus = {
  enabled: false,
  subaccountId: null,
  balanceCents: null,
  incomingCents: null,
  outgoingCents: null,
};

export function ServiceStoreProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletStatus>(EMPTY_WALLET);
  const [isWalletLoading, setIsWalletLoading] = useState(true);

  const [postedServices, setPostedServices] = useState<ServiceListingRecord[]>([]);
  const [availableServices, setAvailableServices] = useState<ServiceListingRecord[]>(
    [],
  );
  const [isServicesLoading, setIsServicesLoading] = useState(true);

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

  const refreshServices = useCallback(async () => {
    setIsServicesLoading(true);
    try {
      const [posted, available] = await Promise.all([
        getMyPostedServices(),
        getAvailableServices(),
      ]);
      setPostedServices(posted);
      setAvailableServices(available);
    } catch {
      setPostedServices([]);
      setAvailableServices([]);
    } finally {
      setIsServicesLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshWallet();
    refreshServices();
  }, [refreshWallet, refreshServices]);

  const postService = useCallback(
    async (input: PostServiceInput) => {
      const result = await postServiceAction(input);
      if (result.ok) await refreshServices();
      return result;
    },
    [refreshServices],
  );

  const unlistService = useCallback(
    async (id: string) => {
      const result = await unlistServiceAction(id);
      if (result.ok) await refreshServices();
      return result;
    },
    [refreshServices],
  );

  const hireService = useCallback(
    async (id: string) => {
      const result = await hireServiceAction(id);
      if (result.ok) {
        await Promise.all([refreshServices(), refreshWallet()]);
      }
      return result;
    },
    [refreshServices, refreshWallet],
  );

  const value = useMemo<ServiceStore>(
    () => ({
      walletEnabled: wallet.enabled,
      walletBalanceCents: wallet.balanceCents,
      walletIncomingCents: wallet.incomingCents,
      walletOutgoingCents: wallet.outgoingCents,
      isWalletLoading,
      refreshWallet,
      postedServices,
      availableServices,
      isServicesLoading,
      refreshServices,
      postService,
      unlistService,
      hireService,
    }),
    [
      wallet,
      isWalletLoading,
      refreshWallet,
      postedServices,
      availableServices,
      isServicesLoading,
      refreshServices,
      postService,
      unlistService,
      hireService,
    ],
  );

  return (
    <ServiceStoreContext.Provider value={value}>{children}</ServiceStoreContext.Provider>
  );
}

export function useServiceStore() {
  const ctx = useContext(ServiceStoreContext);
  if (!ctx) {
    throw new Error('useServiceStore must be used within a ServiceStoreProvider');
  }
  return ctx;
}
