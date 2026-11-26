import React, { useState } from 'react';
import { Leaf, Lock, Sparkles, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import { api, setStoredToken } from '../api';
import type { User } from '../types';

interface LoginScreenProps {
  onSuccess: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.login(username, password);
      setStoredToken(res.token);
      onSuccess(res.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Giriş yapılamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md rounded-3xl border border-emerald-400/20 bg-emerald-950/65 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_24px_80px_rgba(0,0,0,0.65)]">
        {/* Logo & Başlık */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400/25 to-teal-500/20 border border-emerald-300/30 flex items-center justify-center mb-4 shadow-inner">
            <Leaf className="w-8 h-8 text-emerald-300" />
          </div>
          <h1 className="font-romantic text-3xl sm:text-4xl font-semibold text-emerald-50 tracking-wide">
            Bizim Gizli Bahçemiz
          </h1>
          <p className="text-sm text-emerald-200/75 mt-2">
            Sadece ikimize özel Dilek Söğüdü &amp; sanal çiçek bahçesi
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-emerald-200/80 mb-1.5 ml-1">
              Kullanıcı Adı
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-emerald-400/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Kullanıcı adın"
                autoComplete="username"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-emerald-900/40 border border-emerald-500/25 text-emerald-50 placeholder:text-emerald-300/35 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-emerald-200/80 mb-1.5 ml-1">
              Şifre
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-emerald-400/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full pl-10 pr-11 py-3 rounded-xl bg-emerald-900/40 border border-emerald-500/25 text-emerald-50 placeholder:text-emerald-300/35 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-300/60 hover:text-emerald-200 p-1 cursor-pointer"
                aria-label="Şifreyi göster/gizle"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-rose-500/15 border border-rose-400/30 px-3.5 py-2.5 text-xs text-rose-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-emerald-950 font-semibold text-sm hover:from-emerald-400 hover:to-teal-300 transition shadow-lg shadow-emerald-950/60 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? 'Bahçenin Kapısı Açılıyor...' : 'Bahçeye Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
};
