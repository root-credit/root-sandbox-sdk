import { NextRequest, NextResponse } from 'next/server';
import { generateSessionToken, validateEmail } from '@/lib/auth';
import { setSession, getRestaurantByEmail } from '@/lib/redis';
import { verifySharedAppPassword } from '@/lib/app-settings';

/**
 * Restaurant login: email must match a restaurant created via Sign up (stored in Redis).
 * The shared app password only restricts who can use this demo; identity is the restaurant email.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim();

    if (!validateEmail(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { error: 'Password is required (min 8 characters)' },
        { status: 400 }
      );
    }

    const passwordOk = await verifySharedAppPassword(password);
    if (!passwordOk) {
      return NextResponse.json(
        { error: 'Invalid app password' },
        { status: 401 }
      );
    }

    const restaurant = await getRestaurantByEmail(trimmedEmail);
    if (!restaurant) {
      return NextResponse.json(
        {
          error:
            'No restaurant account exists for this email. Sign up first, then sign in with the same email and shared app password.',
          code: 'RESTAURANT_ACCOUNT_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    console.log('[v0] Login successful for:', trimmedEmail);

    const sessionToken = generateSessionToken();

    await setSession(sessionToken, {
      adminEmail: restaurant.adminEmail,
      restaurantId: restaurant.id,
    });

    return NextResponse.json(
      {
        sessionToken,
        restaurantId: restaurant.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Login error:', error);
    const message = error instanceof Error ? error.message : 'Login failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
