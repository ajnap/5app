import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/calendar.events',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!account) return false

      // Store OAuth tokens in Supabase
      if (account.provider === 'google' && account.access_token) {
        try {
          const cookieStore = await cookies()
          const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
              cookies: {
                get(name: string) {
                  return cookieStore.get(name)?.value
                },
              },
            }
          )

          // Get the current authenticated user from Supabase
          const {
            data: { session },
          } = await supabase.auth.getSession()

          if (!session) {
            console.error('No Supabase session found')
            return false
          }

          // Calculate expires_at timestamp (in seconds)
          const expiresAt = account.expires_at || Math.floor(Date.now() / 1000) + 3600

          // Upsert OAuth token
          const { error } = await supabase.from('google_oauth_tokens').upsert(
            {
              user_id: session.user.id,
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              token_type: account.token_type || 'Bearer',
              expires_at: expiresAt,
              scope: account.scope,
            },
            {
              onConflict: 'user_id',
            }
          )

          if (error) {
            console.error('Error storing OAuth token:', error)
            return false
          }

          return true
        } catch (error) {
          console.error('Error in signIn callback:', error)
          return false
        }
      }

      return true
    },
    async session({ session, token }) {
      // Attach user ID to session
      if (session.user) {
        session.user.id = token.sub as string
      }
      return session
    },
  },
  pages: {
    signIn: '/signup',
    error: '/signup',
  },
  session: {
    strategy: 'jwt',
  },
}
