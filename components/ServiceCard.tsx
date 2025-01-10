'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

import styles from '@/styles';
import { fadeIn } from '@/utils/motion';

// Define the type for the ServiceCard props
interface ServiceCardProps {
  id: string ;
  imgUrl: string;
  title: string;
  description: string;
  index: number;
  active: string | number;
  handleClick: (id: string) => void; // Ajustado para aceitar apenas string
}

const ServiceCard: React.FC<ServiceCardProps> = ({ 
  id, 
  imgUrl, 
  title, 
  description, 
  index, 
  active, 
  handleClick 
}) => (
<motion.div
  variants={fadeIn('right', 'spring', index * 0.5, 0.75)}
  className={`relative ${
    active === id ? 'lg:flex-[3] flex-[8]' : 'lg:flex-[0.4] flex-[1.5]'
  } flex items-center justify-center min-w-[170px] h-[500px] transition-[flex] duration-[0.7s] ease-out-flex cursor-pointer`}
  onClick={() => handleClick(id)}
>
  <Image
    src={imgUrl}
    width={800}
    height={800}
    alt="planet-04"
    className="absolute w-full h-full object-cover rounded-[20px]"
  />
  {active !== id ? (
    <h3 className="font-semibold sm:text-[22px] text-[16px] text-white absolute z-0 lg:bottom-16 lg:rotate-[-90deg] lg:origin-[0,0]">
      {title}
    </h3>
  ) : (
    <div className="absolute bottom-0 p-6 flex justify-start w-full flex-col bg-[rgba(0,0,0,0.5)] rounded-b-[20px]">
  
    
      <h2 className="mt-[16px] font-semibold sm:text-[28px] text-[20px] text-white">
        {title}
      </h2>
      <p className="font-normal text-[16px] leading-[16px] text-white">
        {description}
      </p>
    </div>
  )}
</motion.div>
);

export default ServiceCard;