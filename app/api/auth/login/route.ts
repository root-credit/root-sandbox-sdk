import { NextRequest, NextResponse } from 'next/server';
import { generateSessionToken, validateEmail } from '@/lib/auth';
import { setSession, getPayerByEmail } from '@/lib/redis';
import { verifySharedAppPassword } from '@/lib/app-settings';
import {
  HARDCODED_ADMIN_EMAIL,
  verifyAdminCredentials,
  createAdminSessionToken,
  ADMIN_SESSION_TTL_SEC,
} from '@/lib/admin-session';

/**
 * Operator login.
 *
 * Special-case: the hardcoded admin email (admin@root.credit) is recognised here so
 * the admin can sign in from this single login screen without ever touching Redis.
 * Real payer users go through the shared-password gate and a Redis payer lookup.
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

    // Hardcoded admin path — fully bypasses Redis.
    if (trimmedEmail.toLowerCase() === HARDCODED_ADMIN_EMAIL.toLowerCase()) {
      if (!verifyAdminCredentials(trimmedEmail, password)) {
        return NextResponse.json(
          { error: 'Invalid admin credentials' },
          { status: 401 }
        );
      }
      const token = createAdminSessionToken();
      const res = NextResponse.json({
        ok: true,
        isAdmin: true,
        redirectTo: '/admin',
      });
      res.cookies.set('admin_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: ADMIN_SESSION_TTL_SEC,
      });
      return res;
    }

    const passwordOk = await verifySharedAppPassword(password);
    if (!passwordOk) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    const payer = await getPayerByEmail(trimmedEmail);
    if (!payer) {
      return NextResponse.json(
        {
          error:
            'No account exists for this email. Sign up first, then sign in with the same email and password.',
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
