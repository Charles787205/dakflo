import { MongoClient, Db } from 'mongodb'

const uri = process.env.MONGO_URI!
let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function getClient(): Promise<MongoClient> {
  if (cachedClient) return cachedClient
  if (!uri) throw new Error('MONGO_URI is not defined')
  const client = new MongoClient(uri)
  await client.connect()
  cachedClient = client
  return client
}

export async function getDb(dbName?: string): Promise<Db> {
  if (cachedDb) return cachedDb
  const client = await getClient()
  const db = client.db(dbName)
  cachedDb = db
  return db
}
