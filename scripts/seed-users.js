// Load environment variables from .env when running the script directly
try {
  require('dotenv').config()
} catch (err) {
  // dotenv not installed or failed to load — environment variables may already be set
}

const { MongoClient } = require('mongodb')
const bcrypt = require('bcryptjs')

const MONGO_URI = "mongodb://jcanedo527294:ffgfqcb9AdQ82HW7@ac-nnanmlz-shard-00-00.iiloql1.mongodb.net:27017,ac-nnanmlz-shard-00-01.iiloql1.mongodb.net:27017,ac-nnanmlz-shard-00-02.iiloql1.mongodb.net:27017/dakflodb?replicaSet=atlas-7ew5fv-shard-0&ssl=true&authSource=admin"
if (!MONGO_URI) {
  console.error('\nERROR: MONGO_URI is not set.\nPlease set MONGO_URI in your environment or in a .env file and try again.\n')
  process.exit(1)
}

async function seedUsers() {
  const client = new MongoClient(MONGO_URI)

  try {
    await client.connect()
    console.log('Connected to MongoDB')

    const db = client.db()
    const users = db.collection('users')

    // Clear existing users (optional)
    // await users.deleteMany({})

    // Test users for each role
    const testUsers = [
      {
        username: 'field_collector',
        password: 'password123',
        role: 'field_collector',
        firstName: 'Field',
        lastName: 'Collector',
        email: 'field@dakflo.com'
      },
      {
        username: 'lab_tech',
        password: 'password123',
        role: 'lab_tech',
        firstName: 'Lab',
        lastName: 'Technician',
        email: 'lab@dakflo.com'
      },
      {
        username: 'admin',
        password: 'password123',
        role: 'admin',
        firstName: 'System',
        lastName: 'Administrator',
        email: 'admin@dakflo.com'
      },
      {
        username: 'ext_expert',
        password: 'password123',
        role: 'ext_expert',
        firstName: 'External',
        lastName: 'Expert',
        email: 'expert@dakflo.com'
      },
      {
        username: 'pending_user',
        password: 'password123',
        role: 'field_collector',
        firstName: 'Pending',
        lastName: 'User',
        email: 'pending@dakflo.com',
        isApproved: false // This user is pending approval
      }
    ]

    console.log('Creating test users...')

    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await users.findOne({ username: userData.username })
      
      if (existingUser) {
        console.log(`User ${userData.username} already exists, skipping...`)
        continue
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12)

      // Create user
      const newUser = {
        ...userData,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        isApproved: userData.isApproved !== undefined ? userData.isApproved : true // Use the specified value or default to true
      }

      const result = await users.insertOne(newUser)
      console.log(`Created user: ${userData.username} (${userData.role}) - ID: ${result.insertedId}`)
    }

    console.log('User seeding completed!')
    console.log('\nTest Credentials:')
    console.log('================')
    testUsers.forEach(user => {
      console.log(`Role: ${user.role}`)
      console.log(`Username: ${user.username}`)
      console.log(`Password: ${user.password}`)
      console.log('---')
    })

  } catch (error) {
    console.error('Error seeding users:', error)
  } finally {
    await client.close()
  }
}

seedUsers()