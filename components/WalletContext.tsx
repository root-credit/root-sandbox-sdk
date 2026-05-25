'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Transaction {
  id: string;
  date: string;
  time: string;
  fromCurrency: string;
  toCurrency: string;
  sentAmount: number;
  receivedAmount: number;
  exchangeRate: number;
  fee: number;
  status: 'Completed';
}

interface WalletContextType {
  balance: number;
  transactions: Transaction[];
  deductBalance: (amount: number) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date' | 'time' | 'status'>) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ 
  children, 
  initialBalance = 9500.00 
}: { 
  children: ReactNode; 
  initialBalance?: number;
}) {
  const [balance, setBalance] = useState(initialBalance);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const deductBalance = useCallback((amount: number) => {
    setBalance((prev) => Math.max(0, prev - amount));
  }, []);

  const addTransaction = useCallback((txData: Omit<Transaction, 'id' | 'date' | 'time' | 'status'>) => {
    const now = new Date();
    const newTransaction: Transaction = {
      ...txData,
      id: Date.now().toString(),
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      status: 'Completed',
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  }, []);

  return (
    <WalletContext.Provider value={{ balance, transactions, deductBalance, addTransaction }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
