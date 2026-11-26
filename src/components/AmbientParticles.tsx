import React from 'react';

const FIREFLIES = [
  { top: '14%', left: '12%', delay: '0s', size: 5 },
  { top: '26%', left: '84%', delay: '1.4s', size: 6 },
  { top: '44%', left: '22%', delay: '2.8s', size: 4 },
  { top: '38%', left: '72%', delay: '0.7s', size: 5 },
  { top: '62%', left: '15%', delay: '3.5s', size: 6 },
  { top: '68%', left: '88%', delay: '2.1s', size: 4 },
  { top: '20%', left: '48%', delay: '4.2s', size: 5 },
  { top: '54%', left: '58%', delay: '1.1s', size: 4 },
];

const LEAVES = [
  { left: '8%', delay: '0s', duration: '15s' },
  { left: '27%', delay: '4s', duration: '18s' },
  { left: '52%', delay: '2s', duration: '14s' },
  { left: '74%', delay: '7s', duration: '17s' },
  { left: '91%', delay: '5s', duration: '16s' },
];

export const AmbientParticles: React.FC = () => {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
      {/* Yumuşak güneş ışığı / ay ışığı hüzmesi */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[520px] rounded-full bg-emerald-400/10 blur-[120px]" />
      <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-[110px]" />
      <div className="absolute bottom-0 right-0 w-[550px] h-[450px] rounded-full bg-amber-300/5 blur-[130px]" />

      {/* Ateşböcekleri */}
      {FIREFLIES.map((f, idx) => (
        <span
          key={`firefly-${idx}`}
          className="animate-firefly absolute rounded-full bg-amber-200/80 shadow-[0_0_12px_rgba(253,230,138,0.85)]"
          style={{
            top: f.top,
            left: f.left,
            width: `${f.size}px`,
            height: `${f.size}px`,
            animationDelay: f.delay,
          }}
        />
      ))}

      {/* Süzülen söğüt yaprakları */}
      {LEAVES.map((leaf, idx) => (
        <svg
          key={`leaf-${idx}`}
          viewBox="0 0 24 24"
          className="animate-leaf-fall absolute -top-8 w-4 h-4 text-emerald-300/35"
          style={{
            left: leaf.left,
            animationDelay: leaf.delay,
            animationDuration: leaf.duration,
          }}
          fill="currentColor"
        >
          <path d="M12 2C9 7 7 12 12 22C17 12 15 7 12 2Z" />
        </svg>
      ))}
    </div>
  );
};
