'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)

    try {
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_INVITE_WEBHOOK!
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json().catch(() => ({}))

      // 409 = user already has an account — redirect to login
      if (res.status === 409) {
        router.push(`/login?hint=${encodeURIComponent(email)}`)
        return
      }

      if (!res.ok) {
        throw new Error(data?.message || 'Something went wrong. Please try again.')
      }

      router.push(`/check-email?email=${encodeURIComponent(email)}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-10 py-5 border-b border-gray-100">
        <div className="flex items-center">
          
          <Image
            src="/logo.jpg"
            alt="Echo Barrier"
            width={200}
            height={50}
            className="h-12 w-auto object-contain"
            priority
          />
        </div>
        <a
          href="https://echobarrier.com"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#FF7026] hover:bg-black text-white font-bold text-sm px-6 py-3 rounded transition-colors"
        >
          Visit Echobarrier.com
        </a>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] p-10">
            {/* Logo / Title */}
            <div className="text-center mb-8">
              <Image
                src="/logo.jpg"
                alt="Echo Barrier"
                width={180}
                height={45}
                className="h-10 w-auto object-contain mx-auto mb-6"
              />
              <h1 className="text-2xl font-bold text-black">
                Sales Training Access
              </h1>
              <p className="text-gray-500 text-sm mt-2">
                Enter your work email to get access to Echo Barrier&apos;s US Sales Rep training portal.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Work Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@yourcompany.com"
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7026] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF7026] hover:bg-black text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending invite...' : 'Get Access'}
              </button>
            </form>

            {/* Login link */}
            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{' '}
              <a href="/login" className="text-[#FF7026] hover:underline font-medium">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
