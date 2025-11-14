import { createServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SignOutButton from '@/components/SignOutButton'
import CheckoutButton from '@/components/CheckoutButton'
import ManageSubscriptionButton from '@/components/ManageSubscriptionButton'
import CalendarConnection from '@/components/CalendarConnection'
import { SUBSCRIPTION_STATUS, ROUTES } from '@/lib/constants'

export default async function AccountPage() {
  const supabase = await createServerClient()

  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect(ROUTES.SIGNUP)
  }

  // Get user's profile and subscription info
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  const isPremium = profile?.subscription_status === SUBSCRIPTION_STATUS.ACTIVE
  const subscriptionTier = profile?.subscription_tier || 'free'

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
            <SignOutButton />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 fade-in">Account Settings</h1>

          {/* Account Info Card */}
          <div className="card fade-in mb-8 slide-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Information</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl">
                <span className="text-gray-700 font-medium">Email:</span>
                <span className="font-semibold text-gray-900">{session.user.email}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl">
                <span className="text-gray-700 font-medium">Plan:</span>
                <span className={`font-semibold ${isPremium ? 'text-green-600' : 'text-gray-600'}`}>
                  {isPremium ? `Premium (${subscriptionTier})` : 'Free'}
                </span>
              </div>
            </div>
          </div>

          {/* Subscription Card */}
          <div className="card fade-in" style={{animationDelay: '0.1s'}}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Subscription</h2>

            {isPremium ? (
              <div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 rounded-2xl p-8 mb-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 text-9xl opacity-10">✓</div>
                  <div className="flex items-start gap-4">
                    <span className="text-5xl">✓</span>
                    <div>
                      <h3 className="text-2xl font-bold text-green-900 mb-3">
                        Premium Member
                      </h3>
                      <p className="text-green-800 text-lg mb-2">
                        You have full access to all features and daily prompts.
                      </p>
                      <p className="text-green-700 font-medium">
                        Plan: {subscriptionTier === 'yearly' ? 'Annual ($10/year)' : 'Monthly ($1/month)'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Manage Subscription via Stripe Customer Portal */}
                <ManageSubscriptionButton />
              </div>
            ) : (
              <div>
                <p className="text-gray-700 text-lg mb-8 leading-relaxed">
                  Upgrade to premium to unlock all features, advanced tracking, and personalized recommendations.
                </p>

                {/* Pricing Options */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Monthly Plan */}
                  <div className="card hover:scale-105 hover:border-primary-400 border-2 border-primary-200 transition-all duration-300">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Monthly</h3>
                    <div className="flex items-baseline mb-6">
                      <span className="text-5xl font-bold gradient-text">$1</span>
                      <span className="text-gray-600 text-lg ml-2">/month</span>
                    </div>
                    <ul className="space-y-3 mb-8">
                      <li className="flex items-start">
                        <span className="text-2xl mr-3 mt-1">✓</span>
                        <span className="text-gray-700 font-medium">Daily connection prompts</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-2xl mr-3 mt-1">✓</span>
                        <span className="text-gray-700 font-medium">Progress tracking</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-2xl mr-3 mt-1">✓</span>
                        <span className="text-gray-700 font-medium">Personalized recommendations</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-2xl mr-3 mt-1">✓</span>
                        <span className="text-gray-700 font-medium">Cancel anytime</span>
                      </li>
                    </ul>
                    <CheckoutButton tier="monthly" />
                  </div>

                  {/* Yearly Plan */}
                  <div className="card hover:scale-105 border-2 border-primary-400 relative bg-gradient-to-br from-primary-50 to-purple-50 transition-all duration-300">
                    <div className="absolute -top-3 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                      SAVE 17%
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Annual</h3>
                    <div className="flex items-baseline mb-6">
                      <span className="text-5xl font-bold gradient-text">$10</span>
                      <span className="text-gray-600 text-lg ml-2">/year</span>
                    </div>
                    <ul className="space-y-3 mb-8">
                      <li className="flex items-start">
                        <span className="text-2xl mr-3 mt-1">✓</span>
                        <span className="text-gray-700 font-medium">Everything in Monthly</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-2xl mr-3 mt-1">✓</span>
                        <span className="text-gray-700 font-medium">Save $2/year</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-2xl mr-3 mt-1">✓</span>
                        <span className="text-gray-700 font-medium">Priority support</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-2xl mr-3 mt-1">✓</span>
                        <span className="text-gray-700 font-medium">Early access to new features</span>
                      </li>
                    </ul>
                    <CheckoutButton tier="yearly" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Calendar Connection Card */}
          <div className="fade-in mt-8" style={{animationDelay: '0.2s'}}>
            <CalendarConnection />
          </div>
        </div>
      </main>
    </div>
  )
}
