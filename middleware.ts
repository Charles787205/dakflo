import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Define role-based access control
    const roleRoutes = {
      field_collector: ['/field_collector'],
      lab_tech: ['/lab_tech'],
      admin: ['/admin'],
      ext_expert: ['/ext_expert'],
      patient: ['/patient']
    }

    // Check if user is accessing a role-specific route
    for (const [role, routes] of Object.entries(roleRoutes)) {
      for (const route of routes) {
        if (pathname.startsWith(route)) {
          if (token?.role !== role) {
            // Redirect to appropriate dashboard based on user's role
            const redirectPath = token?.role === 'patient' ? '/patient' : 
                               token?.role === 'field_collector' ? '/field_collector' :
                               token?.role === 'admin' ? '/admin' :
                               token?.role === 'ext_expert' ? '/ext_expert' :
                               '/lab_tech/dashboard'
            return NextResponse.redirect(
              new URL(redirectPath, req.url)
            )
          }
        }
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export const config = {
  matcher: [
    '/field_collector/:path*',
    '/lab_tech/:path*',
    '/admin/:path*',
    '/ext_expert/:path*',
    '/patient/:path*',
    '/profile'
  ]
}