import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard'

  const supabase = await createClient()

  // PKCE flow (most common with @supabase/ssr)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // If it's an invite, go to set-password; otherwise go to next or dashboard
      const destination = type === 'invite' ? '/set-password' : next
      return NextResponse.redirect(new URL(destination, origin))
    }
  }

  // OTP / magic link flow
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'invite' | 'magiclink' | 'recovery' | 'email',
    })
    if (!error) {
      const destination = type === 'invite' ? '/set-password' : next
      return NextResponse.redirect(new URL(destination, origin))
    }
  }

  // Auth failed — redirect to login with error
  return NextResponse.redirect(new URL('/login?error=auth_failed', origin))
}
