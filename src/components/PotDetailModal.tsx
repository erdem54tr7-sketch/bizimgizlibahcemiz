import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Bot, Calendar, Droplets, Hand, Heart, Sparkles, Sun, X } from 'lucide-react';
import type { Pot } from '../types';
import { FlowerIllustration } from './FlowerIllustration';

interface PotDetailModalProps {
  pot: Pot;
  onClose: () => void;
  onWaterPot: (potId: number) => Promise<{ pot: Pot; justBloomed: boolean }>;
}

function getEstimatedBloomText(pot: Pot): string {
  const remainingSteps = Math.max(0, pot.growthDaysRequired - pot.growthPoints);
  if (remainingSteps === 0) {
    return pot.flower.kind === 'plant'
      ? '🌿 Tam olgunluğa ulaştı ve mis gibi kokuyor!'
      : '🌺 Tam çiçek açtı!';
  }
  const interval = pot.flower.waterIntervalDays || 1;
  const startOffset = pot.wateredToday ? interval : 0;
  const estDays = startOffset + (remainingSteps - 1) * interval;
  const targetDate = new Date(Date.now() + Math.max(1, estDays) * 24 * 60 * 60 * 1000);
  const formatted = targetDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
  return `${remainingSteps} sulama günü kaldı · Tahmini açılış: ${formatted}`;
}

export const PotDetailModal: React.FC<PotDetailModalProps> = ({ pot, onClose, onWaterPot }) => {
  const [watering, setWatering] = useState(false);
  const [dropping, setDropping] = useState(false);
  const [isPetting, setIsPetting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const isScentedPlant = Boolean(pot.flower.canTouchScent || pot.flower.kind === 'plant');

  const handleWater = async () => {
    setWatering(true);
    setDropping(true);
    setStatusMessage(null);
    try {
      const res = await onWaterPot(pot.id);
      if (res.justBloomed) {
        confetti({
          particleCount: 100,
          spread: 85,
          origin: { y: 0.58 },
          colors: ['#fde047', '#34d399', '#f472b6', '#ffffff'],
        });
        setStatusMessage(`🌺 Harika! ${pot.flower.name} tam anlamıyla açtı!`);
      } else {
        setStatusMessage('💧 Sulandı! Kökleri tazeleniyor.');
      }
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'Sulama yapılamadı.');
    } finally {
      setWatering(false);
      setTimeout(() => setDropping(false), 1000);
    }
  };

  const handlePetPlant = () => {
    setIsPetting(true);
    setStatusMessage(
      `✋ Elinle ${pot.flower.name} yapraklarını nazikçe sevdin — mis gibi taze koku bahçeye yayıldı! 🌿✨`
    );
    setTimeout(() => setIsPetting(false), 2400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl border border-emerald-400/30 bg-gradient-to-b from-[#0a271b] to-[#061810] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full text-emerald-300/60 hover:text-white hover:bg-emerald-800/50 cursor-pointer"
          aria-label="Kapat"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Üst Başlık */}
        <div className="flex items-center gap-2 text-xs text-emerald-300/80 mb-2">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-900/60 border border-emerald-500/25">
            {pot.ownerEmoji} {pot.ownerName}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-300/30 text-amber-200 font-medium">
            {pot.stageInfo.badge} ({pot.growthPoints}/{pot.growthDaysRequired})
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-5 mt-2">
          <div className="relative w-36 h-36 rounded-3xl bg-emerald-950/80 border border-emerald-500/25 flex items-center justify-center shrink-0">
            <FlowerIllustration
              flower={pot.flower}
              stage={pot.stageInfo.stage}
              showPot
              isPetting={isPetting}
              className="w-32 h-32"
            />
            {dropping && (
              <div className="animate-water-drop absolute top-3 left-1/2 -translate-x-1/2 text-sky-300 pointer-events-none flex gap-1">
                <Droplets className="w-5 h-5 fill-sky-300" />
                <Droplets className="w-4 h-4 fill-sky-200 mt-1" />
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-romantic text-3xl font-semibold text-emerald-50">
              {pot.flower.name}
            </h3>
            <p className="text-xs italic text-emerald-300/65">{pot.flower.latinName}</p>

            <div className="mt-3 rounded-2xl bg-emerald-900/35 border border-emerald-500/20 px-3 py-2 text-xs text-amber-200 flex items-center justify-center sm:justify-start gap-2">
              <Calendar className="w-4 h-4 shrink-0" />
              <span>{getEstimatedBloomText(pot)}</span>
            </div>

            <div className="mt-2.5 flex flex-wrap justify-center sm:justify-start gap-2 text-[11px]">
              <span className="px-2.5 py-1 rounded-lg bg-amber-400/10 text-amber-200 border border-amber-300/20 inline-flex items-center gap-1">
                <Sun className="w-3 h-3" /> {pot.sunExposure}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-sky-400/10 text-sky-200 border border-sky-300/20 inline-flex items-center gap-1">
                <Droplets className="w-3 h-3" /> Nem %{pot.waterLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Romantik Anlam */}
        <div className="mt-4 rounded-2xl bg-rose-500/10 border border-rose-300/20 p-3.5">
          <div className="text-xs font-semibold text-rose-200 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 fill-rose-300" />
            {pot.flower.languageOfFlowers}
          </div>
          <p className="text-xs text-emerald-100/85 mt-1 leading-relaxed">
            {pot.flower.romanticMeaning}
          </p>
        </div>

        {/* Eylem Butonları */}
        <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
          {pot.isMine && (
            <button
              onClick={handleWater}
              disabled={watering || pot.wateredToday}
              className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer ${
                pot.wateredToday
                  ? 'bg-sky-500/15 text-sky-200 border border-sky-400/30 cursor-default'
                  : 'bg-gradient-to-r from-sky-400 to-teal-400 text-emerald-950 hover:from-sky-300 hover:to-teal-300'
              }`}
            >
              <Droplets className="w-4 h-4" />
              {watering ? 'Sulanıyor...' : pot.wateredToday ? 'Bugün Sulandı ✓' : 'Bugün Sula 💧'}
            </button>
          )}

          {isScentedPlant && (
            <button
              onClick={handlePetPlant}
              className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-400 to-lime-300 text-emerald-950 hover:from-emerald-300 hover:to-lime-200 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer"
            >
              <Hand className="w-4 h-4" />
              Elini Değdir &amp; Sev 🌿
            </button>
          )}
        </div>

        {statusMessage && (
          <div className="mt-3 text-xs px-3.5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Flora AI Tavsiyesi */}
        <div className="mt-4 rounded-2xl border border-teal-400/25 bg-teal-950/50 p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-200 mb-1">
            <Bot className="w-4 h-4 text-teal-300" />
            <span>{pot.aiAdvice.source}</span>
          </div>
          <p className="text-xs text-emerald-50/90 leading-relaxed">{pot.aiAdvice.message}</p>
        </div>
      </div>
    </div>
  );
};
