'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const { sessionToken } = await response.json();

      document.cookie = `session=${sessionToken}; path=/; max-age=86400; SameSite=Strict`;

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="p-4 bg-error bg-opacity-5 border border-error border-opacity-20 rounded-lg text-error text-sm font-medium">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
          Email Address
        </label>
        <input
          {...register('email')}
          type="email"
          id="email"
          placeholder="admin@restaurant.com"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 focus:border-transparent transition-smooth text-foreground placeholder-gray-500"
        />
        {errors.email && (
          <p className="text-error text-sm mt-1.5 font-medium">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-foreground mb-2">
          App password
        </label>
        <input
          {...register('password')}
          type="password"
          id="password"
          autoComplete="current-password"
          placeholder="Shared demo password"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 focus:border-transparent transition-smooth text-foreground placeholder-gray-500"
        />
        {errors.password && (
          <p className="text-error text-sm mt-1.5 font-medium">{errors.password.message}</p>
        )}
        <p className="text-xs text-gray-500 mt-2">
          Same shared password for every restaurant in this demo (default{' '}
          <code className="bg-gray-100 px-1 rounded">1234567890</code> until changed in admin).
        </p>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-smooth disabled:opacity-50 disabled:cursor-not-allowed shadow-sm-custom hover:shadow-md-custom"
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
