import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET() {
  try {
    const db = await getDb()
    const users = db.collection('users')

    // Get all users
    const allUsers = await users.find({}).toArray()

    return NextResponse.json({ users: allUsers })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId, action } = await request.json()

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const db = await getDb()
    const users = db.collection('users')

    interface UpdateData {
      updatedAt: Date;
      isApproved?: boolean;
      isActive?: boolean;
    }

    let updateData: UpdateData = { updatedAt: new Date() }

    switch (action) {
      case 'approve':
        updateData = {
          ...updateData,
          isApproved: true,
          isActive: true
        }
        break
      case 'reject':
        // For reject, we'll delete the user
        const deleteResult = await users.deleteOne({ _id: new ObjectId(userId) })
        if (deleteResult.deletedCount === 0) {
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          )
        }
        return NextResponse.json({ message: 'User rejected and removed' })
      case 'deactivate':
        updateData = {
          ...updateData,
          isActive: false
        }
        break
      case 'activate':
        updateData = {
          ...updateData,
          isActive: true
        }
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    const result = await users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      message: `User ${action}d successfully`,
      action 
    })

  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}