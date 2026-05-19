import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const AUTH_COOKIE = 'vaultmail_auth';

export async function POST(req: Request) {
  const authUsername = process.env.AUTH_USERNAME;
  const authPassword = process.env.AUTH_PASSWORD;

  if (!authUsername || !authPassword) {
    return NextResponse.json(
      { error: 'Authentication is not configured.' },
      { status: 500 }
    );
  }

  const body = (await req.json()) as { username?: string; password?: string };
  const username = body?.username?.trim();
  const password = body?.password;

  if (!username || !password) {
    return NextResponse.json(
      { error: 'Username and password are required.' },
      { status: 400 }
    );
  }

  if (username !== authUsername || password !== authPassword) {
    return NextResponse.json(
      { error: 'Invalid username or password.' },
      { status: 401 }
    );
  }

  const token = Buffer.from(`${authUsername}:${authPassword}`).toString('base64');

  const cookieStore = await cookies();
  const forwardedProto = req.headers.get('x-forwarded-proto');
  const isHttps =
    forwardedProto === 'https' || new URL(req.url).protocol === 'https:';

  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isHttps,
    maxAge: 60 * 60 * 24 * 7,
    path: '/'
  });

  return NextResponse.json({ success: true });
}
