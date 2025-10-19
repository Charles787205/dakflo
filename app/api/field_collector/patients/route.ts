import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getDb } from '@/lib/mongodb'
import type { NewUser } from '@/models/user'

function generateUsername(firstName: string, lastName: string) {
  const fn = firstName.replace(/[^a-zA-Z]/g, '').toLowerCase().slice(0, 6)
  const ln = lastName.replace(/[^a-zA-Z]/g, '').toLowerCase().slice(0, 6)
  const random = Math.floor(1000 + Math.random() * 9000)
  return `${fn}.${ln}${random}`
}

function generateOtp(length = 8) {
  // simple alphanumeric OTP
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let out = ''
  for (let i = 0; i < length; i++) out += chars.charAt(Math.floor(Math.random() * chars.length))
  return out
}

export async function GET() {
  try {
    const db = await getDb()
    const patients = db.collection('patients')
    
    const patientList = await patients
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ 
      patients: patientList.map(p => ({
        ...p,
        _id: p._id.toString()
      }))
    })
  } catch (error) {
    console.error('Error fetching patients:', error)
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const { 
      firstName, 
      lastName, 
      middleName, 
      suffix,
      age,
      gender,
      dateOfBirth,
      phoneNumber, 
      alternatePhone,
      email, 
      address,
      barangay,
      municipality,
      province,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      medicalHistory,
      allergies,
      currentMedications,
      symptoms,
      referringPhysician,
      notes
    } = payload

    if (!firstName || !lastName) {
      return NextResponse.json({ error: 'firstName and lastName are required' }, { status: 400 })
    }

    const db = await getDb()

    // Insert patient record with all collected fields
    const patients = db.collection('patients')
    const patientDoc = {
      firstName,
      middleName: middleName || null,
      lastName,
      suffix: suffix || null,
      age: age ? parseInt(age) : null,
      gender: gender || null,
      dateOfBirth: dateOfBirth || null,
      phoneNumber: phoneNumber || null,
      alternatePhone: alternatePhone || null,
      email: email || null,
      address: address || null,
      barangay: barangay || null,
      municipality: municipality || null,
      province: province || null,
      emergencyContactName: emergencyContactName || null,
      emergencyContactPhone: emergencyContactPhone || null,
      emergencyContactRelation: emergencyContactRelation || null,
      medicalHistory: medicalHistory || null,
      allergies: allergies || null,
      currentMedications: currentMedications || null,
      symptoms: symptoms || null,
      referringPhysician: referringPhysician || null,
      notes: notes || null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const patientResult = await patients.insertOne(patientDoc)

    // Create user account for patient
    const users = db.collection('users')
    const username = generateUsername(firstName, lastName)
    const otp = generateOtp(10)
    const hashed = await bcrypt.hash(otp, 12)

    const newUser: NewUser = {
      username,
      password: hashed,
      role: 'patient',
      firstName,
      middleName: middleName || null,
      lastName,
      suffix: suffix || null,
      email: email || null,
      isActive: true,
      isApproved: true
    }

    const insertUserDoc = { ...newUser, createdAt: new Date(), updatedAt: new Date() }
    const userResult = await users.insertOne(insertUserDoc)

    return NextResponse.json({
      message: 'Patient and account created',
      patientId: patientResult.insertedId,
      userId: userResult.insertedId,
      username,
      otp // plaintext OTP to be displayed/shared once
    }, { status: 201 })
  } catch (error) {
    console.error('Create patient error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
