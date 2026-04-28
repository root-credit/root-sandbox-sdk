'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const workerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  paymentMethodType: z.enum(['bank_account', 'debit_card']),
  // Bank account fields
  accountNumber: z.string().optional(),
  routingNumber: z.string().optional(),
  accountType: z.enum(['checking', 'savings']).optional(),
  // Debit card fields
  cardNumber: z.string().optional(),
  expiryMonth: z.number().optional(),
  expiryYear: z.number().optional(),
  cvv: z.string().optional(),
  cardholderName: z.string().optional(),
}).refine((data) => {
  if (data.paymentMethodType === 'bank_account') {
    return data.accountNumber && data.routingNumber;
  }
  if (data.paymentMethodType === 'debit_card') {
    return data.cardNumber && data.expiryMonth && data.expiryYear && data.cvv && data.cardholderName;
  }
  return false;
}, {
  message: 'Required payment method fields are missing',
});

type WorkerFormData = z.infer<typeof workerSchema>;

interface WorkerFormProps {
  restaurantId: string;
  onSuccess?: () => void;
}

export function WorkerForm({ restaurantId, onSuccess }: WorkerFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paymentType, setPaymentType] = useState<'bank_account' | 'debit_card'>('bank_account');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<WorkerFormData>({
    resolver: zodResolver(workerSchema),
    defaultValues: {
      paymentMethodType: 'bank_account',
      accountType: 'checking',
    },
  });

  const currentPaymentType = watch('paymentMethodType');

  async function onSubmit(data: WorkerFormData) {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          restaurantId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add worker');
      }

      setSuccess('Worker added successfully!');
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

      {/* Worker Info */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Worker Information</h3>

        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Full Name
          </label>
          <input
            {...register('name')}
            type="text"
            id="name"
            placeholder="John Doe"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email Address
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            placeholder="john@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-2">
            Phone Number
          </label>
          <input
            {...register('phone')}
            type="tel"
            id="phone"
            placeholder="(555) 123-4567"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.phone && (
            <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Payment Method</h3>

        <div className="flex gap-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              value="bank_account"
              {...register('paymentMethodType')}
              className="w-4 h-4"
            />
            <span className="ml-2">Bank Account</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              value="debit_card"
              {...register('paymentMethodType')}
              className="w-4 h-4"
            />
            <span className="ml-2">Debit Card</span>
          </label>
        </div>
      </div>

      {/* Bank Account Fields */}
      {currentPaymentType === 'bank_account' && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium">Bank Account Details</h4>

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
        </div>
      )}

      {/* Debit Card Fields */}
      {currentPaymentType === 'debit_card' && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium">Debit Card Details</h4>

          <div>
            <label htmlFor="cardholderName" className="block text-sm font-medium mb-2">
              Cardholder Name
            </label>
            <input
              {...register('cardholderName')}
              type="text"
              id="cardholderName"
              placeholder="John Doe"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.cardholderName && (
              <p className="text-red-600 text-sm mt-1">{errors.cardholderName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="cardNumber" className="block text-sm font-medium mb-2">
              Card Number
            </label>
            <input
              {...register('cardNumber')}
              type="password"
              id="cardNumber"
              placeholder="••••••••••••••••"
              maxLength={16}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.cardNumber && (
              <p className="text-red-600 text-sm mt-1">{errors.cardNumber.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="expiryMonth" className="block text-sm font-medium mb-2">
                Expiry Month
              </label>
              <input
                {...register('expiryMonth', { valueAsNumber: true })}
                type="number"
                id="expiryMonth"
                placeholder="MM"
                min={1}
                max={12}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.expiryMonth && (
                <p className="text-red-600 text-sm mt-1">{errors.expiryMonth.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="expiryYear" className="block text-sm font-medium mb-2">
                Expiry Year
              </label>
              <input
                {...register('expiryYear', { valueAsNumber: true })}
                type="number"
                id="expiryYear"
                placeholder="YYYY"
                min={new Date().getFullYear()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.expiryYear && (
                <p className="text-red-600 text-sm mt-1">{errors.expiryYear.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="cvv" className="block text-sm font-medium mb-2">
                CVV
              </label>
              <input
                {...register('cvv')}
                type="password"
                id="cvv"
                placeholder="•••"
                maxLength={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.cvv && (
                <p className="text-red-600 text-sm mt-1">{errors.cvv.message}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Adding Worker...' : 'Add Worker'}
      </button>
    </form>
  );
}
