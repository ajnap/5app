'use client'

import { useRouter } from 'next/navigation'

export default function AddChildButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push('/children/new')}
      className="btn-primary-lg group"
    >
      <svg
        className="w-5 h-5 transition-transform group-hover:rotate-90"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
      </svg>
      Add Child
    </button>
  )
}
