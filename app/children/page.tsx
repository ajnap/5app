import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SignOutButton from '@/components/SignOutButton'
import AddChildButton from '@/components/AddChildButton'
import ChildCard from '@/components/ChildCard'
import { ROUTES } from '@/lib/constants'

export default async function ChildrenPage() {
  const cookieStore = cookies()
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 fade-in">
        <div className="flex justify-between items-center backdrop-blur-sm bg-white/30 rounded-2xl px-6 py-3 shadow-sm">
          <Link href={ROUTES.DASHBOARD} className="text-2xl font-bold gradient-text">
            The Next 5 Minutes
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href={ROUTES.DASHBOARD}
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href={ROUTES.ACCOUNT}
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Account
            </Link>
            <SignOutButton />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Your Children</h1>
            <p className="text-xl text-gray-600">
              {hasChildren
                ? 'Personalized prompts for each child based on their age and interests'
                : 'Add your children to get personalized connection prompts'}
            </p>
          </div>

          {/* Empty State */}
          {!hasChildren && (
            <div className="card text-center py-16 fade-in">
              <div className="text-6xl mb-6">👨‍👩‍👧‍👦</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Let's get to know your family!
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Tell us about your children so we can provide age-appropriate prompts and activities tailored just for them.
              </p>
              <AddChildButton />
            </div>
          )}

          {/* Children Grid */}
          {hasChildren && (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 fade-in mb-8">
                {childrenWithAge.map((child, index) => (
                  <ChildCard
                    key={child.id}
                    child={child}
                    index={index}
                  />
                ))}
              </div>

              {/* Add Another Child */}
              <div className="text-center fade-in">
                <AddChildButton />
              </div>
            </>
          )}

          {/* Info Box */}
          {hasChildren && (
            <div className="mt-12 bg-gradient-to-r from-primary-100 to-purple-100 rounded-2xl p-8 border-2 border-primary-200 fade-in">
              <h3 className="text-xl font-bold text-primary-900 mb-4 flex items-center gap-2">
                <span>💡</span>
                Why we ask about your children
              </h3>
              <ul className="space-y-2 text-primary-900">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span><strong>Age-appropriate prompts:</strong> A 3-year-old and a 13-year-old need very different activities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span><strong>Personalized suggestions:</strong> We'll match activities to their interests and personality</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span><strong>Better connection:</strong> The more we know, the better we can help you connect</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
