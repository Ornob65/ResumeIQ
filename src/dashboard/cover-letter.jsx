import React from 'react'
import { FileText, Gauge, LoaderCircle, PenLine, Printer, Sparkles, Plus } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth, useUser } from '@clerk/clerk-react'
import Header from '../components/custom/header'
import { Button } from '@/components/ui/button'
import {
  createCoverLetter,
  getCoverLetter,
  getUserCoverLetters,
  updateCoverLetter,
} from '@/lib/cover-letters'

const emptyData = {
  candidateName: '',
  candidateEmail: '',
  candidatePhone: '',
  candidateLocation: '',
  hiringManager: '',
  role: '',
  company: '',
  jobDescription: '',
  tone: 'Professional',
  length: 'Medium',
}

function DashboardSidebar() {
  return (
    <aside className='w-full shrink-0 border-b border-slate-200 bg-white p-4 lg:w-64 lg:border-b-0 lg:border-r lg:p-6'>
      <nav aria-label='Dashboard sections'>
        <p className='px-3 pb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400'>Workspace</p>
        <Link to='/dashboard' className='flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700'>
          <FileText className='size-4' aria-hidden='true' /> Resume
        </Link>
        <Link to='/dashboard/cover-letters' className='mt-1 flex items-center gap-3 rounded-lg bg-emerald-50 px-3 py-3 text-sm font-semibold text-emerald-700'>
          <PenLine className='size-4' aria-hidden='true' /> Cover Letter
        </Link>
        <Link to='/dashboard/ats-score' className='mt-1 flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700'>
          <Gauge className='size-4' aria-hidden='true' /> ATS Score
        </Link>
      </nav>
    </aside>
  )
}

function CoverLetterLayout({ children }) {
  return (
    <div className='cover-letter-page min-h-screen bg-slate-50'>
      <Header />
      <div className='flex min-h-[calc(100vh-65px)] flex-col lg:flex-row'>
        <DashboardSidebar />
        <main className='min-w-0 flex-1 px-6 py-10 lg:px-10 lg:py-16'>{children}</main>
      </div>
    </div>
  )
}

export function CoverLetters() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const navigate = useNavigate()
  const [letters, setLetters] = React.useState([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [errorMessage, setErrorMessage] = React.useState('')

  React.useEffect(() => {
    let isActive = true
    async function loadLetters() {
      if (!user) return
      const { data, error } = await getUserCoverLetters(getToken, user.id)
      if (!isActive) return
      if (error) setErrorMessage(error.message)
      else setLetters(data ?? [])
      setIsLoading(false)
    }
    loadLetters()
    return () => { isActive = false }
  }, [getToken, user])

  return (
    <CoverLetterLayout>
      <div className='mx-auto max-w-6xl'>
        <div className='flex flex-wrap items-end justify-between gap-4'>
          <div>
            <p className='text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600'>Cover Letters</p>
            <h1 className='mt-2 text-3xl font-bold text-slate-900'>Make your next introduction count.</h1>
            <p className='mt-2 text-slate-600'>Create a tailored letter, then edit every word before you send it.</p>
          </div>
          <Button type='button' onClick={() => navigate('/dashboard/cover-letter/new')}><Plus className='size-4' />Create cover letter</Button>
        </div>
        {errorMessage && <p className='mt-6 text-sm text-red-600'>{errorMessage}</p>}
        {isLoading && <p className='mt-8 text-sm text-slate-500'>Loading cover letters...</p>}
        {!isLoading && letters.length === 0 && (
          <div className='mt-10 rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center'>
            <PenLine className='mx-auto size-8 text-emerald-600' aria-hidden='true' />
            <h2 className='mt-4 text-lg font-semibold text-slate-900'>Your cover letters will appear here</h2>
            <p className='mt-2 text-sm text-slate-500'>Start with the job details and let AI help you find the right words.</p>
          </div>
        )}
        <div className='mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {letters.map((letter) => (
            <Link key={letter.id} to={`/dashboard/cover-letter/${letter.id}/edit`} className='group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md'>
              <div className='flex items-start justify-between gap-3'>
                <PenLine className='size-5 text-emerald-600' aria-hidden='true' />
                <span className='text-xs text-slate-400'>{new Date(letter.updated_at ?? letter.created_at).toLocaleDateString()}</span>
              </div>
              <h2 className='mt-8 truncate text-lg font-semibold text-slate-900 group-hover:text-emerald-700'>{letter.title}</h2>
              <p className='mt-2 truncate text-sm text-slate-500'>{letter.cover_letter_data?.role || 'Cover letter draft'}</p>
            </Link>
          ))}
        </div>
      </div>
    </CoverLetterLayout>
  )
}

