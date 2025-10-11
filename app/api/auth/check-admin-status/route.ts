import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGO_URI!);

export async function GET() {
  try {
    await client.connect();
    const db = client.db();
    const users = db.collection('users');

    // Check if there are any approved admin users
    const approvedAdminCount = await users.countDocuments({
      role: 'admin',
      isApproved: true,
      isActive: true
    });

    return NextResponse.json({
      hasApprovedAdmins: approvedAdminCount > 0,
      approvedAdminCount
    });

  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}