import React from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../components/custom/header'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Play, Sparkles } from 'lucide-react'
import { FaGithub, FaLinkedinIn } from 'react-icons/fa'
import featuresImage from '../assets/features.jpg'
import featuresImageTwo from '../assets/features(2).jpg'
import logo from '../assets/logo.png'

const testimonials = [
  {
    quote: 'Very professional. I think it will boost people\'s confidence and take the headache out of writing the resume by yourself.',
    name: 'Savannah S.',
    role: 'ResumeIQ User',
  },
  {
    quote: 'The suggestions helped me explain my experience clearly and gave me confidence before applying.',
    name: 'Jordan M.',
    role: 'ResumeIQ User',
  },
  {
    quote: 'A simple way to turn rough notes into a resume that feels focused, polished, and ready to send.',
    name: 'Alex R.',
    role: 'ResumeIQ User',
  },
]

function Home({ isPublic = false }) {
  const [testimonialIndex, setTestimonialIndex] = React.useState(0)
  const testimonial = testimonials[testimonialIndex]
  const location = useLocation()

  React.useEffect(() => {
    const hash = location.hash?.replace('#', '')
    if (!hash) return

    const section = document.getElementById(hash)
    if (!section) return

    const timeoutId = window.setTimeout(() => {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [location.hash])

  function changeTestimonial(direction) {
    setTestimonialIndex((current) => (current + direction + testimonials.length) % testimonials.length)
  }

  return (
    <div className='min-h-screen bg-slate-50'>
      <Header publicOnly={isPublic} />
      <main>
        <section id='home' className='mx-auto grid max-w-6xl items-center gap-14 px-6 py-24 lg:grid-cols-[0.9fr_1.1fr]'>
          <div>
            <p className='mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600'>ResumeIQ</p>
            <h1 className='max-w-xl font-serif text-5xl leading-[1.05] text-slate-900 md:text-6xl'>
              Build a resume that gets you noticed.
            </h1>
            <p className='mt-7 max-w-xl text-lg leading-8 text-slate-600'>
              ResumeIQ is an AI-powered tool that helps you create a professional resume in minutes. With our easy-to-use interface and customizable templates, you can build a resume that highlights your skills and experience, and stands out to potential employers.
            </p>
            <div className='mt-8 flex flex-wrap gap-4'>
              <Button asChild className='bg-emerald-600 px-7 py-3 hover:bg-emerald-700'>
                <a href={isPublic ? '/auth/sign-in' : '/dashboard'}>{isPublic ? 'Get Started' : 'Build My Resume'}</a>
              </Button>
              <Button asChild variant='outline' className='px-6 py-3'>
                <a href='https://www.youtube.com' target='_blank' rel='noopener noreferrer' className='flex items-center gap-2'>
                  <Play aria-hidden='true' className='size-4 fill-current' />Watch video
                </a>
              </Button>
            </div>
          </div>

          <div className='relative min-h-[360px] overflow-hidden rounded-[2rem] border border-emerald-100 bg-emerald-50/70 p-8'>
            <div className='absolute right-10 top-10 size-24 rounded-full bg-rose-300/70' />
            <div className='absolute bottom-8 left-10 size-16 rounded-full bg-cyan-400/60' />
            <div className='relative mx-auto mt-5 max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl'>
              <div className='h-3 w-32 rounded bg-slate-200' />
              <div className='mt-3 h-2 w-48 rounded bg-slate-100' />
              <div className='mt-8 space-y-4'>
                {['Clarify your impact', 'Highlight your strengths', 'Polish your experience'].map((label) => (
                  <div key={label} className='flex items-center gap-3 rounded-lg border-2 border-emerald-400 bg-white px-4 py-4 text-sm text-slate-600'>
                    <Sparkles className='size-4 text-emerald-500' />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id='features' className='border-y border-slate-200 bg-white'>
          <div className='mx-auto grid max-w-6xl items-center gap-16 px-6 py-24 lg:grid-cols-2'>
            <div className='lg:order-2'>
              <p className='mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600'>Features</p>
              <h2 className='max-w-lg font-serif text-4xl leading-tight text-slate-900 md:text-5xl'>Turn your experience into opportunities</h2>
              <p className='mt-6 max-w-xl text-lg leading-8 text-slate-600'>Create a professional Resume from our templates and move seamlessly into job discovery and applications.</p>
              <Button asChild className='mt-8 bg-emerald-600 px-8 py-3 hover:bg-emerald-700'><a href={isPublic ? '/auth/sign-in' : '/dashboard'}>{isPublic ? 'Get Started' : 'Build My Resume'}</a></Button>
            </div>
            <div className='overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm lg:order-1'>
              <img src={featuresImage} alt='ResumeIQ feature preview' className='block aspect-[4/3] h-full w-full object-cover' />
            </div>
          </div>
          <div className='mx-auto grid max-w-6xl items-center gap-16 px-6 pb-24 lg:grid-cols-2'>
            <div>
              <h2 className='max-w-lg font-serif text-4xl leading-tight text-slate-900 md:text-5xl'>Get an AI resume-score to make sure your resume is perfect.</h2>
              <p className='mt-6 max-w-xl text-lg leading-8 text-slate-600'>Our AI-powered tools analyze your resume and provide actionable feedback to help you optimize it for better results.</p>
              <Button asChild className='mt-8 bg-emerald-600 px-8 py-3 hover:bg-emerald-700'><a href={isPublic ? '/auth/sign-in' : '/dashboard'}>{isPublic ? 'Get Started' : 'Upload Resume'}</a></Button>
            </div>
            <div className='overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm'>
              <img src={featuresImageTwo} alt='ResumeIQ templates preview' className='block aspect-[4/3] h-full w-full object-cover' />
            </div>
          </div>
           <div className='mx-auto grid max-w-6xl items-center gap-16 px-6 py-10 lg:grid-cols-2'>
            <div className='lg:order-2'>
              <h2 className='max-w-lg font-serif text-4xl leading-tight text-slate-900 md:text-5xl'>Create a cover letter in minutes using ResumeIQ.</h2>
              <p className='mt-6 max-w-xl text-lg leading-8 text-slate-600'>Our intuitive tools make it easy to craft a compelling cover letter that showcases your skills and experience.</p>
              <Button asChild className='mt-8 bg-emerald-600 px-8 py-3 hover:bg-emerald-700'><a href={isPublic ? '/auth/sign-in' : '/dashboard'}>{isPublic ? 'Get Started' : 'Build My Cover Letter'}</a></Button>
            </div>
            <div className='overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm lg:order-1'>
              <img src={featuresImage} alt='ResumeIQ feature preview' className='block aspect-[4/3] h-full w-full object-cover' />
            </div>
          </div>
        </section>

        <section id='pricing' className='mx-auto max-w-6xl px-6 py-24'>
          <div className='max-w-2xl'>
            <p className='mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600'>Pricing</p>
            <h2 className='font-serif text-4xl text-slate-900'>Everything you need to make your next move.</h2>
          </div>
          <div className='mt-10 grid gap-6 md:grid-cols-2'>
            {['Starter', 'Career Builder'].map((plan, index) => (
              <div key={plan} className='border border-slate-200 bg-white p-7 shadow-sm'>
                <h3 className='text-xl font-semibold text-slate-900'>{plan}</h3>
                <p className='mt-3 text-slate-600'>{index === 0 ? 'Build one polished resume with the essential tools.' : 'Create, refine, and tailor resumes for every opportunity.'}</p>
                <p className='mt-7 font-serif text-3xl text-slate-900'>{index === 0 ? 'Free' : 'Coming soon'}</p>
              </div>
            ))}
          </div>
        </section>

        <section id='testimonials' className='border-t border-slate-200 bg-[#eff8ff]'>
          <div className='mx-auto max-w-6xl px-6 py-24 text-center'>
            <h2 className='mx-auto max-w-3xl font-serif text-4xl leading-tight text-slate-900 md:text-5xl'>
              What Jobseekers Say About ResumeIQ
            </h2>
            <div className='relative mt-14 flex items-center justify-center gap-5 md:gap-16'>
              <button type='button' onClick={() => changeTestimonial(-1)} aria-label='Previous testimonial' className='flex size-16 shrink-0 items-center justify-center rounded-full bg-white text-slate-900 shadow-md transition hover:-translate-x-1 hover:shadow-lg'>
                <ArrowLeft className='size-7' aria-hidden='true' />
              </button>
              <div className='max-w-3xl'>
                <div className='mx-auto flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-rose-200 to-amber-100 text-3xl font-serif text-rose-700'>
                  {testimonial.name.charAt(0)}
                </div>
                <blockquote className='mt-6 font-sans text-3xl leading-tight text-slate-800 md:text-4xl'>“{testimonial.quote}”</blockquote>
                <p className='mt-8 text-base text-slate-600'>{testimonial.name}</p>
                <p className='text-base text-slate-600'>{testimonial.role}</p>
              </div>
              <button type='button' onClick={() => changeTestimonial(1)} aria-label='Next testimonial' className='flex size-16 shrink-0 items-center justify-center rounded-full bg-white text-slate-900 shadow-md transition hover:translate-x-1 hover:shadow-lg'>
                <ArrowRight className='size-7' aria-hidden='true' />
              </button>
            </div>
          </div>
        </section>
      </main>
      <footer className='border-t border-slate-200 bg-white'>
        <div className='mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10 md:flex-row md:items-center md:justify-between'>
          <div className='flex items-center gap-3'>
            <img src={logo} alt='ResumeIQ logo' width={36} height={36} />
            <div>
              <p className='font-semibold text-slate-900'>ResumeIQ</p>
              <p className='mt-1 text-sm text-slate-500'>Build your next opportunity with confidence.</p>
            </div>
          </div>
          <nav aria-label='Footer navigation' className='flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-600'>
            <a href='#home' className='transition hover:text-emerald-600'>Home</a>
            <a href='#features' className='transition hover:text-emerald-600'>Features</a>
            <a href='#pricing' className='transition hover:text-emerald-600'>Pricing</a>
            <a href='#testimonials' className='transition hover:text-emerald-600'>Testimonials</a>
            <a href={isPublic ? '/auth/sign-in' : '/dashboard'} className='transition hover:text-emerald-600'>{isPublic ? 'Get Started' : 'Dashboard'}</a>
          </nav>
          <div className='flex items-center gap-3'>
            <a href='https://www.linkedin.com' target='_blank' rel='noopener noreferrer' aria-label='ResumeIQ on LinkedIn' className='flex size-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-emerald-500 hover:text-emerald-600'>
              <FaLinkedinIn className='size-4' aria-hidden='true' />
            </a>
            <a href='https://github.com' target='_blank' rel='noopener noreferrer' aria-label='ResumeIQ on GitHub' className='flex size-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-emerald-500 hover:text-emerald-600'>
              <FaGithub className='size-4' aria-hidden='true' />
            </a>
          </div>
        </div>
        <div className='border-t border-slate-100 py-4 text-center text-xs text-slate-500'>&copy; {new Date().getFullYear()} ResumeIQ. All rights reserved.</div>
      </footer>
    </div>
  )
}

export default Home