export function CoverLetterEdit() {
  const { coverLetterId } = useParams()
  const { getToken } = useAuth()
  const { user } = useUser()
  const navigate = useNavigate()
  const [title, setTitle] = React.useState('')
  const [data, setData] = React.useState(emptyData)
  const [content, setContent] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(Boolean(coverLetterId))
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState('')
  const [saveMessage, setSaveMessage] = React.useState('')

  React.useEffect(() => {
    if (!coverLetterId || !user) return
    let isActive = true
    async function loadLetter() {
      const { data: letter, error } = await getCoverLetter(getToken, coverLetterId, user.id)
      if (!isActive) return
      if (error) setErrorMessage(error.message)
      else {
        setTitle(letter.title)
        setData({ ...emptyData, ...(letter.cover_letter_data ?? {}) })
        setContent(letter.content ?? '')
      }
      setIsLoading(false)
    }
    loadLetter()
    return () => { isActive = false }
  }, [coverLetterId, getToken, user])

  function updateField(field, value) {
    setData((current) => ({ ...current, [field]: value }))
  }

  async function handleGenerate(event) {
    event.preventDefault()
    if (!data.candidateName.trim() || !data.role.trim() || !data.company.trim() || !data.jobDescription.trim()) {
      setErrorMessage('Add your name, target role, company, and job description before generating.')
      return
    }
    setIsGenerating(true)
    setErrorMessage('')
    try {
      const response = await fetch('/.netlify/functions/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const responseText = await response.text()
      let result
      try { result = responseText ? JSON.parse(responseText) : {} } catch {
        throw new Error(`The AI service returned an invalid response (${response.status}).`)
      }
      if (!response.ok) throw new Error(result.error || 'Unable to generate cover letter.')
      if (typeof result.content !== 'string' || !result.content.trim()) throw new Error('The AI service returned no cover letter.')
      setContent(result.content)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to generate cover letter.')
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleSave(event) {
    event.preventDefault()
    if (!title.trim()) {
      setErrorMessage('Add a title before saving this cover letter.')
      return
    }
    if (!content.trim()) {
      setErrorMessage('Generate or write your cover letter before saving.')
      return
    }
    setIsSaving(true)
    setErrorMessage('')
    setSaveMessage('')
    const payload = { title: title.trim(), content: content.trim(), cover_letter_data: data }
    const result = coverLetterId
      ? await updateCoverLetter(getToken, coverLetterId, user.id, { ...payload, updated_at: new Date().toISOString() })
      : await createCoverLetter(getToken, { ...payload, user_id: user.id, user_email: user.primaryEmailAddress?.emailAddress ?? null })
    if (result.error) setErrorMessage(result.error.message)
    else if (result.data?.id) {
      setSaveMessage('Cover letter saved successfully.')
      if (!coverLetterId) navigate(`/dashboard/cover-letter/${result.data.id}/edit`, { replace: true })
      window.setTimeout(() => setSaveMessage(''), 3000)
    }
    setIsSaving(false)
  }

  if (isLoading) {
    return <CoverLetterLayout><p className='text-sm text-slate-500'>Loading cover letter...</p></CoverLetterLayout>
  }

  return (
    <CoverLetterLayout>
      <div className='mx-auto max-w-6xl'>
        <Link to='/dashboard/cover-letters' className='text-sm font-medium text-emerald-700 hover:text-emerald-800'>Back to cover letters</Link>
        <div className='cover-letter-editor-layout mt-6 grid items-start gap-8 lg:grid-cols-[minmax(320px,0.85fr)_minmax(420px,1.15fr)]'>
          <form onSubmit={handleSave} className='cover-letter-editor-form space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm'>
            <div>
              <label htmlFor='cover-letter-title' className='text-sm font-semibold text-slate-700'>Document title</label>
              <input id='cover-letter-title' value={title} onChange={(event) => setTitle(event.target.value)} placeholder='Product Designer application' className='mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-lg font-semibold' />
            </div>
            <fieldset className='space-y-3'>
              <legend className='text-lg font-semibold text-slate-900'>Your details</legend>
              <div className='grid gap-3 sm:grid-cols-2'>
                {[
                  ['candidateName', 'Full name', true],
                  ['candidateEmail', 'Email', false],
                  ['candidatePhone', 'Phone', false],
                  ['candidateLocation', 'Location', false],
                ].map(([field, label]) => <input key={field} required={field === 'candidateName'} value={data[field]} onChange={(event) => updateField(field, event.target.value)} placeholder={label} className='w-full rounded-md border border-slate-300 px-3 py-2' />)}
              </div>
            </fieldset>
            <fieldset className='space-y-3'>
              <legend className='text-lg font-semibold text-slate-900'>Target role</legend>
              <input value={data.hiringManager} onChange={(event) => updateField('hiringManager', event.target.value)} placeholder='Hiring manager (optional)' className='w-full rounded-md border border-slate-300 px-3 py-2' />
              <div className='grid gap-3 sm:grid-cols-2'>
                <input required value={data.role} onChange={(event) => updateField('role', event.target.value)} placeholder='Target role' className='w-full rounded-md border border-slate-300 px-3 py-2' />
                <input required value={data.company} onChange={(event) => updateField('company', event.target.value)} placeholder='Company' className='w-full rounded-md border border-slate-300 px-3 py-2' />
              </div>
              <textarea required value={data.jobDescription} onChange={(event) => updateField('jobDescription', event.target.value)} rows='7' placeholder='Paste the job description...' className='w-full resize-y rounded-md border border-slate-300 px-3 py-2 leading-6' />
            </fieldset>
            <div className='grid gap-3 sm:grid-cols-2'>
              <label className='text-sm font-medium text-slate-700'>Tone<select value={data.tone} onChange={(event) => updateField('tone', event.target.value)} className='mt-2 w-full rounded-md border border-slate-300 px-3 py-2'><option>Professional</option><option>Warm</option><option>Confident</option><option>Concise</option></select></label>
              <label className='text-sm font-medium text-slate-700'>Length<select value={data.length} onChange={(event) => updateField('length', event.target.value)} className='mt-2 w-full rounded-md border border-slate-300 px-3 py-2'><option>Short</option><option>Medium</option><option>Long</option></select></label>
            </div>
            <Button type='button' variant='outline' onClick={handleGenerate} disabled={isGenerating} className='w-full'><Sparkles className='size-4' />{isGenerating ? <><LoaderCircle className='size-4 animate-spin' />Generating...</> : 'Generate with AI'}</Button>
            <div>
              <label htmlFor='cover-letter-content' className='text-lg font-semibold text-slate-900'>Your letter</label>
              <textarea id='cover-letter-content' value={content} onChange={(event) => setContent(event.target.value)} rows='18' placeholder='Your cover letter will appear here...' className='mt-3 w-full resize-y rounded-md border border-slate-300 px-3 py-3 leading-7' />
            </div>
            {errorMessage && <p className='text-sm text-red-600'>{errorMessage}</p>}
            {saveMessage && <p className='text-sm text-emerald-700'>{saveMessage}</p>}
            <div className='flex flex-wrap gap-3'>
              <Button type='submit' disabled={isSaving}>{isSaving ? 'Saving...' : 'Save cover letter'}</Button>
              <Button type='button' variant='outline' onClick={() => window.print()} disabled={!content.trim()}><Printer className='size-4' />Print / PDF</Button>
            </div>
          </form>
          <article className='cover-letter-preview-container lg:sticky lg:top-6'>
            <div className='mb-3 flex items-center justify-between gap-3'>
              <h2 className='font-semibold text-slate-900'>Preview</h2>
              <span className='text-xs text-slate-500'>Print-ready</span>
            </div>
            <article className='cover-letter-preview-page min-h-[297mm] overflow-wrap-anywhere bg-white px-[18mm] py-[16mm] text-[13px] leading-7 text-slate-800 shadow-sm'>
              <header className='border-b border-slate-300 pb-6'>
                <h1 className='text-2xl font-bold text-slate-900'>{data.candidateName || 'Your name'}</h1>
                <p className='mt-2 text-sm text-slate-500'>{[data.candidateEmail, data.candidatePhone, data.candidateLocation].filter(Boolean).join('  •  ') || 'Your contact details'}</p>
              </header>
              <div className='mt-10 space-y-1 text-sm'>
                <p>{new Date().toLocaleDateString()}</p>
                {data.hiringManager && <p className='mt-5'>{data.hiringManager}</p>}
                <p>{data.company || 'Company name'}</p>
              </div>
              <p className='mt-8'>Dear {data.hiringManager || 'Hiring Manager'},</p>
              <div className='mt-5 whitespace-pre-wrap'>{content || 'Your cover letter preview will appear here.'}</div>
              <p className='mt-8'>Sincerely,<br />{data.candidateName || 'Your name'}</p>
            </article>
          </article>
        </div>
      </div>
    </CoverLetterLayout>
  )
}
