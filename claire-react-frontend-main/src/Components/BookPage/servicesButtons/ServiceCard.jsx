import React from 'react'
import '../BookPage.css'

const ServiceCard = ({ service, onToggle, isSelected }) => {
  return (
    <label className='booking-checkbar'>
      <div className='book-input'>
        <input
          type='checkbox'
          checked={isSelected}
          onChange={() => onToggle(service)}
        />
      </div>

      <div className='left-side'>
        <div className='service-name'>{service.name}</div>
      </div>

      <div className='right-side'>
        <div className='price'>
          {typeof service.price === 'number' ? `PHP ${service.price}` : service.priceLabel}
        </div>
      </div>
    </label>
  )
}

export default ServiceCard
