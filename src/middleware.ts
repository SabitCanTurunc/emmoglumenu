import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('admin_session');
  const isAuthenticated = authCookie && authCookie.value === 'authenticated';
  const pathname = request.nextUrl.pathname;

  // We let /admin routes pass through to be handled by the AdminLayout
  // Protect mutating API routes
  if ((pathname.startsWith('/api/menu') && request.method !== 'GET') || pathname.startsWith('/api/upload')) {
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/menu', '/api/upload'],
};
