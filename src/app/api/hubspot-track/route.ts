import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  // Verify authenticated session
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { email, milestone, percentage } = await request.json()
  if (!email || !milestone) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const hubspotToken = process.env.HUBSPOT_PRIVATE_APP_TOKEN
  if (!hubspotToken) {
    return NextResponse.json({ ok: false, reason: 'HubSpot not configured' })
  }

  try {
    // 1. Find the HubSpot contact by email
    const searchRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${hubspotToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: email }] }],
        properties: ['id', 'email'],
        limit: 1,
      }),
    })

    const searchData = await searchRes.json()
    const contactId = searchData.results?.[0]?.id

    if (!contactId) {
      // Not a tracked contact — silently succeed so the video still works
      return NextResponse.json({ ok: true, tracked: false })
    }

    // 2. Create a note on the contact
    const noteBody =
      milestone === 'started'
        ? `▶ Started watching the Echo Barrier Sales Training video.`
        : milestone === 'completed'
        ? `✅ Completed the Echo Barrier Sales Training video (watched 100%).`
        : `📺 Reached ${percentage}% of the Echo Barrier Sales Training video.`

    await fetch('https://api.hubapi.com/crm/v3/objects/notes', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${hubspotToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          hs_note_body: noteBody,
          hs_timestamp: new Date().toISOString(),
        },
        associations: [
          {
            to: { id: contactId },
            types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 202 }],
          },
        ],
      }),
    })

    return NextResponse.json({ ok: true, tracked: true })
  } catch (err) {
    console.error('HubSpot tracking error:', err)
    // Never fail the client — tracking is best-effort
    return NextResponse.json({ ok: true, tracked: false })
  }
}
