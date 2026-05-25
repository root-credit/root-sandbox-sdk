'use client';

import { useState } from 'react';
import { branding } from '@/lib/branding';
import { ChevronDown } from 'lucide-react';

const CURRENCIES = [
  { code: 'EUR', flag: '🇪🇺', rate: 0.9185 },
  { code: 'INR', flag: '🇮🇳', rate: 83.42 },
  { code: 'MXN', flag: '🇲🇽', rate: 17.24 },
  { code: 'GBP', flag: '🇬🇧', rate: 0.79 },
];

export function TransferCalculator() {
  const [amount, setAmount] = useState('1,000.00');
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  // Parse amount
  const numericAmount = parseFloat(amount.replace(/,/g, '')) || 0;
  const fee = 7.48;
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
          <span className="font-medium text-foreground">- {fee.toFixed(2)} USD</span>
        </div>
        <div className="flex justify-between">
          <span>Exchange rate</span>
          <span className="font-medium text-foreground">
            1 USD = {selectedCurrency.rate} {selectedCurrency.code}
          </span>
        </div>
      </div>

      {/* Recipient gets input - TEAL background */}
      <div className="mb-6">
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          Recipient gets
        </label>
        <div 
          className="flex items-center gap-3 p-4 rounded-lg"
          style={{ backgroundColor: '#00D9C6' }}
        >
          <div className="flex-1 text-2xl font-bold text-white tabular-nums">
            {parseFloat(receiveAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
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
        Should arrive in <span className="font-medium text-foreground">seconds</span>
      </p>

      {/* Send button */}
      <button
        type="button"
        className="w-full py-3.5 px-6 bg-primary text-primary-foreground text-base font-semibold rounded-full hover:bg-primary/90 transition-colors"
      >
        {branding.payoutVerb}
      </button>
    </div>
  );
}
