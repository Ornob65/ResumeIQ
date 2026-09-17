import { config } from 'dotenv'

config({ path: '.env.local' })

const headers = {
  'Content-Type': 'application/json',
}

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed.' }), {
      status: 405,
      headers,
    })
  }

  if (!process.env.GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured.' }), {
      status: 500,
      headers,
    })
  }

  try {
    const { jobTitle } = await request.json()
    const role = jobTitle?.trim() || 'the target role'
    const prompt = `Create three professional resume summaries for a candidate applying for ${role}. Return only valid JSON with this exact shape: {"suggestions":[{"level":"Fresher","text":"..."},{"level":"Mid-level","text":"..."},{"level":"Experienced","text":"..."}]}. Each summary should be 2-3 sentences, specific to ${role}, and contain no markdown.`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      },
    )

    if (!response.ok) {
      const message = await response.text()
      return new Response(JSON.stringify({ error: `Gemini request failed: ${message}` }), {
        status: response.status,
        headers,
      })
    }

    const result = await response.json()
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) throw new Error('Gemini returned no suggestions.')

    const cleanedText = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()
    const parsed = JSON.parse(cleanedText)
    if (!Array.isArray(parsed.suggestions)) throw new Error('Gemini returned an invalid suggestions format.')
    return new Response(JSON.stringify(parsed), { status: 200, headers })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Unable to generate summaries.' }), {
      status: 500,
      headers,
    })
  }
}
