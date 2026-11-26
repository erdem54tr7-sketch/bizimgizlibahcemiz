import React from 'react';
import type { Pot, Wish } from '../types';
import { FlowerIllustration } from './FlowerIllustration';

interface WeepingWillowProps {
  wishes: Wish[];
  pots: Pot[];
  unreadLettersCount: number;
  onSelectWish: (wish: Wish) => void;
  onSelectPot: (pot: Pot) => void;
  onOpenMailbox: () => void;
  onOpenNewWish: () => void;
}

// Gerçekçi Söğüt dalları üzerinde 12 dengeli asma noktası (viewBox 0 0 800 580)
const BRANCH_ANCHORS: Array<{ x: number; y: number; swayDelay: string }> = [
  { x: 175, y: 245, swayDelay: '0s' },
  { x: 235, y: 208, swayDelay: '0.8s' },
  { x: 298, y: 184, swayDelay: '1.5s' },
  { x: 370, y: 162, swayDelay: '0.4s' },
  { x: 445, y: 172, swayDelay: '1.9s' },
  { x: 520, y: 192, swayDelay: '0.6s' },
  { x: 590, y: 230, swayDelay: '1.2s' },
  { x: 205, y: 295, swayDelay: '2.1s' },
  { x: 275, y: 265, swayDelay: '0.3s' },
  { x: 488, y: 260, swayDelay: '1.7s' },
  { x: 558, y: 290, swayDelay: '0.9s' },
  { x: 632, y: 272, swayDelay: '2.4s' },
];

// Şelale gibi sarkan uzun Salkım Söğüt dalları (arka ve ön katmanlar)
const WILLOW_VINES = [
  { x: 132, y: 218, h: 175, delay: '0.2s', back: true },
  { x: 156, y: 192, h: 205, delay: '0s', back: false },
  { x: 182, y: 172, h: 225, delay: '0.9s', back: true },
  { x: 208, y: 154, h: 238, delay: '0.5s', back: false },
  { x: 234, y: 138, h: 245, delay: '1.3s', back: true },
  { x: 262, y: 124, h: 242, delay: '0.4s', back: false },
  { x: 292, y: 112, h: 225, delay: '1.6s', back: true },
  { x: 322, y: 102, h: 205, delay: '0.8s', back: false },
  { x: 354, y: 94, h: 175, delay: '2.0s', back: true },
  { x: 386, y: 90, h: 165, delay: '0.7s', back: false },
  { x: 418, y: 92, h: 170, delay: '1.4s', back: true },
  { x: 450, y: 98, h: 195, delay: '0.3s', back: false },
  { x: 482, y: 108, h: 215, delay: '1.7s', back: true },
  { x: 514, y: 120, h: 235, delay: '0.6s', back: false },
  { x: 544, y: 134, h: 245, delay: '1.9s', back: true },
  { x: 574, y: 150, h: 235, delay: '0.4s', back: false },
  { x: 604, y: 168, h: 220, delay: '1.2s', back: true },
  { x: 632, y: 190, h: 198, delay: '0.8s', back: false },
  { x: 660, y: 215, h: 175, delay: '1.5s', back: true },
];

// Söğüt ağacının dibindeki çimenlerde saksı yerleşim koordinatları (mektup kutusuyla çakışmaz)
const GROUND_POT_SLOTS: Array<{ x: number; y: number }> = [
  { x: 286, y: 472 },
  { x: 484, y: 474 },
  { x: 214, y: 480 },
  { x: 642, y: 476 },
  { x: 142, y: 474 },
  { x: 712, y: 482 },
  { x: 74, y: 484 },
  { x: 250, y: 506 },
  { x: 178, y: 508 },
  { x: 676, y: 506 },
];

