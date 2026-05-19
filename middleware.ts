import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE = 'vaultmail_auth';

const isAuthEnabled = () => {
  return Boolean(process.env.AUTH_USERNAME && process.env.AUTH_PASSWORD);
};

const publicPaths = ['/login', '/api/auth/login', '/api/webhook', '/favicon.ico'];

const isPublicPath = (pathname: string) => {
  return publicPaths.some((path) => pathname.startsWith(path));
};

export function middleware(request: NextRequest) {
  if (!isAuthEnabled()) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get(AUTH_COOKIE)?.value;
  const expectedToken = Buffer.from(
    `${process.env.AUTH_USERNAME}:${process.env.AUTH_PASSWORD}`
  )
    .toString('base64');

  if (authCookie === expectedToken) {
    return NextResponse.next();
  }

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('from', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|css|js)).*)']
};
