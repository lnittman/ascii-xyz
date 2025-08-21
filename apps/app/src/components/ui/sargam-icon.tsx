import { forwardRef } from 'react';
import { cn } from '@repo/design/lib/utils';

interface SargamIconProps {
  icon: React.ComponentType<any>;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = {
  xs: 'h-3 w-3',   // 12px
  sm: 'h-3.5 w-3.5', // 14px
  md: 'h-4 w-4',   // 16px
  lg: 'h-5 w-5',   // 20px
  xl: 'h-6 w-6',   // 24px
};

export const SargamIcon = forwardRef<HTMLSpanElement, SargamIconProps>(
  ({ icon: Icon, className, size = 'md' }, ref) => {
    return (
      <span 
        ref={ref} 
        className={cn(
          'inline-flex items-center justify-center',
          sizes[size],
          className
        )}
        style={{ fontSize: `${parseInt(sizes[size].match(/\d+/)?.[0] || '4') * 4}px` }}
      >
        <Icon />
      </span>
    );
  }
);

SargamIcon.displayName = 'SargamIcon';