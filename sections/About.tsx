'use client';

import { motion } from 'framer-motion';
// import { TypingText } from '@/components';

import styles from '@/styles';
import { fadeIn, staggerContainer,zoomIn } from '@/utils/motion';

const About = () => (
<section  id="about" className={`${styles.paddings} sm:p-8 xs:p-4 px-6 py-8`}> 
<div className="section-heading">
          <h2 className="section-title mt-5">
            Sobre Nós
          </h2>
        </div>
  <motion.div
   variants={staggerContainer(0.1, 0.2)}
    initial="hidden"
    whileInView="show"
    viewport={{ once: false, amount: 0.25 }}
    className={`${styles.innerWidth} mx-auto flex lg:flex-row flex-col gap-3 mt-4`} 
  >
<motion.div
  variants={fadeIn('right', 'tween', 0.2, 1)}
  className="flex-[0.5] lg:max-w-[370px] flex flex-col gradient-05 sm:p-6 p-4 rounded-[20px] border-[1px] border-[#6A6A6A] relative"
>
  <div className="flex flex-col flex-grow justify-start space-y-3">
    <h4 className="font-bold sm:text-[24px] text-[20px] text-white">
      ProEnglish Academy
    </h4>

    <p className="font-normal sm:text-[18px] text-[14px] text-white">
 
    A ProEnglish Academy é uma plataforma inovadora de ensino de inglês, projetada para atender a diferentes necessidades e objetivos. Oferecemos cursos personalizados que vão do básico ao avançado, além de programas especializados em áreas como negócios, tecnologia, setor bancário e petróleo. 
    </p>
  </div>
</motion.div>


    <motion.div
      variants={fadeIn('left', 'tween', 0.2, 1)}
      className="relative flex-1 flex justify-center items-center"
    >
      <img
        src="/about-1.jpg"
        alt="planet-09"
        className="w-full lg:h-[400px] h-auto min-h-[180px] object-cover rounded-[20px]"
      />

      <motion.div
        variants={zoomIn(0.4, 1)}
        className="lg:block hidden absolute -left-[5%] top-[2%]"
      >
        {/* <img
          src="/logosaas.png"
          alt="stamp"
          className="w-[50px] h-[50px] object-contain"
        /> */}
      </motion.div>
    </motion.div>
  </motion.div>
</section>








);

export default About;
