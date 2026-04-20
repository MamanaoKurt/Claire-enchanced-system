import React from 'react'
import './PromoSection.css'
import promo1 from '../../assets/promo1.png'
import promo2 from '../../assets/promo2.png'
import promo3 from '../../assets/promo3.png'
import percent from '../../assets/promo-percent.png'

const PromoSection = () => {
  return (
    <div className='promosection' id='promo'>
      <div className='promo-inner'>
        <div className='promo-top'>
          <img src={percent} alt="percent" /> 
        </div>
        <div className='promo-images'>
          <div className='promo-image-button'><img src={promo3} alt="promo3" /><button>BOOK NOW!</button></div>
          <div className='promo-image-button'><img src={promo1} alt="promo1" /><button>BOOK NOW!</button></div>  
          <div className='promo-image-button'><img src={promo2} alt="promo2" /><button>BOOK NOW!</button></div>    
        </div>
      </div>
    </div>
  )
}

export default PromoSection
