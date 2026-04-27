import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/session';
import { getRestaurant, setRestaurant } from '@/lib/redis';
import { attachPayerBankAccount } from '@/lib/root-api';

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      accountNumber,
      routingNumber,
      accountHolderName,
      accountType,
      restaurantId,
    } = body;

    // Verify the restaurant belongs to this user
    if (restaurantId !== session.restaurantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get the restaurant to get Root customer ID
    const restaurant = await getRestaurant(restaurantId);

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    // Attach the bank account to the payer via Root API
    const bankAccount = await attachPayerBankAccount(restaurant.rootCustomerId, {
      accountNumber,
      routingNumber,
      accountHolderName,
    });

    console.log('[v0] Bank account linked:', bankAccount.id);

    // Update restaurant record with bank account token
    const updatedRestaurant = {
      ...restaurant,
      bankAccountToken: bankAccount.id,
      updatedAt: Date.now(),
    };

    await setRestaurant(restaurantId, updatedRestaurant);

    return NextResponse.json(
      {
        success: true,
        bankAccountId: bankAccount.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Bank account linking error:', error);
    const message = error instanceof Error ? error.message : 'Failed to link bank account';
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
