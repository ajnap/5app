import { createServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Navigation from '@/components/Navigation'
import AddChildButton from '@/components/AddChildButton'
import ChildProfileCard from '@/components/ChildProfileCard'
import { ROUTES } from '@/lib/constants'

export default async function ChildrenPage() {
  const supabase = await createServerClient()

  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect(ROUTES.SIGNUP)
  }

  // Get all children for this user
  const { data: children } = await supabase
    .from('child_profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: true })

  // Calculate age for each child
  const childrenWithAge = children?.map(child => {
    const birthDate = new Date(child.birth_date)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return { ...child, age }
  })

  const hasChildren = childrenWithAge && childrenWithAge.length > 0

  return (
    <div className="min-h-screen bg-cream-100">
      <Navigation />

      {/* Main Content */}
      <main className="container-narrow py-12">
        {/* Header */}
        <div className="text-center mb-12 fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-lavender-100 mb-4">
            <span className="text-3xl">👶</span>
          </div>
          <h1 className="font-display text-display-sm md:text-display-md text-slate-900 mb-3">
            Your Children
          </h1>
          <p className="text-body-lg text-slate-600 max-w-xl mx-auto">
            {hasChildren
              ? 'Personalized prompts for each child based on their age and interests'
              : 'Add your children to get personalized connection prompts'}
          </p>
        </div>

        {/* Empty State */}
        {!hasChildren && (
          <div className="card-elevated text-center py-16 fade-in-up delay-100">
            <div className="text-6xl mb-6 animate-bounce-gentle">👨‍👩‍👧‍👦</div>
            <h2 className="font-display text-2xl font-semibold text-slate-900 mb-3">
              Let's get to know your family!
            </h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Tell us about your children so we can provide age-appropriate prompts and activities tailored just for them.
            </p>
            <AddChildButton />
          </div>
        )}

        {/* Children Grid */}
        {hasChildren && (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 fade-in-up delay-100 mb-10">
              {childrenWithAge.map((child, index) => (
                <ChildProfileCard
                  key={child.id}
                  child={child}
                  index={index}
                />
              ))}
            </div>

            {/* Add Another Child */}
            <div className="text-center fade-in-up delay-200">
              <AddChildButton />
            </div>
          </>
        )}

        {/* Info Box */}
        {hasChildren && (
          <div className="mt-16 card-lavender fade-in-up delay-300">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-lavender-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-slate-900 mb-2">
                  Why we ask about your children
                </h3>
                <ul className="space-y-2 text-slate-600 text-sm">
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-lavender-500 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span><strong>Age-appropriate prompts:</strong> A 3-year-old and a 13-year-old need very different activities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-lavender-500 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span><strong>Personalized suggestions:</strong> We'll match activities to their interests and personality</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-lavender-500 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span><strong>Better connection:</strong> The more we know, the better we can help you connect</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
