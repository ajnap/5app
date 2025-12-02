import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AssistantClient from '@/components/AssistantClient'

export const metadata = {
  title: 'Parenting Assistant | The Next 5 Minutes',
  description: 'Get personalized parenting advice and activity suggestions',
}

export default async function AssistantPage() {
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

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/signup')
  }

  // Get user's children for welcome message
  const { data: children } = await supabase
    .from('child_profiles')
    .select('name')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: true })

  const childNames = children?.map((c) => c.name).join(', ') || 'your children'

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <AssistantClient userId={session.user.id} childNames={childNames} />
    </div>
  )
}
