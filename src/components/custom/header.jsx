import React from 'react'
import { UserButton, useUser } from '@clerk/clerk-react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../../assets/logo.png'
import { Button } from '@/components/ui/button'

function Header({ publicOnly = false }) {
  const { isSignedIn } = useUser()
  const navigate = useNavigate()
  const showAuthenticatedActions = isSignedIn && !publicOnly

  function handleSectionClick(event, section) {
    event.preventDefault()
    navigate(`/#${section}`)
  }

  return (
    <header className='flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3 shadow-sm'>
      <div className='flex items-center gap-3'>
        <img src={logo} alt='ResumeIQ logo' width={40} height={40} />
        <span className='text-lg font-semibold text-slate-900'>ResumeIQ</span>
      </div>

      <nav className='hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex'>
        <Link to='/#home' onClick={(event) => handleSectionClick(event, 'home')} className='transition hover:text-sky-600'>Home</Link>
        <Link to='/#features' onClick={(event) => handleSectionClick(event, 'features')} className='transition hover:text-sky-600'>Features</Link>
        <Link to='/#pricing' onClick={(event) => handleSectionClick(event, 'pricing')} className='transition hover:text-sky-600'>Pricing</Link>
        <Link to='/#testimonials' onClick={(event) => handleSectionClick(event, 'testimonials')} className='transition hover:text-sky-600'>Testimonials</Link>
      </nav>

      <div className='flex items-center gap-[10px]'>
        {!showAuthenticatedActions ? (
          <Link to='/auth/sign-in'>
            <Button>Get Started</Button>
          </Link>
        ) : (
          <>
            <Link
              to='/dashboard'
              className='rounded-md border border-slate-200 bg-slate-100 px-[15px] py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200'
            >
              Dashboard
            </Link>
            <UserButton afterSignOutUrl='/' />
          </>
        )}
      </div>
    </header>
  )
}

export default Header
