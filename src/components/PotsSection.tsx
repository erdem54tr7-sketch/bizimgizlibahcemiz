import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Bot,
  Droplets,
  Hand,
  Heart,
  NotebookPen,
  RefreshCw,
  Sparkles,
  Sun,
  Trash2,
} from 'lucide-react';
import type { AiAdvice, Pot } from '../types';
import { FlowerIllustration } from './FlowerIllustration';

interface PotsSectionProps {
  pots: Pot[];
  onWaterPot: (potId: number) => Promise<{ pot: Pot; justBloomed: boolean }>;
  onChangeSun: (potId: number, sun: string) => Promise<void>;
  onAddNote: (potId: number, content: string) => Promise<void>;
  onDeleteNote: (potId: number, noteId: number) => Promise<void>;
  onRefreshAi: (potId: number) => Promise<AiAdvice>;
  onGoToCatalog: () => void;
}

const SUN_OPTIONS = ['Tam Güneş', 'Yarı Gölge', 'Dolaylı Işık'] as const;

export const PotsSection: React.FC<PotsSectionProps> = ({
  pots,
  onWaterPot,
  onChangeSun,
  onAddNote,
  onDeleteNote,
  onRefreshAi,
  onGoToCatalog,
}) => {
  const [filterScope, setFilterScope] = useState<'mine' | 'partner' | 'all'>('mine');
  const [wateringId, setWateringId] = useState<number | null>(null);
  const [droppingId, setDroppingId] = useState<number | null>(null);
  const [pettingId, setPettingId] = useState<number | null>(null);
  const [noteInputs, setNoteInputs] = useState<Record<number, string>>({});
  const [aiOverrides, setAiOverrides] = useState<Record<number, AiAdvice>>({});
  const [aiLoadingId, setAiLoadingId] = useState<number | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<Record<number, string>>({});

  const visiblePots = pots.filter((p) => {
    if (filterScope === 'mine') return p.isMine;
    if (filterScope === 'partner') return !p.isMine;
    return true;
  });

  const handleWater = async (pot: Pot) => {
    setWateringId(pot.id);
    setDroppingId(pot.id);
    setFeedbackMsg((prev) => ({ ...prev, [pot.id]: '' }));
    try {
      const res = await onWaterPot(pot.id);
      setAiOverrides((prev) => ({ ...prev, [pot.id]: res.pot.aiAdvice }));
      if (res.justBloomed) {
        confetti({
          particleCount: 110,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#fde047', '#34d399', '#f472b6', '#ffffff'],
        });
        setFeedbackMsg((prev) => ({
          ...prev,
          [pot.id]: `🌺 Mucize! ${pot.flower.name} bugün tam anlamıyla çiçek açtı!`,
        }));
      } else {
        setFeedbackMsg((prev) => ({
          ...prev,
          [pot.id]: '💧 Sulama başarılı! Çiçeğin sevgiyle büyümeye devam ediyor.',
        }));
      }
    } catch (err) {
      setFeedbackMsg((prev) => ({
        ...prev,
        [pot.id]: err instanceof Error ? err.message : 'Sulama yapılamadı.',
      }));
    } finally {
      setWateringId(null);
      setTimeout(() => setDroppingId((curr) => (curr === pot.id ? null : curr)), 1000);
    }
  };

  const handlePetPlant = (pot: Pot) => {
    setPettingId(pot.id);
    setFeedbackMsg((prev) => ({
      ...prev,
      [pot.id]: `✋ Elinle ${pot.flower.name} yapraklarını sevdin — mis gibi taze kokusu yayıldı! 🌿✨`,
    }));
    setTimeout(() => setPettingId((curr) => (curr === pot.id ? null : curr)), 2400);
  };

  const handleNoteSubmit = async (e: React.FormEvent, potId: number) => {
    e.preventDefault();
    const text = (noteInputs[potId] || '').trim();
    if (!text) return;
    await onAddNote(potId, text);
    setNoteInputs((prev) => ({ ...prev, [potId]: '' }));
  };

  const handleRefreshAi = async (potId: number) => {
    setAiLoadingId(potId);
    try {
      const advice = await onRefreshAi(potId);
      setAiOverrides((prev) => ({ ...prev, [potId]: advice }));
    } finally {
      setAiLoadingId(null);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-emerald-300/75 font-medium">
            Tohumdan Çiçeğe Yolculuk
          </span>
          <h2 className="font-romantic text-3xl sm:text-4xl font-semibold text-emerald-50 mt-1">
            Saksılarım &amp; Bahçemiz
          </h2>
          <p className="text-sm text-emerald-200/70 mt-1">
            Her çiçek tohum olarak başlar. Düzenli sulama ve doğru güneşle 3-5 günde tam çiçeğe dönüşür.
          </p>
        </div>

        <div className="flex gap-1.5 p-1 rounded-full bg-emerald-950/80 border border-emerald-500/20 self-start">
          {[
            { id: 'mine', label: 'Benim Saksılarım' },
            { id: 'partner', label: 'Sevgilimin Saksıları' },
            { id: 'all', label: 'Hepsi' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterScope(tab.id as typeof filterScope)}
              className={`text-xs px-3.5 py-1.5 rounded-full transition cursor-pointer ${
                filterScope === tab.id
                  ? 'bg-emerald-500 text-emerald-950 font-semibold'
                  : 'text-emerald-200/75 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {visiblePots.length === 0 ? (
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-950/50 p-10 text-center">
          <div className="text-4xl mb-3">🌱</div>
          <h3 className="font-romantic text-2xl text-emerald-50">Burada henüz ekilmiş bir saksı yok</h3>
          <p className="text-sm text-emerald-200/70 mt-1 mb-5">
            Çiçek Kataloğundan sevdiğin bir çiçeği seçip tohum olarak dikebilirsin.
          </p>
          <button
            onClick={onGoToCatalog}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-emerald-950 font-semibold text-sm hover:from-emerald-400 hover:to-teal-300 transition cursor-pointer"
          >
            Çiçek Kataloğuna Git
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {visiblePots.map((pot) => {
            const advice = aiOverrides[pot.id] || pot.aiAdvice;
            const stage = pot.stageInfo.stage;

            return (
              <div
                key={pot.id}
                className="rounded-3xl border border-emerald-500/25 bg-gradient-to-b from-[#0b271b]/90 to-[#061810]/95 p-5 sm:p-6 shadow-xl flex flex-col gap-5"
              >
                {/* Üst Bilgi: Sahip & Evre Rozeti */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-emerald-200/80">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/25">
                      {pot.ownerEmoji} {pot.ownerName}
                    </span>
                    <span className="text-emerald-300/60">
                      {new Date(pot.plantedAt).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-400/15 border border-amber-300/30 text-amber-200">
                    {pot.stageInfo.badge} ({pot.growthPoints}/{pot.growthDaysRequired})
                  </span>
                </div>

                {/* Saksı Görseli + Çiçek Bilgi Kartı */}
                <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-stretch">
                  <div className="relative w-36 h-36 rounded-3xl bg-gradient-to-b from-emerald-900/40 to-emerald-950/80 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <FlowerIllustration
                      flower={pot.flower}
                      stage={stage}
                      showPot
                      isPetting={pettingId === pot.id}
                      className="w-32 h-32"
                    />
                    {droppingId === pot.id && (
                      <div className="animate-water-drop absolute top-3 left-1/2 -translate-x-1/2 text-sky-300 pointer-events-none flex gap-1">
                        <Droplets className="w-5 h-5 fill-sky-300" />
                        <Droplets className="w-4 h-4 fill-sky-200 mt-1" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-2.5">
                    <div>
                      <h3 className="font-romantic text-2xl sm:text-3xl font-semibold text-emerald-50">
                        {pot.flower.name}
                      </h3>
                      <p className="text-xs italic text-emerald-300/60">{pot.flower.latinName}</p>
                    </div>

                    {/* Romantik Anlam / Çiçeğin Dili */}
                    <div className="rounded-2xl bg-rose-500/10 border border-rose-300/20 p-3">
                      <div className="text-[11px] font-semibold text-rose-200 flex items-center gap-1">
                        <Heart className="w-3 h-3 fill-rose-300" />
                        {pot.flower.languageOfFlowers}
                      </div>
                      <p className="text-xs text-emerald-100/80 mt-1 leading-relaxed">
                        {pot.flower.romanticMeaning}
                      </p>
                    </div>

                    {/* Özellik Etiketleri */}
                    <div className="flex flex-wrap gap-2 text-[11px]">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-400/10 text-amber-200 border border-amber-300/20">
                        ☀️ İdeal: {pot.flower.sunlight}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-sky-400/10 text-sky-200 border border-sky-300/20">
                        💧 {pot.flower.waterNeed} Su
                      </span>
                    </div>
                  </div>
                </div>

                {/* İlerleme & Nem Barları */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-emerald-950/60 border border-emerald-500/15 p-3">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-emerald-200/80">Büyüme Evresi</span>
                      <span className="font-semibold text-emerald-300">{pot.stageInfo.progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-emerald-900/60 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-amber-300 transition-all duration-500"
                        style={{ width: `${Math.max(8, pot.stageInfo.progress)}%` }}
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl bg-emerald-950/60 border border-emerald-500/15 p-3">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-sky-200/80">Toprak Nemi</span>
                      <span className="font-semibold text-sky-300">%{pot.waterLevel}</span>
                    </div>
                    <div className="h-2 rounded-full bg-emerald-900/60 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-300 transition-all duration-500"
                        style={{ width: `${pot.waterLevel}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Etkileşim: Bugün Sula, Elini Değdir & Güneş Konumu */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-2.5">
                  {pot.isMine && (
                    <button
                      onClick={() => handleWater(pot)}
                      disabled={wateringId === pot.id || pot.wateredToday}
                      className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer ${
                        pot.wateredToday
                          ? 'bg-sky-500/15 text-sky-200 border border-sky-400/30 cursor-default'
                          : 'bg-gradient-to-r from-sky-400 to-teal-400 text-emerald-950 hover:from-sky-300 hover:to-teal-300 shadow-lg shadow-sky-950/40'
                      }`}
                    >
                      <Droplets className="w-4 h-4" />
                      {wateringId === pot.id
                        ? 'Sulanıyor...'
                        : pot.wateredToday
                        ? 'Bugün Sulandı ✓'
                        : 'Bugün Sula 💧'}
                    </button>
                  )}

                  {(pot.flower.canTouchScent || pot.flower.kind === 'plant') && (
                    <button
                      onClick={() => handlePetPlant(pot)}
                      className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-400 to-lime-300 text-emerald-950 hover:from-emerald-300 hover:to-lime-200 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer"
                    >
                      <Hand className="w-4 h-4" />
                      Elini Değdir &amp; Sev 🌿
                    </button>
                  )}

                  {pot.isMine && (
                    <div className="flex items-center gap-1.5 rounded-xl bg-emerald-950/70 border border-emerald-500/20 px-3 py-1.5">
                      <Sun className="w-4 h-4 text-amber-300 shrink-0" />
                      <select
                        value={pot.sunExposure}
                        onChange={(e) => onChangeSun(pot.id, e.target.value)}
                        aria-label="Güneş konumu seç"
                        className="bg-transparent text-xs text-emerald-100 focus:outline-none cursor-pointer"
                      >
                        {SUN_OPTIONS.map((opt) => (
                          <option key={opt} value={opt} className="bg-[#061810] text-emerald-50">
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {feedbackMsg[pot.id] && (
                  <div className="text-xs px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-400/25 text-emerald-100">
                    {feedbackMsg[pot.id]}
                  </div>
                )}

                {/* Yapay Zeka (Flora AI) Sulama Danışmanı Kutusu */}
                <div className="rounded-2xl border border-teal-400/30 bg-gradient-to-r from-teal-950/70 to-emerald-950/70 p-4">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-teal-200">
                      <Bot className="w-4 h-4 text-teal-300" />
                      <span>{advice.source}</span>
                      <span className="px-2 py-0.5 rounded-full bg-teal-400/15 text-[10px] text-teal-200">
                        {advice.headline}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRefreshAi(pot.id)}
                      disabled={aiLoadingId === pot.id}
                      className="text-[11px] text-teal-300/80 hover:text-teal-200 flex items-center gap-1 cursor-pointer"
                      title="AI Tavsiyesini Yenile"
                    >
                      <RefreshCw className={`w-3 h-3 ${aiLoadingId === pot.id ? 'animate-spin' : ''}`} />
                      Yenile
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-50/90 leading-relaxed flex items-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-1" />
                    <span>{advice.message}</span>
                  </p>
                </div>

                {/* Kişisel Not Alanı */}
                <div className="pt-2 border-t border-emerald-500/15 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-200/85">
                    <NotebookPen className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Kişisel Bakım Notlarım ({pot.notes.length})</span>
                  </div>

                  <form onSubmit={(e) => handleNoteSubmit(e, pot.id)} className="flex gap-2">
                    <input
                      type="text"
                      value={noteInputs[pot.id] || ''}
                      onChange={(e) =>
                        setNoteInputs((prev) => ({ ...prev, [pot.id]: e.target.value }))
                      }
                      maxLength={400}
                      placeholder="Örn: Bugün 14:00'te suladım, yarın sulamayacağım..."
                      className="flex-1 rounded-xl bg-emerald-950/70 border border-emerald-500/20 px-3 py-2 text-xs text-emerald-50 placeholder:text-emerald-300/35 focus:outline-none focus:border-emerald-400"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 rounded-xl bg-emerald-500/25 hover:bg-emerald-500 text-emerald-100 hover:text-emerald-950 text-xs font-semibold transition cursor-pointer"
                    >
                      Ekle
                    </button>
                  </form>

                  {pot.notes.length > 0 && (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {pot.notes.map((note) => (
                        <div
                          key={note.id}
                          className="flex items-start justify-between gap-2 rounded-xl bg-emerald-950/50 border border-emerald-500/10 px-3 py-2 text-xs"
                        >
                          <div>
                            <p className="text-emerald-100/90">{note.content}</p>
                            <span className="text-[10px] text-emerald-300/55">
                              {note.author_name} · {new Date(note.created_at).toLocaleString('tr-TR')}
                            </span>
                          </div>
                          <button
                            onClick={() => onDeleteNote(pot.id, note.id)}
                            className="text-emerald-300/40 hover:text-rose-300 p-1 cursor-pointer"
                            title="Notu sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