export const WeepingWillow: React.FC<WeepingWillowProps> = ({
  wishes,
  pots,
  unreadLettersCount,
  onSelectWish,
  onSelectPot,
  onOpenMailbox,
  onOpenNewWish,
}) => {
  const visibleWishes = wishes.slice(0, 12);

  return (
    <div className="relative w-full max-w-4xl mx-auto select-none">
      {/* Üst etkileşim çubuğu */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-2">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-200/80 bg-emerald-950/60 border border-emerald-500/20 px-3 py-1.5 rounded-full backdrop-blur-md">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
          <span>Dallardaki dileklere veya ağacın altındaki saksılara dokun</span>
        </div>
        <button
          onClick={onOpenNewWish}
          className="text-xs sm:text-sm font-medium px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-emerald-950 hover:from-emerald-400 hover:to-teal-400 transition shadow-lg shadow-emerald-900/50 cursor-pointer"
        >
          + Söğüde Dilek As
        </button>
      </div>

      {/* Büyülü Cennet Bahçesi Sahnesi */}
      <div className="relative rounded-3xl overflow-hidden border border-emerald-500/20 bg-gradient-to-b from-[#0b291d]/90 via-[#0c2d1f]/85 to-[#061810]/95 shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
        <svg
          viewBox="0 0 800 540"
          className="w-full h-auto block"
          role="img"
          aria-label="İnteraktif Salkım Söğüt Ağacı ve Gizli Mektup Kutusu"
        >
          <defs>
            <radialGradient id="willowGlow" cx="50%" cy="35%" r="55%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.24" />
              <stop offset="65%" stopColor="#065f46" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#04150d" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="meadowGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14532d" />
              <stop offset="100%" stopColor="#052e16" />
            </linearGradient>
            <linearGradient id="trunkGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#2c190e" />
              <stop offset="35%" stopColor="#54331f" />
              <stop offset="65%" stopColor="#663f27" />
              <stop offset="100%" stopColor="#2c190e" />
            </linearGradient>
            <radialGradient id="goldStarOrb" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef9c3" />
              <stop offset="45%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="canopyDark" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#065f46" />
              <stop offset="100%" stopColor="#022c22" />
            </radialGradient>
          </defs>

          {/* Arka plan halosu */}
          <rect width="800" height="540" fill="url(#willowGlow)" />

          {/* Ay & Yıldızlar */}
          <circle cx="695" cy="72" r="30" fill="#fef3c7" opacity="0.14" />
          <circle cx="695" cy="72" r="18" fill="#fef9c3" opacity="0.34" />
          {[
            [85, 58],
            [162, 42],
            [270, 68],
            [525, 48],
            [612, 82],
            [745, 122],
          ].map(([sx, sy], i) => (
            <circle key={i} cx={sx} cy={sy} r="1.8" fill="#fde68a" opacity="0.65" />
          ))}

          {/* Çimen tepeleri */}
          <path d="M0 440 Q210 385 420 432 T800 422 L800 540 L0 540 Z" fill="#064e3b" opacity="0.55" />
          <path d="M0 462 Q260 418 480 452 T800 448 L800 540 L0 540 Z" fill="url(#meadowGrad)" />

          {/* Arka katman sarkan söğüt dalları */}
          {WILLOW_VINES.filter((v) => v.back).map((vine, idx) => (
            <g key={`back-${idx}`} className="animate-sway-slow" style={{ animationDelay: vine.delay }}>
              <path
                d={`M${vine.x} ${vine.y} C${vine.x - 12} ${vine.y + vine.h * 0.35}, ${vine.x + 8} ${vine.y + vine.h * 0.7}, ${vine.x - 2} ${vine.y + vine.h}`}
                stroke="#065f46"
                strokeWidth="2.6"
                strokeLinecap="round"
                fill="none"
                opacity="0.72"
              />
              {[0.18, 0.34, 0.5, 0.66, 0.82, 0.94].map((ratio, j) => {
                const ly = vine.y + vine.h * ratio;
                const lx = vine.x + (j % 2 === 0 ? -5 : 5);
                return (
                  <path
                    key={j}
                    d={`M${lx} ${ly - 6} Q${lx - 4} ${ly} ${lx} ${ly + 8} Q${lx + 4} ${ly} ${lx} ${ly - 6} Z`}
                    fill="#047857"
                    opacity="0.72"
                  />
                );
              })}
            </g>
          ))}

          {/* Gerçekçi Kıvrımlı Söğüt Gövdesi ve Kökleri */}
          <g>
            <ellipse cx="402" cy="476" rx="68" ry="12" fill="#021e11" opacity="0.6" />
            <path
              d="M342 478 C362 465, 370 438, 372 390 C374 335, 378 292, 372 250 C366 218, 336 184, 286 154 L302 142 C348 168, 378 198, 392 232 C402 195, 405 162, 396 128 L414 126 C424 162, 422 196, 415 234 C432 196, 466 164, 514 142 L526 156 C474 182, 438 218, 430 256 C424 300, 428 345, 434 396 C440 440, 448 466, 468 478 Q404 490 342 478 Z"
              fill="url(#trunkGrad)"
            />
            {/* Kabuk dokusu çizgileri */}
            <path d="M385 458 Q390 390 388 310" stroke="#24130a" strokeWidth="2" fill="none" opacity="0.5" />
            <path d="M404 468 Q402 380 407 290" stroke="#7c4f33" strokeWidth="1.6" fill="none" opacity="0.4" />
            <path d="M419 452 Q415 385 418 315" stroke="#24130a" strokeWidth="2" fill="none" opacity="0.45" />

            {/* Kavisli kemer söğüt ana dalları */}
            <path d="M378 232 Q265 142 142 212" stroke="#4a2d1b" strokeWidth="11" strokeLinecap="round" fill="none" />
            <path d="M422 230 Q540 138 656 208" stroke="#4a2d1b" strokeWidth="11" strokeLinecap="round" fill="none" />
            <path d="M394 195 Q325 102 225 136" stroke="#4a2d1b" strokeWidth="8" strokeLinecap="round" fill="none" />
            <path d="M412 194 Q482 100 578 138" stroke="#4a2d1b" strokeWidth="8" strokeLinecap="round" fill="none" />
          </g>

          {/* Organik Söğüt Tepe Örtüsü */}
          <g opacity="0.88">
            <path
              d="M128 216 Q165 105 280 88 Q402 52 528 88 Q638 106 672 212 Q575 170 400 176 Q225 170 128 216 Z"
              fill="url(#canopyDark)"
            />
            <ellipse cx="400" cy="112" rx="185" ry="52" fill="#059669" opacity="0.32" />
            <ellipse cx="270" cy="145" rx="125" ry="44" fill="#10b981" opacity="0.22" />
            <ellipse cx="530" cy="145" rx="125" ry="44" fill="#10b981" opacity="0.22" />
          </g>

          {/* Ön katman rüzgarda süzülen uzun ince söğüt dalları ve sivri yaprakları */}
          {WILLOW_VINES.filter((v) => !v.back).map((vine, idx) => (
            <g key={`front-${idx}`} className="animate-sway-slow" style={{ animationDelay: vine.delay }}>
              <path
                d={`M${vine.x} ${vine.y} C${vine.x - 10} ${vine.y + vine.h * 0.4}, ${vine.x + 10} ${vine.y + vine.h * 0.75}, ${vine.x + 2} ${vine.y + vine.h}`}
                stroke={idx % 2 === 0 ? '#34d399' : '#10b981'}
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
                opacity="0.65"
              />
              {[0.14, 0.28, 0.42, 0.56, 0.7, 0.84, 0.96].map((ratio, j) => {
                const ly = vine.y + vine.h * ratio;
                const lx = vine.x + (j % 2 === 0 ? -5.5 : 5.5);
                return (
                  <path
                    key={j}
                    d={`M${lx} ${ly - 7} Q${lx - 3.5} ${ly} ${lx} ${ly + 9} Q${lx + 3.5} ${ly} ${lx} ${ly - 7} Z`}
                    fill={j % 2 === 0 ? '#6ee7b7' : '#34d399'}
                    opacity="0.68"
                  />
                );
              })}
            </g>
          ))}

          {/* Dallara Asılı Dilek Kurdeleleri ve Gerçekleşmiş Altın Yıldız Küreleri */}
          {visibleWishes.map((wish, idx) => {
            const anchor =
              BRANCH_ANCHORS[wish.branch_slot % BRANCH_ANCHORS.length] ||
              BRANCH_ANCHORS[idx % BRANCH_ANCHORS.length];
            const offset = Math.floor(idx / BRANCH_ANCHORS.length) * 18;
            const wx = anchor.x + offset;
            const wy = anchor.y + (idx % 2 === 0 ? 0 : 12);
            const isFulfilled = wish.status === 'fulfilled';

            return (
              <g
                key={wish.id}
                transform={`translate(${wx}, ${wy})`}
                onClick={() => onSelectWish(wish)}
                className="cursor-pointer group"
              >
                <line x1="0" y1="-22" x2="0" y2="0" stroke="#fde68a" strokeWidth="1.4" opacity="0.7" />

                {isFulfilled ? (
                  <g className="animate-star-pulse">
                    <circle cx="0" cy="10" r="20" fill="url(#goldStarOrb)" opacity="0.65" />
                    <path
                      d="M0 -4 L4 6 L14 7 L6 13 L9 23 L0 17 L-9 23 L-6 13 L-14 7 L-4 6 Z"
                      fill="#fde047"
                      stroke="#fef9c3"
                      strokeWidth="1.2"
                    />
                    <circle cx="0" cy="10" r="3.5" fill="#ffffff" opacity="0.9" />
                  </g>
                ) : (
                  <g className="animate-sway-gentle" style={{ animationDelay: anchor.swayDelay }}>
                    <rect
                      x="-10"
                      y="0"
                      width="20"
                      height="32"
                      rx="5"
                      fill={wish.ribbon_color || '#f9a8d4'}
                      stroke="#ecfdf5"
                      strokeWidth="1.2"
                      className="transition-transform group-hover:scale-110"
                    />
                    <path d="M-10 27 L0 35 L10 27" fill={wish.ribbon_color || '#f9a8d4'} opacity="0.85" />
                    <circle cx="0" cy="12" r="2.6" fill="#064e3b" opacity="0.65" />
                  </g>
                )}

                <title>
                  {isFulfilled ? '✨ Gerçekleşti: ' : '🎀 Dilek: '}
                  {wish.content}
                </title>
              </g>
            );
          })}

          {/* Söğüt Ağacı Altında Gizli Mektup Kutusu */}
          <g
            transform="translate(562, 426)"
            onClick={onOpenMailbox}
            className="cursor-pointer group"
            role="button"
            aria-label="Gizli Mektup Kutusunu Aç"
          >
            <rect x="-4" y="14" width="8" height="38" rx="3" fill="#5c3a24" />
            <rect
              x="-24"
              y="-14"
              width="48"
              height="32"
              rx="10"
              fill="#0f766e"
              stroke="#99f6e4"
              strokeWidth="1.8"
              className="transition-transform group-hover:scale-105"
            />
            <rect x="-13" y="-4" width="26" height="16" rx="3" fill="#fef3c7" />
            <path d="M-13 -4 L0 6 L13 -4" stroke="#d97706" strokeWidth="1.8" fill="none" />
            <path d="M22 -12 L22 -26 L33 -22 L22 -17" fill="#fb7185" />

            {unreadLettersCount > 0 && (
              <g transform="translate(22, -28)">
                <circle cx="0" cy="0" r="11" fill="#e11d48" className="animate-pulse" />
                <text x="0" y="4" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">
                  {unreadLettersCount}
                </text>
              </g>
            )}

            <g transform="translate(0, 62)">
              <rect
                x="-66"
                y="-12"
                width="132"
                height="22"
                rx="11"
                fill="#042f2e"
                opacity="0.88"
                stroke="#2dd4bf"
                strokeOpacity="0.4"
              />
              <text x="0" y="3" textAnchor="middle" fill="#ccfbf1" fontSize="11" fontWeight="600">
                💌 Gizli Mektup Kutusu
              </text>
            </g>
          </g>

          {/* Söğüt Ağacının Dibindeki Çimenlerde Canlı Saksılar & Çiçekler */}
          {pots.slice(0, GROUND_POT_SLOTS.length).map((pot, idx) => {
            const slot = GROUND_POT_SLOTS[idx];
            return (
              <g
                key={`ground-pot-${pot.id}`}
                transform={`translate(${slot.x}, ${slot.y})`}
                onClick={() => onSelectPot(pot)}
                className="cursor-pointer group"
                role="button"
                aria-label={`${pot.flower.name} saksısını aç`}
              >
                {/* Çim gölgesi */}
                <ellipse cx="0" cy="14" rx="22" ry="5" fill="#02180c" opacity="0.6" />
                {/* Gerçekçi saksı + çiçek/bitki çizimi */}
                <g transform="translate(-34, -52)" className="transition-transform group-hover:scale-110">
                  <svg width="68" height="68" viewBox="0 0 120 120">
                    <FlowerIllustration
                      flower={pot.flower}
                      stage={pot.stageInfo.stage}
                      showPot
                      className="w-full h-full"
                    />
                  </svg>
                </g>
                {/* Küçük isim etiketi */}
                <g transform="translate(0, 24)">
                  <rect
                    x="-34"
                    y="-8"
                    width="68"
                    height="14"
                    rx="7"
                    fill="#042215"
                    opacity="0.85"
                    stroke="#34d399"
                    strokeOpacity="0.3"
                  />
                  <text x="0" y="2" textAnchor="middle" fill="#d1fae5" fontSize="8.5" fontWeight="600">
                    {pot.flower.name.length > 11 ? pot.flower.name.slice(0, 10) + '…' : pot.flower.name}
                  </text>
                </g>
                <title>
                  {pot.flower.name} ({pot.ownerName}) — {pot.stageInfo.badge}
                </title>
              </g>
            );
          })}
        </svg>

        {/* Söğüt Ağacı Altında Ekili Saksılar (İnteraktif Bahçe Rafı) */}
        <div className="border-t border-emerald-500/20 bg-gradient-to-b from-[#062616]/90 to-[#04160d]/95 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="text-xs sm:text-sm font-medium text-emerald-100 flex items-center gap-2">
              <span>🪴</span>
              <span>Söğüt Ağacının Altındaki Saksılarımız ({pots.length})</span>
            </div>
            <span className="text-[11px] text-emerald-300/70">
              Detaylar, açılış tarihi ve sulama için saksıya dokun
            </span>
          </div>

          {pots.length === 0 ? (
            <p className="text-xs text-emerald-300/60 py-2">
              Henüz söğüt ağacının altına ekilmiş bir saksı yok. Katalogdan çiçek veya fesleğen ekebilirsin.
            </p>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {pots.map((pot) => {
                const remaining = Math.max(0, pot.growthDaysRequired - pot.growthPoints);
                return (
                  <button
                    key={pot.id}
                    onClick={() => onSelectPot(pot)}
                    className="group shrink-0 w-32 rounded-2xl border border-emerald-500/25 bg-emerald-950/60 hover:bg-emerald-900/50 hover:border-emerald-400/55 p-2.5 text-center transition cursor-pointer"
                  >
                    <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                      <FlowerIllustration
                        flower={pot.flower}
                        stage={pot.stageInfo.stage}
                        showPot
                        className="w-20 h-20 group-hover:scale-105 transition"
                      />
                      {!pot.wateredToday && pot.isMine && (
                        <span
                          className="absolute top-0 right-0 w-5 h-5 rounded-full bg-sky-500/90 text-white text-[10px] flex items-center justify-center shadow"
                          title="Bugün sulanmayı bekliyor"
                        >
                          💧
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-emerald-50 truncate mt-1">
                      {pot.flower.name}
                    </div>
                    <div className="text-[10px] text-emerald-300/75 truncate">
                      {pot.ownerEmoji} {pot.ownerName}
                    </div>
                    <div className="mt-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/70 text-amber-200/90 inline-block">
                      {remaining === 0 ? '✨ Açtı' : `${remaining} gün kaldı`}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
