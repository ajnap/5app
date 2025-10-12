import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SignOutButton from '@/components/SignOutButton'
import CheckoutButton from '@/components/CheckoutButton'
import ManageSubscriptionButton from '@/components/ManageSubscriptionButton'

export default async function AccountPage() {
  const supabase = createServerComponentClient({ cookies })

  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/signup')
  }

  // Get user's profile and subscription info
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  const isPremium = profile?.subscription_status === 'active'
  const subscriptionTier = profile?.subscription_tier || 'free'

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold text-primary-700">
            The Next 5 Minutes
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Dashboard
            </Link>
            <SignOutButton />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Account Settings</h1>

          {/* Account Info Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Account Information</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600">Email:</span>
                <span className="ml-2 font-medium">{session.user.email}</span>
              </div>
              <div>
                <span className="text-gray-600">Plan:</span>
                <span className={`ml-2 font-medium ${isPremium ? 'text-green-600' : 'text-gray-600'}`}>
                  {isPremium ? `Premium (${subscriptionTier})` : 'Free'}
                </span>
              </div>
            </div>
          </div>

          {/* Subscription Card */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Subscription</h2>

            {isPremium ? (
              <div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                  <div className="flex items-start">
                    <span className="text-3xl mr-4">✓</span>
                    <div>
                      <h3 className="text-xl font-semibold text-green-900 mb-2">
                        Premium Member
                      </h3>
                      <p className="text-green-800">
                        You have full access to all features and daily prompts.
                      </p>
                      <p className="text-green-700 text-sm mt-2">
                        Plan: {subscriptionTier === 'yearly' ? 'Annual ($99/year)' : 'Monthly ($9.99/month)'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Manage Subscription via Stripe Customer Portal */}
                <ManageSubscriptionButton />
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-8">
                  Upgrade to premium to unlock all features, advanced tracking, and personalized recommendations.
                </p>

                {/* Pricing Options */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Monthly Plan */}
                  <div className="border-2 border-primary-200 rounded-lg p-6 hover:border-primary-400 transition">
                    <h3 className="text-xl font-semibold mb-2">Monthly</h3>
                    <div className="text-3xl font-bold text-primary-600 mb-4">
                      $9.99<span className="text-lg text-gray-600">/month</span>
                    </div>
                    <ul className="space-y-2 mb-6 text-sm">
                      <li className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        Daily connection prompts
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        Progress tracking
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        Personalized recommendations
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        Cancel anytime
                      </li>
                    </ul>
                    <CheckoutButton tier="monthly" />
                  </div>

                  {/* Yearly Plan */}
                  <div className="border-2 border-primary-400 rounded-lg p-6 relative bg-primary-50">
                    <div className="absolute -top-3 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      SAVE 17%
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Annual</h3>
                    <div className="text-3xl font-bold text-primary-600 mb-4">
                      $99<span className="text-lg text-gray-600">/year</span>
                    </div>
                    <ul className="space-y-2 mb-6 text-sm">
                      <li className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        Everything in Monthly
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        Save $20/year
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        Priority support
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        Early access to new features
                      </li>
                    </ul>
                    <CheckoutButton tier="yearly" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
