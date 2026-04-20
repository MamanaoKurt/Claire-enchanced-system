import React from 'react'
import './GallerySection.css'
import gallery1 from '../../assets/GallerySection/gallery1.png'
import gallery2 from '../../assets/GallerySection/gallery2.png'
import gallery3 from '../../assets/GallerySection/gallery3.png'
import gallery4 from '../../assets/GallerySection/gallery4.png'
import gallery5 from '../../assets/GallerySection/gallery5.png'
import gallery6 from '../../assets/GallerySection/gallery6.png'

const GallerySection = () => {
  return (
    <div className='gallery-section' id='gallery'> 
        <div className='gallery-top'>
            <p>Our Recent Shots</p>
        </div>
        <div className='gallery-bottom'>
            <div className='gallery-layer1'>
                <img src={gallery1} alt="image" />
                <img src={gallery2} alt="image" />
                <img src={gallery3} alt="image" />
            </div>
            <div className='gallery-layer2'>
                <img src={gallery4} alt="image" />
                <img src={gallery5} alt="image" />
                <img src={gallery6} alt="image" />
            </div>
        </div>
      
    </div>
  )
}

export default GallerySection
