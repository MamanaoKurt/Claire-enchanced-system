import React from 'react'
import HomePage from './Pages/HomePage'
import BookingPage from './Pages/BookingPage'
import AdminAppointmentsPage from './Pages/AdminAppointmentsPage'
import StaffSchedulePage from './Pages/StaffSchedulePage'
import LoginPage from './Pages/LoginPage'
import ProfilePage from './Pages/ProfilePage'
import { Layout } from './Layout'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './Components/Auth/ProtectedRoute'
import { ROLES } from './lib/auth'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path='/' element={<HomePage />} />
          <Route path='/home' element={<Navigate to='/' replace />} />
          <Route path='/page1' element={<BookingPage />} />
          <Route
            path='/admin'
            element={(
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminAppointmentsPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path='/staff-portal'
            element={(
              <ProtectedRoute allowedRoles={[ROLES.STAFF]}>
                <StaffSchedulePage />
              </ProtectedRoute>
            )}
          />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/signup' element={<LoginPage />} />
          <Route
            path='/profile'
            element={(
              <ProtectedRoute allowedRoles={[ROLES.REGISTERED_USER, ROLES.STAFF, ROLES.ADMIN]}>
                <ProfilePage />
              </ProtectedRoute>
            )}
          />
          <Route path='*' element={<Navigate to='/' replace />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App