'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  initialMarketplaceDomains,
  initialOwnedDomains,
  type DomainCategory,
  type MarketplaceDomain,
  type OwnedDomain,
} from '@/lib/godaddy-mock-data';
import type { Money } from '@/lib/types/payments';

/**
 * Cross-page mock store for the GoDaddy reskin.
 *
 * The live Root SDK has no concept of domains — these records are intentionally
 * client-only. We mount the provider once at the dashboard layout level so navigating
 * between dashboard sub-pages keeps wallet balance, owned domains, and the marketplace
 * inventory in a single place.
 */

type BuyResult = { ok: true } | { ok: false; reason: string };

type DomainStore = {
  walletBalanceCents: Money;
  topUpWallet: (cents: Money) => void;
  withdrawFromWallet: (cents: Money) => boolean;

  ownedDomains: OwnedDomain[];
  addOwnedDomain: (name: string) => OwnedDomain | null;
  listDomainForSale: (id: string, priceCents: Money) => void;
  unlistDomain: (id: string) => void;

  marketplaceDomains: MarketplaceDomain[];
  buyDomain: (id: string) => BuyResult;
};

const DomainStoreContext = createContext<DomainStore | null>(null);

const STARTING_BALANCE_CENTS: Money = 125000;

export function DomainStoreProvider({ children }: { children: React.ReactNode }) {
  const [walletBalanceCents, setWalletBalanceCents] = useState<Money>(STARTING_BALANCE_CENTS);
  const [ownedDomains, setOwnedDomains] = useState<OwnedDomain[]>(initialOwnedDomains);
  const [marketplaceDomains, setMarketplaceDomains] =
    useState<MarketplaceDomain[]>(initialMarketplaceDomains);

  const topUpWallet = useCallback((cents: Money) => {
    setWalletBalanceCents((b) => b + cents);
  }, []);

  const withdrawFromWallet = useCallback(
    (cents: Money) => {
      if (cents <= 0) return false;
      if (walletBalanceCents < cents) return false;
      setWalletBalanceCents((b) => b - cents);
      return true;
    },
    [walletBalanceCents],
  );

  const addOwnedDomain = useCallback((name: string) => {
    const trimmed = name.trim().toLowerCase();
    if (!trimmed) return null;
    const next: OwnedDomain = {
      id: `own-${Date.now()}`,
      name: trimmed,
      registeredAt: new Date().toISOString().slice(0, 10),
    };
    setOwnedDomains((list) => [next, ...list]);
    return next;
  }, []);

  const listDomainForSale = useCallback((id: string, priceCents: Money) => {
    setOwnedDomains((list) =>
      list.map((d) => (d.id === id ? { ...d, listingPriceCents: priceCents } : d)),
    );
    setOwnedDomains((current) => {
      const target = current.find((d) => d.id === id);
      if (!target) return current;
      // also surface in marketplace as a self-listed domain
      const sellerDomain: MarketplaceDomain = {
        id: `mkt-self-${id}`,
        name: target.name,
        priceCents,
        sellerHandle: '@you',
        category: inferCategory(target.name),
        trafficScore: 50 + Math.floor(Math.random() * 30),
        description: 'Listed by you. Visible to other accounts in the marketplace.',
      };
      setMarketplaceDomains((mkt) => {
        const existing = mkt.find((m) => m.id === sellerDomain.id);
        if (existing) {
          return mkt.map((m) => (m.id === sellerDomain.id ? { ...m, priceCents } : m));
        }
        return [sellerDomain, ...mkt];
      });
      return current;
    });
  }, []);

  const unlistDomain = useCallback((id: string) => {
    setOwnedDomains((list) =>
      list.map((d) =>
        d.id === id ? { ...d, listingPriceCents: undefined } : d,
      ),
    );
    setMarketplaceDomains((mkt) => mkt.filter((m) => m.id !== `mkt-self-${id}`));
  }, []);

  const buyDomain = useCallback(
    (id: string): BuyResult => {
      const target = marketplaceDomains.find((m) => m.id === id);
      if (!target) return { ok: false, reason: 'Domain no longer available.' };
      if (walletBalanceCents < target.priceCents) {
        return { ok: false, reason: 'Insufficient wallet balance.' };
      }
      setWalletBalanceCents((b) => b - target.priceCents);
      setMarketplaceDomains((mkt) => mkt.filter((m) => m.id !== id));
      setOwnedDomains((list) => [
        {
          id: `own-${Date.now()}`,
          name: target.name,
          registeredAt: new Date().toISOString().slice(0, 10),
        },
        ...list,
      ]);
      return { ok: true };
    },
    [marketplaceDomains, walletBalanceCents],
  );

  const value = useMemo<DomainStore>(
    () => ({
      walletBalanceCents,
      topUpWallet,
      withdrawFromWallet,
      ownedDomains,
      addOwnedDomain,
      listDomainForSale,
      unlistDomain,
      marketplaceDomains,
      buyDomain,
    }),
    [
      walletBalanceCents,
      topUpWallet,
      withdrawFromWallet,
      ownedDomains,
      addOwnedDomain,
      listDomainForSale,
      unlistDomain,
      marketplaceDomains,
      buyDomain,
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

function inferCategory(name: string): DomainCategory {
  const lc = name.toLowerCase();
  if (/(dev|stack|cloud|api|tech|app|io)/.test(lc)) return 'tech';
  if (/(shop|trade|biz|deal|store)/.test(lc)) return 'business';
  if (/(studio|loop|paper|design|art)/.test(lc)) return 'creative';
  if (/(credit|finance|capital|fund|bank)/.test(lc)) return 'finance';
  return 'lifestyle';
}
