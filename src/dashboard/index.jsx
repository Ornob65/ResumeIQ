import React from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { FileText, Gauge, PenLine } from 'lucide-react'
import Header from '../components/custom/header'
import AppResume from './appresume'
import documentIcon from '../assets/document-icon.jpg'
import { getUserResumes } from '@/lib/resumes'

function Dashboard() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const [resumes, setResumes] = React.useState([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [errorMessage, setErrorMessage] = React.useState('')

  React.useEffect(() => {
    let isActive = true

    async function loadResumes() {
      if (!user) return

      setIsLoading(true)
      const { data, error } = await getUserResumes(getToken, user.id)

      if (!isActive) return

      if (error) {
        setErrorMessage(error.message)
      } else {
        setResumes(data ?? [])
      }
      setIsLoading(false)
    }

    loadResumes()

    return () => {
      isActive = false
    }
  }, [getToken, user])

  return (
    <div className='min-h-screen bg-slate-50'>
      <Header />
      <div className='flex min-h-[calc(100vh-65px)] flex-col lg:flex-row'>
        <aside className='w-full shrink-0 border-b border-slate-200 bg-white p-4 lg:w-64 lg:border-b-0 lg:border-r lg:p-6'>
          <nav aria-label='Dashboard sections'>
            <p className='px-3 pb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400'>Workspace</p>
            <Link to='/dashboard' className='flex items-center gap-3 rounded-lg bg-emerald-50 px-3 py-3 text-sm font-semibold text-emerald-700'>
              <FileText className='size-4' aria-hidden='true' />
              Resume
            </Link>
            <button type='button' disabled title='Cover Letter is coming soon' className='mt-1 flex w-full cursor-not-allowed items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-slate-400'>
              <PenLine className='size-4' aria-hidden='true' />
              <span className='flex-1'>Cover Letter</span>
              <span className='text-[10px] uppercase tracking-wide'>Soon</span>
            </button>
            <button type='button' disabled title='ATS Score is coming soon' className='mt-1 flex w-full cursor-not-allowed items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-slate-400'>
              <Gauge className='size-4' aria-hidden='true' />
              <span className='flex-1'>ATS Score</span>
              <span className='text-[10px] uppercase tracking-wide'>Soon</span>
            </button>
          </nav>
        </aside>

        <main className='min-w-0 flex-1 px-6 py-10 lg:px-10 lg:py-16'>
          <div className='mx-auto max-w-6xl'>
            <h1 className='text-3xl font-bold text-slate-900'>My Resume</h1>
            <p className='mt-2 text-slate-600'>Start Creating Resume for your next job</p>
            {errorMessage && <p className='mt-6 text-sm text-red-600'>{errorMessage}</p>}
            {isLoading && <p className='mt-6 text-sm text-slate-500'>Loading resumes...</p>}
            <div className='mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
              <AppResume />
              {resumes.length > 0 && resumes.map((resume) => (
                <Link
                  key={resume.id}
                  to={`/dashboard/resume/${resume.id}/edit`}
                  className='group relative block h-[300px] overflow-hidden rounded-lg border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md'
                >
                  <img
                    src={documentIcon}
                    alt='Resume document icon'
                    className='h-full w-full object-cover object-center transition duration-200 group-hover:scale-[1.02]'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/20 to-transparent' />
                  <div className='absolute inset-x-0 bottom-0 p-5 text-white'>
                    <h2 className='text-lg font-semibold'>{resume.title}</h2>
                    <p className='mt-2 text-sm text-slate-200'>
                      Created {new Date(resume.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
