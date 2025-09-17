import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = ['/home', '/brands', '/cart', '/categories', '/allorders', '/wishlist', '/user'];
const publicRoutes = ['/login', '/signup', '/'];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);
  // const token = req.headers.get('authorization')?.replace('Bearer', '') || null;
  const localToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  // Check for token in headers (if passed from client)

  if (isProtectedRoute && !localToken) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  if (isPublicRoute && localToken) {
    return NextResponse.redirect(new URL('/home', req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
