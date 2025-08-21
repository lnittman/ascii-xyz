interface TextFadeProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export function TextFade({ children, style, className }: TextFadeProps) {
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}