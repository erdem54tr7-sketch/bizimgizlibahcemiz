import React, { useEffect, useState } from 'react';
import { Activity, Clock, RefreshCw, ShieldCheck, Smartphone, X } from 'lucide-react';
import { api } from '../api';
import type { AdminLogsResponse } from '../types';

interface AdminLogsModalProps {
  onClose: () => void;
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds < 60) {
    return `${seconds || 0} sn`;
  }
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs} sa ${mins} dk`;
  }
  return `${mins} dk ${secs} sn`;
}

function parseDeviceLabel(ua: string): string {
  if (!ua) return 'Bilinmeyen Cihaz';
  if (/iPhone|iPad|Android|Mobile/i.test(ua)) return 'Mobil Tarayıcı';
  if (/Windows/i.test(ua)) return 'Windows Masaüstü';
  if (/Mac OS/i.test(ua)) return 'Mac Masaüstü';
  return 'Web Tarayıcı';
}

export const AdminLogsModal: React.FC<AdminLogsModalProps> = ({ onClose }) => {
  const [data, setData] = useState<AdminLogsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAdminLogs();
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kayıtlar alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[88vh] flex flex-col rounded-3xl border border-emerald-400/25 bg-[#061c14] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-500/20 bg-emerald-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-romantic text-2xl font-semibold text-emerald-50">
                Gizli Takip &amp; Ziyaretçi Panosu
              </h3>
              <p className="text-xs text-emerald-300/70">
                Yalnızca yönetici hesabına görünür — giriş, çıkış ve oturum süreleri
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadLogs}
              className="p-2 rounded-xl border border-emerald-500/25 text-emerald-200 hover:bg-emerald-900/50 cursor-pointer"
              title="Yenile"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-emerald-300/60 hover:text-white hover:bg-emerald-800/50 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="rounded-2xl bg-rose-500/15 border border-rose-400/30 p-4 text-sm text-rose-200">
              {error}
            </div>
          )}

          {data && (
            <>
              {/* Özet Kartları */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl bg-emerald-950/70 border border-emerald-500/20 p-4">
                  <div className="text-xs text-emerald-300/70">Takip Edilen</div>
                  <div className="text-base font-semibold text-emerald-50 mt-1 flex items-center gap-1.5">
                    <span>{data.partner?.avatarEmoji || '🌸'}</span>
                    <span>{data.partner?.displayName || 'Sevgilim'}</span>
                  </div>
                </div>

                <div className="rounded-2xl bg-emerald-950/70 border border-emerald-500/20 p-4">
                  <div className="text-xs text-emerald-300/70">Anlık Durum</div>
                  <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        data.summary.isCurrentlyOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                      }`}
                    />
                    <span className={data.summary.isCurrentlyOnline ? 'text-emerald-300' : 'text-slate-300'}>
                      {data.summary.isCurrentlyOnline ? 'Şu an bahçede' : 'Çevrimdışı'}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl bg-emerald-950/70 border border-emerald-500/20 p-4">
                  <div className="text-xs text-emerald-300/70">Toplam Ziyaret</div>
                  <div className="text-xl font-bold text-emerald-100 mt-1">
                    {data.summary.totalVisits} kez
                  </div>
                </div>

                <div className="rounded-2xl bg-emerald-950/70 border border-emerald-500/20 p-4">
                  <div className="text-xs text-emerald-300/70">Toplam Süre</div>
                  <div className="text-lg font-bold text-amber-200 mt-1">
                    {formatDuration(data.summary.totalDurationSeconds)}
                  </div>
                </div>
              </div>

              {/* Oturum Tablosu */}
              <div className="rounded-2xl border border-emerald-500/20 overflow-hidden bg-emerald-950/40">
                <div className="px-4 py-3 border-b border-emerald-500/15 flex items-center gap-2 text-xs font-semibold text-emerald-200">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Giriş / Çıkış Geçmişi</span>
                </div>

                {data.logs.length === 0 ? (
                  <div className="p-8 text-center text-sm text-emerald-300/60">
                    Henüz giriş kaydı bulunmuyor.
                  </div>
                ) : (
                  <div className="divide-y divide-emerald-500/10">
                    {data.logs.map((log) => (
                      <div
                        key={log.id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-emerald-900/20"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                log.is_active
                                  ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/40'
                                  : 'bg-slate-700/40 text-slate-300'
                              }`}
                            >
                              {log.is_active ? 'Aktif Oturum' : 'Tamamlandı'}
                            </span>
                            <span className="text-emerald-100 font-medium">
                              Giriş: {new Date(log.login_at).toLocaleString('tr-TR')}
                            </span>
                          </div>
                          <div className="text-emerald-300/70 flex flex-wrap items-center gap-3">
                            <span>
                              Çıkış:{' '}
                              {log.logout_at
                                ? new Date(log.logout_at).toLocaleString('tr-TR')
                                : `Son görülme ${new Date(log.last_seen_at).toLocaleTimeString('tr-TR')}`}
                            </span>
                            <span className="inline-flex items-center gap-1 text-emerald-300/60">
                              <Smartphone className="w-3 h-3" />
                              {parseDeviceLabel(log.user_agent)}
                            </span>
                          </div>
                        </div>

                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-900/50 border border-emerald-500/20 text-amber-200 font-semibold self-start sm:self-center">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDuration(log.duration_seconds)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
