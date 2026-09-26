import { config } from 'dotenv'

config({ path: '.env.local' })

const headers = {
  'Content-Type': 'application/json',
}
const MAX_FILE_BYTES = 8 * 1024 * 1024
const MAX_JOB_DESCRIPTION_LENGTH = 30000

function response(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers })
}

function cleanJson(text) {
  return text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()
}

export default async function handler(request) {
  if (request.method !== 'POST') return response({ error: 'Method not allowed.' }, 405)
  if (!process.env.GEMINI_API_KEY) return response({ error: 'GEMINI_API_KEY is not configured.' }, 500)

  try {
    const { fileName, fileData, jobDescription } = await request.json()
    if (!fileName?.toLowerCase().endsWith('.pdf') || typeof fileData !== 'string') {
      return response({ error: 'A PDF resume is required.' }, 400)
    }
    if (!jobDescription?.trim()) return response({ error: 'A job description is required.' }, 400)

    const fileBuffer = Buffer.from(fileData, 'base64')
    if (!fileBuffer.length || fileBuffer.length > MAX_FILE_BYTES) {
      return response({ error: 'The PDF must be smaller than 8 MB.' }, 400)
    }
    if (jobDescription.length > MAX_JOB_DESCRIPTION_LENGTH) {
      return response({ error: 'The job description is too long.' }, 400)
    }

    const prompt = `You are an ATS resume evaluator. Review the attached PDF resume against the target job description.
Use practical industry-standard ATS criteria: machine-readable structure, standard section headings, contact details, chronology, role-relevant skills, keyword alignment, measurable achievements, clarity, consistency, and professional formatting.
Do not score or mention protected characteristics. Do not invent resume facts. Give a fair, explainable assessment.
Return only valid JSON with exactly this shape:
{
  "score": 0,
  "summary": "One concise assessment.",
  "breakdown": {
    "keywordMatch": 0,
    "skillsMatch": 0,
    "experienceRelevance": 0,
    "formatting": 0,
    "sectionCompleteness": 0
  },
  "strengths": ["..."],
  "recommendations": ["..."],
  "missingKeywords": ["..."]
}
All scores must be integers from 0 to 100. The overall score should reflect the breakdown and job match. Keep each list to at most 6 useful items.

Target job description:
${jobDescription.trim()}`

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inlineData: { mimeType: 'application/pdf', data: fileData } },
              { text: prompt },
            ],
          }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
        }),
      },
    )

    if (!geminiResponse.ok) {
      const message = await geminiResponse.text()
      return response({ error: `Gemini request failed: ${message}` }, geminiResponse.status)
    }

    const result = await geminiResponse.json()
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) throw new Error('Gemini returned no ATS assessment.')

    const parsed = JSON.parse(cleanJson(text))
    if (typeof parsed.score !== 'number' || !parsed.breakdown || !Array.isArray(parsed.recommendations)) {
      throw new Error('Gemini returned an invalid ATS assessment.')
    }

    return response(parsed)
  } catch (error) {
    return response({ error: error.message || 'Unable to score this resume.' }, 500)
  }
}
