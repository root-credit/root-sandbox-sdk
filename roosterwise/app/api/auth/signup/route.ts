import { NextRequest, NextResponse } from 'next/server';
import { registerRestaurant, generateSessionToken } from '@/lib/auth';
import { setSession } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { email, restaurantName, phone } = body;

    if (!email || !restaurantName || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Register the restaurant
    const { restaurantId, rootCustomerId } = await registerRestaurant({
      email,
      restaurantName,
      phone,
    });

    console.log("[v0] Registered restaurant:", restaurantId);

    // Generate session token
    const sessionToken = generateSessionToken();

    // Store session
    await setSession(sessionToken, {
      adminEmail: email,
      restaurantId,
    });

    return NextResponse.json(
      {
        sessionToken,
        restaurantId,
        rootCustomerId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Signup error:', error);
    const message = error instanceof Error ? error.message : 'Signup failed';
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
