import React, { useId } from 'react';
import type { FlowerCatalogItem } from '../types';

interface Props {
  flower: FlowerCatalogItem;
  stage?: 0 | 1 | 2 | 3; // 0: Tohum, 1: Filiz, 2: Tomurcuk, 3: Tam Çiçek / Olgun Bitki
  showPot?: boolean;
  isPetting?: boolean;
  className?: string;
}

export const FlowerIllustration: React.FC<Props> = ({
  flower,
  stage = 3,
  showPot = false,
  isPetting = false,
  className = 'w-28 h-28',
}) => {
  const uid = useId().replace(/:/g, '');
  const { petalColor, secondaryColor, accentColor, visualType } = flower;
  const stemBaseY = showPot ? 84 : 104;

  const renderSoil = () => (
    <g>
      <ellipse cx="60" cy="84" rx="23" ry="6.5" fill="#2d1810" />
      <ellipse cx="60" cy="83.5" rx="19" ry="4.5" fill="#4a2c1d" />
      <circle cx="51" cy="83" r="1.2" fill="#6b4430" />
      <circle cx="67" cy="84" r="1.4" fill="#6b4430" />
      <circle cx="58" cy="85" r="1" fill="#3a2015" />
    </g>
  );

  const renderLeaf = (d: string, veinD: string, fillId: string) => (
    <g>
      <path d={d} fill={`url(#${fillId})`} stroke="#14532d" strokeWidth="0.6" />
      <path d={veinD} stroke="#86efac" strokeWidth="0.7" fill="none" opacity="0.55" />
    </g>
  );

  const renderBloom = () => {
    if (stage === 0) {
      return (
        <g>
          {renderSoil()}
          {/* Toprak içinde filizlenmeye hazır gerçekçi tohum */}
          <path
            d="M60 70 C52 74, 53 84, 60 85 C67 84, 68 74, 60 70 Z"
            fill={`url(#seedGrad-${uid})`}
            stroke="#92400e"
            strokeWidth="0.8"
          />
          <path d="M58 73 Q57 79 60 83" stroke="#fef3c7" strokeWidth="0.9" fill="none" opacity="0.55" />
        </g>
      );
    }

    if (stage === 1) {
      return (
        <g>
          {renderSoil()}
          <path
            d="M60 84 C59 73, 58 62, 60 53"
            stroke={`url(#stemGrad-${uid})`}
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />
          {renderLeaf(
            'M60 66 C49 56, 41 60, 44 66 C48 72, 56 70, 60 66 Z',
            'M60 66 Q51 63 46 64',
            `leafGrad-${uid}`
          )}
          {renderLeaf(
            'M60 58 C71 48, 79 53, 75 59 C71 65, 63 62, 60 58 Z',
            'M60 58 Q69 55 73 57',
            `leafGrad-${uid}`
          )}
        </g>
      );
    }

    if (stage === 2) {
      return (
        <g>
          {renderSoil()}
          <path
            d="M60 84 C57 67, 58 51, 60 36"
            stroke={`url(#stemGrad-${uid})`}
            strokeWidth="3.6"
            strokeLinecap="round"
            fill="none"
          />
          {renderLeaf(
            'M59 69 C45 58, 37 64, 41 71 C46 77, 54 74, 59 69 Z',
            'M59 69 Q49 65 43 67',
            `leafGrad-${uid}`
          )}
          {renderLeaf(
            'M60 58 C74 47, 82 53, 78 60 C73 66, 65 63, 60 58 Z',
            'M60 58 Q70 55 76 57',
            `leafGrad-${uid}`
          )}
          {/* Gerçekçi tomurcuk */}
          <path
            d="M60 22 C50 31, 51 44, 60 45 C69 44, 70 31, 60 22 Z"
            fill={`url(#petalGrad-${uid})`}
          />
          <path d="M52 40 Q60 49 68 40 Q64 46 60 47 Q56 46 52 40 Z" fill="#15803d" />
          <path d="M56 36 Q60 44 60 27" stroke={accentColor} strokeWidth="0.9" fill="none" opacity="0.55" />
        </g>
      );
    }

    // stage === 3: Tam Çiçek / Olgun Bitki
    return (
      <g>
        {showPot && renderSoil()}

        {/* Bitki: Fesleğen, Nane, Biberiye */}
        {visualType === 'basil' || visualType === 'mint' ? (
          <g>
            {/* Çoklu dallı gür gövde */}
            <path d={`M60 ${stemBaseY} Q58 64 60 40`} stroke={`url(#stemGrad-${uid})`} strokeWidth="3.4" fill="none" />
            <path d={`M60 ${stemBaseY - 12} Q47 64 41 52`} stroke={`url(#stemGrad-${uid})`} strokeWidth="2.4" fill="none" />
            <path d={`M60 ${stemBaseY - 14} Q73 64 79 52`} stroke={`url(#stemGrad-${uid})`} strokeWidth="2.4" fill="none" />

            {/* Alt büyük kubbeli fesleğen yaprakları */}
            {renderLeaf(
              'M59 67 C43 56, 30 62, 35 72 C41 80, 53 74, 59 67 Z',
              'M59 67 Q46 64 38 69',
              `leafGrad-${uid}`
            )}
            {renderLeaf(
              'M61 67 C77 56, 90 62, 85 72 C79 80, 67 74, 61 67 Z',
              'M61 67 Q74 64 82 69',
              `leafGrad-${uid}`
            )}
            {/* Orta yapraklar */}
            {renderLeaf(
              'M56 54 C40 42, 32 47, 37 56 C42 63, 52 59, 56 54 Z',
              'M56 54 Q45 50 39 53',
              `leafGrad-${uid}`
            )}
            {renderLeaf(
              'M64 54 C80 42, 88 47, 83 56 C78 63, 68 59, 64 54 Z',
              'M64 54 Q75 50 81 53',
              `leafGrad-${uid}`
            )}
            {/* Üst taç yapraklar */}
            {renderLeaf(
              'M60 44 C50 32, 46 22, 54 20 C61 19, 64 32, 60 44 Z',
              'M60 44 Q55 31 54 23',
              `leafGrad-${uid}`
            )}
            {renderLeaf(
              'M60 44 C70 32, 74 22, 66 20 C59 19, 56 32, 60 44 Z',
              'M60 44 Q65 31 66 23',
              `leafGrad-${uid}`
            )}
            {renderLeaf(
              'M60 48 C50 40, 44 33, 50 29 C57 27, 62 38, 60 48 Z',
              'M60 48 Q53 38 51 32',
              `leafGrad-${uid}`
            )}
          </g>
        ) : visualType === 'rosemary' ? (
          <g>
            <path d={`M60 ${stemBaseY} Q59 55 60 22`} stroke="#5c4033" strokeWidth="3.2" strokeLinecap="round" fill="none" />
            <path d={`M60 ${stemBaseY - 14} Q48 56 43 34`} stroke="#5c4033" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <path d={`M60 ${stemBaseY - 16} Q72 56 77 34`} stroke="#5c4033" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const y = 66 - i * 7;
              return (
                <g key={i}>
                  <path d={`M60 ${y} Q49 ${y - 6} 45 ${y - 11}`} stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                  <path d={`M60 ${y} Q71 ${y - 6} 75 ${y - 11}`} stroke="#34d399" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                </g>
              );
            })}
          </g>
        ) : (
          /* Gerçekçi Çiçek Gövdesi + Yaprakları */
          <g>
            <path
              d={`M60 ${stemBaseY} C57 ${stemBaseY - 18}, 58 ${stemBaseY - 30}, 60 44`}
              stroke={`url(#stemGrad-${uid})`}
              strokeWidth="3.8"
              strokeLinecap="round"
              fill="none"
            />
            {renderLeaf(
              `M59 ${stemBaseY - 14} C42 ${stemBaseY - 27}, 34 ${stemBaseY - 19}, 40 ${stemBaseY - 11} C46 ${stemBaseY - 5}, 55 ${stemBaseY - 10}, 59 ${stemBaseY - 14} Z`,
              `M59 ${stemBaseY - 14} Q48 ${stemBaseY - 19} 42 ${stemBaseY - 15}`,
              `leafGrad-${uid}`
            )}
            {renderLeaf(
              `M60 ${stemBaseY - 22} C77 ${stemBaseY - 35}, 85 ${stemBaseY - 27}, 79 ${stemBaseY - 19} C73 ${stemBaseY - 13}, 64 ${stemBaseY - 18}, 60 ${stemBaseY - 22} Z`,
              `M60 ${stemBaseY - 22} Q71 ${stemBaseY - 27} 77 ${stemBaseY - 23}`,
              `leafGrad-${uid}`
            )}

            {/* Çiçek başı türleri */}
            {visualType === 'lavender' || visualType === 'hyacinth' ? (
              <g>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <g key={i} transform={`translate(0, ${i * 5.2})`}>
                    <ellipse cx="55" cy="21" rx="4.2" ry="3.2" fill={secondaryColor} transform="rotate(-22 55 21)" />
                    <ellipse cx="65" cy="21" rx="4.2" ry="3.2" fill={petalColor} transform="rotate(22 65 21)" />
                    <ellipse cx="60" cy="18" rx="4.2" ry="3.5" fill={accentColor} opacity="0.92" />
                  </g>
                ))}
              </g>
            ) : visualType === 'tulip' || visualType === 'snowdrop' ? (
              <g>
                <path
                  d="M60 47 C43 45, 42 21, 51 15 C56 23, 59 30, 60 47 Z"
                  fill={secondaryColor}
                />
                <path
                  d="M60 47 C77 45, 78 21, 69 15 C64 23, 61 30, 60 47 Z"
                  fill={secondaryColor}
                />
                <path
                  d="M60 48 C47 45, 50 15, 60 12 C70 15, 73 45, 60 48 Z"
                  fill={`url(#petalGrad-${uid})`}
                />
                <path d="M55 42 Q56 26 60 16" stroke={accentColor} strokeWidth="1" fill="none" opacity="0.55" />
                <path d="M54 45 Q60 50 66 45" stroke="#15803d" strokeWidth="2.4" fill="none" />
              </g>
            ) : visualType === 'sunflower' || visualType === 'daisy' ? (
              <g transform="translate(60, 34)">
                {Array.from({ length: 16 }).map((_, i) => (
                  <path
                    key={i}
                    d="M0 -6 C-3.2 -13, -3.2 -21, 0 -24 C3.2 -21, 3.2 -13, 0 -6 Z"
                    fill={i % 2 === 0 ? `url(#petalGrad-${uid})` : secondaryColor}
                    transform={`rotate(${i * 22.5})`}
                  />
                ))}
                <circle cx="0" cy="0" r="9.5" fill={accentColor} />
                <circle cx="0" cy="0" r="6.5" fill="#451a03" opacity={visualType === 'sunflower' ? 0.45 : 0.15} />
                {[
                  [-3, -2],
                  [3, -2],
                  [0, 3],
                  [-2, 2],
                  [2, 2],
                ].map(([px, py], idx) => (
                  <circle key={idx} cx={px} cy={py} r="1" fill="#fef08a" opacity="0.7" />
                ))}
              </g>
            ) : visualType === 'rose' || visualType === 'peony' || visualType === 'camellia' || visualType === 'gardenia' ? (
              <g transform="translate(60, 34)">
                {/* Dış büyük taç yapraklar */}
                {[0, 51, 102, 153, 204, 255, 306].map((deg) => (
                  <path
                    key={deg}
                    d="M0 0 C-11 -4, -14 -17, 0 -20 C14 -17, 11 -4, 0 0 Z"
                    fill={secondaryColor}
                    stroke={accentColor}
                    strokeWidth="0.45"
                    transform={`rotate(${deg})`}
                    opacity="0.95"
                  />
                ))}
                {/* Orta katman */}
                {[25, 85, 145, 205, 265, 325].map((deg) => (
                  <path
                    key={deg}
                    d="M0 0 C-8 -3, -10 -13, 0 -15 C10 -13, 8 -3, 0 0 Z"
                    fill={`url(#petalGrad-${uid})`}
                    transform={`rotate(${deg})`}
                  />
                ))}
                {/* İç sarmal */}
                <circle cx="0" cy="0" r="6.8" fill={secondaryColor} />
                <path
                  d="M-3 -1 C-3 -4, 3 -4, 3 -1 C3 2, -2 3, -4 0 C-5 -3, 0 -5, 4 -3"
                  fill="none"
                  stroke={accentColor}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </g>
            ) : (
              /* Zambak, Orkide, Yasemin, Menekşe, Sakura, Lotus, Ortanca, Unutmabeni */
              <g transform="translate(60, 34)">
                {[0, 60, 120, 180, 240, 300].map((deg) => (
                  <path
                    key={deg}
                    d="M0 0 C-7 -6, -8 -18, 0 -21 C8 -18, 7 -6, 0 0 Z"
                    fill={`url(#petalGrad-${uid})`}
                    stroke={secondaryColor}
                    strokeWidth="0.7"
                    transform={`rotate(${deg})`}
                  />
                ))}
                <circle cx="0" cy="0" r="5" fill={accentColor} />
                {[0, 72, 144, 216, 288].map((deg) => (
                  <line
                    key={deg}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="-6.5"
                    stroke="#fef08a"
                    strokeWidth="0.9"
                    transform={`rotate(${deg})`}
                  />
                ))}
              </g>
            )}
          </g>
        )}
      </g>
    );
  };

  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label={flower.name}>
      <defs>
        <linearGradient id={`potGrad-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#92400e" />
          <stop offset="45%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
        <linearGradient id={`rimGrad-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
        <linearGradient id={`stemGrad-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#15803d" />
          <stop offset="50%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#166534" />
        </linearGradient>
        <linearGradient id={`leafGrad-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="65%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#14532d" />
        </linearGradient>
        <radialGradient id={`petalGrad-${uid}`} cx="45%" cy="35%" r="65%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.95" />
          <stop offset="45%" stopColor={petalColor} />
          <stop offset="100%" stopColor={secondaryColor} />
        </radialGradient>
        <radialGradient id={`seedGrad-${uid}`} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="60%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#78350f" />
        </radialGradient>
      </defs>

      {renderBloom()}

      {showPot && (
        <g>
          {/* Saksı alt gölgesi */}
          <ellipse cx="60" cy="113.5" rx="22" ry="3.5" fill="#020b06" opacity="0.55" />
          {/* Terracotta saksı gövdesi */}
          <path d="M35 84 L85 84 L78 111 Q60 116 42 111 Z" fill={`url(#potGrad-${uid})`} />
          {/* Üst kenarlık */}
          <rect x="31" y="79.5" width="58" height="6.5" rx="3" fill={`url(#rimGrad-${uid})`} />
          {/* Kenar ışıltısı */}
          <path d="M40 90 L44 108" stroke="#fef3c7" strokeWidth="1.5" strokeLinecap="round" opacity="0.22" />
        </g>
      )}

      {/* Fesleğen / kokulu bitki okşama & koku efekti */}
      {isPetting && (
        <g>
          {/* Yükselen mis koku dalgaları */}
          <g className="animate-scent-rise">
            <path
              d="M44 48 Q38 36 45 26 Q51 16 45 6"
              stroke="#bbf7d0"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
              opacity="0.85"
            />
            <path
              d="M60 44 Q67 32 59 22 Q53 12 61 2"
              stroke="#fde68a"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
              opacity="0.9"
            />
            <path
              d="M76 48 Q82 36 74 26 Q68 16 76 6"
              stroke="#6ee7b7"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
              opacity="0.85"
            />
            <circle cx="42" cy="18" r="2.2" fill="#fef08a" />
            <circle cx="64" cy="12" r="2.5" fill="#bbf7d0" />
            <circle cx="78" cy="22" r="2" fill="#fde68a" />
          </g>

          {/* Yaprağı nazikçe okşayan el detayı */}
          <g className="animate-hand-pet" transform="translate(56, 30)">
            {/* Bilek & avuç içi */}
            <path
              d="M22 14 C16 14, 10 10, 6 6 C3 3, 0 5, 2 9 L6 14 C1 13, -3 15, 0 18 C3 20, 9 20, 14 21 C19 22, 24 22, 29 20 Z"
              fill="#fde2c8"
              stroke="#d4a373"
              strokeWidth="0.9"
            />
            {/* Parmak uçları */}
            <path d="M5 6 C2 2, -2 4, 1 8" fill="#fde2c8" stroke="#d4a373" strokeWidth="0.8" />
            <path d="M3 10 C-1 8, -3 11, 1 13" fill="#fde2c8" stroke="#d4a373" strokeWidth="0.8" />
          </g>
        </g>
      )}
    </svg>
  );
};
