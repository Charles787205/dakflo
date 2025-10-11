import NextAuth from 'next-auth/next'
import CredentialsProvider from 'next-auth/providers/credentials'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import bcrypt from 'bcryptjs'
import { getClient, getDb } from '@/lib/mongodb'
import type { User } from '@/models/user'
import type { JWT } from 'next-auth/jwt'
import type { Session, User as NextAuthUser } from 'next-auth'

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
          return null
        }

        try {
          const db = await getDb()
          const users = db.collection<User>('users')

          const user = await users.findOne({ username: credentials.username })

          if (!user) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          // Check if user is approved and active
          if (!user.isApproved || !user.isActive) {
            throw new Error('Account pending approval or inactive. Please contact an administrator.')
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
    async jwt({ token, user }: { token: JWT; user?: NextAuthUser | undefined }) {
      if (user) {
        // merge role/username into token
        Object.assign(token as unknown as Record<string, unknown>, {
          role: user.role,
          username: user.username
        })
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        const t = token as unknown as { sub?: string; role?: string; username?: string }
        const sUser = session.user as unknown as { id?: string; role?: string; username?: string }
        if (t.sub) sUser.id = String(t.sub)
        if (t.role) sUser.role = t.role
        if (t.username) sUser.username = t.username
      }
      return session
    }
  },
  pages: {
    signIn: '/',
    error: '/'
  }
}

const handler = NextAuth(authOptions as unknown as never)

export { handler as GET, handler as POST }