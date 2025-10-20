// Extended session type for our application
export interface ExtendedSessionUser {
  id?: string
  username?: string
  role?: string
  name?: string | null
  email?: string | null
  image?: string | null
}

export interface ExtendedSession {
  user?: ExtendedSessionUser
  expires: string
}