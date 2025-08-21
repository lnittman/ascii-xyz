'use client';
import { cn } from '@/lib/utils';
import {
  AnimatePresence,
  type Transition,
  type Variants,
  motion,
} from 'framer-motion';
import React from 'react';

export type PresetType = 'blur' | 'fade-in-blur' | 'scale' | 'fade' | 'slide';
export type PerType = 'word' | 'char' | 'line';

export type TextEffectProps = {
  children: string;
  per?: PerType;
  as?: keyof React.JSX.IntrinsicElements;
  variants?: {
    container?: Variants;
    item?: Variants;
  };
  className?: string;
  preset?: PresetType;
  delay?: number;
  speedReveal?: number;
  speedSegment?: number;
  trigger?: boolean;
  onAnimationComplete?: () => void;
  onAnimationStart?: () => void;
  segmentWrapperClassName?: string;
  containerTransition?: Transition;
  segmentTransition?: Transition;
  style?: React.CSSProperties;
};

const defaultStaggerTimes: Record<PerType, number> = {
  char: 0.03,
  word: 0.05,
  line: 0.1,
};

const defaultContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
  exit: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
};

const defaultItemVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
  },
  exit: { opacity: 0 },
};

const presetVariants: Record<
  PresetType,
  { container: Variants; item: Variants }
> = {
  blur: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, filter: 'blur(12px)' },
      visible: { opacity: 1, filter: 'blur(0px)' },
      exit: { opacity: 0, filter: 'blur(12px)' },
    },
  },
  'fade-in-blur': {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, y: 10, filter: 'blur(8px)' },
      visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
      exit: { opacity: 0, y: 10, filter: 'blur(8px)' },
    },
  },
  scale: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, scale: 0 },
      visible: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0 },
    },
  },
  fade: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 },
    },
  },
  slide: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 },
    },
  },
};

export const TextEffect: React.FC<TextEffectProps> = ({
  children,
  per = 'word',
  as = 'div',
  variants,
  className,
  preset,
  delay = 0,
  speedReveal = 0.5,
  speedSegment = 0.5,
  trigger = true,
  onAnimationComplete,
  onAnimationStart,
  segmentWrapperClassName,
  containerTransition,
  segmentTransition,
  style,
}) => {
  const segments = React.useMemo(() => {
    if (per === 'line') {
      return children.split('\n');
    }
    if (per === 'word') {
      return children.split(' ');
    }
    return children.split('');
  }, [children, per]);

  const MotionComponent = (motion[as as keyof typeof motion] ||
    motion.div) as any;
  const selectedVariants = preset
    ? presetVariants[preset]
    : { container: defaultContainerVariants, item: defaultItemVariants };
  const containerVariants = variants?.container || selectedVariants.container;
  const itemVariants = variants?.item || selectedVariants.item;
  const staggerTime = defaultStaggerTimes[per];

  const transition: Transition = containerTransition || {
    staggerChildren: staggerTime,
    delayChildren: delay,
    duration: speedReveal,
  };

  const segmentContainerTransition: Transition = segmentTransition || {
    duration: speedSegment,
  };

  return (
    <AnimatePresence mode="wait">
      {trigger && (
        <MotionComponent
          className={cn('overflow-hidden', className)}
          style={style}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={containerVariants}
          transition={transition}
          onAnimationStart={onAnimationStart}
          onAnimationComplete={onAnimationComplete}
        >
          {segments.map((segment, i) => (
            <motion.span
              key={`${segment}-${i}`}
              className={cn(
                'inline-block',
                per === 'line' && 'block',
                segmentWrapperClassName
              )}
              variants={itemVariants}
              transition={segmentContainerTransition}
            >
              {segment}
              {per === 'word' && i < segments.length - 1 && ' '}
            </motion.span>
          ))}
        </MotionComponent>
      )}
    </AnimatePresence>
  );
};
