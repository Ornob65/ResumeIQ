import React from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import html2pdf from 'html2pdf.js'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import { Link, useParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ResumeProvider, useResume } from '@/context/ResumeContext'
import Header from '../components/custom/header'
import ResumePreview from './resume-preview'
import SummaryForm from './summary-form'
import { getResume, updateResumeData } from '@/lib/resumes'

function ResumeEdit() {
  const { resumeId } = useParams()
  const { getToken } = useAuth()
  const { user } = useUser()
  const [resume, setResume] = React.useState(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [errorMessage, setErrorMessage] = React.useState('')

  React.useEffect(() => {
    let isActive = true

    async function loadResume() {
      if (!user || !resumeId) return

      setIsLoading(true)
      const { data, error } = await getResume(getToken, resumeId, user.id)

      if (!isActive) return

      if (error) {
        setErrorMessage(error.message)
      } else {
        setResume(data)
      }
      setIsLoading(false)
    }

    loadResume()

    return () => {
      isActive = false
    }
  }, [getToken, resumeId, user])

  return (
    <div className='min-h-screen bg-slate-50'>
      <Header />
      <main className='mx-auto max-w-6xl px-6 py-20'>
        <Link to='/dashboard' className='text-sm font-medium text-sky-600 hover:text-sky-700'>
          Back to resumes
        </Link>
        {isLoading && <p className='mt-8 text-slate-500'>Loading resume...</p>}
        {errorMessage && <p className='mt-8 text-red-600'>Unable to load this resume.</p>}
        {resume && <ResumeProvider initialData={resume.resume_data}>
          <ResumeEditorForm
            getToken={getToken}
            resumeId={resumeId}
            userId={user.id}
            title={resume.title}
            onSaved={setResume}
            onError={setErrorMessage}
          />
        </ResumeProvider>}
      </main>
    </div>
  )
}

function ResumeEditorForm({ getToken, resumeId, userId, title, onSaved, onError }) {
  const { resumeInfo, updateResumeInfo, updatePersonalField } = useResume()
  const [isSaving, setIsSaving] = React.useState(false)
  const [saveMessage, setSaveMessage] = React.useState('')
  const [isDownloading, setIsDownloading] = React.useState(false)
  const previewRef = React.useRef(null)

  async function handleSave(event) {
    event.preventDefault()
    setIsSaving(true)
    onError('')
    setSaveMessage('')
    const { data, error } = await updateResumeData(getToken, resumeId, userId, resumeInfo)
    if (error) {
      onError(error.message)
    } else {
      onSaved(data)
      setSaveMessage('Resume saved successfully.')
      window.setTimeout(() => setSaveMessage(''), 3000)
    }
    setIsSaving(false)
  }

  function updateArrayItem(section, index, field, value) {
    const items = [...resumeInfo[section]]
    items[index] = { ...items[index], [field]: value }
    updateResumeInfo(section, items)
  }

  function addArrayItem(section, item) {
    updateResumeInfo(section, [...resumeInfo[section], item])
  }

  function handleProfileImageChange(event) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      onError('Please select an image file.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => updateResumeInfo('profileImage', String(reader.result))
    reader.onerror = () => onError('Unable to read that image.')
    reader.readAsDataURL(file)
  }

  async function handleDownloadPdf() {
    if (!previewRef.current) return

    setIsDownloading(true)
    setSaveMessage('')
    try {
      const createPdf = html2pdf.default ?? html2pdf
      if (typeof createPdf !== 'function') throw new Error('PDF exporter failed to load.')

      await createPdf().set({
        margin: 0,
        filename: `${title.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'resume'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          onclone: (documentClone) => {
            documentClone.querySelectorAll('style').forEach((style) => {
              style.textContent = style.textContent
                .replace(/oklch\([^)]*\)/gi, '#000000')
                .replace(/oklab\([^)]*\)/gi, '#000000')
                .replace(/color-mix\([^)]*\)/gi, 'transparent')
            })

            documentClone.querySelectorAll('*').forEach((element) => {
              const computedStyle = window.getComputedStyle(element)
              const safeColors = {
                color: computedStyle.color,
                backgroundColor: computedStyle.backgroundColor,
                borderColor: computedStyle.borderColor,
                outlineColor: computedStyle.outlineColor,
                boxShadow: computedStyle.boxShadow,
                textShadow: computedStyle.textShadow,
              }

              Object.entries(safeColors).forEach(([property, value]) => {
                const hasUnsupportedColor = value.includes('oklch') || value.includes('oklab') || value.includes('color-mix')
                element.style[property] = hasUnsupportedColor
                  ? (property === 'backgroundColor' || property === 'outlineColor' || property === 'boxShadow' || property === 'textShadow' ? 'transparent' : '#000000')
                  : value
              })
            })
          },
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] },
      }).from(previewRef.current).save()
      setSaveMessage('Resume downloaded as PDF.')
    } catch (error) {
      setSaveMessage(error instanceof Error ? `PDF download failed: ${error.message}` : 'PDF download failed.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className='mt-8 grid items-start gap-8 lg:grid-cols-[minmax(320px,0.9fr)_minmax(420px,1.1fr)]'>
      <form onSubmit={handleSave} className='space-y-6 rounded-lg border bg-white p-6 shadow-sm'>
        <div>
          <h1 className='text-3xl font-bold text-slate-900'>{title}</h1>
          <p className='mt-2 text-slate-600'>Edit your resume details</p>
        </div>

        <fieldset className='space-y-3'>
          <legend className='text-lg font-semibold text-slate-900'>Personal details</legend>
          {Object.entries({ firstName: 'First name', lastName: 'Last name', address: 'Address', jobTitle: 'Job title', phone: 'Phone', email: 'Email' }).map(([field, label]) => (
            <input key={field} value={resumeInfo.personal[field]} onChange={(event) => updatePersonalField(field, event.target.value)} placeholder={label} className='w-full rounded-md border border-slate-300 px-3 py-2' />
          ))}
          {resumeInfo.template === 'image' && (
            <label className='block space-y-2 text-sm font-medium text-slate-700'>
              Profile image
              <input type='file' accept='image/*' onChange={handleProfileImageChange} className='block w-full rounded-md border border-slate-300 px-3 py-2 text-sm' />
            </label>
          )}
          <div className='space-y-3 rounded-md border border-slate-200 p-3'>
            <div className='flex items-center justify-between'>
              <span className='font-medium text-slate-800'>Social links</span>
              <button type='button' onClick={() => updatePersonalField('socialLinks', [...resumeInfo.personal.socialLinks, { platform: 'Facebook', url: '' }])} aria-label='Add social link' className='rounded-md p-2 text-slate-600 transition hover:bg-slate-100 hover:text-sky-600'>
                <Plus className='size-5' aria-hidden='true' />
              </button>
            </div>
            {resumeInfo.personal.socialLinks.map((link, index) => (
              <div key={index} className='flex gap-2'>
                <select value={link.platform} onChange={(event) => {
                  const links = [...resumeInfo.personal.socialLinks]
                  links[index] = { ...links[index], platform: event.target.value }
                  updatePersonalField('socialLinks', links)
                }} className='rounded-md border px-2 py-2'>
                  {['Facebook', 'Instagram', 'WhatsApp', 'Telegram', 'GitHub', 'LinkedIn'].map((platform) => <option key={platform}>{platform}</option>)}
                </select>
                <input value={link.url} onChange={(event) => {
                  const links = [...resumeInfo.personal.socialLinks]
                  links[index] = { ...links[index], url: event.target.value }
                  updatePersonalField('socialLinks', links)
                }} placeholder='Paste profile link' className='min-w-0 flex-1 rounded-md border px-3 py-2' />
              </div>
            ))}
          </div>
        </fieldset>

        <SummaryForm />

        <fieldset className='space-y-3'>
          <div className='flex items-center justify-between'>
            <legend className='text-lg font-semibold text-slate-900'>Experience</legend>
            <button type='button' onClick={() => addArrayItem('experience', { company: '', role: '', dates: '', description: '' })} aria-label='Add experience' className='rounded-md p-2 text-slate-600 transition hover:bg-slate-100 hover:text-sky-600'>
              <Plus className='size-5' aria-hidden='true' />
            </button>
          </div>
          {resumeInfo.experience.map((item, index) => (
            <div key={index} className='space-y-3 rounded-md border p-3'>
              <input value={item.role} onChange={(event) => updateArrayItem('experience', index, 'role', event.target.value)} placeholder='Role' className='w-full rounded-md border px-3 py-2' />
              <input value={item.company} onChange={(event) => updateArrayItem('experience', index, 'company', event.target.value)} placeholder='Company' className='w-full rounded-md border px-3 py-2' />
              <input value={item.dates} onChange={(event) => updateArrayItem('experience', index, 'dates', event.target.value)} placeholder='Dates' className='w-full rounded-md border px-3 py-2' />
              <ReactQuill theme='snow' value={item.description} onChange={(value) => updateArrayItem('experience', index, 'description', value)} placeholder='Describe your work' />
            </div>
          ))}
        </fieldset>

        <fieldset className='space-y-3'>
          <div className='flex items-center justify-between'>
            <legend className='text-lg font-semibold text-slate-900'>Education</legend>
            <button type='button' onClick={() => addArrayItem('education', { school: '', degree: '', dates: '' })} aria-label='Add education' className='rounded-md p-2 text-slate-600 transition hover:bg-slate-100 hover:text-sky-600'>
              <Plus className='size-5' aria-hidden='true' />
            </button>
          </div>
          {resumeInfo.education.map((item, index) => (
            <div key={index} className='space-y-3 rounded-md border p-3'>
              <input value={item.degree} onChange={(event) => updateArrayItem('education', index, 'degree', event.target.value)} placeholder='Degree' className='w-full rounded-md border px-3 py-2' />
              <input value={item.school} onChange={(event) => updateArrayItem('education', index, 'school', event.target.value)} placeholder='School' className='w-full rounded-md border px-3 py-2' />
              <input value={item.dates} onChange={(event) => updateArrayItem('education', index, 'dates', event.target.value)} placeholder='Dates' className='w-full rounded-md border px-3 py-2' />
            </div>
          ))}
        </fieldset>

        <fieldset className='space-y-3'>
          <div className='flex items-center justify-between'>
            <legend className='text-lg font-semibold text-slate-900'>Technical Skills</legend>
            <button type='button' onClick={() => addArrayItem('technicalSkills', { name: '', category: '' })} aria-label='Add technical skill' className='rounded-md p-2 text-slate-600 transition hover:bg-slate-100 hover:text-sky-600'>
              <Plus className='size-5' aria-hidden='true' />
            </button>
          </div>
          {resumeInfo.technicalSkills.map((item, index) => (
            <div key={index} className='flex gap-3'>
              <input value={item.name} onChange={(event) => updateArrayItem('technicalSkills', index, 'name', event.target.value)} placeholder='Skill' className='min-w-0 flex-1 rounded-md border px-3 py-2' />
            </div>
          ))}
        </fieldset>

        <fieldset className='space-y-3'>
          <div className='flex items-center justify-between'>
            <legend className='text-lg font-semibold text-slate-900'>Projects</legend>
            <button type='button' onClick={() => addArrayItem('projects', { name: '', technologies: '', dates: '', description: '' })} aria-label='Add project' className='rounded-md p-2 text-slate-600 transition hover:bg-slate-100 hover:text-sky-600'>
              <Plus className='size-5' aria-hidden='true' />
            </button>
          </div>
          {resumeInfo.projects.map((item, index) => (
            <div key={index} className='space-y-3 rounded-md border p-3'>
              <input value={item.name} onChange={(event) => updateArrayItem('projects', index, 'name', event.target.value)} placeholder='Project name' className='w-full rounded-md border px-3 py-2' />
              <input value={item.technologies} onChange={(event) => updateArrayItem('projects', index, 'technologies', event.target.value)} placeholder='Technologies' className='w-full rounded-md border px-3 py-2' />
              <input value={item.dates} onChange={(event) => updateArrayItem('projects', index, 'dates', event.target.value)} placeholder='Dates' className='w-full rounded-md border px-3 py-2' />
              <textarea value={item.description} onChange={(event) => updateArrayItem('projects', index, 'description', event.target.value)} placeholder='Project description' rows='3' className='w-full rounded-md border px-3 py-2' />
            </div>
          ))}
        </fieldset>

        {[
          ['competitiveAdvantages', 'Competitive Advantages', 'Highlight strengths that set you apart'],
          ['interests', 'Interests', 'Describe your professional or personal interests'],
          ['extraCurricularActivities', 'Extra Curricular Activities', 'Add activities, leadership, or volunteer work'],
          ['communication', 'Communication', 'List languages or communication strengths'],
        ].map(([field, label, placeholder]) => (
          <label key={field} className='block space-y-2'>
            <span className='text-lg font-semibold text-slate-900'>{label}</span>
            <textarea value={resumeInfo[field]} onChange={(event) => updateResumeInfo(field, event.target.value)} rows='3' placeholder={placeholder} className='w-full rounded-md border border-slate-300 px-3 py-2' />
          </label>
        ))}

        <fieldset className='space-y-3'>
          <div className='flex items-center justify-between'>
            <legend className='text-lg font-semibold text-slate-900'>References</legend>
            <button type='button' onClick={() => addArrayItem('references', { name: '', role: '', organization: '', email: '', phone: '' })} aria-label='Add reference' className='rounded-md p-2 text-slate-600 transition hover:bg-slate-100 hover:text-sky-600'>
              <Plus className='size-5' aria-hidden='true' />
            </button>
          </div>
          {resumeInfo.references.map((item, index) => (
            <div key={index} className='space-y-3 rounded-md border p-3'>
              <input value={item.name} onChange={(event) => updateArrayItem('references', index, 'name', event.target.value)} placeholder='Name' className='w-full rounded-md border px-3 py-2' />
              <input value={item.role} onChange={(event) => updateArrayItem('references', index, 'role', event.target.value)} placeholder='Role' className='w-full rounded-md border px-3 py-2' />
              <input value={item.organization} onChange={(event) => updateArrayItem('references', index, 'organization', event.target.value)} placeholder='Organization' className='w-full rounded-md border px-3 py-2' />
              <input value={item.email} onChange={(event) => updateArrayItem('references', index, 'email', event.target.value)} placeholder='Email' className='w-full rounded-md border px-3 py-2' />
              <input value={item.phone} onChange={(event) => updateArrayItem('references', index, 'phone', event.target.value)} placeholder='Phone' className='w-full rounded-md border px-3 py-2' />
            </div>
          ))}
        </fieldset>

        <label className='flex items-center justify-between rounded-md border px-3 py-2'>
          <span className='font-medium'>Theme color</span>
          <input type='color' value={resumeInfo.themeColor} onChange={(event) => updateResumeInfo('themeColor', event.target.value)} />
        </label>
        <label className='flex items-center justify-between gap-4 rounded-md border px-3 py-2'>
          <span className='font-medium'>Resume font</span>
          <select value={resumeInfo.fontFamily} onChange={(event) => updateResumeInfo('fontFamily', event.target.value)} className='rounded-md border px-3 py-2'>
            {['Inter', 'Poppins', 'Roboto', 'Noto Sans', 'Oswald', 'Nunito', 'Raleway', 'Rubik'].map((font) => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </label>
        <div className='flex items-center justify-between gap-4'>
          {saveMessage && <p role='status' className='text-sm font-medium text-emerald-600'>{saveMessage}</p>}
          <div className='flex flex-wrap gap-3'>
            <Button type='submit' disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Resume'}</Button>
            <Button type='button' variant='outline' onClick={handleDownloadPdf} disabled={isDownloading}>
              {isDownloading ? 'Preparing PDF...' : 'Download as PDF'}
            </Button>
          </div>
        </div>
      </form>
      <div className='lg:sticky lg:top-6'>
        <ResumePreview ref={previewRef} />
      </div>
    </div>
  )
}

export default ResumeEdit
