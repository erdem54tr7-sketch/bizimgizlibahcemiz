import React, { useState } from 'react';
import { Heart, Mail, MailOpen, Send, X } from 'lucide-react';
import type { Letter, User } from '../types';

interface MailboxModalProps {
  currentUser: User;
  letters: Letter[];
  onClose: () => void;
  onSendLetter: (payload: { title: string; content: string; mood: string }) => Promise<void>;
  onMarkRead: (id: number) => Promise<void>;
}

const MOODS = ['💌', '💚', '🌹', '✨', '🌙', '🤍'];

export const MailboxModal: React.FC<MailboxModalProps> = ({
  currentUser,
  letters,
  onClose,
  onSendLetter,
  onMarkRead,
}) => {
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(letters[0] || null);
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('💌');
  const [sending, setSending] = useState(false);

  const handleOpenLetter = async (letter: Letter) => {
    setSelectedLetter(letter);
    setComposing(false);
    if (letter.recipient_id === currentUser.id && !letter.is_read) {
      await onMarkRead(letter.id);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    try {
      await onSendLetter({
        title: title.trim() || 'Söğüt Altından Mektup',
        content: content.trim(),
        mood,
      });
      setTitle('');
      setContent('');
      setComposing(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border border-teal-400/25 bg-[#061d19] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-teal-500/20 bg-teal-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-200">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-romantic text-2xl font-semibold text-emerald-50">
                Gizli Mektup Kutusu
              </h3>
              <p className="text-xs text-teal-200/70">
                Söğüt ağacının gölgesinde yalnızca ikimizin okuyabildiği mektuplar
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setComposing(true)}
              className="text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 text-emerald-950 hover:from-teal-300 hover:to-emerald-300 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Mektup Bırak
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-emerald-300/60 hover:text-white hover:bg-emerald-800/40 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Sol: Mektup Listesi */}
          <div className="md:col-span-5 border-b md:border-b-0 md:border-r border-teal-500/15 overflow-y-auto max-h-56 md:max-h-none p-3 space-y-2 bg-emerald-950/30">
            {letters.length === 0 ? (
              <div className="text-center py-8 text-xs text-emerald-300/60">
                Henüz mektup yok. İlk mektubu sen bırak!
              </div>
            ) : (
              letters.map((l) => {
                const isUnreadForMe = l.recipient_id === currentUser.id && !l.is_read;
                const active = !composing && selectedLetter?.id === l.id;
                return (
                  <button
                    key={l.id}
                    onClick={() => handleOpenLetter(l)}
                    className={`w-full text-left p-3 rounded-2xl border transition cursor-pointer ${
                      active
                        ? 'bg-teal-500/20 border-teal-400/50'
                        : 'bg-emerald-950/50 border-emerald-500/15 hover:border-teal-400/30'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-teal-200 flex items-center gap-1.5">
                        <span>{l.mood}</span>
                        <span>{l.sender_name}</span>
                      </span>
                      {isUnreadForMe ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-semibold">
                          Yeni
                        </span>
                      ) : (
                        <MailOpen className="w-3.5 h-3.5 text-emerald-400/50" />
                      )}
                    </div>
                    <div className="text-sm font-medium text-emerald-50 truncate mt-1">
                      {l.title}
                    </div>
                    <div className="text-[11px] text-emerald-300/60 mt-0.5">
                      {new Date(l.created_at).toLocaleString('tr-TR')}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Sağ: Okuma veya Yazma Alanı */}
          <div className="md:col-span-7 overflow-y-auto p-5 sm:p-6">
            {composing ? (
              <form onSubmit={handleSend} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-romantic text-xl text-emerald-50 font-semibold">
                    Yeni Romantik Mektup
                  </h4>
                  <div className="flex gap-1.5">
                    {MOODS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMood(m)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center border transition cursor-pointer ${
                          mood === m
                            ? 'bg-teal-400/25 border-teal-300 scale-110'
                            : 'border-emerald-500/20 hover:bg-emerald-900/40'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={120}
                  placeholder="Mektup başlığı (örn: Bugün seni düşündüm...)"
                  className="w-full rounded-xl bg-emerald-950/70 border border-teal-500/25 px-4 py-2.5 text-sm text-emerald-50 placeholder:text-emerald-300/40 focus:outline-none focus:border-teal-400"
                />

                <textarea
                  rows={7}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={2000}
                  required
                  placeholder="Kalbinden geçen satırları buraya bırak..."
                  className="w-full rounded-2xl bg-emerald-950/70 border border-teal-500/25 p-4 text-sm text-emerald-50 placeholder:text-emerald-300/40 focus:outline-none focus:border-teal-400 resize-none leading-relaxed"
                />

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setComposing(false)}
                    className="px-4 py-2 rounded-xl border border-emerald-500/25 text-xs text-emerald-200 hover:bg-emerald-900/40 cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={sending || !content.trim()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 text-emerald-950 font-semibold text-sm hover:from-teal-300 hover:to-emerald-300 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Heart className="w-4 h-4" />
                    {sending ? 'Kutuya Bırakılıyor...' : 'Mektubu Bırak'}
                  </button>
                </div>
              </form>
            ) : selectedLetter ? (
              <div className="rounded-2xl border border-amber-200/20 bg-gradient-to-b from-amber-50/[0.06] to-emerald-950/50 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-2 pb-4 border-b border-emerald-500/15">
                  <div>
                    <span className="text-xs text-teal-300/80">
                      {selectedLetter.sender_emoji} {selectedLetter.sender_name} →{' '}
                      {selectedLetter.recipient_name}
                    </span>
                    <h4 className="font-romantic text-2xl font-semibold text-amber-50 mt-1">
                      {selectedLetter.mood} {selectedLetter.title}
                    </h4>
                  </div>
                  <span className="text-[11px] text-emerald-300/60 shrink-0">
                    {new Date(selectedLetter.created_at).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                <p className="mt-4 text-sm sm:text-base text-emerald-50/90 leading-relaxed whitespace-pre-wrap">
                  {selectedLetter.content}
                </p>
                <div className="mt-6 pt-3 border-t border-emerald-500/10 flex items-center justify-between text-xs text-emerald-300/60">
                  <span>
                    {selectedLetter.is_read ? '✓ Okundu' : '✨ Yeni mektup'}
                  </span>
                  <button
                    onClick={() => setComposing(true)}
                    className="text-teal-300 hover:text-teal-200 underline underline-offset-4 cursor-pointer"
                  >
                    Cevap yaz
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-10 text-emerald-300/60">
                <Mail className="w-10 h-10 mb-3 opacity-50" />
                <p className="text-sm">Okumak için soldan bir mektup seç veya yeni bir mektup bırak.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
