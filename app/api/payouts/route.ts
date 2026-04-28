import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import {
  getRestaurant,
  getWorker,
  setTransaction,
  getRestaurantTransactions,
  getSession,
} from '@/lib/redis';
import { createTipPayout } from '@/lib/root-api';

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
    const { restaurantId, tips, totalAmount } = body;

    // Validate restaurant ID from body
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

    if (!Array.isArray(tips) || tips.length === 0) {
      return NextResponse.json(
        { error: 'Missing or empty tips array' },
        { status: 400 }
      );
    }

    const restaurant = await getRestaurant(restaurantId);
    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    // Process each tip payout
    const results = [];
    const transactionIds = [];

    for (const tip of tips) {
      try {
        const worker = await getWorker(tip.workerId);
        if (!worker) {
          console.error(`[v0] Worker not found: ${tip.workerId}`);
          continue;
        }

        // Convert amount to cents
        const amountCents = Math.round(tip.amount * 100);

        // Process payout via Root API using the correct signature
        const payout = await createTipPayout(
          worker.rootPayeeId,
          amountCents,
          'instant_card' // Use instant_card for faster settlements
        );

        console.log('[v0] Payout processed:', payout.id);

        // Save transaction
        const transactionId = randomUUID();
        await setTransaction(transactionId, {
          id: transactionId,
          restaurantId,
          workerId: worker.id,
          workerName: worker.name,
          workerEmail: worker.email,
          amountCents,
          amount: tip.amount,
          status: payout.status || 'completed',
          rootPayoutId: payout.id,
          rootTransactionId: payout.id,
          createdAt: Date.now(),
          completedAt: Date.now(),
        });

        transactionIds.push(transactionId);

        results.push({
          workerId: worker.id,
          workerName: worker.name,
          amount: tip.amount,
          status: 'success',
          payoutId: payout.id,
          transactionId,
        });
      } catch (err) {
        console.error('[v0] Error processing payout for worker:', err);
        results.push({
          workerId: tip.workerId,
          amount: tip.amount,
          status: 'failed',
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        totalAmount,
        payoutCount: tips.length,
        results,
        transactionIds,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Payouts error:', error);
    const message = error instanceof Error ? error.message : 'Failed to process payouts';
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}

// Get transaction history
export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const sessionMatch = cookieHeader.match(/session=([^;]+)/);
    
    if (!sessionMatch) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const restaurantId = request.nextUrl.searchParams.get('restaurantId');

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

    const transactions = await getRestaurantTransactions(restaurantId);

    return NextResponse.json(
      { transactions },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Get transactions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
