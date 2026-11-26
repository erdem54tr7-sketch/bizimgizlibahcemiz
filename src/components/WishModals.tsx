import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Sparkles, Star, X, Plus, Ribbon } from 'lucide-react';
import type { Wish } from '../types';

export function triggerWishFulfilledCelebration() {
  confetti({
    particleCount: 95,
    spread: 85,
    origin: { y: 0.55 },
    colors: ['#fde047', '#facc15', '#34d399', '#fda4af', '#ffffff'],
  });
  setTimeout(() => {
    confetti({
      particleCount: 55,
      angle: 60,
      spread: 60,
      origin: { x: 0.1, y: 0.65 },
      colors: ['#fde047', '#fbbf24', '#fef08a'],
    });
    confetti({
      particleCount: 55,
      angle: 120,
      spread: 60,
      origin: { x: 0.9, y: 0.65 },
      colors: ['#fde047', '#fbbf24', '#fef08a'],
    });
  }, 220);
}

interface WishDetailModalProps {
  wish: Wish;
  onClose: () => void;
  onFulfill: (wishId: number) => Promise<void>;
}

export const WishDetailModal: React.FC<WishDetailModalProps> = ({
  wish,
  onClose,
  onFulfill,
}) => {
  const [loading, setLoading] = useState(false);
  const isFulfilled = wish.status === 'fulfilled';

  const handleFulfill = async () => {
    setLoading(true);
    try {
      await onFulfill(wish.id);
      triggerWishFulfilledCelebration();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl border border-emerald-400/25 bg-[#082117] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-full text-emerald-300/60 hover:text-white hover:bg-emerald-800/50 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${
              isFulfilled
                ? 'bg-amber-400/20 border-amber-300/50 text-amber-300'
                : 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300'
            }`}
          >
            {isFulfilled ? <Star className="w-6 h-6 fill-amber-300" /> : <Ribbon className="w-6 h-6" />}
          </div>
          <div>
            <div className="text-xs text-emerald-300/75">
              {wish.author_emoji} {wish.author_name} tarafından dilendi
            </div>
            <div className="text-[11px] text-emerald-400/60">
              {new Date(wish.created_at).toLocaleString('tr-TR')}
            </div>
          </div>
        </div>

        <blockquote className="font-romantic text-2xl text-emerald-50 leading-relaxed bg-emerald-950/60 border border-emerald-500/20 rounded-2xl p-5 italic">
          “{wish.content}”
        </blockquote>

        {isFulfilled ? (
          <div className="mt-5 rounded-2xl bg-amber-400/15 border border-amber-300/35 p-3.5 text-center">
            <div className="text-sm font-semibold text-amber-200 flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Bu Dilek Gerçekleşti &amp; Yıldızlaştı!
            </div>
            {wish.fulfilled_at && (
              <div className="text-xs text-amber-200/70 mt-1">
                {wish.fulfilled_by_name ? `${wish.fulfilled_by_name} tarafından · ` : ''}
                {new Date(wish.fulfilled_at).toLocaleString('tr-TR')}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={handleFulfill}
            disabled={loading}
            className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 font-semibold text-sm hover:from-amber-300 hover:to-yellow-200 transition flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 cursor-pointer disabled:opacity-60"
          >
            <CheckCircle2 className="w-4 h-4" />
            {loading ? 'Yıldıza Dönüşüyor...' : 'Dilek Gerçekleşti / Kabul Oldu! ✨'}
          </button>
        )}
      </div>
    </div>
  );
};

interface WishArchiveModalProps {
  wishes: Wish[];
  onClose: () => void;
  onCreateWish: (content: string) => Promise<void>;
  onFulfillWish: (wishId: number) => Promise<void>;
}

export const WishArchiveModal: React.FC<WishArchiveModalProps> = ({
  wishes,
  onClose,
  onCreateWish,
  onFulfillWish,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'fulfilled'>('all');
  const [newWish, setNewWish] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filtered = wishes.filter((w) => (filter === 'all' ? true : w.status === filter));

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWish.trim()) return;
    setSubmitting(true);
    try {
      await onCreateWish(newWish.trim());
      setNewWish('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[88vh] flex flex-col rounded-3xl border border-emerald-400/25 bg-[#071f15] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-500/20">
          <div>
            <h3 className="font-romantic text-2xl font-semibold text-emerald-50">
              Dilek Defteri &amp; Geçmişi
            </h3>
            <p className="text-xs text-emerald-300/70">
              Toplam {wishes.length} dilek · {wishes.filter((w) => w.status === 'fulfilled').length} gerçekleşen yıldız
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-emerald-300/60 hover:text-white hover:bg-emerald-800/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Yeni Dilek Formu */}
        <form onSubmit={handleAdd} className="p-4 sm:px-6 border-b border-emerald-500/15 bg-emerald-950/40">
          <div className="flex gap-2">
            <input
              type="text"
              value={newWish}
              onChange={(e) => setNewWish(e.target.value)}
              maxLength={320}
              placeholder="Söğüde yeni bir dilek as..."
              className="flex-1 rounded-xl bg-emerald-900/40 border border-emerald-500/25 px-3.5 py-2.5 text-sm text-emerald-50 placeholder:text-emerald-300/40 focus:outline-none focus:border-emerald-400"
            />
            <button
              type="submit"
              disabled={submitting || !newWish.trim()}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 text-emerald-950 font-semibold text-sm hover:bg-emerald-400 transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              As
            </button>
          </div>
        </form>

        {/* Filtreler */}
        <div className="flex gap-2 px-6 pt-3 pb-2">
          {[
            { id: 'all', label: 'Tümü' },
            { id: 'pending', label: 'Kurdeleler (Bekleyen)' },
            { id: 'fulfilled', label: 'Altın Yıldızlar (Gerçekleşen)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as typeof filter)}
              className={`text-xs px-3 py-1.5 rounded-full border transition cursor-pointer ${
                filter === tab.id
                  ? 'bg-emerald-500/25 border-emerald-400 text-emerald-100 font-medium'
                  : 'border-emerald-500/20 text-emerald-300/70 hover:bg-emerald-900/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Liste */}
        <div className="flex-1 overflow-y-auto px-6 py-3 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-sm text-emerald-300/60">
              Bu kategoride henüz dilek yok.
            </div>
          ) : (
            filtered.map((wish) => {
              const fulfilled = wish.status === 'fulfilled';
              return (
                <div
                  key={wish.id}
                  className={`rounded-2xl p-4 border transition ${
                    fulfilled
                      ? 'bg-amber-400/10 border-amber-300/30'
                      : 'bg-emerald-950/60 border-emerald-500/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-xs text-emerald-300/75 mb-1">
                        <span>
                          {wish.author_emoji} {wish.author_name}
                        </span>
                        <span>•</span>
                        <span>{new Date(wish.created_at).toLocaleDateString('tr-TR')}</span>
                      </div>
                      <p className="text-sm sm:text-base text-emerald-50 leading-relaxed">
                        {wish.content}
                      </p>
                    </div>

                    {fulfilled ? (
                      <span className="shrink-0 inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-300/20 text-amber-200 border border-amber-300/40">
                        <Star className="w-3.5 h-3.5 fill-amber-300" />
                        Kabul Oldu
                      </span>
                    ) : (
                      <button
                        onClick={async () => {
                          await onFulfillWish(wish.id);
                          triggerWishFulfilledCelebration();
                        }}
                        className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-full bg-amber-400/20 hover:bg-amber-400 text-amber-200 hover:text-amber-950 border border-amber-300/40 transition cursor-pointer"
                      >
                        Gerçekleşti! ✨
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
