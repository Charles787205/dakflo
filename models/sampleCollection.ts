import { ObjectId } from 'mongodb'

export interface SampleImage {
  filename: string
  contentType: string
  size: number
  imageId: ObjectId // Reference to the image stored in sample_images collection
}

export interface SampleCollection {
  _id?: ObjectId
  patientId: ObjectId // Reference to patient document _id
  patientName?: string // Optional: store patient display name for easier queries
  sampleType: 'stool' | 'blood' | 'urine' | 'other'
  notes?: string
  images: SampleImage[]
  collectedBy?: string // Field collector username/id
  collectionDate: Date
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  createdAt: Date
  updatedAt: Date
}

export interface NewSampleCollection {
  patientId: ObjectId
  patientName?: string
  sampleType: 'stool' | 'blood' | 'urine' | 'other'
  notes?: string
  images: SampleImage[]
  collectedBy?: string
  collectionDate: Date
  status: 'pending' | 'processing' | 'completed' | 'rejected'
}
