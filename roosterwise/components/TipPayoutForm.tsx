'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const tipPayoutSchema = z.object({
  tips: z.array(
    z.object({
      workerId: z.string(),
      amount: z.number().min(0.01, 'Amount must be greater than 0'),
    })
  ).min(1, 'At least one worker must have a tip amount'),
});

type TipPayoutFormData = z.infer<typeof tipPayoutSchema>;

interface Worker {
  id: string;
  name: string;
}

interface TipPayoutFormProps {
  restaurantId: string;
  workers: Worker[];
  onSuccess?: () => void;
}

export function TipPayoutForm({ restaurantId, workers, onSuccess }: TipPayoutFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [tipAmounts, setTipAmounts] = useState<Record<string, number>>({});

  const {
    handleSubmit,
    formState: { errors },
  } = useForm<TipPayoutFormData>({
    resolver: zodResolver(tipPayoutSchema),
  });

  const handleTipAmountChange = (workerId: string, amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    const newAmounts = { ...tipAmounts, [workerId]: numAmount };
    setTipAmounts(newAmounts);

    const total = Object.values(newAmounts).reduce((sum, val) => sum + val, 0);
    setTotalAmount(total);
  };

  async function onSubmit() {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const tips = workers
        .map(worker => ({
          workerId: worker.id,
          amount: tipAmounts[worker.id] || 0,
        }))
        .filter(tip => tip.amount > 0);

      if (tips.length === 0) {
        throw new Error('Please enter at least one tip amount');
      }

      const response = await fetch('/api/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          tips,
          totalAmount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process payouts');
      }

      const result = await response.json();
      setSuccess(`Successfully paid out $${(totalAmount / 100).toFixed(2)} to ${tips.length} worker(s)!`);
      setTipAmounts({});
      setTotalAmount(0);

      if (onSuccess) {
        setTimeout(onSuccess, 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  if (workers.length === 0) {
    return (
      <div className="p-8 bg-blue-50 border border-blue-200 rounded-lg text-center text-blue-900">
        <p>No workers added yet. Please add workers before processing payouts.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {success}
        </div>
      )}

      {/* Workers Tip Input */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Enter End-of-Day Tips</h3>
        <p className="text-gray-600 text-sm">
          Enter the tip amount for each worker. Leave blank for no tip.
        </p>

        <div className="space-y-3">
          {workers.map(worker => (
            <div key={worker.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex-1">
                <p className="font-medium">{worker.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={tipAmounts[worker.id] || ''}
                  onChange={(e) => handleTipAmountChange(worker.id, e.target.value)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total Amount */}
      <div className="p-6 bg-primary-light bg-opacity-10 border-2 border-primary rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">Total Payout:</span>
          <span className="text-3xl font-bold text-primary">
            ${(totalAmount / 100).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || totalAmount === 0}
        className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
      >
        {isLoading ? 'Processing Payouts...' : '🚀 Process Payouts Now'}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Tips will be processed immediately via Root&apos;s payment infrastructure
      </p>
    </form>
  );
}
