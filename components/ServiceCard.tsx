'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { fadeIn } from '@/utils/motion';
import { Users, Clock, Award, Building } from 'lucide-react';

// Define the type for the ServiceCard props
interface ServiceCardProps {
  id: string;
  imgUrl: string;
  title: string;
  description: string;
  icon?: string;
  companies?: string[];
  students?: string;
  level?: string;
  duration?: string;
  certification?: string;
  index: number;
  active: string | number;
  handleClick: (id: string) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ 
  id, 
  imgUrl, 
  title, 
  description,
  icon,
  companies,
  students,
  level,
  duration,
  certification,
  index, 
  active, 
  handleClick 
}) => (
<motion.div
  variants={fadeIn('right', 'spring', index * 0.1, 0.6)}
  className={`relative ${
    active === id ? 'lg:flex-[3.5] flex-[10]' : 'lg:flex-[0.8] flex-[2]'
  } flex items-center justify-center min-w-[200px] h-[600px] transition-[flex] duration-700 ease-out-flex cursor-pointer group overflow-hidden`}
  onClick={() => handleClick(id)}
  whileHover={{ scale: 1.02 }}
>
  <Image
    src={imgUrl}
    width={800}
    height={800}
    alt={title}
    className="absolute w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-110"
  />
  
  {/* Gradient Overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent rounded-2xl" />
  <div className="absolute inset-0 bg-gradient-to-r from-violet-900/30 to-purple-900/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

  {active !== id ? (
    // Collapsed State
    <div className="absolute inset-0 flex flex-col justify-between p-6">
      <div className="flex items-center justify-between">
        <div className="text-3xl">{icon}</div>
        <motion.div 
          className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 backdrop-blur-sm border border-violet-500/30 rounded-full px-3 py-1"
          whileHover={{ scale: 1.1 }}
        >
          <span className="text-white text-xs font-bold">{students}</span>
        </motion.div>
      </div>
      
      <div className="text-center lg:text-left">
        <h3 className="font-bold text-white text-xl lg:text-2xl mb-2 lg:transform lg:rotate-[-90deg] lg:origin-center lg:whitespace-nowrap">
          {title}
        </h3>
        <div className="hidden lg:block lg:transform lg:rotate-[-90deg] lg:origin-center lg:mt-8">
          <span className="text-violet-300 text-sm font-medium">{level}</span>
        </div>
      </div>
    </div>
  ) : (
    // Expanded State
    <div className="absolute inset-0 p-8 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center text-2xl shadow-xl">
            {icon}
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-white leading-tight">
              {title}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Users className="w-4 h-4 text-violet-400" />
              <span className="text-violet-300 text-sm font-semibold">{students} estudantes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-white/90 text-base leading-relaxed mb-6 flex-1">
        {description}
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-violet-900/30 backdrop-blur-sm border border-violet-700/30 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-violet-400" />
            <span className="text-violet-300 text-xs font-semibold">Duração</span>
          </div>
          <p className="text-white text-sm font-medium">{duration}</p>
        </div>
        
        <div className="bg-purple-900/30 backdrop-blur-sm border border-purple-700/30 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-xs font-semibold">Certificação</span>
          </div>
          <p className="text-white text-sm font-medium">{certification}</p>
        </div>
      </div>

      {/* Companies */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Building className="w-4 h-4 text-green-400" />
          <span className="text-green-300 text-sm font-semibold">Usado por:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {companies?.map((company, idx) => (
            <span 
              key={idx}
              className="bg-green-900/30 border border-green-700/30 text-green-300 text-xs px-3 py-1 rounded-full font-medium"
            >
              {company}
            </span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl shadow-xl transition-all duration-300"
      >
        Começar Curso
      </motion.button>
    </div>
  )}
</motion.div>
);

export default ServiceCard;