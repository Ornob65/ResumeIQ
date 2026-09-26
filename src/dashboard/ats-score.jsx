import React from 'react'
import { FileText, Gauge, LoaderCircle, Upload } from 'lucide-react'
import Header from '../components/custom/header'

const MAX_FILE_SIZE = 8 * 1024 * 1024

function ScoreGauge({ score }) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0))
  const radius = 92
  const circumference = Math.PI * radius
  const dashOffset = circumference - (safeScore / 100) * circumference

  return (
    <div className='relative mx-auto w-full max-w-[280px]' aria-label={`ATS score ${safeScore} out of 100`} role='img'>
      <svg viewBox='0 0 220 125' className='h-auto w-full overflow-visible' aria-hidden='true'>
        <path d='M 18 110 A 92 92 0 0 1 202 110' fill='none' stroke='#dbe4e1' strokeWidth='18' strokeLinecap='round' />
        <path
          d='M 18 110 A 92 92 0 0 1 202 110'
          fill='none'
          stroke='#059669'
          strokeWidth='18'
          strokeLinecap='round'
          pathLength='1'
          strokeDasharray='1'
          strokeDashoffset={dashOffset / circumference}
          className='ats-score-gauge-fill'
        />
      </svg>
      <div className='absolute inset-x-0 bottom-0 text-center'>
        <p className='text-6xl font-bold tracking-tight text-slate-900'>{safeScore}</p>
        <p className='text-sm font-semibold uppercase tracking-[0.18em] text-slate-500'>out of 100</p>
      </div>
    </div>
  )
}

