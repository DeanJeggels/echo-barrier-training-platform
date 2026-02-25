import { redirect } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import HubSpotVideo from '@/components/HubSpotVideo'
import ElevenLabsAgentCard from '@/components/ElevenLabsAgentCard'
import SignOutButton from '@/components/SignOutButton'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '20px 40px',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        {/* Logo */}
        <div style={{ marginTop: '15px' }}>
          <Image
            src="/logo.jpg"
            alt="Echo Barrier"
            width={340}
            height={65}
            style={{ width: 'auto', maxWidth: '340px', height: 'auto', maxHeight: '65px', objectFit: 'contain' }}
            priority
          />
        </div>

        {/* Right side: Visit button + sign out */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '35px',
          }}
        >
          <a
            href="https://echobarrier.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: '#FF7026',
              color: '#ffffff',
              fontFamily: 'Roboto, sans-serif',
              padding: '12px 30px',
              borderRadius: '4px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '16px',
              display: 'inline-block',
              border: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Visit Echobarrier.com
          </a>
          <SignOutButton />
        </div>
      </header>

      {/* Body */}
      <div
        style={{
          paddingTop: '40px',
          paddingLeft: '40px',
          paddingRight: '40px',
          paddingBottom: '40px',
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '40px',
            width: '100%',
          }}
          className="dashboard-row"
        >
          {/* Video — 60% */}
          <div style={{ flex: '2 1 60%', minWidth: '450px' }}>
            <HubSpotVideo />
          </div>

          {/* Agent Card — 35% */}
          <div style={{ flex: '1 1 35%', minWidth: '300px' }}>
            <ElevenLabsAgentCard userEmail={user.email!} />
          </div>
        </div>
      </div>

      {/* Mobile responsive override */}
      <style>{`
        @media (max-width: 991px) {
          .dashboard-row {
            flex-direction: column !important;
          }
          .dashboard-row > div {
            width: 100% !important;
            min-width: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}
