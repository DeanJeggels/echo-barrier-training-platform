'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export default function SetPasswordPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSetPassword(e: { preventDefault(): void }) {
    e.preventDefault()
    setError('')

    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your first and last name.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    // Get user info then call profile completion webhook (fire and forget)
    const { data: { user } } = await supabase.auth.getUser()
    const profileWebhook = process.env.NEXT_PUBLIC_N8N_PROFILE_WEBHOOK
    if (user?.email && profileWebhook) {
      fetch(profileWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          user_id: user.id,
        }),
      }).catch(() => {})
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-10 py-5 border-b border-gray-100">
        <Image
          src="/logo.jpg"
          alt="Echo Barrier"
          width={200}
          height={50}
          className="h-16 w-auto object-contain"
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
                src="/logo.jpg"
                alt="Echo Barrier"
                width={180}
                height={45}
                className="h-14 w-auto object-contain mx-auto mb-6"
              />
              <h1 className="text-2xl font-bold text-black">
                Complete Your Profile
              </h1>
              <p className="text-gray-500 text-sm mt-2">
                Set up your account to access your training portal
              </p>
            </div>

            <form onSubmit={handleSetPassword} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jane"
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7026] focus:border-transparent disabled:opacity-50"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Smith"
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7026] focus:border-transparent disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  required
                  minLength={8}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7026] focus:border-transparent disabled:opacity-50"
                />
              </div>

              <div>
                <label
                  htmlFor="confirm"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm Password
                </label>
                <input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter your password"
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
                {loading ? 'Setting up your account...' : 'Complete Setup'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
