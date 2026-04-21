const rawApiUrl = import.meta.env.VITE_API_URL?.trim()

const normalizedApiUrl = rawApiUrl
  ? rawApiUrl.replace(/\/$/, '').replace(/\/api$/, '')
  : ''

const API_BASE_URL =
  normalizedApiUrl || 'https://claire-laravel-backend-main-kibskh.free.laravel.cloud'

const authHeaders = (extra = {}) => ({
  Accept: 'application/json',
  'Content-Type': 'application/json',
  ...extra,
})

const getStoredToken = () => {
  try {
    return localStorage.getItem('claire_auth_token')
  } catch {
    return null
  }
}

const request = async (path, options = {}) => {
  const token = getStoredToken()
  const headers = authHeaders(options.headers || {})

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    })
  } catch {
    throw new Error(`Failed to connect to the server at ${API_BASE_URL}`)
  }

  let data = null

  try {
    const contentType = response.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      data = await response.json()
    } else {
      const text = await response.text()
      data = text ? { message: text } : null
    }
  } catch {
    data = null
  }

  if (!response.ok) {
    const message =
      data?.message ||
      (data?.errors ? Object.values(data.errors)?.flat?.()[0] : null) ||
      `Request failed with status ${response.status}`

    throw new Error(message)
  }

  return data
}

export const loginApi = async ({ email, password }) => {
  const data = await request('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  if (data?.token) {
    localStorage.setItem('claire_auth_token', data.token)
  }

  return data
}

export const registerApi = async ({
  name,
  email,
  password,
  password_confirmation,
}) => {
  const data = await request('/api/register', {
    method: 'POST',
    body: JSON.stringify({
      name,
      email,
      password,
      password_confirmation,
    }),
  })

  if (data?.token) {
    localStorage.setItem('claire_auth_token', data.token)
  }

  return data
}

export const logoutApi = async () => {
  try {
    await request('/api/logout', {
      method: 'POST',
    })
  } finally {
    localStorage.removeItem('claire_auth_token')
    localStorage.removeItem('claire_user')
  }
}

export const getCurrentUserApi = async () => {
  return request('/api/user')
}

export const fetchNotificationsApi = async () => {
  return request('/api/notifications')
}

export const fetchCurrentServiceApi = async () => {
  return request('/api/current-service')
}

export const fetchUpcomingAppointmentApi = async () => {
  return request('/api/profile/upcoming-appointment')
}

export const fetchAppointmentAvailability = async (date) => {
  const query = new URLSearchParams({ date }).toString()
  return request(`/api/appointments/availability?${query}`)
}

export const fetchAppointmentCalendar = async (month) => {
  const query = new URLSearchParams({ month }).toString()
  return request(`/api/appointments/calendar?${query}`)
}

export const createPublicAppointment = async (payload) => {
  return request('/api/appointments', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export const fetchAdminAppointments = async (params = {}) => {
  const search = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, value)
    }
  })

  const query = search.toString()
  return request(`/api/admin/appointments${query ? `?${query}` : ''}`)
}

export const fetchAdminReportsSummary = async (params = {}) => {
  const search = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, value)
    }
  })

  const query = search.toString()
  return request(`/api/admin/reports/summary${query ? `?${query}` : ''}`)
}

export const createAdminAppointment = async (payload) => {
  return request('/api/admin/appointments', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export const updateAdminAppointment = async (id, payload) => {
  return request(`/api/admin/appointments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export const cancelAdminAppointment = async (id) => {
  return request(`/api/admin/appointments/${id}`, {
    method: 'DELETE',
  })
}

export const assignStaffToAppointment = async (id, assigned_staff_id) => {
  return request(`/api/admin/appointments/${id}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ assigned_staff_id }),
  })
}

export const fetchAdminStaffDirectory = async () => {
  return request('/api/admin/staff')
}

export const fetchStaffAppointments = async (params = {}) => {
  const search = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, value)
    }
  })

  const query = search.toString()
  return request(`/api/staff/appointments${query ? `?${query}` : ''}`)
}

export const updateStaffAppointmentStatus = async (id, status) => {
  return request(`/api/staff/appointments/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export const addStaffAppointmentNotes = async (id, staff_notes) => {
  return request(`/api/staff/appointments/${id}/notes`, {
    method: 'PATCH',
    body: JSON.stringify({ staff_notes }),
  })
}

export const requestStaffAppointmentReschedule = async (id, payload) => {
  return request(`/api/staff/appointments/${id}/reschedule-request`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}