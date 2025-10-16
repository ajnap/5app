import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 fade-in">
        <div className="flex justify-between items-center backdrop-blur-sm bg-white/30 rounded-2xl px-6 py-3 shadow-sm">
          <h1 className="text-2xl font-bold gradient-text">The Next 5 Minutes</h1>
          <div className="flex items-center space-x-4">
            <Link
              href="/signup"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="btn-primary"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16">
        <div className="max-w-5xl mx-auto text-center fade-in">
          {/* Hero Badge */}
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
            </span>
            Building stronger families, one moment at a time
          </div>

          <h2 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            5 Minutes to
            <span className="gradient-text"> Strengthen </span>
            Your Bond
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Daily parenting connection prompts that transform ordinary moments into
            <span className="text-primary-600 font-semibold"> meaningful memories</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              href="/signup"
              className="btn-primary group"
            >
              Start Free Trial
              <span className="inline-block transition-transform group-hover:translate-x-1 ml-2">→</span>
            </Link>
            <Link
              href="#features"
              className="btn-secondary"
            >
              Learn More
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-2 text-gray-600 text-sm">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white"></div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white"></div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-white"></div>
            </div>
            <span className="font-medium">Join parents building stronger connections</span>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="grid md:grid-cols-3 gap-8 mt-24 max-w-6xl mx-auto">
          <div className="feature-card slide-in" style={{animationDelay: '0.1s'}}>
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">📧</div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Daily Prompts</h3>
            <p className="text-gray-600 leading-relaxed">
              Fresh connection activities every day, expertly crafted to strengthen your parent-child bond.
            </p>
          </div>

          <div className="feature-card slide-in" style={{animationDelay: '0.2s'}}>
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">⏱️</div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Just 5 Minutes</h3>
            <p className="text-gray-600 leading-relaxed">
              Quick, meaningful moments designed to fit seamlessly into your busiest days.
            </p>
          </div>

          <div className="feature-card slide-in" style={{animationDelay: '0.3s'}}>
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">💝</div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Real Results</h3>
            <p className="text-gray-600 leading-relaxed">
              Build trust, deepen communication, and create lasting memories together.
            </p>
          </div>
        </div>

        {/* Pricing Preview */}
        <div className="mt-32 text-center fade-in">
          <div className="inline-block bg-gradient-to-r from-primary-100 to-purple-100 px-4 py-2 rounded-full text-sm font-semibold text-primary-700 mb-4">
            ⚡ Limited Time Offer
          </div>
          <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h3>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Start free, upgrade anytime. No hidden fees, cancel whenever you want.
          </p>

          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Monthly Plan */}
            <div className="card group hover:scale-105">
              <div className="text-center">
                <h4 className="text-2xl font-bold text-gray-900 mb-2">Monthly</h4>
                <div className="flex items-baseline justify-center mb-6">
                  <span className="text-5xl font-bold gradient-text">$1</span>
                  <span className="text-gray-500 ml-2">/month</span>
                </div>
                <ul className="space-y-4 mb-8 text-left">
                  <li className="flex items-start">
                    <span className="text-2xl mr-3 mt-1">✓</span>
                    <span className="text-gray-700">Daily connection prompts</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-2xl mr-3 mt-1">✓</span>
                    <span className="text-gray-700">Age-appropriate activities</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-2xl mr-3 mt-1">✓</span>
                    <span className="text-gray-700">Track your progress</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-2xl mr-3 mt-1">✓</span>
                    <span className="text-gray-700">Cancel anytime</span>
                  </li>
                </ul>
                <Link href="/signup" className="block btn-primary">
                  Start Monthly
                </Link>
              </div>
            </div>

            {/* Annual Plan */}
            <div className="card group hover:scale-105 relative overflow-hidden border-2 border-primary-300">
              <div className="absolute top-0 right-0 bg-gradient-to-br from-primary-500 to-purple-600 text-white px-4 py-1 text-sm font-bold rounded-bl-2xl">
                SAVE 17%
              </div>
              <div className="text-center">
                <h4 className="text-2xl font-bold text-gray-900 mb-2">Annual</h4>
                <div className="flex items-baseline justify-center mb-6">
                  <span className="text-5xl font-bold gradient-text">$10</span>
                  <span className="text-gray-500 ml-2">/year</span>
                </div>
                <ul className="space-y-4 mb-8 text-left">
                  <li className="flex items-start">
                    <span className="text-2xl mr-3 mt-1">✓</span>
                    <span className="text-gray-700">Everything in Monthly</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-2xl mr-3 mt-1">✓</span>
                    <span className="text-gray-700">Save $2 per year</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-2xl mr-3 mt-1">✓</span>
                    <span className="text-gray-700">Priority support</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-2xl mr-3 mt-1">✓</span>
                    <span className="text-gray-700">Early access to features</span>
                  </li>
                </ul>
                <Link href="/signup" className="block btn-primary">
                  Start Annual
                </Link>
              </div>
            </div>
          </div>

          <p className="text-gray-500 text-sm mt-8">
            💳 Try free for 7 days. No credit card required.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 mt-32">
        <div className="max-w-6xl mx-auto">
          <div className="backdrop-blur-sm bg-white/50 rounded-3xl p-8 border border-gray-200">
            <div className="text-center">
              <h3 className="text-2xl font-bold gradient-text mb-2">The Next 5 Minutes</h3>
              <p className="text-gray-600 mb-6">Building stronger families, one moment at a time.</p>
              <div className="flex justify-center gap-6 text-sm text-gray-500">
                <span>&copy; 2025 All rights reserved</span>
                <span>•</span>
                <Link href="/privacy" className="hover:text-primary-600 transition-colors">Privacy</Link>
                <span>•</span>
                <Link href="/terms" className="hover:text-primary-600 transition-colors">Terms</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
