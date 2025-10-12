import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-700">The Next 5 Minutes</h1>
          <div className="space-x-4">
            <Link
              href="/signup"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            5 Minutes to Strengthen Your Bond
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Daily parenting connection prompts delivered to your inbox.
            Spend just 5 minutes a day building deeper connections with your child.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition"
          >
            Start Your Free Trial
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-primary-600 text-3xl mb-4">📧</div>
            <h3 className="text-xl font-semibold mb-2">Daily Prompts</h3>
            <p className="text-gray-600">
              Get a fresh connection activity every day, designed by parenting experts.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-primary-600 text-3xl mb-4">⏱️</div>
            <h3 className="text-xl font-semibold mb-2">Just 5 Minutes</h3>
            <p className="text-gray-600">
              Quick, meaningful activities that fit into your busy schedule.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-primary-600 text-3xl mb-4">💝</div>
            <h3 className="text-xl font-semibold mb-2">Real Results</h3>
            <p className="text-gray-600">
              Build trust, communication, and lasting memories with your child.
            </p>
          </div>
        </div>

        {/* Pricing Preview */}
        <div className="mt-20 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-8">Simple Pricing</h3>
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <p className="text-gray-600 mb-4">Start free, upgrade anytime</p>
            <div className="text-4xl font-bold text-primary-600 mb-2">$9.99/month</div>
            <p className="text-gray-500 mb-6">or $99/year (save 17%)</p>
            <ul className="text-left space-y-3 mb-6">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Daily connection prompts
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Age-appropriate activities
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Track your progress
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Cancel anytime
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 mt-20 border-t">
        <div className="text-center text-gray-600">
          <p>&copy; 2025 The Next 5 Minutes. Building stronger families, one moment at a time.</p>
        </div>
      </footer>
    </div>
  )
}
