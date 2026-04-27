'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  restaurantName: z.string().min(2, 'Restaurant name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
});

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  async function onSubmit(data: SignupFormData) {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Signup failed');
      }

      const { sessionToken, restaurantId } = await response.json();

      // Store session in cookie
      document.cookie = `session=${sessionToken}; path=/; max-age=86400; SameSite=Strict`;
      
      // Redirect to dashboard
      router.push('/dashboard');
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

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email Address
        </label>
        <input
          {...register('email')}
          type="email"
          id="email"
          placeholder="admin@restaurant.com"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.email && (
          <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="restaurantName" className="block text-sm font-medium mb-2">
          Restaurant Name
        </label>
        <input
          {...register('restaurantName')}
          type="text"
          id="restaurantName"
          placeholder="My Restaurant"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.restaurantName && (
          <p className="text-red-600 text-sm mt-1">{errors.restaurantName.message}</p>
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

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Creating account...' : 'Create Account'}
      </button>
    </form>
  );
}
