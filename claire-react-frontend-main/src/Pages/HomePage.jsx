import React from 'react'
import HeroSection from '../Components/HeroSection/HeroSection'
import SecondSection from '../Components/secondSection/secondSection'
import Services from '../Components/Services/Services'
import GallerySection from '../Components/GallerySection/GallerySection'
import FeedbackSection from '../Components/FeedbackSection/FeedbackSection'
import FillerSection from '../Components/FillerSection/FillerSection'
import FooterSection from '../Components/FooterSection/FooterSection'

const HomePage = () => {
  return (
    <div className='container'>
      <HeroSection />
      <SecondSection />
      <Services />
      <GallerySection />
      <FeedbackSection />
      <FillerSection />
      <FooterSection />
    </div>
  )
}

export default HomePage