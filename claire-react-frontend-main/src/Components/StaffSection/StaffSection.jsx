import React from 'react'
import staffimage from '../../assets/user-icon.png'
import './StaffSection.css'

const StaffSection = () => {
  return (
    <div className='staff-section' id='staff'>
         <div className='staff-top'>
                <h1>Our Team</h1>
            </div>
        <div className='staff-image-container'>
            <div className='staff-images'>
                <img src={staffimage} alt="" />
                <p>Position</p>
                <hr />
                <h2>Name</h2>
            </div>

            <div className='staff-images'>
                <img src={staffimage} alt="" />
                <p>Position</p>
                <hr />
                <h2>Name</h2>
            </div>

            <div className='staff-images'>
                <img src={staffimage} alt="" />
                <p>Position</p>
                <hr />
                <h2>Name</h2>
            </div>

            <div className='staff-images'>
                <img src={staffimage} alt="" />
                <p>Position</p>
                <hr />
                <h2>Name</h2>
            </div>

            <div className='staff-images'>
                <img src={staffimage} alt="" />
                <p>Position</p>
                <hr />
                <h2>Name</h2>
            </div>
        </div>
        
    </div>
  )
}

export default StaffSection
