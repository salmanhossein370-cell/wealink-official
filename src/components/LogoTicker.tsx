import React, { useState } from "react";

export interface TickerLogo {
  id: string;
  name: string;
  url: string;
}

interface Props {
  title: string;
  logos: TickerLogo[];
  speedSeconds?: number;
  direction?: 'left' | 'right';
}

const LogoItem: React.FC<{ logo: TickerLogo }> = ({ logo }) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="flex-shrink-0 flex items-center justify-center h-[36px] sm:h-[42px] w-[110px] sm:w-[130px] pointer-events-none select-none px-2 text-center">
      {!hasError && logo.url ? (
        <img
          src={logo.url}
          alt={logo.name}
          className="h-[36px] sm:h-[42px] max-h-full w-auto max-w-full object-contain pointer-events-none"
          loading="eager"
          decoding="async"
          draggable={false}
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="text-xs sm:text-sm font-bold text-slate-800 truncate">
          {logo.name}
        </span>
      )}
    </div>
  );
};

const LogoTicker = ({ title, logos, speedSeconds = 35, direction = 'left' }: Props) => {
  if (!logos || logos.length === 0) return null;

  // Repeat the logos list to ensure it spans enough width to cover the screen container,
  // making the infinite marquee loop seamlessly with zero jumps even if there are few logos.
  const repeatedLogos = [...logos];
  while (repeatedLogos.length > 0 && repeatedLogos.length < 12) {
    repeatedLogos.push(...logos);
  }

  // Create a dynamic custom animation name based on speed and direction
  const animationName = `ticker-anim-${direction}-${speedSeconds}`;

  // Render two pixel-identical groups.
  const renderGroup = (ariaHidden: boolean) => (
    <div
      className="flex shrink-0 items-center gap-8 sm:gap-10 pr-8 sm:pr-10"
      aria-hidden={ariaHidden || undefined}
    >
      {repeatedLogos.map((l, i) => (
        <LogoItem key={`${l.id}-${i}`} logo={l} />
      ))}
    </div>
  );

  const keyframes = direction === 'left'
    ? `@keyframes ${animationName} {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }`
    : `@keyframes ${animationName} {
        0% { transform: translateX(-50%); }
        100% { transform: translateX(0); }
      }`;

  return (
    <div className="px-4">
      <style>{keyframes}</style>
      <h3 className="text-xs font-extrabold text-[#1E293B] mb-2.5 tracking-wider uppercase">{title}</h3>
      <div className="overflow-hidden rounded-[24px] bg-white border border-[#E2E8F0]/70 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.02)] h-[80px] sm:h-[88px] flex items-center w-full relative">
        <div 
          className="flex flex-nowrap w-max"
          style={{
            animation: `${animationName} ${speedSeconds}s linear infinite`,
            willChange: "transform",
          }}
        >
          {renderGroup(false)}
          {renderGroup(true)}
        </div>
      </div>
    </div>
  );
};

export default LogoTicker;

