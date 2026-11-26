import React, { useState } from 'react';
import { Droplets, Search, Sparkles, Sprout, Sun, Check, Flower2, Leaf } from 'lucide-react';
import type { FlowerCatalogItem } from '../types';
import { FlowerIllustration } from './FlowerIllustration';

interface CatalogSectionProps {
  flowers: FlowerCatalogItem[];
  onPlantFlower: (flowerId: string, nickname?: string) => Promise<void>;
}

export const CatalogSection: React.FC<CatalogSectionProps> = ({ flowers, onPlantFlower }) => {
  const [kindTab, setKindTab] = useState<'flower' | 'plant'>('flower');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('Tümü');
  const [plantingId, setPlantingId] = useState<string | null>(null);
  const [justPlantedId, setJustPlantedId] = useState<string | null>(null);

  const itemsForTab = flowers.filter((f) =>
    kindTab === 'plant' ? f.kind === 'plant' : f.kind !== 'plant'
  );

  const categories = ['Tümü', ...Array.from(new Set(itemsForTab.map((f) => f.category)))];

  const filtered = itemsForTab.filter((f) => {
    const matchesCat = category === 'Tümü' || f.category === category;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      f.name.toLowerCase().includes(q) ||
      f.latinName.toLowerCase().includes(q) ||
      f.languageOfFlowers.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  const handleTabSwitch = (next: 'flower' | 'plant') => {
    setKindTab(next);
    setCategory('Tümü');
  };

  const handlePlant = async (flower: FlowerCatalogItem) => {
    setPlantingId(flower.id);
    try {
      await onPlantFlower(flower.id);
      setJustPlantedId(flower.id);
      setTimeout(() => setJustPlantedId((prev) => (prev === flower.id ? null : prev)), 2500);
    } finally {
      setPlantingId(null);
    }
  };

  return (
    <section className="space-y-6">
      {/* Üst Sekme: Çiçekler vs Bitkiler */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-emerald-300/75 font-medium">
            Bahçe Vitrini
          </span>
          <h2 className="font-romantic text-3xl sm:text-4xl font-semibold text-emerald-50 mt-1">
            {kindTab === 'flower' ? 'Çiçek Kataloğu' : 'Bitkiler & Kokulu Dostlar'}
          </h2>
          <p className="text-sm text-emerald-200/70 mt-1">
            {kindTab === 'flower'
              ? 'Anlamını sevdiğin bir çiçeği seç; saksına Tohum olarak ekilsin ve suladıkça büyüsün.'
              : 'Fesleğen ve kokulu bitkileri saksına ek; büyüdükçe elinle dokunup mis kokularını yayabilirsin.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="flex p-1 rounded-full bg-emerald-950/80 border border-emerald-500/25">
            <button
              onClick={() => handleTabSwitch('flower')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition cursor-pointer ${
                kindTab === 'flower'
                  ? 'bg-gradient-to-r from-rose-400 to-pink-300 text-rose-950 font-semibold'
                  : 'text-emerald-200/80 hover:text-white'
              }`}
            >
              <Flower2 className="w-4 h-4" />
              Çiçekler
            </button>
            <button
              onClick={() => handleTabSwitch('plant')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition cursor-pointer ${
                kindTab === 'plant'
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-300 text-emerald-950 font-semibold'
                  : 'text-emerald-200/80 hover:text-white'
              }`}
            >
              <Leaf className="w-4 h-4" />
              Bitkiler
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-emerald-300/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={kindTab === 'flower' ? 'Çiçek veya anlam ara...' : 'Bitki ara (örn: Fesleğen)...'}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/25 text-sm text-emerald-50 placeholder:text-emerald-300/40 focus:outline-none focus:border-emerald-400"
            />
          </div>
        </div>
      </div>

      {/* Kategori Filtreleri */}
      {categories.length > 2 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`text-xs sm:text-sm px-4 py-1.5 rounded-full border transition cursor-pointer ${
                category === cat
                  ? 'bg-emerald-500 text-emerald-950 border-emerald-400 font-semibold'
                  : 'bg-emerald-950/50 border-emerald-500/20 text-emerald-200/80 hover:border-emerald-400/45'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filtered.map((flower) => {
          const isPlanting = plantingId === flower.id;
          const isJustPlanted = justPlantedId === flower.id;

          return (
            <article
              key={flower.id}
              className="group rounded-3xl border border-emerald-500/20 bg-gradient-to-b from-emerald-950/75 to-[#061810]/90 p-5 flex flex-col justify-between hover:border-emerald-400/45 transition shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-block text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/25 text-emerald-200">
                      {flower.category}
                    </span>
                    <h3 className="font-romantic text-2xl font-semibold text-emerald-50 mt-2">
                      {flower.name}
                    </h3>
                    <p className="text-xs italic text-emerald-300/60">{flower.latinName}</p>
                  </div>
                  <div className="w-24 h-24 rounded-2xl bg-emerald-900/35 border border-emerald-500/15 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                    <FlowerIllustration flower={flower} stage={3} className="w-20 h-20" />
                  </div>
                </div>

                {/* Dili */}
                <div className="mt-3 rounded-2xl bg-emerald-900/25 border border-emerald-500/15 p-3">
                  <div className="text-[11px] font-semibold text-amber-200/90 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {flower.kind === 'plant' ? 'Bitkinin Ruhu: ' : 'Çiçeğin Dili: '}
                    {flower.languageOfFlowers}
                  </div>
                  <p className="text-xs text-emerald-100/80 mt-1 leading-relaxed">
                    {flower.romanticMeaning}
                  </p>
                </div>

                {/* Özellikler */}
                <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400/10 text-amber-200 border border-amber-300/20">
                    <Sun className="w-3 h-3" />
                    {flower.sunlight}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-400/10 text-sky-200 border border-sky-300/20">
                    <Droplets className="w-3 h-3" />
                    {flower.waterNeed} Su ({flower.waterIntervalDays} günde 1)
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-400/10 text-emerald-200 border border-emerald-300/20">
                    <Sprout className="w-3 h-3" />
                    {flower.growthDaysRequired} günde olgunlaşır
                  </span>
                </div>
              </div>

              <button
                onClick={() => handlePlant(flower)}
                disabled={isPlanting}
                className={`mt-4 w-full py-2.5 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer ${
                  isJustPlanted
                    ? 'bg-teal-400 text-emerald-950'
                    : 'bg-emerald-500/20 hover:bg-emerald-500 text-emerald-100 hover:text-emerald-950 border border-emerald-400/30'
                }`}
              >
                {isJustPlanted ? (
                  <>
                    <Check className="w-4 h-4" />
                    Saksıya Tohum Ekildi!
                  </>
                ) : (
                  <>
                    <Sprout className="w-4 h-4" />
                    {isPlanting ? 'Ekiliyor...' : 'Saksıya Tohum Ek'}
                  </>
                )}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
};
