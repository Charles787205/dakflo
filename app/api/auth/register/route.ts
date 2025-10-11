import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

import { getDb } from '@/lib/mongodb'
import type { NewUser, User } from '@/models/user'

export async function POST(request: NextRequest) {
  try {
    const { username, password, role, firstName, middleName, lastName, suffix, email } = await request.json()

    // Validate required fields
    if (!username || !password || !role || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Username, password, role, first name, and last name are required' },
        { status: 400 }
      )
    }

    // Validate role (allow patient role)
    const validRoles = ['field_collector', 'lab_tech', 'admin', 'ext_expert', 'patient']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

  const db = await getDb()
  const users = db.collection<User>('users')

    // Check if username already exists
    if (username) {
      const existingUser = await users.findOne({ username })
      if (existingUser) {
        return NextResponse.json({ error: 'User already exists' }, { status: 409 })
      }
    }

    // Check if this is the first admin
    const existingAdminCount = await users.countDocuments({ role: 'admin', isApproved: true })
    const isFirstAdmin = role === 'admin' && existingAdminCount === 0

    // Prevent registration as admin if admins already exist
    if (role === 'admin' && existingAdminCount > 0) {
      return NextResponse.json(
        { error: 'Admin registration is not allowed. Please contact an existing administrator.' },
        { status: 403 }
      )
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Patients are auto-approved and active; other roles require approval unless first admin
    const isPatient = role === 'patient'
    // Build user payload matching NewUser (timestamps are added at insert)
    const newUser: NewUser = {
      username,
      password: hashedPassword,
      role: role as NewUser['role'],
      firstName,
      middleName: middleName || null,
      lastName,
      suffix: suffix || null,
      email: email || null,
      isActive: isPatient ? true : isFirstAdmin ? true : false,
      isApproved: isPatient ? true : isFirstAdmin ? true : false
    }

    const insertDoc = {
      ...newUser,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await users.insertOne(insertDoc)

    return NextResponse.json(
      {
        message: 'User created successfully',
        userId: result.insertedId,
        username: newUser.username,
        role: newUser.role
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}