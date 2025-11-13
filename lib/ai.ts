import OpenAI from 'openai'

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

/**
 * Personalizes a daily prompt based on child profile data
 * @param basePrompt - The original prompt text
 * @param childProfile - Complete child profile with all context
 * @returns Personalized prompt text
 */
export async function personalizePrompt(
  basePrompt: string,
  childProfile: any
): Promise<string> {
  try {
    // Build rich context from child profile
    const context = buildChildContext(childProfile)

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a parenting expert specializing in brief, meaningful connection moments grounded in research and faith-centered family values.

CORE PHILOSOPHY:
- Small moments create lasting bonds (quality over quantity)
- 5 minutes of focused connection > hours of divided attention
- Connection strengthens the parent-child relationship and builds eternal family bonds

RESEARCH-BACKED PRINCIPLES:
- Emotional attunement: Notice and validate feelings
- Child-led interaction: Follow their interests and passions
- Positive presence: Be fully present without distractions
- Consistent micro-connections build secure attachment
- Shared joy strengthens relationships

FAITH-CENTERED VALUES:
- Recognizing each child's divine nature and potential
- Building on individual strengths and gifts
- Nurturing with patience and long-suffering
- Creating moments that matter for eternity
- Teaching through love and example

APPROACH:
- Keep activities simple and doable (5 minutes max)
- Focus on connection, not perfection
- Honor each child's unique personality and needs
- Make ordinary moments sacred
- Build on what already works for this family

Be creative, warm, and vary your suggestions. Each personalization should feel fresh and uniquely suited to this child.`,
        },
        {
          role: 'user',
          content: `ORIGINAL ACTIVITY PROMPT:
"${basePrompt}"

CHILD CONTEXT:
${context}

TASK: Rewrite this activity prompt to be highly personalized for this specific child. Make it feel like it was written just for them by incorporating:
- Their specific interests, strengths, and personality
- Age-appropriate language and complexity
- What motivates them and what they love
- Their learning style and preferences
- Current focus areas the parent wants to work on

REQUIREMENTS:
- Keep the core activity concept the same
- Make it warm, encouraging, and specific to this child
- Length: 2-3 sentences maximum
- Don't use the child's name in the prompt itself
- Focus on what will resonate with THIS child specifically
- Be creative and vary your wording - avoid repetitive phrases
- Each personalization should feel fresh and unique

Respond with ONLY the personalized prompt text, nothing else.`,
        },
      ],
      temperature: 0.9,
      max_tokens: 150,
    })

    const personalizedText = completion.choices[0]?.message?.content?.trim() || basePrompt

    // Validate we got a different response
    if (personalizedText === basePrompt || !personalizedText) {
      console.warn('AI returned same text or empty, using original')
      return basePrompt
    }

    return personalizedText
  } catch (error: any) {
    console.error('AI personalization error:', error.message)
    // Fallback to original prompt if AI fails
    return basePrompt
  }
}

/**
 * Builds a rich context string from child profile
 */
function buildChildContext(child: any): string {
  const age = calculateAge(child.birth_date)
  const sections = []

  sections.push(`Name: ${child.name}`)
  sections.push(`Age: ${age} years old`)

  if (child.interests?.length > 0) {
    sections.push(`Interests: ${child.interests.join(', ')}`)
  }

  if (child.personality_traits?.length > 0) {
    sections.push(`Personality: ${child.personality_traits.join(', ')}`)
  }

  if (child.strengths?.length > 0) {
    sections.push(`Strengths: ${child.strengths.join(', ')}`)
  }

  if (child.challenges_weaknesses?.length > 0) {
    sections.push(`Challenges: ${child.challenges_weaknesses.join(', ')}`)
  }

  if (child.communication_style?.length > 0) {
    sections.push(`Best receives love through: ${child.communication_style.join(', ')}`)
  }

  if (child.learning_style) {
    sections.push(`Learning style: ${child.learning_style}`)
  }

  if (child.favorite_activities?.length > 0) {
    sections.push(`Loves doing: ${child.favorite_activities.join(', ')}`)
  }

  if (child.motivators?.length > 0) {
    sections.push(`Motivated by: ${child.motivators.join(', ')}`)
  }

  if (child.best_time_of_day) {
    sections.push(`Most engaged: ${child.best_time_of_day}`)
  }

  if (child.current_focus_areas?.length > 0) {
    sections.push(`Parent wants to work on: ${child.current_focus_areas.join(', ')}`)
  }

  if (child.connection_insights) {
    sections.push(`Connection notes: ${child.connection_insights}`)
  }

  if (child.developmental_goals?.length > 0) {
    sections.push(`Development goals: ${child.developmental_goals.join(', ')}`)
  }

  if (child.social_preferences) {
    sections.push(`Social: ${child.social_preferences}`)
  }

  if (child.sensory_preferences) {
    sections.push(`Sensory: ${child.sensory_preferences}`)
  }

  if (child.triggers_stressors?.length > 0) {
    sections.push(`Avoid/Be mindful of: ${child.triggers_stressors.join(', ')}`)
  }

  if (child.special_considerations) {
    sections.push(`Important context: ${child.special_considerations}`)
  }

  return sections.join('\n')
}

/**
 * Calculate age from birth date
 */
function calculateAge(birthDate: string): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}
