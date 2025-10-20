import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import type { ExtendedSession } from '@/types/session'

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as ExtendedSession | null
    
    if (!session || !session.user || session.user.role !== 'patient') {
      return NextResponse.json({ error: 'Unauthorized - Patient access required' }, { status: 401 })
    }

    // Get patient's user ID to find their samples
    const db = await getDb()
    const users = db.collection('users')
    
    // Find the patient user record
    const patientUser = await users.findOne({ 
      username: session.user.username,
      role: 'patient'
    })

    if (!patientUser) {
      return NextResponse.json({ error: 'Patient record not found' }, { status: 404 })
    }

    // Find the corresponding patient record
    const patients = db.collection('patients')
    const patientRecord = await patients.findOne({
      $or: [
        // Try to match by exact name and email
        {
          firstName: patientUser.firstName,
          lastName: patientUser.lastName,
          email: patientUser.email
        },
        // Try to match by name only (in case email doesn't match)
        {
          firstName: patientUser.firstName,
          lastName: patientUser.lastName
        }
      ]
    })

    if (!patientRecord) {
      // Patient user exists but no patient profile found - return empty results instead of error
      return NextResponse.json({ 
        results: [],
        patientInfo: {
          firstName: patientUser.firstName,
          lastName: patientUser.lastName,
          email: patientUser.email
        }
      })
    }

    // Get sample collections for this patient
    const sampleCollections = db.collection('sample_collections')
    const samples = await sampleCollections
      .find({ patientId: new ObjectId(patientRecord._id) })
      .sort({ collectionDate: -1 }) // Most recent first
      .toArray()

    // Format the results for the frontend
    const results = samples.map(sample => ({
      _id: sample._id.toString(),
      sampleType: sample.sampleType,
      collectionDate: sample.collectionDate,
      status: sample.status,
      labStatus: sample.labStatus,
      labComments: sample.labComments,
      reviewedBy: sample.reviewedBy,
      reviewedAt: sample.reviewedAt,
      notes: sample.notes,
      collectedBy: sample.collectedBy
    }))

    return NextResponse.json({ 
      results,
      patientInfo: {
        firstName: patientRecord.firstName,
        lastName: patientRecord.lastName,
        email: patientRecord.email
      }
    })

  } catch (error) {
    console.error('Error fetching patient results:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}