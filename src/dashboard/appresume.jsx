import { PlusSquare } from 'lucide-react'
import React, { useState } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { createResume } from '@/lib/resumes'

const AppResume = () => {
  const { getToken } = useAuth()
  const { user } = useUser()
  const navigate = useNavigate()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [resumeTitle, setResumeTitle] = useState('')
  const [template, setTemplate] = useState('classic')
  const [profileImage, setProfileImage] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  function handleImageChange(event) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select an image file.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => setProfileImage(String(reader.result))
    reader.onerror = () => setErrorMessage('Unable to read that image.')
    reader.readAsDataURL(file)
  }

  async function handleCreateResume(event) {
    event.preventDefault()

    const title = resumeTitle.trim()
    if (!title || !user) return

    setIsCreating(true)
    setErrorMessage('')

    try {
      if (template === 'image' && !profileImage) {
        setErrorMessage('Please upload a profile image.')
        return
      }

      const { data, error } = await createResume(getToken, {
        title,
        user_id: user.id,
        user_email: user.primaryEmailAddress?.emailAddress ?? null,
        resume_data: { template, profileImage },
      })

      if (error) throw new Error(error.message)
      if (!data?.id) throw new Error('Resume was created without an ID.')

      setResumeTitle('')
      setTemplate('classic')
      setProfileImage('')
      setIsDialogOpen(false)
      navigate(`/dashboard/resume/${data.id}/edit`)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to create resume.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <>
      <button
        type='button'
        onClick={() => {
          setErrorMessage('')
          setTemplate('classic')
          setProfileImage('')
          setIsDialogOpen(true)
        }}
        className='flex h-[300px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border bg-gray-200 p-14 py-24 transition-all duration-300 hover:scale-105 hover:shadow-md'
      >
        <PlusSquare />
        <span className='mt-3 text-sm font-medium text-slate-700'>Create a new resume</span>
      </button>

      {isDialogOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4'>
          <div
            role='dialog'
            aria-modal='true'
            aria-labelledby='resume-dialog-title'
            className='w-full max-w-md rounded-lg bg-white p-6 shadow-xl'
          >
            <h2 id='resume-dialog-title' className='text-xl font-semibold text-slate-900'>
              Create a new resume
            </h2>
            <p className='mt-2 text-sm text-slate-600'>Give your resume a title to get started.</p>

            <form onSubmit={handleCreateResume} className='mt-6 space-y-4'>
              <label htmlFor='resume-title' className='block text-sm font-medium text-slate-700'>
                Resume title
              </label>
              <input
                id='resume-title'
                value={resumeTitle}
                onChange={(event) => setResumeTitle(event.target.value)}
                placeholder='Full Stack Developer'
                autoFocus
                className='w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200'
              />

              <fieldset className='space-y-3'>
                <legend className='text-sm font-medium text-slate-700'>Choose a resume design</legend>
                <div className='grid gap-3 sm:grid-cols-2'>
                  <label className={`cursor-pointer rounded-md border p-3 ${template === 'classic' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}>
                    <input type='radio' name='resume-template' value='classic' checked={template === 'classic'} onChange={() => setTemplate('classic')} className='sr-only' />
                    <span className='block text-sm font-semibold text-slate-900'>Resume without image</span>
                    <span className='mt-1 block text-xs text-slate-500'>Use the existing resume format.</span>
                  </label>
                  <label className={`cursor-pointer rounded-md border p-3 ${template === 'image' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}>
                    <input type='radio' name='resume-template' value='image' checked={template === 'image'} onChange={() => setTemplate('image')} className='sr-only' />
                    <span className='block text-sm font-semibold text-slate-900'>Resume with image</span>
                    <span className='mt-1 block text-xs text-slate-500'>Use the two-column profile design.</span>
                  </label>
                </div>
              </fieldset>

              {template === 'image' && (
                <label className='block space-y-2 text-sm font-medium text-slate-700'>
                  Profile image
                  <input type='file' accept='image/*' onChange={handleImageChange} className='block w-full rounded-md border border-slate-300 px-3 py-2 text-sm' />
                </label>
              )}

              <div className='flex justify-end gap-3'>
                <Button type='button' variant='outline' onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type='submit' disabled={!resumeTitle.trim() || isCreating}>
                  {isCreating ? 'Creating...' : 'Create'}
                </Button>
              </div>
              {errorMessage && <p className='text-sm text-red-600'>{errorMessage}</p>}
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default AppResume
