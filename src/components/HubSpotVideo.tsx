'use client'

import { useEffect, useRef, useState } from 'react'

interface VideoData {
  url: string
  name?: string
}

interface Props {
  userEmail?: string
}

export default function HubSpotVideo({ userEmail }: Props) {
  const [videoData, setVideoData] = useState<VideoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  // Track which milestones have already been reported this session
  const tracked = useRef<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/hubspot-video')
      .then(r => r.ok ? r.json() : Promise.reject(new Error('Failed to load video')))
      .then(data => setVideoData(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // Fire-and-forget tracking call — never blocks the UI
  function track(milestone: string, percentage?: number) {
    if (!userEmail || tracked.current.has(milestone)) return
    tracked.current.add(milestone)
    fetch('/api/hubspot-track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, milestone, percentage }),
    }).catch(() => {})
  }

  function handlePlay() {
    track('started')
  }

  function handleTimeUpdate() {
    const el = videoRef.current
    if (!el || !el.duration) return
    const pct = Math.floor((el.currentTime / el.duration) * 100)
    if (pct >= 50 && !tracked.current.has('50%')) track('50%', 50)
    if (pct >= 75 && !tracked.current.has('75%')) track('75%', 75)
  }

  function handleEnded() {
    track('completed', 100)
  }

  if (loading) {
    return (
      <div style={{ width: '100%', aspectRatio: '16/9', background: '#f5f5f5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #FF7026', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (error || !videoData?.url) {
    return (
      <div style={{ width: '100%', aspectRatio: '16/9', background: '#1a1a2e', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#FF7026" strokeWidth="1.5">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
        <p style={{ marginTop: '12px', fontSize: '14px', color: '#aaa' }}>US Sales Reps — Introduction</p>
        <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{error || 'Video unavailable'}</p>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden', background: '#000' }}>
      <video
        ref={videoRef}
        src={videoData.url}
        controls
        controlsList="nodownload"
        onPlay={handlePlay}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        style={{ width: '100%', height: '100%', display: 'block' }}
        title={videoData.name ?? 'US Sales Reps Introduction'}
      />
    </div>
  )
}
