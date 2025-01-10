
"use client";
// import ArrowRight from "@/public/arrow-right.svg";
import HeroImage from "@/public/bg.png";
import {motion, useScroll, useTransform} from "framer-motion";
import { MoveRight } from 'lucide-react';

import { useRef } from "react";
 const Hero = () => {
  const heroRef = useRef(null);
  const {scrollYProgress} = useScroll({
    target:heroRef,
    offset: ["start end","end start"]
  });

  const translateY = useTransform(scrollYProgress,[0,1], [150, -50]);
  return (
    <section ref={heroRef} className="pt-20 pb-20 md:pt-20 md:pb-10 overflow-clip ">
      <div className="container">
        <div className="md:flex items-center">
        <div className="md:w-[478px]">
          <div className="tag">Versão 1.0</div>
          <h1 className="text-5xl md:text-5xl font-bold tracking-tighter text-white mt-6 ">Fluência ao alcance de todos</h1>
          <p className=" text-center text-xl text-gray-300 tracking-tight mt-5">""Domine o inglês e expanda seus horizontes com a ProEnglish. Cursos personalizados, tecnologia de ponta e ensino interativo para transformar seus sonhos em conquistas globais."</p>
       
       <div className="flex gap-3 items-center mt-[30px]">
        <button className="btn btn-primary">Obtenha de graça</button>
        <button className="btn btn-text gap-1">Saber mais
        <MoveRight className="h-4 w-4 inline-flex justify-center items-center " size={24}/>
      
        </button>
       </div>
        </div>

        <div className="mt-20 md:mt-0 md:h-[648px] md:flex-1  relative">
          <motion.img src={HeroImage.src} alt="Hero" className="md:absolute md:h-full  md:w-auto md:max-w-none md:-left-[-62px]"
          animate={{
            translateY:[-30, 30]
          }}
          transition={{
            repeat:Infinity,
            repeatType:"mirror",
            duration:3,
            ease:"easeInOut"
          }}
          
          
          />
          {/* <motion.img src={CilindroImage.src} alt="Cilinder" width={220} height={220}
          style={{
            translateY: translateY
          }}
          className="hidden md:block -top-8 -left-[-30px] md:absolute lg:block "
          
          /> */}

{/* <motion.img src={noodleImage.src} alt="noodle" width={220} height={220}
 style={{
  rotate:30,
  translateY: translateY
}}
          className="hidden lg:block  top-[490px] left-[448px] absolute rotate-[30deg] overflow-clip z-20"
          
          /> */}
       
       
        </div>
        </div>
     
   
    
      </div>
    </section>
  )
};


export default Hero;