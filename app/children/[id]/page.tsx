import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import SignOutButton from '@/components/SignOutButton'
import ChildForm from '@/components/ChildForm'
import { ROUTES } from '@/lib/constants'

export default async function EditChildPage({ params }: { params: { id: string } }) {
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

  // Fetch the child profile
  const { data: child, error } = await supabase
    .from('child_profiles')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', session.user.id) // Ensure user owns this child
    .single()

  if (error || !child) {
    notFound()
  }

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
              href="/children"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              ← Back to Children
            </Link>
            <SignOutButton />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 fade-in">
            <div className="text-6xl mb-4">✏️</div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Edit {child.name}'s Profile</h1>
            <p className="text-xl text-gray-600">
              Update information to keep prompts personalized
            </p>
          </div>

          {/* Form Card */}
          <div className="card fade-in">
            <ChildForm existingChild={child} />
          </div>

          {/* Help Text */}
          <div className="mt-8 text-center text-sm text-gray-600 fade-in">
            <p>Changes are saved immediately</p>
          </div>
        </div>
      </main>
    </div>
  )
}
