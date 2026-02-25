'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      style={{
        background: 'transparent',
        border: '1px solid #e5e5e5',
        color: '#666',
        fontFamily: 'Roboto, sans-serif',
        padding: '10px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 500,
        whiteSpace: 'nowrap',
      }}
    >
      Sign Out
    </button>
  )
}
