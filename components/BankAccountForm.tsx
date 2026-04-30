'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { branding } from '@/lib/branding';
import { useLinkBank } from '@/lib/hooks/usePayer';
import { linkBankInputSchema, type LinkBankInput } from '@/lib/types/payer';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BankAccountFormProps {
  payerId: string;
  onSuccess?: () => void;
}

export function BankAccountForm({ payerId, onSuccess }: BankAccountFormProps) {
  const router = useRouter();
  const [linked, setLinked] = useState(false);
  const { linkBank, isSubmitting } = useLinkBank();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LinkBankInput>({
    resolver: zodResolver(linkBankInputSchema),
    defaultValues: { accountType: 'checking' },
  });

  async function onSubmit(data: LinkBankInput) {
    try {
      await linkBank(payerId, data);
      toast.success('Bank account linked successfully');
      setLinked(true);
      reset();
      router.refresh();
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    }
  }

  if (linked) {
    return (
      <div className="flex items-center gap-2 rounded-md border bg-green-50 px-4 py-3 text-sm text-green-700">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Bank account linked successfully.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="accountHolderName">Account holder name</Label>
        <Input
          {...register('accountHolderName')}
          type="text"
          id="accountHolderName"
          placeholder={`${branding.payerSingular} name`}
        />
        {errors.accountHolderName && (
          <p className="text-xs text-destructive">{errors.accountHolderName.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="routingNumber">Routing number</Label>
          <Input
            {...register('routingNumber')}
            type="text"
            id="routingNumber"
            placeholder="123456789"
            maxLength={9}
            className="font-mono"
          />
          {errors.routingNumber && (
            <p className="text-xs text-destructive">{errors.routingNumber.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="accountNumber">Account number</Label>
          <Input
            {...register('accountNumber')}
            type="password"
            id="accountNumber"
            placeholder="••••••••"
            className="font-mono"
          />
          {errors.accountNumber && (
            <p className="text-xs text-destructive">{errors.accountNumber.message}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="accountType">Account type</Label>
        <select
          {...register('accountType')}
          id="accountType"
          className={cn(
            'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          )}
        >
          <option value="checking">Checking</option>
          <option value="savings">Savings</option>
        </select>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Linking account…
          </>
        ) : (
          'Link bank account'
        )}
      </Button>
    </form>
  );
}
