import Link from 'next/link'

// Playful character illustrations (SVG components)
function CharacterGroup() {
  return (
    <div className="flex items-end justify-center gap-2 md:gap-4">
      {/* Blue triangle character */}
      <div className="w-12 h-16 md:w-16 md:h-20 relative animate-bounce-gentle" style={{ animationDelay: '0s' }}>
        <svg viewBox="0 0 60 80" className="w-full h-full">
          <path d="M30 5 L55 70 L5 70 Z" fill="#6366F1" />
          <circle cx="22" cy="45" r="4" fill="white" />
          <circle cx="38" cy="45" r="4" fill="white" />
          <circle cx="22" cy="45" r="2" fill="#1E293B" />
          <circle cx="38" cy="45" r="2" fill="#1E293B" />
          <ellipse cx="30" cy="75" rx="8" ry="3" fill="#4F46E5" />
        </svg>
      </div>

      {/* Green blob character */}
      <div className="w-14 h-16 md:w-18 md:h-20 relative animate-bounce-gentle" style={{ animationDelay: '0.2s' }}>
        <svg viewBox="0 0 70 80" className="w-full h-full">
          <ellipse cx="35" cy="45" rx="28" ry="32" fill="#4ADE80" />
          <circle cx="25" cy="40" r="4" fill="white" />
          <circle cx="45" cy="40" r="4" fill="white" />
          <circle cx="25" cy="40" r="2" fill="#1E293B" />
          <circle cx="45" cy="40" r="2" fill="#1E293B" />
          <path d="M28 55 Q35 62 42 55" stroke="#1E293B" strokeWidth="2" fill="none" />
        </svg>
      </div>

      {/* Pink spiky character */}
      <div className="w-14 h-18 md:w-18 md:h-22 relative animate-bounce-gentle" style={{ animationDelay: '0.4s' }}>
        <svg viewBox="0 0 80 90" className="w-full h-full">
          <circle cx="40" cy="50" r="25" fill="#F472B6" />
          <path d="M40 10 L45 30 L35 30 Z" fill="#F472B6" />
          <path d="M15 35 L30 40 L25 50 Z" fill="#F472B6" />
          <path d="M65 35 L50 40 L55 50 Z" fill="#F472B6" />
          <path d="M20 60 L35 55 L30 65 Z" fill="#F472B6" />
          <path d="M60 60 L45 55 L50 65 Z" fill="#F472B6" />
          <circle cx="32" cy="45" r="4" fill="white" />
          <circle cx="48" cy="45" r="4" fill="white" />
          <circle cx="32" cy="45" r="2" fill="#1E293B" />
          <circle cx="48" cy="45" r="2" fill="#1E293B" />
        </svg>
      </div>

      {/* Orange circle character (main/center) */}
      <div className="w-16 h-18 md:w-20 md:h-24 relative animate-bounce-gentle" style={{ animationDelay: '0.1s' }}>
        <svg viewBox="0 0 80 90" className="w-full h-full">
          <circle cx="40" cy="45" r="32" fill="#FB923C" />
          <circle cx="30" cy="40" r="6" fill="white" />
          <circle cx="50" cy="40" r="6" fill="white" />
          <circle cx="30" cy="40" r="3" fill="#1E293B" />
          <circle cx="50" cy="40" r="3" fill="#1E293B" />
          <ellipse cx="40" cy="85" rx="10" ry="4" fill="#EA580C" />
        </svg>
      </div>

      {/* Small orange character */}
      <div className="w-10 h-12 md:w-12 md:h-16 relative animate-bounce-gentle" style={{ animationDelay: '0.3s' }}>
        <svg viewBox="0 0 50 65" className="w-full h-full">
          <circle cx="25" cy="30" r="20" fill="#FDBA74" />
          <circle cx="18" cy="28" r="3" fill="white" />
          <circle cx="32" cy="28" r="3" fill="white" />
          <circle cx="18" cy="28" r="1.5" fill="#1E293B" />
          <circle cx="32" cy="28" r="1.5" fill="#1E293B" />
        </svg>
      </div>

      {/* Purple teardrop character */}
      <div className="w-12 h-16 md:w-14 md:h-20 relative animate-bounce-gentle" style={{ animationDelay: '0.5s' }}>
        <svg viewBox="0 0 55 80" className="w-full h-full">
          <path d="M27.5 10 Q5 45 27.5 70 Q50 45 27.5 10" fill="#A78BFA" />
          <circle cx="20" cy="45" r="4" fill="white" />
          <circle cx="35" cy="45" r="4" fill="white" />
          <circle cx="20" cy="45" r="2" fill="#1E293B" />
          <circle cx="35" cy="45" r="2" fill="#1E293B" />
        </svg>
      </div>
    </div>
  )
}

