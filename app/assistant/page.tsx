import { createServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Navigation from '@/components/Navigation'
import AssistantClient from '@/components/AssistantClient'
import { ROUTES } from '@/lib/constants'

export const metadata = {
  title: 'Parenting Assistant | The Next 5 Minutes',
  description: 'Get personalized parenting advice and activity suggestions',
}

export default async function AssistantPage() {
  const supabase = await createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect(ROUTES.SIGNUP)
  }

  // Get user's children for welcome message
  const { data: children } = await supabase
    .from('child_profiles')
    .select('name')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: true })

  const childNames = children?.map((c) => c.name).join(', ') || 'your children'

  return (
    <div className="min-h-screen bg-cream-100">
      <Navigation />
      <AssistantClient userId={session.user.id} childNames={childNames} />
    </div>
  )
}
