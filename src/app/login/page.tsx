'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Pre-fill email if redirected from registration (already-registered case)
  useEffect(() => {
    const hint = searchParams.get('hint')
    if (hint) setEmail(decodeURIComponent(hint))
  }, [searchParams])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-10 py-5 border-b border-gray-100">
        <Image
          src="/logo.png"
          alt="Echo Barrier"
          width={200}
          height={50}
          className="h-12 w-auto object-contain"
          priority
        />
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
            <div className="text-center mb-8">
              <Image
                src="/logo.png"
                alt="Echo Barrier"
                width={180}
                height={45}
                className="h-10 w-auto object-contain mx-auto mb-6"
              />
              <h1 className="text-2xl font-bold text-black">Sign In</h1>
              <p className="text-gray-500 text-sm mt-2">
                Access your Echo Barrier training portal
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@yourcompany.com"
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7026] focus:border-transparent disabled:opacity-50"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7026] focus:border-transparent disabled:opacity-50"
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
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Don&apos;t have an account?{' '}
              <a href="/" className="text-[#FF7026] hover:underline font-medium">
                Request access
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
