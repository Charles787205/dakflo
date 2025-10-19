import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getDb } from '@/lib/mongodb'
import bcrypt from 'bcryptjs'

interface ExtendedSession {
  user: {
    username: string
    role: string
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the session
    const session = await getServerSession(authOptions as never) as ExtendedSession | null
    
    if (!session || !session.user || !session.user.username) {
      return NextResponse.json(
        { error: 'You must be logged in to change your password' },
        { status: 401 }
      )
    }

    // Parse the request body
    const body = await request.json()
    const { currentPassword, newPassword } = body

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Connect to MongoDB
    const db = await getDb()
    const users = db.collection('users')
    
    // Find the user by username and include password
    const user = await users.findOne({ 
      username: session.user.username 
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    // Hash the new password
    const saltRounds = 12
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)

    // Update the user's password
    const updateResult = await users.updateOne(
      { username: session.user.username },
      { 
        $set: {
          password: hashedNewPassword,
          updatedAt: new Date()
        }
      }
    )

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      )
    }

    console.log(`Password changed successfully for user: ${user.username}`)

    return NextResponse.json(
      { message: 'Password changed successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json(
      { error: 'An error occurred while changing the password' },
      { status: 500 }
    )
  }
}