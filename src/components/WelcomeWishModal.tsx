import React, { useState } from 'react';
import { Sparkles, TreeDeciduous, X } from 'lucide-react';
import type { User } from '../types';

interface WelcomeWishModalProps {
  user: User;
  onSubmitWish: (content: string) => Promise<void>;
  onSkip: () => void;
}

export const WelcomeWishModal: React.FC<WelcomeWishModalProps> = ({
  user,
  onSubmitWish,
  onSkip,
}) => {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Söğüt ağacına asmak için kalbinden geçen bir dilek yaz.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmitWish(content.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dilek asılamadı.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl border border-emerald-400/30 bg-gradient-to-b from-[#0b2a1d] to-[#061810] p-6 sm:p-8 shadow-[0_25px_90px_rgba(0,0,0,0.8)]">
        <button
          onClick={onSkip}
          className="absolute right-4 top-4 p-2 rounded-full text-emerald-300/60 hover:text-emerald-100 hover:bg-emerald-800/40 transition cursor-pointer"
          aria-label="Kapat"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-300/30 flex items-center justify-center mb-4">
            <TreeDeciduous className="w-7 h-7 text-emerald-300" />
          </div>
          <span className="text-xs uppercase tracking-[0.2em] text-emerald-300/80 font-medium">
            Hoş Geldin {user.avatarEmoji} {user.displayName}
          </span>
          <h2 className="font-romantic text-2xl sm:text-3xl font-semibold text-emerald-50 mt-2 leading-snug">
            “Hadi önce bir dilek dileyelim, sonra çiçeklerimize geçelim...”
          </h2>
          <p className="text-xs sm:text-sm text-emerald-200/70 mt-2">
            Yazdığın dilek, cennet bahçemizdeki dev Dilek Söğüdünün dallarına ipek bir kurdele olarak asılacak.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={320}
            placeholder="Bugün kalbimden geçen dilek..."
            className="w-full rounded-2xl bg-emerald-950/70 border border-emerald-500/30 p-4 text-sm text-emerald-50 placeholder:text-emerald-300/40 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 resize-none"
          />

          {error && <p className="text-xs text-rose-300">{error}</p>}

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-emerald-950 font-semibold text-sm hover:from-emerald-400 hover:to-teal-300 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Sparkles className="w-4 h-4" />
              {submitting ? 'Dala Asılıyor...' : 'Söğüt Dalına As'}
            </button>
            <button
              type="button"
              onClick={onSkip}
              className="py-3 px-5 rounded-xl border border-emerald-500/25 text-emerald-200/85 hover:bg-emerald-900/40 text-sm transition cursor-pointer"
            >
              Çiçeklere Geç
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
