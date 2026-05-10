import React from 'react'
import { Outlet } from 'react-router-dom'
import { AuthFooter } from './AuthFooter'

export const AuthenticationLayout = () => {
  return (
    <>
    <div>
    <main>
      <Outlet/>
    </main>
    <AuthFooter/>
    </div>
    </>
  )
}
