import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { generateRecommendations } from '@/lib/recommendations/engine'

export default async function TestRecommendationsPage() {
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

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return <div className="p-8">Not authenticated</div>
  }

  // Get children
  const { data: children } = await supabase
    .from('child_profiles')
    .select('*')
    .eq('user_id', session.user.id)

  if (!children || children.length === 0) {
    return <div className="p-8">No children found</div>
  }

  const child = children[0]

  // Generate recommendations
  let recommendations
  let error
  try {
    recommendations = await generateRecommendations(
      {
        userId: session.user.id,
        childId: child.id,
        faithMode: false,
        limit: 5
      },
      supabase
    )
  } catch (err: any) {
    error = err.message
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Recommendation Engine Test</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Child Info</h2>
        <p><strong>Name:</strong> {child.name}</p>
        <p><strong>ID:</strong> {child.id}</p>
        <p><strong>Birth Date:</strong> {child.birth_date}</p>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-red-900 mb-2">Error</h2>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {recommendations && (
        <>
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-green-900 mb-4">Recommendations Generated</h2>
            <p><strong>Count:</strong> {recommendations.recommendations.length}</p>
            <p><strong>Total Completions:</strong> {recommendations.metadata.totalCompletions}</p>
          </div>

          <div className="space-y-4">
            {recommendations.recommendations.map((rec, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow p-6 border-2 border-primary-200">
                <h3 className="text-lg font-bold mb-2">{rec.prompt.title}</h3>
                <p className="text-gray-600 mb-2">{rec.prompt.description}</p>
                <p className="text-sm text-gray-500 mb-2">
                  <strong>Category:</strong> {rec.prompt.category} | <strong>Score:</strong> {rec.score.toFixed(2)}
                </p>
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm font-semibold mb-1">Why recommended:</p>
                  <ul className="text-sm text-blue-900 list-disc list-inside">
                    {rec.reasons.map((reason, i) => (
                      <li key={i}>{reason.message}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
