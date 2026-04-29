import { NextRequest, NextResponse } from 'next/server';
import { registerPayer, generateSessionToken } from '@/lib/auth';
import { setSession } from '@/lib/redis';
import { verifySharedAppPassword } from '@/lib/app-settings';
import { HARDCODED_ADMIN_EMAIL } from '@/lib/admin-session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { email, payerName, phone, password } = body;

    if (!email || !payerName || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (
      typeof email === 'string' &&
      email.trim().toLowerCase() === HARDCODED_ADMIN_EMAIL.toLowerCase()
    ) {
      return NextResponse.json(
        {
          error:
            'This email is reserved for the admin console. Use a different email to create a payer account.',
        },
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

    const { payerId, rootPayerId } = await registerPayer({
      email,
      payerName,
      phone,
    });

    console.log('[v0] Registered payer:', payerId);

    const sessionToken = generateSessionToken();

    await setSession(sessionToken, {
      payerEmail: email,
      payerId,
    });

    return NextResponse.json(
      {
        sessionToken,
        payerId,
        rootPayerId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Signup error:', error);
    const message = error instanceof Error ? error.message : 'Signup failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
