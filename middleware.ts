import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all control-room routes with server-side RBAC verification
  if (pathname.startsWith('/control-room')) {
    const roleCookie = request.cookies.get('pulse_user_role');
    const role = roleCookie?.value;

    // Default behavior: block unless a valid staff session cookie ('ops' or 'security') is explicitly present
    if (!role || (role !== 'ops' && role !== 'security')) {
      return NextResponse.redirect(new URL('/login?error=unauthorized_access', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/control-room/:path*'],
};
