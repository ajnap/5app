import Link from 'next/link'

// Playful character illustrations (SVG components) - Family of friendly shapes
function CharacterGroup() {
  return (
    <div className="flex items-end justify-center gap-3 md:gap-5">
      {/* Blue triangle character - curious explorer */}
      <div className="w-14 h-18 md:w-18 md:h-24 relative animate-bounce-gentle" style={{ animationDelay: '0s' }}>
        <svg viewBox="0 0 60 80" className="w-full h-full drop-shadow-lg">
          {/* Body */}
          <path d="M30 8 L54 65 L6 65 Z" fill="#818CF8" />
          <path d="M30 8 L54 65 L6 65 Z" fill="url(#triangleGradient)" />
          {/* Face highlight */}
          <path d="M30 20 L42 50 L18 50 Z" fill="#A5B4FC" opacity="0.4" />
          {/* Eyes */}
          <ellipse cx="22" cy="42" rx="5" ry="5.5" fill="white" />
          <ellipse cx="38" cy="42" rx="5" ry="5.5" fill="white" />
          <circle cx="23" cy="43" r="2.5" fill="#1E293B" />
          <circle cx="39" cy="43" r="2.5" fill="#1E293B" />
          {/* Eye sparkles */}
          <circle cx="24.5" cy="41.5" r="1" fill="white" />
          <circle cx="40.5" cy="41.5" r="1" fill="white" />
          {/* Rosy cheeks */}
          <circle cx="16" cy="48" r="4" fill="#FDA4AF" opacity="0.6" />
          <circle cx="44" cy="48" r="4" fill="#FDA4AF" opacity="0.6" />
          {/* Happy smile */}
          <path d="M24 52 Q30 58 36 52" stroke="#1E293B" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Little feet */}
          <ellipse cx="22" cy="68" rx="6" ry="3" fill="#6366F1" />
          <ellipse cx="38" cy="68" rx="6" ry="3" fill="#6366F1" />
          <defs>
            <linearGradient id="triangleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A5B4FC" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Green blob character - the hugger */}
      <div className="w-16 h-18 md:w-20 md:h-24 relative animate-bounce-gentle" style={{ animationDelay: '0.15s' }}>
        <svg viewBox="0 0 70 80" className="w-full h-full drop-shadow-lg">
          {/* Body blob */}
          <ellipse cx="35" cy="42" rx="28" ry="30" fill="#4ADE80" />
          <ellipse cx="35" cy="42" rx="28" ry="30" fill="url(#blobGradient)" />
          {/* Highlight */}
          <ellipse cx="28" cy="32" rx="12" ry="10" fill="#86EFAC" opacity="0.5" />
          {/* Eyes */}
          <ellipse cx="25" cy="38" rx="5.5" ry="6" fill="white" />
          <ellipse cx="45" cy="38" rx="5.5" ry="6" fill="white" />
          <circle cx="26" cy="39" r="3" fill="#1E293B" />
          <circle cx="46" cy="39" r="3" fill="#1E293B" />
          {/* Eye sparkles */}
          <circle cx="27.5" cy="37" r="1.2" fill="white" />
          <circle cx="47.5" cy="37" r="1.2" fill="white" />
          {/* Rosy cheeks */}
          <circle cx="17" cy="46" r="5" fill="#FCA5A5" opacity="0.5" />
          <circle cx="53" cy="46" r="5" fill="#FCA5A5" opacity="0.5" />
          {/* Big happy smile */}
          <path d="M25 52 Q35 62 45 52" stroke="#1E293B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Little arms reaching out */}
          <ellipse cx="8" cy="45" rx="6" ry="4" fill="#22C55E" />
          <ellipse cx="62" cy="45" rx="6" ry="4" fill="#22C55E" />
          {/* Feet */}
          <ellipse cx="25" cy="72" rx="7" ry="4" fill="#22C55E" />
          <ellipse cx="45" cy="72" rx="7" ry="4" fill="#22C55E" />
          <defs>
            <linearGradient id="blobGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#86EFAC" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Pink star character - the sparkly one */}
      <div className="w-16 h-20 md:w-20 md:h-26 relative animate-bounce-gentle" style={{ animationDelay: '0.3s' }}>
        <svg viewBox="0 0 80 90" className="w-full h-full drop-shadow-lg">
          {/* Star body with rounded points */}
          <circle cx="40" cy="48" r="24" fill="#F472B6" />
          <circle cx="40" cy="48" r="24" fill="url(#starGradient)" />
          {/* Star points */}
          <ellipse cx="40" cy="16" rx="6" ry="12" fill="#F472B6" />
          <ellipse cx="14" cy="38" rx="12" ry="6" fill="#F472B6" />
          <ellipse cx="66" cy="38" rx="12" ry="6" fill="#F472B6" />
          <ellipse cx="20" cy="68" rx="8" ry="10" fill="#F472B6" />
          <ellipse cx="60" cy="68" rx="8" ry="10" fill="#F472B6" />
          {/* Face highlight */}
          <circle cx="34" cy="40" r="10" fill="#F9A8D4" opacity="0.5" />
          {/* Eyes - slightly closed happy */}
          <ellipse cx="32" cy="44" rx="5" ry="5.5" fill="white" />
          <ellipse cx="48" cy="44" rx="5" ry="5.5" fill="white" />
          <circle cx="33" cy="45" r="2.5" fill="#1E293B" />
          <circle cx="49" cy="45" r="2.5" fill="#1E293B" />
          {/* Eye sparkles */}
          <circle cx="34.5" cy="43" r="1" fill="white" />
          <circle cx="50.5" cy="43" r="1" fill="white" />
          {/* Rosy cheeks */}
          <circle cx="24" cy="52" r="5" fill="#FCA5A5" opacity="0.6" />
          <circle cx="56" cy="52" r="5" fill="#FCA5A5" opacity="0.6" />
          {/* Cute smile */}
          <path d="M34 56 Q40 62 46 56" stroke="#1E293B" strokeWidth="2" fill="none" strokeLinecap="round" />
          <defs>
            <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F9A8D4" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#EC4899" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Orange circle character - main/center, the leader */}
      <div className="w-20 h-22 md:w-26 md:h-30 relative animate-bounce-gentle" style={{ animationDelay: '0.1s' }}>
        <svg viewBox="0 0 80 85" className="w-full h-full drop-shadow-xl">
          {/* Main body */}
          <circle cx="40" cy="40" r="34" fill="#FB923C" />
          <circle cx="40" cy="40" r="34" fill="url(#orangeGradient)" />
          {/* Highlight */}
          <ellipse cx="30" cy="28" rx="14" ry="12" fill="#FDBA74" opacity="0.6" />
          {/* Eyes - big and expressive */}
          <ellipse cx="28" cy="36" rx="7" ry="8" fill="white" />
          <ellipse cx="52" cy="36" rx="7" ry="8" fill="white" />
          <circle cx="30" cy="38" r="4" fill="#1E293B" />
          <circle cx="54" cy="38" r="4" fill="#1E293B" />
          {/* Eye sparkles */}
          <circle cx="32" cy="35" r="1.5" fill="white" />
          <circle cx="56" cy="35" r="1.5" fill="white" />
          {/* Rosy cheeks */}
          <circle cx="18" cy="46" r="6" fill="#FCA5A5" opacity="0.5" />
          <circle cx="62" cy="46" r="6" fill="#FCA5A5" opacity="0.5" />
          {/* Big warm smile */}
          <path d="M28 52 Q40 64 52 52" stroke="#1E293B" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Little feet */}
          <ellipse cx="28" cy="78" rx="8" ry="4" fill="#EA580C" />
          <ellipse cx="52" cy="78" rx="8" ry="4" fill="#EA580C" />
          <defs>
            <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FED7AA" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Small peach character - the little one */}
      <div className="w-12 h-14 md:w-16 md:h-20 relative animate-bounce-gentle" style={{ animationDelay: '0.25s' }}>
        <svg viewBox="0 0 50 60" className="w-full h-full drop-shadow-lg">
          {/* Body */}
          <circle cx="25" cy="28" r="22" fill="#FDBA74" />
          <circle cx="25" cy="28" r="22" fill="url(#peachGradient)" />
          {/* Highlight */}
          <ellipse cx="20" cy="20" rx="8" ry="7" fill="#FED7AA" opacity="0.6" />
          {/* Eyes */}
          <ellipse cx="18" cy="26" rx="4" ry="4.5" fill="white" />
          <ellipse cx="32" cy="26" rx="4" ry="4.5" fill="white" />
          <circle cx="19" cy="27" r="2" fill="#1E293B" />
          <circle cx="33" cy="27" r="2" fill="#1E293B" />
          {/* Eye sparkles */}
          <circle cx="20" cy="25" r="0.8" fill="white" />
          <circle cx="34" cy="25" r="0.8" fill="white" />
          {/* Rosy cheeks */}
          <circle cx="12" cy="32" r="4" fill="#FCA5A5" opacity="0.5" />
          <circle cx="38" cy="32" r="4" fill="#FCA5A5" opacity="0.5" />
          {/* Small smile */}
          <path d="M20 36 Q25 41 30 36" stroke="#1E293B" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          {/* Little feet */}
          <ellipse cx="18" cy="52" rx="5" ry="3" fill="#F97316" />
          <ellipse cx="32" cy="52" rx="5" ry="3" fill="#F97316" />
          <defs>
            <linearGradient id="peachGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FED7AA" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Purple teardrop character - the dreamer */}
      <div className="w-14 h-18 md:w-18 md:h-24 relative animate-bounce-gentle" style={{ animationDelay: '0.4s' }}>
        <svg viewBox="0 0 55 75" className="w-full h-full drop-shadow-lg">
          {/* Teardrop body */}
          <path d="M27.5 8 Q4 42 27.5 68 Q51 42 27.5 8" fill="#A78BFA" />
          <path d="M27.5 8 Q4 42 27.5 68 Q51 42 27.5 8" fill="url(#purpleGradient)" />
          {/* Highlight */}
          <ellipse cx="22" cy="35" rx="8" ry="10" fill="#C4B5FD" opacity="0.5" />
          {/* Eyes */}
          <ellipse cx="20" cy="42" rx="5" ry="5.5" fill="white" />
          <ellipse cx="35" cy="42" rx="5" ry="5.5" fill="white" />
          <circle cx="21" cy="43" r="2.5" fill="#1E293B" />
          <circle cx="36" cy="43" r="2.5" fill="#1E293B" />
          {/* Eye sparkles */}
          <circle cx="22.5" cy="41" r="1" fill="white" />
          <circle cx="37.5" cy="41" r="1" fill="white" />
          {/* Rosy cheeks */}
          <circle cx="13" cy="49" r="4" fill="#FCA5A5" opacity="0.5" />
          <circle cx="42" cy="49" r="4" fill="#FCA5A5" opacity="0.5" />
          {/* Content smile */}
          <path d="M22 54 Q27.5 60 33 54" stroke="#1E293B" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Little feet */}
          <ellipse cx="20" cy="70" rx="5" ry="3" fill="#7C3AED" />
          <ellipse cx="35" cy="70" rx="5" ry="3" fill="#7C3AED" />
          <defs>
            <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#DDD6FE" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
            </linearGradient>
          </defs>
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
            {/* Main headline - properly aligned */}
            <h1 className="font-display text-display-lg md:text-display-xl text-slate-900 mb-6 fade-in-up leading-tight">
              <span className="block">Parent Confidently with</span>
              <span className="gradient-text inline-block">5-Minute</span>
              <span> Connections</span>
            </h1>

            <p className="text-body-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto fade-in-up delay-100">
              The only parenting app you&apos;ll ever need. Daily expert-backed activities,
              personalized to your child&apos;s age and interests. Smarter than every baby book.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 fade-in-up delay-200">
              <Link href="/signup" className="btn-primary-lg group">
                Get started
                <ArrowIcon className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/try" className="btn-secondary group">
                Try it free
                <span className="inline-block transition-transform group-hover:scale-110">✨</span>
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
