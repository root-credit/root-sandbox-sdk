'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Transaction {
  id: string;
  date: string;
  time: string;
  recipientName: string;
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
  executeTransfer: (tx: Omit<Transaction, 'id' | 'date' | 'time' | 'status'>) => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ 
  children, 
  initialBalance = 9500.00 
}: { 
  children: ReactNode; 
  initialBalance?: number;
}) {
  const [balance, setBalance] = useState(initialBalance);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const executeTransfer = useCallback((tx: Omit<Transaction, 'id' | 'date' | 'time' | 'status'>) => {
    const totalDeducted = tx.sentAmount + tx.fee;
    if (totalDeducted > balance) return; // insufficient funds guard

    setBalance((prev) => prev - totalDeducted);
    setTransactions((prev) => [
      {
        ...tx,
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: 'Completed',
      },
      ...prev,
    ]);
  }, [balance]);

  return (
    <WalletContext.Provider value={{ balance, transactions, executeTransfer }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
