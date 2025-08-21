import { motion } from 'framer-motion';
import Image from 'next/image';

interface AnimatedLogoProps {
  size?: number;
  className?: string;
}

export function AnimatedLogo({ size = 64, className = '' }: AnimatedLogoProps) {
  const logoAnimation = {
    float: {
      translateY: ['-3px', '3px', '-3px'], // Subtle up and down movement
      transition: {
        duration: 2.5, // Adjust duration for speed
        ease: 'easeInOut' as const,
        repeat: Number.POSITIVE_INFINITY,
      },
    },
  };

  return (
    <motion.div
      variants={logoAnimation}
      animate="float"
      className={`select-none ${className}`}
    >
      <Image
        src="/assets/logo.png"
        alt="Arbor Logo"
        width={size}
        height={size}
      />
    </motion.div>
  );
}
