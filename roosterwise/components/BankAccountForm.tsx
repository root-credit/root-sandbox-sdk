'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const bankAccountSchema = z.object({
  accountNumber: z.string().min(8, 'Account number must be at least 8 digits'),
  routingNumber: z.string().regex(/^\d{9}$/, 'Routing number must be 9 digits'),
  accountHolderName: z.string().min(2, 'Account holder name is required'),
  accountType: z.enum(['checking', 'savings']),
});

type BankAccountFormData = z.infer<typeof bankAccountSchema>;

interface BankAccountFormProps {
  restaurantId: string;
  onSuccess?: () => void;
}

export function BankAccountForm({ restaurantId, onSuccess }: BankAccountFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BankAccountFormData>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      accountType: 'checking',
    },
  });

  async function onSubmit(data: BankAccountFormData) {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/restaurant/bank-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          restaurantId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to link bank account');
      }

      setSuccess('Bank account linked successfully!');
      reset();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
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

      <div>
        <label htmlFor="accountHolderName" className="block text-sm font-medium mb-2">
          Account Holder Name
        </label>
        <input
          {...register('accountHolderName')}
          type="text"
          id="accountHolderName"
          placeholder="Restaurant Name"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.accountHolderName && (
          <p className="text-red-600 text-sm mt-1">{errors.accountHolderName.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="routingNumber" className="block text-sm font-medium mb-2">
            Routing Number
          </label>
          <input
            {...register('routingNumber')}
            type="text"
            id="routingNumber"
            placeholder="123456789"
            maxLength={9}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.routingNumber && (
            <p className="text-red-600 text-sm mt-1">{errors.routingNumber.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="accountNumber" className="block text-sm font-medium mb-2">
            Account Number
          </label>
          <input
            {...register('accountNumber')}
            type="password"
            id="accountNumber"
            placeholder="••••••••"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.accountNumber && (
            <p className="text-red-600 text-sm mt-1">{errors.accountNumber.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="accountType" className="block text-sm font-medium mb-2">
          Account Type
        </label>
        <select
          {...register('accountType')}
          id="accountType"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="checking">Checking</option>
          <option value="savings">Savings</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Linking Account...' : 'Link Bank Account'}
      </button>
    </form>
  );
}
