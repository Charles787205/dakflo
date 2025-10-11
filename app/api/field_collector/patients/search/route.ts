import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    
    if (!query.trim()) {
      return NextResponse.json({ patients: [] })
    }

    const db = await getDb()
    
    // Search patients collection for demographic data
    const patients = db.collection('patients')
    const patientResults = await patients.find({
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { middleName: { $regex: query, $options: 'i' } }
      ]
    }).limit(10).toArray()

    // Format results to show patient name and ID
    const results = patientResults.map(p => ({
      id: p._id.toString(),
      displayName: `${p.firstName || ''} ${p.middleName || ''} ${p.lastName || ''}`.replace(/\s+/g, ' ').trim(),
      identifier: p._id.toString(), // Use patient ID as identifier
      type: 'patient'
    }))

    return NextResponse.json({ patients: results })
  } catch (error) {
    console.error('Patient search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}