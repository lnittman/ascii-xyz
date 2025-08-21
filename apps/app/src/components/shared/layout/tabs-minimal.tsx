'use client';

import { motion } from 'framer-motion';
import * as React from 'react';

import { cn } from '@repo/design/lib/utils';

interface TabsMinimalProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const TabsContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
}>({
  value: '',
  onValueChange: () => {},
});

export function TabsMinimal({
  value,
  onValueChange,
  children,
  className,
}: TabsMinimalProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1 border-border border-b',
        className
      )}
    >
      {children}
    </div>
  );
}

export function Tab({ value, children, className }: TabProps) {
  const { value: selectedValue, onValueChange } = React.useContext(TabsContext);
  const isSelected = value === selectedValue;

  return (
    <button
      onClick={() => onValueChange(value)}
      className={cn(
        'group relative rounded-none px-3 py-2 text-sm transition-all',
        className
      )}
    >
      {/* Hover background */}
      <div
        className={cn(
          'absolute inset-0 rounded-none transition-colors duration-200',
          'group-hover:bg-accent/60'
        )}
      />

      {/* Text content */}
      <span
        className={cn(
          'relative z-10 transition-colors duration-200',
          isSelected
            ? 'font-medium text-foreground'
            : 'text-muted-foreground group-hover:text-foreground'
        )}
      >
        {children}
      </span>

      {/* Animated underline - slides between tabs */}
      {isSelected && (
        <motion.div
          className="absolute right-0 bottom-0 left-0 z-20 h-[2px] bg-primary"
          layoutId="tab-underline"
          transition={{
            duration: 0.3,
            ease: [0.32, 0.72, 0, 1],
          }}
        />
      )}
    </button>
  );
}
