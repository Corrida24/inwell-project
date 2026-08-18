import React from 'react';
import { motion, type Variants } from 'motion/react';

const EASE = [0.22, 1, 0.36, 1] as const;

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}

/** Fades + slides an element up once, the moment it enters the viewport. */
export const Reveal: React.FC<RevealProps> = ({ children, delay = 0, y = 22, className }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.6, delay, ease: EASE }}
  >
    {children}
  </motion.div>
);

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
};

interface RevealStaggerProps {
  children: React.ReactNode;
  className?: string;
}

/** Parent for a grid/list — reveals its RevealItem children one after another. */
export const RevealStagger: React.FC<RevealStaggerProps> = ({ children, className }) => (
  <motion.div
    className={className}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-60px' }}
    variants={containerVariants}
  >
    {children}
  </motion.div>
);

interface RevealItemProps {
  children: React.ReactNode;
  className?: string;
  y?: number;
}

export const RevealItem: React.FC<RevealItemProps> = ({ children, className, y = 18 }) => (
  <motion.div
    className={className}
    variants={{
      hidden: { opacity: 0, y },
      visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
    }}
  >
    {children}
  </motion.div>
);
