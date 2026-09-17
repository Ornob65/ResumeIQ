import { SignIn } from '@clerk/clerk-react'
import React from 'react'

function SignInPage() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-slate-50 px-6'>
      <SignIn routing='path' path='/auth/sign-in' fallbackRedirectUrl='/home' />
    </div>
  )
}

export default SignInPage
