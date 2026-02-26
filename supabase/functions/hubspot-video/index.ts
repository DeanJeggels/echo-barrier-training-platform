import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Verify caller is an authenticated Supabase user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Fetch video file from HubSpot Files API v3
    const hubspotToken = Deno.env.get('HUBSPOT_PRIVATE_APP_TOKEN')
    const fileId = Deno.env.get('HUBSPOT_VIDEO_ID') ?? '206352108644'

    if (!hubspotToken) {
      return new Response(
        JSON.stringify({ error: 'HubSpot token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const hubspotRes = await fetch(
      `https://api.hubapi.com/files/v3/files/${fileId}`,
      {
        headers: { 'Authorization': `Bearer ${hubspotToken}` },
      }
    )

    if (!hubspotRes.ok) {
      const errText = await hubspotRes.text()
      console.error('HubSpot Files API error:', hubspotRes.status, errText)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch video from HubSpot', details: errText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const fileData = await hubspotRes.json()
    const videoUrl = fileData.defaultHostingUrl ?? fileData.url

    if (!videoUrl) {
      return new Response(
        JSON.stringify({ error: 'Video URL not available' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Return only what the frontend needs
    return new Response(
      JSON.stringify({
        id: fileData.id,
        name: fileData.name ?? 'US Sales Reps Introduction',
        url: videoUrl,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (err) {
    console.error('Unhandled error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
