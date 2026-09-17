import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'

const App = () => {
  const { isLoaded, isSignedIn } = useUser()
  const location = useLocation()

  if (!isLoaded) {
    return <div className='flex min-h-screen items-center justify-center'>Loading...</div>
  }

  if (!isSignedIn) {
    return <Navigate to='/auth/sign-in' replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

export default App
