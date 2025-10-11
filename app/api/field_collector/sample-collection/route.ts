import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import type { NewSampleCollection, SampleImage } from '@/models/sampleCollection'

export async function POST(req: NextRequest) {
  try {
    // parse form data
    const form = await req.formData()

    const patientId = form.get('patientId')?.toString() || null
    const patientName = form.get('patientName')?.toString() || null
    const sampleType = form.get('sampleType')?.toString() || 'stool'
    const notes = form.get('notes')?.toString() || null

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 })
    }

    const images: File[] = []
    for (const entry of form.getAll('images')) {
      if (entry instanceof File) images.push(entry)
    }

    if (images.length === 0) {
      return NextResponse.json({ error: 'No images uploaded' }, { status: 400 })
    }

    const client = await getClient()
    const db = client.db()
    const imagesColl = db.collection('sample_images')
    const sampleCollectionsColl = db.collection('sample_collections')

    const storedImages: SampleImage[] = []

    // Store each image in sample_images collection
    for (const img of images) {
      const arrayBuffer = await img.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const imageDoc = {
        filename: img.name || `img-${Date.now()}.jpg`,
        data: buffer,
        contentType: img.type || 'image/jpeg',
        size: buffer.length,
        uploadedAt: new Date()
      }
      const result = await imagesColl.insertOne(imageDoc)
      
      storedImages.push({
        filename: imageDoc.filename,
        contentType: imageDoc.contentType,
        size: imageDoc.size,
        imageId: result.insertedId
      })
    }

    // Create sample collection document
    const newCollection: NewSampleCollection = {
      patientId: new ObjectId(patientId),
      patientName: patientName || undefined,
      sampleType: sampleType as 'stool' | 'blood' | 'urine' | 'other',
      notes: notes || undefined,
      images: storedImages,
      collectionDate: new Date(),
      status: 'pending'
    }

    const collectionDoc = {
      ...newCollection,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const collectionResult = await sampleCollectionsColl.insertOne(collectionDoc)

    return NextResponse.json({ 
      message: 'Sample collection uploaded successfully',
      collectionId: collectionResult.insertedId.toString(),
      imageCount: storedImages.length
    }, { status: 201 })
  } catch (e) {
    console.error('Upload error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
