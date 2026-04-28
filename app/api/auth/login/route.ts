import { NextRequest, NextResponse } from 'next/server';
import { loginRestaurant, generateSessionToken } from '@/lib/auth';
import { setSession } from '@/lib/redis';
import { verifySharedAppPassword } from '@/lib/app-settings';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
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
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Login the restaurant
    const restaurant = await loginRestaurant(email);

    console.log("[v0] Login successful for:", email);

    // Generate session token
    const sessionToken = generateSessionToken();

    // Store session
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
    return NextResponse.json(
      { error: message },
      { status: 401 }
    );
  }
}
