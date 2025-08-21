'use client';
import { cn } from '@repo/design/lib/utils';

interface ArborAsciiLogoProps {
  size?: 'xs' | 'small' | 'medium' | 'large';
  className?: string;
  onClick?: () => void;
}

export function ArborAsciiLogo({
  size = 'medium',
  className,
  onClick,
}: ArborAsciiLogoProps) {
  const sizeClasses = {
    xs: 'text-[4px] leading-tight scale-75 lg:text-[2px] lg:leading-none lg:scale-50',
    small: 'text-[9px] leading-tight',
    medium: 'text-sm leading-tight',
    large: 'text-base leading-tight',
  };

  const asciiArt = `
 ▄▄▄       ██▀███   ▄▄▄▄    ▒█████   ██▀███  
▒████▄    ▓██   ██▒▓█████▄ ▒██▒  ██▒▓██   ██▒
▒██  ▀█▄  ▓██  ▄█ ▒▒██▒ ▄██▒██░  ██▒▓██  ▄█ ▒
░██▄▄▄▄██ ▒██▀▀█▄  ▒██░█▀  ▒██   ██░▒██▀▀█▄  
 ▓█   ▓██▒░██▓ ▒██▒░▓█  ▀█▓░ ████▓▒░░██▒ ░██▒
 ▒▒   ▓▒█░░ ▒▓ ░▒▓░░▒▓███▀▒░ ▒░▒░▒░ ░ ▒▓ ░▒▓░
  ▒   ▒▒ ░  ░▒ ░ ▒░▒░▒   ░   ░ ▒ ▒░   ░▒ ░ ▒░
  ░   ▒     ░░   ░  ░    ░ ░ ░ ░ ▒    ░░   ░ 
      ░      ░      ░          ░ ░     ░     
                                             `;

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={cn(
        'user-select-none select-none font-mono text-foreground/80',
        sizeClasses[size],
        onClick &&
          '-mx-8 -my-1 rounded-md py-1 transition-all duration-200 hover:opacity-70 active:scale-[0.98] active:opacity-50',
        className
      )}
    >
      <pre className="user-select-none select-none whitespace-pre">
        {asciiArt}
      </pre>
    </Component>
  );
}
