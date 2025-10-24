'use client'

import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { ROUTES } from '@/lib/constants'

export default function SignOutButton() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push(ROUTES.HOME)
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-gray-600 hover:text-red-600 font-medium transition-all duration-200 px-3 py-1.5 rounded-lg hover:bg-red-50"
    >
      Sign Out
    </button>
  )
}
