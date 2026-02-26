import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  // Validate the caller is an authenticated user (uses cookies — no JWT header needed)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const hubspotToken = process.env.HUBSPOT_PRIVATE_APP_TOKEN
  const videoId = process.env.HUBSPOT_VIDEO_ID ?? '206352108644'

  if (!hubspotToken) {
    return NextResponse.json({ error: 'HubSpot token not configured' }, { status: 500 })
  }

  const hubspotRes = await fetch(
    `https://api.hubapi.com/marketing/v3/videos/${videoId}`,
    {
      headers: {
        Authorization: `Bearer ${hubspotToken}`,
        'Content-Type': 'application/json',
      },
      // Don't cache stale video data
      next: { revalidate: 3600 },
    }
  )

  if (!hubspotRes.ok) {
    const errText = await hubspotRes.text()
    console.error('HubSpot API error:', hubspotRes.status, errText)
    return NextResponse.json({ error: 'Failed to fetch video from HubSpot' }, { status: 502 })
  }

  const videoData = await hubspotRes.json()

  return NextResponse.json({
    id: videoData.id,
    title: videoData.title ?? 'US Sales Reps Introduction',
    playerEmbedUrl: videoData.playerEmbedUrl ?? videoData.player_embed_url,
    streamingUrl: videoData.streamingUrl ?? videoData.streaming_url,
    thumbnailUrl: videoData.thumbnailUrl ?? videoData.thumbnail_url,
  })
}
