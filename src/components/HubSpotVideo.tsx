'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface VideoData {
  playerEmbedUrl?: string
  title?: string
}

export default function HubSpotVideo() {
  const [videoData, setVideoData] = useState<VideoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchVideo() {
      try {
        const supabase = createClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          setError('Not authenticated')
          setLoading(false)
          return
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const res = await fetch(`${supabaseUrl}/functions/v1/hubspot-video`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        })

        if (!res.ok) {
          throw new Error('Failed to load video')
        }

        const data = await res.json()
        setVideoData(data)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load video')
      } finally {
        setLoading(false)
      }
    }

    fetchVideo()
  }, [])

  if (loading) {
    return (
      <div
        style={{
          width: '100%',
          aspectRatio: '16/9',
          background: '#f5f5f5',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid #FF7026',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (error || !videoData?.playerEmbedUrl) {
    return (
      <div
        style={{
          width: '100%',
          aspectRatio: '16/9',
          background: '#1a1a2e',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
        }}
      >
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#FF7026" strokeWidth="1.5">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
        <p style={{ marginTop: '12px', fontSize: '14px', color: '#aaa' }}>
          US Sales Reps — Introduction
        </p>
        <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
          {error || 'Video unavailable'}
        </p>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden' }}>
      <iframe
        src={videoData.playerEmbedUrl}
        title={videoData.title ?? 'US Sales Reps Introduction'}
        allow="autoplay; fullscreen"
        allowFullScreen
        style={{ width: '100%', height: '100%', border: 'none' }}
      />
    </div>
  )
}
