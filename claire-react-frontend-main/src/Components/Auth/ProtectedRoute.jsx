import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getStoredUser, resolveUserRole, ROLES } from '../../lib/auth'

const ProtectedRoute = ({ allowedRoles, children }) => {
  const location = useLocation()
  const user = getStoredUser()
  const currentRole = resolveUserRole(user)

  if (currentRole === ROLES.GUEST) {
    return <Navigate to='/login' state={{ from: location.pathname }} replace />
  }

  if (!allowedRoles.includes(currentRole)) {
    return <Navigate to='/' replace />
  }

  return children
}

export default ProtectedRoute
