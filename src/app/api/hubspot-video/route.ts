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
  const fileId = process.env.HUBSPOT_VIDEO_ID ?? '206352108644'

  if (!hubspotToken) {
    return NextResponse.json({ error: 'HubSpot token not configured' }, { status: 500 })
  }

  // Use the Files API v3 — returns a direct hostable URL for the video file
  const fileRes = await fetch(
    `https://api.hubapi.com/files/v3/files/${fileId}`,
    {
      headers: { Authorization: `Bearer ${hubspotToken}` },
      next: { revalidate: 3600 },
    }
  )

  if (!fileRes.ok) {
    const errText = await fileRes.text()
    console.error('HubSpot Files API error:', fileRes.status, errText)
    return NextResponse.json({ error: 'Failed to fetch video from HubSpot' }, { status: 502 })
  }

  const fileData = await fileRes.json()
  const videoUrl = fileData.defaultHostingUrl ?? fileData.url

  if (!videoUrl) {
    return NextResponse.json({ error: 'Video URL not available' }, { status: 502 })
  }

  return NextResponse.json({
    id: fileData.id,
    name: fileData.name ?? 'US Sales Reps Introduction',
    url: videoUrl,
  })
}
