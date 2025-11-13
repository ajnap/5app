import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { personalizePrompt } from '@/lib/ai'
import { captureError } from '@/lib/sentry'

export async function POST(request: Request) {
  try {
    // 1. Authenticate
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse request
    const { promptId, childId } = await request.json()

    if (!promptId || !childId) {
      return NextResponse.json(
        { error: 'Missing promptId or childId' },
        { status: 400 }
      )
    }

    // 3. Fetch prompt and child profile
    const [promptResult, childResult] = await Promise.all([
      supabase.from('daily_prompts').select('*').eq('id', promptId).single(),
      supabase
        .from('child_profiles')
        .select('*')
        .eq('id', childId)
        .eq('user_id', session.user.id)
        .single(),
    ])

    if (promptResult.error || !promptResult.data) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      )
    }

    if (childResult.error || !childResult.data) {
      return NextResponse.json(
        { error: 'Child profile not found' },
        { status: 404 }
      )
    }

    // 4. Personalize with OpenAI
    const baseActivity = promptResult.data.activity
    const personalizedText = await personalizePrompt(
      baseActivity,
      childResult.data
    )

    return NextResponse.json({
      original: baseActivity,
      personalized: personalizedText,
      childName: childResult.data.name,
    })
  } catch (error: any) {
    console.error('Personalize prompt error:', error)
    captureError(error, {
      tags: { component: 'personalize-prompt-api' },
    })

    return NextResponse.json(
      { error: 'Failed to personalize prompt' },
      { status: 500 }
    )
  }
}
