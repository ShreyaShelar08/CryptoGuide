import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import NewFeatures from '../components/NewFeatures';
import { CTA, Footer } from '../components/CTAFooter';

export default function LandingPage({ onGetStarted }) {
  return (
    <>
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />
      <div className="bg-grid" />
      <Navbar onGetStarted={onGetStarted} />
      <Hero onGetStarted={onGetStarted} />
      <Features />
      <HowItWorks />
      <NewFeatures onGetStarted={onGetStarted} />
      <CTA onGetStarted={onGetStarted} />
      <Footer />
    </>
  );
}