import { NextRequest, NextResponse } from 'next/server';
import { generateSessionToken, validateEmail } from '@/lib/auth';
import { setSession, getPayerByEmail } from '@/lib/redis';
import { HARDCODED_ADMIN_EMAIL } from '@/lib/admin-session';

/**
 * Operator login (email only — sandbox demo).
 * Admin accounts use `/api/admin/login` from `/admin`.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

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

    if (trimmedEmail.toLowerCase() === HARDCODED_ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json(
        {
          error:
            'Admin accounts sign in from /admin with separate credentials.',
          code: 'ADMIN_USE_ADMIN_ROUTE',
        },
        { status: 403 }
      );
    }

    const payer = await getPayerByEmail(trimmedEmail);
    if (!payer) {
      return NextResponse.json(
        {
          error:
            'No account exists for this email. Sign up first with this email.',
          code: 'PAYER_ACCOUNT_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    console.log('[v0] Login successful for:', trimmedEmail);

    const sessionToken = generateSessionToken();

    await setSession(sessionToken, {
      payerEmail: payer.payerEmail,
      payerId: payer.id,
    });

    return NextResponse.json(
      {
        sessionToken,
        payerId: payer.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Login error:', error);
    const message = error instanceof Error ? error.message : 'Login failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
