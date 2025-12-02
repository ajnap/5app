import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const runtime = 'edge'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Create Supabase client
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

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get or create session
    let currentSessionId = sessionId
    if (!currentSessionId) {
      const { data: newSession, error: sessionError } = await supabase
        .from('assistant_sessions')
        .insert({
          user_id: userId,
          title: message.substring(0, 50), // First 50 chars as title
        })
        .select()
        .single()

      if (sessionError || !newSession) {
        console.error('Error creating session:', sessionError)
        return NextResponse.json(
          { error: 'Failed to create chat session' },
          { status: 500 }
        )
      }

      currentSessionId = newSession.id
    }

    // Get user's children data for context
    const { data: children } = await supabase
      .from('child_profiles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    // Get recent activities for additional context
    const { data: recentActivities } = await supabase
      .from('prompt_completions')
      .select(`
        *,
        prompt:daily_prompts(title, category, description),
        child:child_profiles(name)
      `)
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(10)

    // Get chat history
    const { data: chatHistory } = await supabase
      .from('assistant_messages')
      .select('role, content')
      .eq('session_id', currentSessionId)
      .order('created_at', { ascending: true })
      .limit(20)

    // Build context about children
    const childrenContext = children
      ?.map((child) => {
        const age = Math.floor(
          (Date.now() - new Date(child.birth_date).getTime()) /
            (365.25 * 24 * 60 * 60 * 1000)
        )
        return `- ${child.name}, age ${age}${
          child.interests ? `, interests: ${child.interests}` : ''
        }${child.challenges ? `, challenges: ${child.challenges}` : ''}`
      })
      .join('\n')

    // Build recent activities context
    const activitiesContext = recentActivities
      ?.slice(0, 5)
      .map((activity: any) => {
        const childName = activity.child?.name || 'Unknown'
        const promptTitle = activity.prompt?.title || 'Activity'
        const category = activity.prompt?.category || ''
        return `- ${childName}: ${promptTitle} (${category})`
      })
      .join('\n')

    // System prompt with child context
    const systemPrompt = `You are a warm, supportive parenting assistant for "The Next 5 Minutes" app - a tool that helps parents build stronger connections with their children through short, meaningful activities.

Your role is to:
- Provide practical, evidence-based parenting advice
- Suggest specific 5-minute connection activities tailored to each child
- Be encouraging and non-judgmental
- Consider each child's age, interests, and challenges
- Reference their recent activities when relevant

The parent you're helping has ${children?.length || 0} ${
      children?.length === 1 ? 'child' : 'children'
    }:
${childrenContext || 'No children added yet.'}

Recent activities completed:
${activitiesContext || 'No recent activities.'}

Keep responses concise (2-3 paragraphs max), actionable, and focused on quick connection moments. Use a friendly, conversational tone.`

    // Prepare messages for OpenAI
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...(chatHistory || []),
      { role: 'user', content: message },
    ]

    // Save user message
    await supabase.from('assistant_messages').insert({
      session_id: currentSessionId,
      user_id: userId,
      role: 'user',
      content: message,
    })

    // Call OpenAI with streaming
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Cost-effective model
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 500,
    })

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        let fullResponse = ''

        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              fullResponse += content
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
            }
          }

          // Save assistant message
          await supabase.from('assistant_messages').insert({
            session_id: currentSessionId,
            user_id: userId,
            role: 'assistant',
            content: fullResponse,
          })

          // Send session ID in final chunk
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ done: true, sessionId: currentSessionId })}\n\n`
            )
          )
          controller.close()
        } catch (error) {
          console.error('Streaming error:', error)
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Assistant API error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
