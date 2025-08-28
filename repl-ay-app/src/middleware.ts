import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

// Use the same secret as in AuthUtils but make it compatible with Edge Runtime
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect API routes that require authentication
  const protectedApiRoutes = [
    '/api/auth/onboarding',
    '/api/auth/verify',
    '/api/chat',
    '/api/user',
    // Add more protected routes as needed
  ]

  // Check if the request is for a protected API route
  const isProtectedApiRoute = protectedApiRoutes.some(route => 
    pathname.startsWith(route)
  )

  if (isProtectedApiRoute) {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    try {
      // Use jose library for Edge Runtime compatible JWT verification
      const { payload } = await jwtVerify(token, JWT_SECRET)
      
      // Add user info to request headers for easy access in API routes
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('X-User-ID', payload.userId as string)
      requestHeaders.set('X-User-Email', payload.email as string)
      requestHeaders.set('X-User-Tier', payload.tier as string)

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    } catch (error) {
      console.error('JWT verification failed:', error)
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}