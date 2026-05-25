'use client';

import { useState } from 'react';
import { branding } from '@/lib/branding';
import { ChevronDown, Check } from 'lucide-react';

const CURRENCIES = [
  { code: 'USD', flag: '🇺🇸', rate: 1.00, fee: 0, deliveryTime: 'Transfers in seconds' },
  { code: 'EUR', flag: '🇪🇺', rate: 0.92, fee: 7.48, deliveryTime: 'Should arrive in seconds' },
  { code: 'INR', flag: '🇮🇳', rate: 83.42, fee: 7.48, deliveryTime: 'Should arrive in seconds' },
  { code: 'GBP', flag: '🇬🇧', rate: 0.79, fee: 7.48, deliveryTime: 'Should arrive in seconds' },
];

interface TransferCalculatorProps {
  onTransferComplete?: (transaction: {
    fromCurrency: string;
    toCurrency: string;
    sentAmount: number;
    receivedAmount: number;
    exchangeRate: number;
    fee: number;
  }) => void;
}

export function TransferCalculator({ onTransferComplete }: TransferCalculatorProps) {
  const [amount, setAmount] = useState('1,000.00');
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Parse amount
  const numericAmount = parseFloat(amount.replace(/,/g, '')) || 0;
  const fee = selectedCurrency.fee;
  const sendAmount = numericAmount - fee;
  const receiveAmount = sendAmount > 0 ? (sendAmount * selectedCurrency.rate).toFixed(2) : '0.00';

  function formatAmount(value: string) {
    // Remove non-numeric characters except decimal
    const cleaned = value.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    const intPart = parts[0] || '';
    const decPart = parts[1] !== undefined ? '.' + parts[1].slice(0, 2) : '';
    
    // Add thousand separators
    const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return formatted + decPart;
  }

  function handleSend() {
    if (numericAmount <= fee) return;
    
    // Call the callback with transaction details
    if (onTransferComplete) {
      onTransferComplete({
        fromCurrency: 'USD',
        toCurrency: selectedCurrency.code,
        sentAmount: numericAmount,
        receivedAmount: parseFloat(receiveAmount),
        exchangeRate: selectedCurrency.rate,
        fee: fee,
      });
    }
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  }

  if (showSuccess) {
    return (
      <div className="rounded-lg border border-border bg-background p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Transfer initiated
          </h2>
          <p className="text-muted-foreground">
            {parseFloat(receiveAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {selectedCurrency.code} is on its way
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-background p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6">
        {branding.payoutVerb} money abroad
      </h2>

      {/* You send input */}
      <div className="mb-4">
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          You send
        </label>
        <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-background">
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(formatAmount(e.target.value))}
            className="flex-1 text-2xl font-bold text-foreground bg-transparent outline-none tabular-nums"
          />
          <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#F4F4F4]">
            <span className="text-lg">🇺🇸</span>
            <span className="text-sm font-semibold text-foreground">USD</span>
          </div>
        </div>
      </div>

      {/* Fee and rate breakdown */}
      <div className="flex flex-col gap-2 py-4 px-4 mb-4 text-sm text-muted-foreground border-l-2 border-border ml-4">
        <div className="flex justify-between">
          <span>Fee</span>
          <span className="font-medium text-foreground">
            {fee === 0 ? 'Free' : `- ${fee.toFixed(2)} USD`}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Exchange rate</span>
          <span className="font-medium text-foreground">
            {selectedCurrency.code === 'USD' 
              ? '1:1 (same currency)' 
              : `1 USD = ${selectedCurrency.rate} ${selectedCurrency.code}`}
          </span>
        </div>
      </div>

      {/* Recipient gets input - TEAL background with dark text for accessibility */}
      <div className="mb-6">
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          Recipient gets
        </label>
        <div 
          className="flex items-center gap-3 p-4 rounded-lg"
          style={{ backgroundColor: '#00D9C6' }}
        >
          <div 
            className="flex-1 text-2xl font-bold tabular-nums"
            style={{ color: '#003D36' }}
          >
            {parseFloat(receiveAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              className="flex items-center gap-2 px-3 py-2 rounded-full transition-colors"
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.25)',
                color: '#003D36'
              }}
            >
              <span className="text-lg">{selectedCurrency.flag}</span>
              <span className="text-sm font-semibold">{selectedCurrency.code}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            {showCurrencyDropdown && (
              <div className="absolute right-0 top-full mt-2 bg-background border border-border rounded-lg shadow-lg py-1 min-w-[140px] z-10">
                {CURRENCIES.map((currency) => (
                  <button
                    key={currency.code}
                    type="button"
                    onClick={() => {
                      setSelectedCurrency(currency);
                      setShowCurrencyDropdown(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-[#F4F4F4] ${
                      selectedCurrency.code === currency.code ? 'bg-[#F4F4F4] font-semibold' : ''
                    }`}
                  >
                    <span className="text-lg">{currency.flag}</span>
                    <span>{currency.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delivery estimate */}
      <p className="text-sm text-muted-foreground mb-6">
        {selectedCurrency.deliveryTime}
      </p>

      {/* Send button */}
      <button
        type="button"
        onClick={handleSend}
        disabled={numericAmount <= fee}
        className="w-full py-3.5 px-6 bg-primary text-primary-foreground text-base font-semibold rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {branding.payoutVerb}
      </button>
    </div>
  );
}
