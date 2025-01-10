'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

import styles from '../styles';
import { exploreWorlds } from '../constants';
import { staggerContainer } from '../utils/motion';
import ServiceCard from '@/components/ServiceCard';

// Define a type for the world/service item
interface WorldItem {
  id: string;  // Ensure id is a string
  imgUrl: string;
  title: string;
  description: string;
}

const Explore: React.FC = () => {
  // Specify the type for active state
  const [active, setActive] = useState<string>('world-2');

  return (
    <section className="py-24 overflow-x-clip" id='service'>
      <div className="container">
        <div className="section-heading">
          <h2 className="section-title mt-5">
            Nossos Serviços
          </h2>
        </div>

        <motion.div
          variants={staggerContainer(0.1, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.25 }}
          className={`${styles.innerWidth} mx-auto flex flex-col`}
        >
          <div className="mt-[50px] flex lg:flex-row flex-col min-h-[50vh] gap-5">
            {exploreWorlds.map((world, index) => (
              <ServiceCard
                key={world.id}
                {...world}
                index={index}
                active={active}
                handleClick={(id: string) => setActive(id)} 
                 // Explicitly convert setActive
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Explore;
