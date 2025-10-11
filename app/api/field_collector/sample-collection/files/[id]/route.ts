import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const client = await getClient()
    const db = client.db()
    const imagesColl = db.collection('sample_images')

    const _id = new ObjectId(id)
    const doc = await imagesColl.findOne({ _id })
    if (!doc || !doc.data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const headers = new Headers()
    headers.set('Content-Type', doc.contentType || 'application/octet-stream')
    return new NextResponse(doc.data.buffer, { headers })
  } catch (e) {
    console.error('File stream error', e)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
