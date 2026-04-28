import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import {
  setWorker,
  getRestaurantWorkers,
  getRestaurant,
  getSession,
} from '@/lib/redis';
import { createRootPayee, attachPayeeBankAccount, attachPayeeDebitCard } from '@/lib/root-api';

export async function GET(request: NextRequest) {
  try {
    const restaurantId = request.nextUrl.searchParams.get('restaurantId');

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Missing restaurantId' },
        { status: 400 }
      );
    }

    const cookieHeader = request.headers.get('cookie') || '';
    const sessionMatch = cookieHeader.match(/session=([^;]+)/);

    if (!sessionMatch) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const session = await getSession(sessionMatch[1].trim());
    if (!session || session.restaurantId !== restaurantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const workers = await getRestaurantWorkers(restaurantId);

    return NextResponse.json(
      { workers },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Get workers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const sessionMatch = cookieHeader.match(/session=([^;]+)/);

    if (!sessionMatch) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      email,
      phone,
      paymentMethodType,
      restaurantId,
      // Bank account fields
      accountNumber,
      routingNumber,
      // Card fields
      cardNumber,
      expiryMonth,
      expiryYear,
      cardholderName,
    } = body;

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Missing restaurantId' },
        { status: 400 }
      );
    }

    const session = await getSession(sessionMatch[1].trim());
    if (!session || session.restaurantId !== restaurantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const restaurant = await getRestaurant(restaurantId);
    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    // Create worker payee in Root
    const workerPayee = await createRootPayee({
      email,
      name,
      phone,
    });
    const workerRootId = workerPayee.id;

    // Attach payment method
    let paymentMethodId: string;

    if (paymentMethodType === 'bank_account') {
      const bankResult = await attachPayeeBankAccount(workerRootId, {
        accountNumber,
        routingNumber,
      });
      paymentMethodId = bankResult.id || workerRootId;
    } else {
      const cardResult = await attachPayeeDebitCard(workerRootId, {
        cardNumber,
        expiryMonth,
        expiryYear,
        // cardholderName is not accepted by the Root push-to-card API
      });
      paymentMethodId = cardResult.id || workerRootId;
    }

    console.log('[v0] Created payment method:', paymentMethodId);

    // Save worker to Redis
    const workerId = randomUUID();
    await setWorker(workerId, {
      id: workerId,
      restaurantId,
      name,
      email,
      phone,
      paymentMethodId,
      paymentMethodType,
      rootPayeeId: workerRootId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return NextResponse.json(
      {
        success: true,
        workerId,
        paymentMethodId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Add worker error:', error);
    const message = error instanceof Error ? error.message : 'Failed to add worker';
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