function ScoreBreakdown({ breakdown }) {
  return (
    <div className='grid gap-3 sm:grid-cols-2'>
      {Object.entries(breakdown ?? {}).map(([key, value]) => (
        <div key={key} className='rounded-lg border border-slate-200 bg-white p-4'>
          <div className='flex items-center justify-between gap-3'>
            <span className='text-sm font-medium capitalize text-slate-600'>{key.replace(/([A-Z])/g, ' $1')}</span>
            <strong className='text-lg text-emerald-700'>{value}/100</strong>
          </div>
          <div className='mt-3 h-2 overflow-hidden rounded-full bg-slate-100'>
            <div className='h-full rounded-full bg-emerald-500 transition-all duration-1000' style={{ width: `${Math.max(0, Math.min(100, Number(value) || 0))}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function ResultList({ title, items, tone = 'default' }) {
  if (!Array.isArray(items) || items.length === 0) return null

  const toneClass = tone === 'warning' ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'
  return (
    <section className={`rounded-lg border p-5 ${toneClass}`}>
      <h2 className='font-semibold text-slate-900'>{title}</h2>
      <ul className='mt-3 space-y-2 text-sm leading-6 text-slate-600'>
        {items.map((item, index) => <li key={`${item}-${index}`} className='flex gap-2'><span className='text-emerald-600'>•</span><span>{item}</span></li>)}
      </ul>
    </section>
  )
}

function AtsScore() {
  const [file, setFile] = React.useState(null)
  const [jobDescription, setJobDescription] = React.useState('')
  const [result, setResult] = React.useState(null)
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState('')

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    if (selectedFile.type !== 'application/pdf') {
      setErrorMessage('Please upload a PDF resume.')
      return
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      setErrorMessage('Please upload a PDF smaller than 8 MB.')
      return
    }

    setFile(selectedFile)
    setResult(null)
    setErrorMessage('')
  }

  async function handleAnalyze(event) {
    event.preventDefault()
    if (!file || !jobDescription.trim()) {
      setErrorMessage('Upload a PDF resume and add the job description before analyzing.')
      return
    }

    setIsAnalyzing(true)
    setErrorMessage('')
    setResult(null)

    try {
      const fileData = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result).split(',')[1])
        reader.onerror = () => reject(new Error('Unable to read the PDF.'))
        reader.readAsDataURL(file)
      })

      const response = await fetch('/.netlify/functions/score-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, fileData, jobDescription: jobDescription.trim() }),
      })
      const responseText = await response.text()
      let data
      try {
        data = responseText ? JSON.parse(responseText) : {}
      } catch {
        throw new Error(`The ATS service returned an invalid response (${response.status}).`)
      }
      if (!response.ok) throw new Error(data.error || 'Unable to analyze this resume.')
      setResult(data)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to analyze this resume.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className='min-h-screen bg-slate-50'>
      <Header />
      <main className='mx-auto max-w-6xl px-6 py-12 lg:px-10 lg:py-16'>
        <div className='max-w-2xl'>
          <p className='text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600'>ATS Score</p>
          <h1 className='mt-3 text-4xl font-bold tracking-tight text-slate-900'>Tune your resume for the role.</h1>
          <p className='mt-4 text-slate-600'>Upload a PDF and compare it with a job description using practical ATS criteria and role-specific keywords.</p>
        </div>

        <form onSubmit={handleAnalyze} className='mt-10 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]'>
          <section className='rounded-lg border border-slate-200 bg-white p-6 shadow-sm'>
            <div className='flex items-center gap-3'>
              <div className='rounded-md bg-emerald-50 p-2 text-emerald-700'><Upload className='size-5' aria-hidden='true' /></div>
              <div><h2 className='font-semibold text-slate-900'>Resume PDF</h2><p className='text-sm text-slate-500'>PDF only, up to 8 MB</p></div>
            </div>
            <label className='mt-6 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 px-5 text-center transition hover:border-emerald-500 hover:bg-emerald-50/40'>
              <FileText className='size-8 text-slate-400' aria-hidden='true' />
              <span className='mt-3 text-sm font-semibold text-slate-700'>{file ? file.name : 'Choose your resume PDF'}</span>
              <span className='mt-1 text-xs text-slate-500'>Click to browse files</span>
              <input type='file' accept='application/pdf,.pdf' onChange={handleFileChange} className='sr-only' />
            </label>
          </section>

          <section className='rounded-lg border border-slate-200 bg-white p-6 shadow-sm'>
            <label htmlFor='job-description' className='font-semibold text-slate-900'>Target job description</label>
            <p className='mt-1 text-sm text-slate-500'>Paste the complete listing for the most useful keyword match.</p>
            <textarea id='job-description' value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} rows='11' placeholder='Paste the job title, responsibilities, requirements, and preferred qualifications...' className='mt-5 w-full resize-y rounded-md border border-slate-300 px-3 py-3 text-sm leading-6 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100' />
            <button type='submit' disabled={isAnalyzing} className='mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60'>
              {isAnalyzing ? <><LoaderCircle className='size-4 animate-spin' aria-hidden='true' />Analyzing resume...</> : <><Gauge className='size-4' aria-hidden='true' />Get ATS score</>}
            </button>
            {errorMessage && <p role='alert' className='mt-4 text-sm text-red-600'>{errorMessage}</p>}
          </section>
        </form>

        {result && (
          <section className='mt-10 space-y-6' aria-live='polite'>
            <div className='grid gap-6 lg:grid-cols-[0.8fr_1.2fr]'>
              <div className='rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm'>
                <h2 className='text-lg font-semibold text-slate-900'>Your ATS score</h2>
                <div className='mt-5'><ScoreGauge score={result.score} /></div>
                <p className='mt-3 text-sm text-slate-600'>{result.summary}</p>
              </div>
              <div className='rounded-lg border border-slate-200 bg-white p-6 shadow-sm'>
                <h2 className='text-lg font-semibold text-slate-900'>Score breakdown</h2>
                <div className='mt-5'><ScoreBreakdown breakdown={result.breakdown} /></div>
              </div>
            </div>
            <div className='grid gap-6 lg:grid-cols-2'>
              <ResultList title='What is working' items={result.strengths} />
              <ResultList title='Prioritized improvements' items={result.recommendations} tone='warning' />
            </div>
            <ResultList title='Missing or underused keywords' items={result.missingKeywords} tone='warning' />
          </section>
        )}
      </main>
    </div>
  )
}

export default AtsScore
