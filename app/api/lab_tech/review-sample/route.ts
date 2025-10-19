import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    // For now, we'll skip auth validation since we don't have proper session typing
    // In a real implementation, you would properly validate the session
    
    const { sampleId, status, comments } = await request.json()
    
    console.log('Review API called with:', { sampleId, status, comments })

    if (!sampleId || !status || !['approved', 'rejected'].includes(status)) {
      console.log('Invalid request data:', { sampleId, status, comments })
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    if (status === 'rejected' && !comments?.trim()) {
      console.log('Missing comments for rejection')
      return NextResponse.json({ error: 'Comments are required for rejection' }, { status: 400 })
    }

    const db = await getDb()
    console.log('Database connected successfully')
    
    const result = await db.collection('sample_collections').updateOne(
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

    console.log('Update result:', result)

    if (result.matchedCount === 0) {
      console.log('Sample not found with ID:', sampleId)
      return NextResponse.json({ error: 'Sample not found' }, { status: 404 })
    }

    console.log('Review submitted successfully')
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