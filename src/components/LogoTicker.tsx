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
    <div className="flex-shrink-0 flex items-center justify-center h-[36px] sm:h-[42px] w-[110px] sm:w-[130px] select-none px-2 text-center transition-transform duration-300 hover:scale-105">
      {!hasError && logo.url ? (
        <img
          src={logo.url}
          alt={logo.name}
          className="h-[36px] sm:h-[42px] max-h-full w-auto max-w-full object-contain filter grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
          loading="eager"
          decoding="async"
          draggable={false}
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="text-xs sm:text-sm font-semibold text-slate-400 hover:text-slate-900 transition-colors">
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
    <div className="px-6">
      <style>{keyframes}</style>
      <h3 className="text-[10px] font-bold text-slate-400 mb-1 tracking-widest uppercase text-center md:text-left">{title}</h3>
      <div className="overflow-hidden bg-transparent border-0 shadow-none h-[70px] sm:h-[80px] flex items-center w-full relative">
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

