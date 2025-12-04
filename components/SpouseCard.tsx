interface SpouseCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}

export default function SpouseCard({ title, subtitle, children, className = '' }: SpouseCardProps) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 ${className}`}>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}
