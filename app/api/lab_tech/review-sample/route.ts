import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    // For now, we'll skip auth validation since we don't have proper session typing
    // In a real implementation, you would properly validate the session
    
    const { sampleId, status, comments } = await request.json()

    if (!sampleId || !status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    if (status === 'rejected' && !comments?.trim()) {
      return NextResponse.json({ error: 'Comments are required for rejection' }, { status: 400 })
    }

    const db = await getDb()
    
    const result = await db.collection('sampleCollections').updateOne(
      { _id: new ObjectId(sampleId) },
      {
        $set: {
          labStatus: status,
          labComments: comments?.trim() || '',
          reviewedBy: 'Lab Technician', // In real app, get from auth session
          reviewedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Sample not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true,
      message: `Sample ${status} successfully`,
      data: {
        sampleId,
        status,
        comments,
        reviewedBy: 'Lab Technician',
        reviewedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error reviewing sample:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}