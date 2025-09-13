
import About from "@/sections/About";
import CallToAction from "@/sections/CallToAction";
import Explore from "@/sections/Explore";
import Features from "@/sections/Features";
import Footer from "@/sections/Footer";
import Header from "@/sections/Header";
import Hero from "@/sections/Hero";
import LogoTicker from "@/sections/LogoTicker";
import PracticeLab from "@/sections/PracticeLab";
import Pricing from "@/sections/Pricing";
import Testimonials from "@/sections/Testimonials";
import Chatbot from "@/components/Chatbot";



export default function Home() {
  return (


    <>
     <div className="relative">
        <div className="gradient-03  z-0" />
        <Header />
      </div>

     <div className="relative">
        <div className="gradient-03  z-0" />
        <Hero />
      </div>

      <div className="relative">
        <div className="gradient-01  z-0" />
        <LogoTicker />
      </div>

      <div className="relative">
        <div className="gradient-01  z-0" />
        <About />
      </div> 

      <div className="relative">
        <div className="gradient-03  z-0" />
        <Explore />
      </div>
      <div className="relative">
        <div className="gradient-01  z-0" />
        <Features />
      </div>
      <div className="relative">
        <div className="gradient-03  z-0" />
        <PracticeLab />
      </div>
      <div className="relative">
        <div className="gradient-01  z-0" />
        <Pricing />
      </div>
      <div className="relative">
        <div className="gradient-03  z-0" />
        <Testimonials />
      </div>
      <div className="relative">
        <div className="gradient-01  z-0" />
        <CallToAction />
      </div>
      <div className="relative">
        <div className="gradient-01  z-0" />
        <Footer />
      </div>

      {/* Chatbot */}
      <Chatbot />
 
    </>
  );
}
