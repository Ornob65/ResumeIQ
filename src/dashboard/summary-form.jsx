import React from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useResume } from '@/context/ResumeContext'

function SummaryForm() {
  const { resumeInfo, updateResumeInfo } = useResume()
  const [suggestions, setSuggestions] = React.useState([])
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState('')

  async function generateSuggestions() {
    setIsGenerating(true)
    setErrorMessage('')

    try {
      const response = await fetch('/.netlify/functions/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle: resumeInfo.personal.jobTitle }),
      })
      const responseText = await response.text()
      let result

      try {
        result = responseText ? JSON.parse(responseText) : {}
      } catch {
        throw new Error(`The AI function returned an invalid response (${response.status}).`)
      }

      if (!response.ok) throw new Error(result.error || 'Unable to generate summaries.')
      if (!Array.isArray(result.suggestions)) throw new Error('The AI function returned no suggestions.')
      setSuggestions(result.suggestions ?? [])
    } catch (error) {
      setErrorMessage(error.message || 'Unable to generate summaries.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <section className='space-y-3'>
      <div className='flex items-center justify-between gap-3'>
        <h2 className='text-lg font-semibold text-slate-900'>Summary</h2>
        <Button type='button' variant='outline' onClick={generateSuggestions} disabled={isGenerating}>
          <Sparkles className='size-4' aria-hidden='true' />
          {isGenerating ? 'Generating...' : 'Generate from AI'}
        </Button>
      </div>
      <textarea
        value={resumeInfo.summary}
        onChange={(event) => updateResumeInfo('summary', event.target.value)}
        rows='5'
        placeholder='Write a short professional summary'
        className='w-full rounded-md border border-slate-300 px-3 py-2'
      />
      {errorMessage && <p className='text-sm text-red-600'>{errorMessage}</p>}
      {suggestions.length > 0 && (
        <div className='space-y-2'>
          <p className='text-sm font-medium text-slate-700'>Choose a suggestion</p>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.level}
              type='button'
              onClick={() => updateResumeInfo('summary', suggestion.text)}
              className='w-full rounded-md border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-sky-400 hover:bg-sky-50'
            >
              <span className='block text-sm font-semibold text-slate-900'>{suggestion.level}</span>
              <span className='mt-1 block text-sm leading-5 text-slate-600'>{suggestion.text}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

export default SummaryForm
