import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getDb } from '@/lib/mongodb'

interface ExtendedSession {
  user: {
    username: string
    role: string
    id: string
    name?: string
    email?: string
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions as never) as ExtendedSession | null
    
    if (!session || !session.user || !session.user.username) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDb()
    const users = db.collection('users')
    
    // Find the user by username from the session
    const user = await users.findOne({ 
      username: session.user.username 
    }, {
      projection: {
        password: 0 // Exclude password from the response
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Format the user data for the frontend
    const profile = {
      username: user.username,
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      suffix: user.suffix,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      isApproved: user.isApproved,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }

    return NextResponse.json({ profile })

  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}