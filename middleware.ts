import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all control-room routes with server-side RBAC verification
  if (pathname.startsWith('/control-room')) {
    const roleCookie = request.cookies.get('pulse_user_role');
    const role = roleCookie?.value;

    // If role is 'fan' (or if no role cookie / non-ops/security role), redirect to login with unauthorized error
    if (role === 'fan') {
      return NextResponse.redirect(new URL('/login?error=unauthorized_access', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/control-room/:path*'],
};
