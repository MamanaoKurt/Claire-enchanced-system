export const ROLES = {
  GUEST: 'guest',
  REGISTERED_USER: 'registered_user',
  STAFF: 'staff',
  ADMIN: 'admin'
}

export const normalizeRole = (rawRole, isAuthenticated, email = '') => {
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''

  if (normalizedEmail === 'admin@claire.local') {
    return ROLES.ADMIN
  }

  if (typeof rawRole === 'string') {
    const normalized = rawRole.trim().toLowerCase()

    if (normalized === ROLES.ADMIN || normalized === 'staff_admin') {
      return ROLES.ADMIN
    }

    if (normalized === ROLES.STAFF) {
      return ROLES.STAFF
    }

    if (normalized === ROLES.REGISTERED_USER || normalized === 'customer' || normalized === 'user') {
      return ROLES.REGISTERED_USER
    }
  }

  return isAuthenticated ? ROLES.REGISTERED_USER : ROLES.GUEST
}

export const getStoredUser = () => {
  try {
    const rawUser = localStorage.getItem('claire_user')
    if (!rawUser) {
      return null
    }

    return JSON.parse(rawUser)
  } catch {
    localStorage.removeItem('claire_user')
    return null
  }
}

export const resolveUserRole = (user) => {
  const isAuthenticated = Boolean(user && user.email)
  return normalizeRole(user?.role, isAuthenticated, user?.email)
}

export const getRoleLabel = (role) => {
  if (role === ROLES.ADMIN) {
    return 'Admin'
  }

  if (role === ROLES.STAFF) {
    return 'Staff'
  }

  if (role === ROLES.REGISTERED_USER) {
    return 'Registered User'
  }

  return 'Guest'
}