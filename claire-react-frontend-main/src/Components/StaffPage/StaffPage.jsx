import React, { useState } from 'react'
import './StaffPage.css'

const initialRequests = [
  {
    id: 'APPT-1034',
    name: 'Maria Santos',
    phone: '0991 234 5678',
    email: 'maria@email.com',
    services: ['Hair Color', 'Haircut', 'Treatment'],
    date: 'March 31, 2026',
    time: '10:00 AM - 12:00 NN',
    people: '2 persons',
    notes: 'Please avoid strong chemicals because I have a sensitive scalp.',
    status: 'Pending'
  },
  {
    id: 'APPT-1035',
    name: 'Angela Cruz',
    phone: '0917 583 9014',
    email: 'angela@email.com',
    services: ['Hair Spa', 'Manicure'],
    date: 'March 31, 2026',
    time: '1:00 PM - 2:30 PM',
    people: '1 person',
    notes: 'Prefers a quiet area near the back of the salon.',
    status: 'Pending'
  },
  {
    id: 'APPT-1036',
    name: 'Jessa Ramirez',
    phone: '0928 223 1146',
    email: 'jessa@email.com',
    services: ['Pedicure', 'Foot Spa'],
    date: 'April 1, 2026',
    time: '9:00 AM - 10:30 AM',
    people: '1 person',
    notes: 'Please prepare warm water only.',
    status: 'Accepted'
  },
  {
    id: 'APPT-1037',
    name: 'Danica Flores',
    phone: '0935 116 5529',
    email: 'danica@email.com',
    services: ['Gel Manicure', 'Classic Foot Spa'],
    date: 'April 1, 2026',
    time: '2:00 PM - 3:30 PM',
    people: '2 persons',
    notes: 'Will arrive 10 minutes early.',
    status: 'Accepted'
  }
]

const StaffPage = () => {
  const [requests, setRequests] = useState(initialRequests)
  const [activeTab, setActiveTab] = useState('Pending')
  const [selectedRequestId, setSelectedRequestId] = useState(initialRequests[0]?.id ?? null)

  const visibleRequests = requests.filter((request) => request.status === activeTab)
  const selectedRequest =
    visibleRequests.find((request) => request.id === selectedRequestId) ?? visibleRequests[0] ?? null

  const updateRequest = (requestId, updater) => {
    setRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === requestId ? { ...request, ...updater(request) } : request
      )
    )
  }

  const handleCancel = (requestId) => {
    updateRequest(requestId, () => ({ status: 'Cancelled' }))
  }

  const handleFinish = (requestId) => {
    updateRequest(requestId, () => ({ status: 'Completed' }))
  }

  const handleReschedule = (requestId) => {
    const newDate = window.prompt('Enter the new appointment date:', 'April 3, 2026')

    if (!newDate) {
      return
    }

    const newTime = window.prompt('Enter the new appointment time:', '11:00 AM - 12:30 PM')

    if (!newTime) {
      return
    }

    updateRequest(requestId, () => ({
      date: newDate,
      time: newTime
    }))
  }

  const renderActions = (request) => {
    if (!request) {
      return null
    }

    return (
      <div className='staff-page__actions'>
        <button
          type='button'
          className='staff-page__button staff-page__button--secondary'
          onClick={() => handleReschedule(request.id)}
        >
          Reschedule
        </button>

        {request.status === 'Accepted' ? (
          <button
            type='button'
            className='staff-page__button'
            onClick={() => handleFinish(request.id)}
          >
            Finish
          </button>
        ) : null}

        <button
          type='button'
          className='staff-page__button staff-page__button--danger'
          onClick={() => handleCancel(request.id)}
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <section className='staff-page'>
      <div className='staff-page__header'>
        <p className='staff-page__eyebrow'>Salon Admin</p>
        <h1>Appointment Requests</h1>
        <p>
          View pending and accepted bookings, then reschedule, finish, or cancel each
          appointment.
        </p>
      </div>

      <div className='staff-page__summary'>
        <div className='staff-page__summary-card'>
          <span>Pending Requests</span>
          <strong>{requests.filter((request) => request.status === 'Pending').length}</strong>
        </div>

        <div className='staff-page__summary-card'>
          <span>Accepted Requests</span>
          <strong>{requests.filter((request) => request.status === 'Accepted').length}</strong>
        </div>
      </div>

      <div className='staff-page__panel'>
        <div className='staff-page__tabs'>
          {['Pending', 'Accepted'].map((tab) => (
            <button
              key={tab}
              type='button'
              className={`staff-page__tab ${activeTab === tab ? 'staff-page__tab--active' : ''}`}
              onClick={() => {
                setActiveTab(tab)
                setSelectedRequestId(null)
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className='staff-page__content'>
          <div className='staff-page__list'>
            {visibleRequests.length === 0 ? (
              <div className='staff-page__empty'>
                No {activeTab.toLowerCase()} requests available right now.
              </div>
            ) : (
              visibleRequests.map((request) => (
                <article
                  key={request.id}
                  className={`staff-page__card ${
                    selectedRequest?.id === request.id ? 'staff-page__card--active' : ''
                  }`}
                  onClick={() => setSelectedRequestId(request.id)}
                >
                  <div className='staff-page__card-top'>
                    <div>
                      <h2>{request.name}</h2>
                      <p>{request.id}</p>
                    </div>
                    <span className={`staff-page__status staff-page__status--${request.status.toLowerCase()}`}>
                      {request.status}
                    </span>
                  </div>

                  <div className='staff-page__card-details'>
                    <p>{request.date}</p>
                    <p>{request.time}</p>
                    <p>{request.services.join(', ')}</p>
                    <p>{request.people}</p>
                  </div>

                  {renderActions(request)}
                </article>
              ))
            )}
          </div>

          <div className='staff-page__details'>
            {selectedRequest ? (
              <>
                <div className='staff-page__details-header'>
                  <div>
                    <h2>{selectedRequest.name}</h2>
                    <p>Appointment ID: {selectedRequest.id}</p>
                  </div>
                  <span
                    className={`staff-page__status staff-page__status--${selectedRequest.status.toLowerCase()}`}
                  >
                    {selectedRequest.status}
                  </span>
                </div>

                <div className='staff-page__details-grid'>
                  <section className='staff-page__details-card'>
                    <h3>Customer Details</h3>
                    <p><span>Phone:</span> {selectedRequest.phone}</p>
                    <p><span>Email:</span> {selectedRequest.email}</p>
                    <p><span>People:</span> {selectedRequest.people}</p>
                  </section>

                  <section className='staff-page__details-card'>
                    <h3>Appointment Details</h3>
                    <p><span>Date:</span> {selectedRequest.date}</p>
                    <p><span>Time:</span> {selectedRequest.time}</p>
                    <p><span>Services:</span> {selectedRequest.services.join(', ')}</p>
                  </section>
                </div>

                <section className='staff-page__details-card staff-page__details-card--full'>
                  <h3>Customer Notes</h3>
                  <p>{selectedRequest.notes}</p>
                </section>

                <section className='staff-page__details-card staff-page__details-card--full'>
                  <h3>Actions</h3>
                  {renderActions(selectedRequest)}
                </section>
              </>
            ) : (
              <div className='staff-page__empty'>
                Select a request to view the full appointment details.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default StaffPage
