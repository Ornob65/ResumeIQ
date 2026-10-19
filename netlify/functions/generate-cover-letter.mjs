import { config } from 'dotenv'

config({ path: '.env.local' })

const headers = {
  'Content-Type': 'application/json',
}

function invalidRequest(message) {
  return new Response(JSON.stringify({ error: message }), { status: 400, headers })
}

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed.' }), { status: 405, headers })
  }

  if (!process.env.GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured.' }), { status: 500, headers })
  }

  const geminiApiKey = process.env.GEMINI_API_KEY.trim()

  try {
    const data = await request.json()
    const candidateName = data.candidateName?.trim()
    const role = data.role?.trim()
    const company = data.company?.trim()
    const jobDescription = data.jobDescription?.trim()
    const tone = data.tone?.trim() || 'Professional'
    const length = data.length?.trim() || 'Medium'

    if (!candidateName || !role || !company || !jobDescription) {
      return invalidRequest('Candidate name, target role, company, and job description are required.')
    }

    const prompt = `Write a ${length.toLowerCase()} cover letter for ${candidateName}, applying for the ${role} position at ${company}. Use a ${tone.toLowerCase()} tone. Tailor it to this job description:

${jobDescription}

Return only valid JSON with this exact shape: {"content":"..."}. The letter must be polished, specific to the job description, free of markdown, and must not invent employers, credentials, dates, or achievements that were not provided. Use paragraph breaks with newline characters.`

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': geminiApiKey,
        },
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
    if (!text) throw new Error('Gemini returned no cover letter.')

    const cleanedText = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()
    const parsed = JSON.parse(cleanedText)
    if (typeof parsed.content !== 'string' || !parsed.content.trim()) {
      throw new Error('Gemini returned an invalid cover letter format.')
    }

    return new Response(JSON.stringify({ content: parsed.content.trim() }), { status: 200, headers })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Unable to generate cover letter.' }), {
      status: 500,
      headers,
    })
  }
}
