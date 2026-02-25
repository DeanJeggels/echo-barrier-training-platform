'use client'

import Image from 'next/image'

interface ElevenLabsAgentCardProps {
  userEmail: string
}

export default function ElevenLabsAgentCard({ userEmail }: ElevenLabsAgentCardProps) {
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID!
  const signature = process.env.NEXT_PUBLIC_ELEVENLABS_CONVERSATION_SIGNATURE!

  const agentUrl =
    `https://elevenlabs.io/app/talk-to` +
    `?agent_id=${agentId}` +
    `&conversation_signature=${signature}` +
    `&var_hubspot_email=${encodeURIComponent(userEmail)}`

  const qrUrl =
    `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=10&data=${encodeURIComponent(agentUrl)}`

  return (
    <div
      style={{
        background: '#ffffff',
        padding: '25px',
        borderRadius: '16px',
        textAlign: 'center',
        width: '100%',
        boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
      }}
    >
      {/* QR Code Section */}
      <div style={{ textAlign: 'center', width: '100%' }}>
        <Image
          src={qrUrl}
          alt="Scan to Chat"
          width={160}
          height={160}
          style={{
            display: 'block',
            margin: '0 auto',
            border: '1px solid #ddd',
            borderRadius: '8px',
          }}
          unoptimized
        />
        <p
          style={{
            marginTop: '12px',
            marginBottom: 0,
            color: '#888',
            fontSize: '13px',
            fontWeight: 500,
            fontFamily: 'Roboto, sans-serif',
          }}
        >
          Scan to chat on mobile
        </p>
      </div>

      {/* Divider */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '15px 0',
        }}
      >
        <div style={{ flex: 1, borderTop: '1px solid #eee' }} />
        <span
          style={{
            padding: '0 10px',
            color: '#ccc',
            fontSize: '11px',
            fontWeight: 'bold',
            fontFamily: 'Roboto, sans-serif',
            background: '#fff',
          }}
        >
          OR
        </span>
        <div style={{ flex: 1, borderTop: '1px solid #eee' }} />
      </div>

      {/* Desktop Link Section */}
      <div style={{ textAlign: 'center' }}>
        <h3
          style={{
            margin: '0 0 6px 0',
            color: '#000',
            fontSize: '20px',
            fontFamily: 'Roboto, sans-serif',
          }}
        >
          Talk with our AI Sales Training Agent
        </h3>
        <p
          style={{
            marginBottom: '18px',
            color: '#666',
            fontSize: '14px',
            fontFamily: 'Roboto, sans-serif',
          }}
        >
          Feel free to ask any Echo Barrier related questions about sales,
          product specifications, local noise ordinance laws, and sales
          techniques.
        </p>
        <a
          href={agentUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            backgroundColor: '#FF7026',
            color: '#ffffff',
            padding: '12px 28px',
            borderRadius: '30px',
            fontWeight: 'bold',
            fontSize: '16px',
            fontFamily: 'Roboto, sans-serif',
            textDecoration: 'none',
            boxShadow: '0 4px 15px rgba(255, 112, 38, 0.3)',
          }}
        >
          Start Conversation
        </a>
      </div>
    </div>
  )
}
