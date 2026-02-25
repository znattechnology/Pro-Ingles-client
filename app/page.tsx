'use client';

import dynamic from 'next/dynamic';
import Header from "@/sections/Header";
import Hero from "@/sections/Hero";
import Footer from "@/sections/Footer";
import { useState, useEffect } from 'react';

// Dynamic imports for below-fold sections (performance optimization)
const PracticeLab = dynamic(() => import("@/sections/PracticeLab"), {
  loading: () => <SectionLoader />,
});

const Testimonials = dynamic(() => import("@/sections/Testimonials"), {
  loading: () => <SectionLoader />,
});

const Pricing = dynamic(() => import("@/sections/Pricing"), {
  loading: () => <SectionLoader />,
});

const CallToAction = dynamic(() => import("@/sections/CallToAction"), {
  loading: () => <SectionLoader />,
});

// Lazy load Chatbot - only when user scrolls or after delay
const Chatbot = dynamic(() => import("@/components/Chatbot"), {
  ssr: false,
});

// Simple loading placeholder for sections
function SectionLoader() {
  return (
    <div className="py-24 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function Home() {
  const [showChatbot, setShowChatbot] = useState(false);

  // Load chatbot after 3 seconds or on scroll
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowChatbot(true);
    }, 3000);

    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowChatbot(true);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      {/* Header - Always loaded (above fold) */}
      <div className="relative">
        <div className="gradient-03 z-0" />
        <Header />
      </div>

      {/* Hero - Always loaded (above fold) */}
      <div className="relative">
        <div className="gradient-03 z-0" />
        <Hero />
      </div>

      {/* PracticeLab - Dynamic (replaces Features) */}
      <div className="relative">
        <div className="gradient-02 z-0" />
        <PracticeLab />
      </div>

      {/* Testimonials - Dynamic */}
      <div className="relative">
        <div className="gradient-01 z-0" />
        <Testimonials />
      </div>

      {/* Pricing - Dynamic */}
      <div className="relative">
        <div className="gradient-02 z-0" />
        <Pricing />
      </div>

      {/* CallToAction - Dynamic */}
      <div className="relative">
        <div className="gradient-03 z-0" />
        <CallToAction />
      </div>

      {/* Footer - Always loaded */}
      <div className="relative">
        <div className="gradient-01 z-0" />
        <Footer />
      </div>

      {/* Chatbot - Lazy loaded after scroll/delay */}
      {showChatbot && <Chatbot />}
    </>
  );
}
