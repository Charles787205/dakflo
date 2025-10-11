import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import type { SampleCollection } from '@/models/sampleCollection'

export async function GET() {
  try {
    const db = await getDb()
    const sampleCollections = db.collection<SampleCollection>('sample_collections')
    
    // Fetch all sample collections, sorted by most recent first
    const collections = await sampleCollections
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    // Transform the data to match the expected format for the frontend
    const sampleList = collections.map(collection => ({
      _id: collection._id?.toString(),
      patientId: collection.patientId.toString(), // Convert ObjectId to string
      patientName: collection.patientName,
      sampleType: collection.sampleType,
      files: collection.images.map(img => ({
        filename: img.filename,
        id: img.imageId.toString()
      })),
      notes: collection.notes,
      uploadedAt: collection.collectionDate,
      status: collection.status,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt
    }))

    return NextResponse.json({ 
      samples: sampleList
    })
  } catch (error) {
    console.error('Error fetching sample collections:', error)
    return NextResponse.json({ error: 'Failed to fetch sample collections' }, { status: 500 })
  }
}