'use client';

export function PageGradientOverlay() {
  return (
    <>
      {/* Top edge fade */}
      <div 
        className="pointer-events-none fixed inset-x-0 top-0 h-32 bg-gradient-to-b from-background via-background/95 via-20% to-transparent z-30" 
        aria-hidden="true"
      />
      
      {/* Bottom edge fade */}
      <div 
        className="pointer-events-none fixed inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background via-background/95 via-20% to-transparent z-30" 
        aria-hidden="true"
      />
    </>
  );
}