// Checkmark icon for features
function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-5 h-5 ${className}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  )
}

// Arrow icon
function ArrowIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream-100">
      {/* Announcement Banner */}
      <div className="bg-slate-800 text-white text-center py-2.5 px-4">
        <p className="text-sm font-medium">
          <Link href="/signup" className="underline-animated hover:text-lavender-300 transition-colors">
            Start free for 7 days - No credit card required
          </Link>
        </p>
      </div>

      {/* Navigation */}
      <nav className="container-wide py-5">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">❤️</span>
            <span className="font-display text-xl font-semibold text-lavender-600">
              The Next 5 Minutes
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            <Link href="#features" className="nav-link">Features</Link>
            <Link href="#pricing" className="nav-link">Pricing</Link>
            <Link href="#faq" className="nav-link">FAQ</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/signup" className="nav-link hidden sm:block">Sign In</Link>
            <Link href="/signup" className="btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section pt-8 md:pt-16 overflow-hidden">
        <div className="container-narrow">
          <div className="text-center max-w-4xl mx-auto">
            {/* Main headline */}
            <h1 className="font-display text-display-lg md:text-display-xl text-slate-900 mb-6 fade-in-up">
              Parent Confidently with{' '}
              <span className="gradient-text">5-Minute</span>{' '}
              Connections
            </h1>

            <p className="text-body-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto fade-in-up delay-100">
              The only parenting app you'll ever need. Daily expert-backed activities,
              personalized to your child's age and interests. Smarter than every baby book.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 fade-in-up delay-200">
              <Link href="/signup" className="btn-primary-lg group">
                Get started
                <ArrowIcon className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="#how-it-works" className="btn-secondary">
                Learn more
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center justify-center gap-3 text-slate-500 text-sm fade-in-up delay-300">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lavender-400 to-lavender-600 border-2 border-cream-100" />
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-peach-300 to-peach-500 border-2 border-cream-100" />
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sage-400 to-sage-600 border-2 border-cream-100" />
              </div>
              <span className="font-medium">Join 500+ parents building stronger bonds</span>
            </div>
          </div>

          {/* Character illustrations */}
          <div className="mt-16 fade-in-up delay-400">
            <CharacterGroup />
          </div>
        </div>
      </section>

      {/* Personalized Support Section */}
      <section className="section bg-cream-50" id="how-it-works">
        <div className="container-narrow">
          <div className="text-center mb-12">
            <h2 className="font-display text-display-sm md:text-display-md text-slate-900 mb-4 fade-in-up">
              Parenting isn't one-size-fits-all.<br />
              <span className="text-lavender-500">Your support shouldn't be, either.</span>
            </h2>
            <p className="text-body-lg text-slate-600 max-w-2xl mx-auto fade-in-up delay-100">
              We learn and remember what matters: your child's age, past activities, and what
              works for your family. Support that thinks, adapts, and grows with you.
            </p>
          </div>
        </div>
      </section>

      {/* Superpowers Section */}
      <section className="section bg-lavender-100/50">
        <div className="container-narrow">
          <div className="text-center mb-12">
            <h2 className="font-display text-display-sm md:text-display-md text-slate-900 mb-4">
              What Parenting Superpower<br />Do You Need Today?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {[
              { icon: '🍼', label: 'Navigate the newborn stage', href: '/signup' },
              { icon: '😴', label: 'Get help with naps and sleep', href: '/signup' },
              { icon: '🧩', label: 'Support child development', href: '/signup' },
              { icon: '😤', label: 'Handle toddler tantrums', href: '/signup' },
              { icon: '🥣', label: 'Starting solid foods', href: '/signup' },
              { icon: '📅', label: 'Build a daily routine', href: '/signup' },
            ].map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className="card-interactive flex items-center gap-4 px-6 py-4 fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="font-medium text-slate-800">{item.label}</span>
                <ArrowIcon className="ml-auto text-lavender-400" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section" id="features">
        <div className="container-narrow">
          <div className="text-center mb-16">
            <p className="badge-lavender mb-4 fade-in-up">Designed with Real Parents in Mind</p>
            <h2 className="font-display text-display-sm md:text-display-md text-slate-900 mb-4 fade-in-up delay-100">
              Why The Next 5 Minutes Stands Out
            </h2>
            <p className="text-body-lg text-slate-600 max-w-2xl mx-auto fade-in-up delay-200">
              See how we compare to other parenting resources. It's the
              <strong className="text-slate-800"> one-stop-shop</strong> for all your parenting needs.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="comparison-table fade-in-up delay-300 overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-cream-100">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Feature/Benefit</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-lavender-600">Us</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-slate-400">Google</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-slate-400">Reddit</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-slate-400">ChatGPT</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-slate-400">Books</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Daily Age-Appropriate Activities', us: true, google: false, reddit: false, chatgpt: false, books: true },
                  { feature: 'Expert-Backed, Research-Based', us: true, google: false, reddit: false, chatgpt: false, books: true },
                  { feature: 'Personalized to Your Child', us: true, google: false, reddit: false, chatgpt: false, books: false },
                  { feature: 'Tracks Progress & Habits', us: true, google: false, reddit: false, chatgpt: false, books: false },
                  { feature: 'Takes Just 5 Minutes', us: true, google: false, reddit: false, chatgpt: true, books: false },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-cream-200 last:border-0">
                    <td className="px-6 py-4 font-medium text-slate-700">{row.feature}</td>
                    <td className="px-4 py-4 text-center">
                      {row.us ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-lavender-500 text-white">
                          <CheckIcon className="w-4 h-4" />
                        </span>
                      ) : (
                        <span className="w-6 h-6 rounded-full border-2 border-slate-200 inline-block" />
                      )}
                    </td>
                    {[row.google, row.reddit, row.chatgpt, row.books].map((val, j) => (
                      <td key={j} className="px-4 py-4 text-center">
                        {val ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sage-500 text-white">
                            <CheckIcon className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="w-6 h-6 rounded-full border-2 border-slate-200 inline-block" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-8 fade-in-up delay-400">
            <Link href="/signup" className="btn-primary">
              Join Now — It's Easy
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section bg-cream-50">
        <div className="container-narrow">
          <div className="text-center mb-16">
            <h2 className="font-display text-display-sm md:text-display-md text-slate-900 mb-4">
              Connection Made Simple
            </h2>
            <p className="text-body-lg text-slate-600 max-w-2xl mx-auto">
              Three steps to stronger bonds with your child.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: '👶',
                title: 'Add Your Children',
                description: 'Tell us their ages and interests. We personalize every activity.',
              },
              {
                step: '02',
                icon: '✨',
                title: 'Get Daily Prompts',
                description: 'Receive fun, 5-minute activities designed for meaningful connection.',
              },
              {
                step: '03',
                icon: '📈',
                title: 'Track Your Journey',
                description: 'Watch your streak grow and celebrate milestones together.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="card-elevated text-center fade-in-up"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="text-sm font-bold text-lavender-400 mb-2">{item.step}</div>
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="font-display text-xl font-semibold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="section" id="pricing">
        <div className="container-narrow">
          <div className="text-center mb-12">
            <p className="badge-peach mb-4 fade-in-up">Limited Time Offer</p>
            <h2 className="font-display text-display-sm md:text-display-md text-slate-900 mb-4 fade-in-up delay-100">
              Simple, Transparent Pricing
            </h2>
            <p className="text-body-lg text-slate-600 max-w-xl mx-auto fade-in-up delay-200">
              Start free, upgrade anytime. No hidden fees, cancel whenever you want.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Monthly Plan */}
            <div className="card-elevated fade-in-up delay-300">
              <div className="text-center">
                <h3 className="font-display text-2xl font-semibold text-slate-900 mb-2">Monthly</h3>
                <div className="flex items-baseline justify-center mb-6">
                  <span className="font-display text-5xl font-bold gradient-text">$1</span>
                  <span className="text-slate-500 ml-2">/month</span>
                </div>
                <ul className="space-y-4 mb-8 text-left">
                  {[
                    'Daily connection prompts',
                    'Age-appropriate activities',
                    'Track your progress',
                    'Cancel anytime',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckIcon className="w-5 h-5 text-lavender-500 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="btn-secondary w-full">
                  Start Monthly
                </Link>
              </div>
            </div>

            {/* Annual Plan */}
            <div className="card-elevated relative border-2 border-lavender-300 fade-in-up delay-400">
              <div className="absolute -top-3 right-6 badge-lavender">
                SAVE 17%
              </div>
              <div className="text-center">
                <h3 className="font-display text-2xl font-semibold text-slate-900 mb-2">Annual</h3>
                <div className="flex items-baseline justify-center mb-6">
                  <span className="font-display text-5xl font-bold gradient-text">$10</span>
                  <span className="text-slate-500 ml-2">/year</span>
                </div>
                <ul className="space-y-4 mb-8 text-left">
                  {[
                    'Everything in Monthly',
                    'Save $2 per year',
                    'Priority support',
                    'Early access to features',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckIcon className="w-5 h-5 text-lavender-500 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="btn-primary w-full pulse-glow">
                  Start Annual
                </Link>
              </div>
            </div>
          </div>

          <p className="text-center text-slate-500 text-sm mt-8 fade-in-up delay-500">
            💳 Try free for 7 days. No credit card required.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section bg-cream-50" id="faq">
        <div className="container-narrow">
          <div className="text-center mb-12">
            <h2 className="font-display text-display-sm md:text-display-md text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                q: 'How do I know I can trust this app?',
                a: 'Our activities are grounded in child development research and reviewed by parenting experts. Plus, we learn from your experiences to become more personalized over time.',
              },
              {
                q: "Is my family's data private?",
                a: "Absolutely. We use bank-level encryption and never share your information with third parties. You control what you share, and can delete your data anytime.",
              },
              {
                q: 'What ages does this work for?',
                a: "We support children from newborn to 18 years old. Every activity is automatically tailored to your child's specific age and developmental stage.",
              },
              {
                q: 'What if I have multiple children?',
                a: "Perfect! Add as many children as you'd like. Each gets personalized recommendations, and we help you find activities you can do together.",
              },
            ].map((item, i) => (
              <div key={i} className="faq-card fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                <h3 className="font-display text-lg font-semibold text-slate-900 mb-2">
                  {item.q}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="section bg-lavender-500 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-peach-400 rounded-full blur-3xl" />
        </div>

        <div className="container-narrow relative z-10">
          <div className="text-center">
            <h2 className="font-display text-display-sm md:text-display-md text-white mb-4 fade-in-up">
              We are raising a generation<br />of confident parents.
            </h2>
            <p className="text-lavender-100 text-lg mb-8 max-w-xl mx-auto fade-in-up delay-100">
              Join thousands of parents who've discovered the power of intentional, daily connection.
            </p>
            <Link
              href="/signup"
              className="btn bg-white text-lavender-600 hover:bg-cream-50 hover:-translate-y-0.5 shadow-soft-lg fade-in-up delay-200"
            >
              Get support that gets you
            </Link>
          </div>

          {/* Mini character parade */}
          <div className="mt-12 flex justify-center gap-4 opacity-80 fade-in-up delay-300">
            <CharacterGroup />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-cream-100 py-12">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            {/* Newsletter */}
            <div className="flex-1 max-w-md">
              <p className="text-slate-700 font-medium mb-3">Stay in the loop with our newsletter</p>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email"
                  className="input flex-1"
                />
                <button type="submit" className="btn-primary">
                  Sign up
                </button>
              </form>
            </div>

            {/* Links */}
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link href="#" className="text-slate-600 hover:text-lavender-600 transition-colors">Blog</Link>
              <Link href="#" className="text-slate-600 hover:text-lavender-600 transition-colors">Pricing</Link>
              <Link href="#" className="text-slate-600 hover:text-lavender-600 transition-colors">Privacy Policy</Link>
              <Link href="#" className="text-slate-600 hover:text-lavender-600 transition-colors">Terms of Service</Link>
              <Link href="#" className="text-slate-600 hover:text-lavender-600 transition-colors">Support</Link>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-cream-300 text-center">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} The Next 5 Minutes. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
