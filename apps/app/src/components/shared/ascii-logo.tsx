interface AsciiLogoProps {
  size?: 'small' | 'medium' | 'large';
}

export function AsciiLogo({ size = 'medium' }: AsciiLogoProps) {
  const sizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  return (
    <div className={`font-mono text-center text-primary ${sizeClasses[size]}`}>
      <pre className="whitespace-pre">
{`  ▄▄▄       ▄▄▄       ▄████▄   ██▓ ██▓
 ▒████▄    ▒████▄    ▒██▀ ▀█  ▓██▒▓██▒
 ▒██  ▀█▄  ▒██  ▀█▄  ▒▓█    ▄ ▒██▒▒██▒
 ░██▄▄▄▄██ ░██▄▄▄▄██ ▒▓▓▄ ▄██▒░██░░██░
  ▓█   ▓██▒ ▓█   ▓██▒▒ ▓███▀ ░░██░░██░
  ▒▒   ▓▒█░ ▒▒   ▓▒█░░ ░▒ ▒  ░░▓  ░▓  
   ▒   ▒▒ ░  ▒   ▒▒ ░  ░  ▒    ▒ ░ ▒ ░
   ░   ▒     ░   ▒   ░         ▒ ░ ▒ ░
       ░  ░      ░  ░░ ░       ░   ░  
                     ░`}
      </pre>
    </div>
  );
}