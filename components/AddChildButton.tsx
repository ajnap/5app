'use client'

import { useRouter } from 'next/navigation'

export default function AddChildButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push('/children/new')}
      className="inline-flex items-center gap-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
    >
      <span className="text-2xl">+</span>
      Add Child
    </button>
  )
}
