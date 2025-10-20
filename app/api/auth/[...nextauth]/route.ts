import NextAuth from 'next-auth/next'
import CredentialsProvider from 'next-auth/providers/credentials'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import bcrypt from 'bcryptjs'
import { getClient, getDb } from '@/lib/mongodb'
import type { User } from '@/models/user'

export const authOptions = {
  adapter: MongoDBAdapter(getClient()),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          console.log('Missing credentials')
          return null
        }

        try {
          const db = await getDb()
          const users = db.collection<User>('users')

          const user = await users.findOne({ username: credentials.username })

          if (!user) {
            console.log('User not found:', credentials.username)
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            console.log('Invalid password for user:', credentials.username)
            return null
          }

          // Check if user is approved and active - store error info for frontend
          if (!user.isApproved) {
            console.log('User not approved:', credentials.username)
            // Use a special error code that the frontend can detect
            throw new Error('PENDING_APPROVAL')
          }

          if (!user.isActive) {
            console.log('User inactive:', credentials.username)
            throw new Error('ACCOUNT_INACTIVE')
          }

          // Build a display name from the name parts if available
          const displayName = [user.firstName, user.middleName, user.lastName, user.suffix]
            .filter(Boolean)
            .join(' ') || user.username

          return {
            id: user._id.toString(),
            username: user.username,
            role: user.role,
            name: displayName,
            email: user.email || null,
          }
        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const
  },
  callbacks: {
    // @ts-expect-error NextAuth callback types are inconsistent
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role
        token.username = user.username
      }
      return token
    },
    // @ts-expect-error NextAuth callback types are inconsistent
    session: async ({ session, token }) => {
      if (token && session.user) {
        session.user.id = token.sub || ''
        session.user.role = token.role || ''
        session.user.username = token.username || ''
      }
      return session
    }
  },
  pages: {
    signIn: '/',
    error: '/'
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }