'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [message, setMessage] = useState('Verifying your invite link...')

  useEffect(() => {
    async function handleCallback() {
      const supabase = createClient()

      // Read hash fragment (never sent to server, must be handled client-side)
      const hash = window.location.hash.substring(1)
      const hashParams = new URLSearchParams(hash)

      // Check for errors in hash or query params
      const errorCode =
        hashParams.get('error_code') || searchParams.get('error_code')
      const hasError =
        hashParams.get('error') || searchParams.get('error')

      if (hasError) {
        if (errorCode === 'otp_expired') {
          router.push('/login?error=invite_expired')
        } else {
          router.push('/login?error=auth_failed')
        }
        return
      }

      // PKCE flow — code in query params
      const code = searchParams.get('code')
      const type = searchParams.get('type')

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
          router.push(type === 'invite' ? '/set-password' : (searchParams.get('next') ?? '/dashboard'))
          return
        }
        router.push('/login?error=auth_failed')
        return
      }

      // OTP flow — token_hash in query params
      const token_hash = searchParams.get('token_hash')
      const tokenType = searchParams.get('type') as 'invite' | 'magiclink' | 'recovery' | 'email'

      if (token_hash && tokenType) {
        const { error } = await supabase.auth.verifyOtp({ token_hash, type: tokenType })
        if (!error) {
          router.push(tokenType === 'invite' ? '/set-password' : (searchParams.get('next') ?? '/dashboard'))
          return
        }
        router.push('/login?error=auth_failed')
        return
      }

      // Implicit flow — access_token in hash fragment
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      const hashType = hashParams.get('type')

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        if (!error) {
          router.push(hashType === 'invite' ? '/set-password' : '/dashboard')
          return
        }
        router.push('/login?error=auth_failed')
        return
      }

      // No recognisable params — check if a session was already established
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard')
        return
      }

      router.push('/login?error=auth_failed')
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  )
}
