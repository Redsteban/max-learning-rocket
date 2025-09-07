import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Get the pathname
  const pathname = request.nextUrl.pathname;
  
  // Public routes that don't need authentication
  const publicRoutes = [
    '/',
    '/register',
    '/setup',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/setup',
    '/api/chat',
    '/api/knowledge',
    '/api/progress',
    '/api/claude-chat'
  ];
  
  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  );
  
  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // For protected routes, we'll let the client-side handle authentication
  // since we're using localStorage for authentication
  return NextResponse.next();
}

// Apply middleware to all routes except static files
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /_next/static (static files)
     * - /_next/image (image optimization files)
     * - /favicon.ico (favicon file)
     * - /public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};