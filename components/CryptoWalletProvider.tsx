'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

// Mocked spot prices (static, never change)
export const SPOT_PRICES: Record<CryptoTicker, number> = {
  BTC: 67234.50,
  ETH: 3456.78,
  SOL: 142.56,
  USDC: 1.00,
};

// Mocked 24H change
export const PRICE_CHANGES: Record<CryptoTicker, { value: string; positive: boolean }> = {
  BTC: { value: '+2.4%', positive: true },
  ETH: { value: '+1.8%', positive: true },
  SOL: { value: '-0.5%', positive: false },
  USDC: { value: '0.0%', positive: true },
};

export const CRYPTO_INFO: Record<CryptoTicker, { name: string }> = {
  BTC: { name: 'Bitcoin' },
  ETH: { name: 'Ethereum' },
  SOL: { name: 'Solana' },
  USDC: { name: 'USD Coin' },
};

export type CryptoTicker = 'BTC' | 'ETH' | 'SOL' | 'USDC';

export interface CryptoTransaction {
  id: string;
  type: 'buy' | 'sell';
  ticker: CryptoTicker;
  usdAmount: number;
  cryptoAmount: number;
  price: number;
  date: string;
  status: 'Completed';
}

interface CryptoHoldings {
  BTC: number;
  ETH: number;
  SOL: number;
  USDC: number;
}

interface CryptoWalletState {
  cashBalance: number;
  holdings: CryptoHoldings;
  transactions: CryptoTransaction[];
}

interface CryptoWalletContextValue extends CryptoWalletState {
  buyCrypto: (ticker: CryptoTicker, usdAmount: number) => { ok: boolean; reason?: string };
  sellCrypto: (ticker: CryptoTicker, cryptoAmount: number) => { ok: boolean; reason?: string };
  getHoldingValue: (ticker: CryptoTicker) => number;
  getTotalPortfolioValue: () => number;
}

const CryptoWalletContext = createContext<CryptoWalletContextValue | null>(null);

export function CryptoWalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CryptoWalletState>({
    cashBalance: 10000.00,
    holdings: { BTC: 0, ETH: 0, SOL: 0, USDC: 0 },
    transactions: [],
  });

  const buyCrypto = useCallback((ticker: CryptoTicker, usdAmount: number) => {
    if (usdAmount <= 0) {
      return { ok: false, reason: 'Amount must be greater than zero.' };
    }
    if (usdAmount > state.cashBalance) {
      return { ok: false, reason: 'Insufficient cash balance.' };
    }

    const price = SPOT_PRICES[ticker];
    const cryptoAmount = usdAmount / price;

    setState((prev) => ({
      cashBalance: prev.cashBalance - usdAmount,
      holdings: {
        ...prev.holdings,
        [ticker]: prev.holdings[ticker] + cryptoAmount,
      },
      transactions: [
        ...prev.transactions,
        {
          id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          type: 'buy' as const,
          ticker,
          usdAmount,
          cryptoAmount,
          price,
          date: new Date().toISOString(),
          status: 'Completed' as const,
        },
      ],
    }));

    return { ok: true };
  }, [state.cashBalance]);

  const sellCrypto = useCallback((ticker: CryptoTicker, cryptoAmount: number) => {
    if (cryptoAmount <= 0) {
      return { ok: false, reason: 'Amount must be greater than zero.' };
    }
    if (cryptoAmount > state.holdings[ticker]) {
      return { ok: false, reason: `Insufficient ${ticker} holdings.` };
    }

    const price = SPOT_PRICES[ticker];
    const usdAmount = cryptoAmount * price;

    setState((prev) => ({
      cashBalance: prev.cashBalance + usdAmount,
      holdings: {
        ...prev.holdings,
        [ticker]: prev.holdings[ticker] - cryptoAmount,
      },
      transactions: [
        ...prev.transactions,
        {
          id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          type: 'sell' as const,
          ticker,
          usdAmount,
          cryptoAmount,
          price,
          date: new Date().toISOString(),
          status: 'Completed' as const,
        },
      ],
    }));

    return { ok: true };
  }, [state.holdings]);

  const getHoldingValue = useCallback((ticker: CryptoTicker) => {
    return state.holdings[ticker] * SPOT_PRICES[ticker];
  }, [state.holdings]);

  const getTotalPortfolioValue = useCallback(() => {
    return (
      state.holdings.BTC * SPOT_PRICES.BTC +
      state.holdings.ETH * SPOT_PRICES.ETH +
      state.holdings.SOL * SPOT_PRICES.SOL +
      state.holdings.USDC * SPOT_PRICES.USDC
    );
  }, [state.holdings]);

  return (
    <CryptoWalletContext.Provider
      value={{
        ...state,
        buyCrypto,
        sellCrypto,
        getHoldingValue,
        getTotalPortfolioValue,
      }}
    >
      {children}
    </CryptoWalletContext.Provider>
  );
}

export function useCryptoWallet() {
  const context = useContext(CryptoWalletContext);
  if (!context) {
    throw new Error('useCryptoWallet must be used within a CryptoWalletProvider');
  }
  return context;
}
