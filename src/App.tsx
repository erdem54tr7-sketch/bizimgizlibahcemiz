import React, { useCallback, useEffect, useState } from 'react';
import {
  BookOpen,
  Flower2,
  LogOut,
  Mail,
  Shield,
  Sparkles,
  Sprout,
  TreeDeciduous,
} from 'lucide-react';
import { api, getStoredToken, setStoredToken } from './api';
import type { FlowerCatalogItem, Letter, Pot, User, Wish } from './types';
import { AmbientParticles } from './components/AmbientParticles';
import { LoginScreen } from './components/LoginScreen';
import { WeepingWillow } from './components/WeepingWillow';
import { WelcomeWishModal } from './components/WelcomeWishModal';
import {
  WishArchiveModal,
  WishDetailModal,
} from './components/WishModals';
import { MailboxModal } from './components/MailboxModal';
import { CatalogSection } from './components/CatalogSection';
import { PotsSection } from './components/PotsSection';
import { AdminLogsModal } from './components/AdminLogsModal';
import { PotDetailModal } from './components/PotDetailModal';

type ActiveTab = 'garden' | 'pots' | 'catalog';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [booting, setBooting] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('garden');

  const [wishes, setWishes] = useState<Wish[]>([]);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [unreadLettersCount, setUnreadLettersCount] = useState(0);
  const [catalog, setCatalog] = useState<FlowerCatalogItem[]>([]);
  const [pots, setPots] = useState<Pot[]>([]);

  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null);
  const [selectedPotId, setSelectedPotId] = useState<number | null>(null);
  const [showWishArchive, setShowWishArchive] = useState(false);
  const [showMailbox, setShowMailbox] = useState(false);
  const [showAdminLogs, setShowAdminLogs] = useState(false);

  const loadGardenData = useCallback(async () => {
    const [wishRes, letterRes, catRes, potRes] = await Promise.all([
      api.getWishes(),
      api.getLetters(),
      api.getCatalog(),
      api.getPots(),
    ]);
    setWishes(wishRes.wishes);
    setLetters(letterRes.letters);
    setUnreadLettersCount(letterRes.unreadCount);
    setCatalog(catRes.flowers);
    setPots(potRes.pots);
  }, []);

  // Başlangıç oturum kontrolü
  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setBooting(false);
      return;
    }

    api
      .me()
      .then(async (res) => {
        setUser(res.user);
        await loadGardenData();
      })
      .catch(() => {
        setStoredToken(null);
      })
      .finally(() => {
        setBooting(false);
      });
  }, [loadGardenData]);

  // Aktif oturum heartbeat + canlı senkronizasyon + sekme kapanış logu
  useEffect(() => {
    if (!user) return;

    const heartbeatTimer = window.setInterval(() => {
      api.heartbeat().catch(() => {});
    }, 30000);

    const syncTimer = window.setInterval(() => {
      loadGardenData().catch(() => {});
    }, 5000);

    const handleFocusOrVisible = () => {
      if (document.visibilityState === 'visible') {
        loadGardenData().catch(() => {});
      }
    };
    window.addEventListener('focus', handleFocusOrVisible);
    document.addEventListener('visibilitychange', handleFocusOrVisible);

    const handleUnload = () => {
      api.logoutBeacon();
    };
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.clearInterval(heartbeatTimer);
      window.clearInterval(syncTimer);
      window.removeEventListener('focus', handleFocusOrVisible);
      document.removeEventListener('visibilitychange', handleFocusOrVisible);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [user, loadGardenData]);

  const handleLoginSuccess = async (loggedInUser: User) => {
    setUser(loggedInUser);
    await loadGardenData();
    setShowWelcomeModal(true);
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    }
    setStoredToken(null);
    setUser(null);
    setShowWelcomeModal(false);
    setShowAdminLogs(false);
    setShowMailbox(false);
    setShowWishArchive(false);
  };

  const handleCreateWish = async (content: string) => {
    const res = await api.createWish(content);
    setWishes((prev) => [res.wish, ...prev]);
    setShowWelcomeModal(false);
  };

  const handleFulfillWish = async (wishId: number) => {
    const res = await api.fulfillWish(wishId);
    setWishes((prev) => prev.map((w) => (w.id === wishId ? res.wish : w)));
    setSelectedWish((prev) => (prev && prev.id === wishId ? res.wish : prev));
  };

  const handleSendLetter = async (payload: { title: string; content: string; mood: string }) => {
    const res = await api.sendLetter(payload);
    setLetters((prev) => [res.letter, ...prev]);
  };

  const handleMarkLetterRead = async (id: number) => {
    await api.markLetterRead(id);
    setLetters((prev) => prev.map((l) => (l.id === id ? { ...l, is_read: 1 } : l)));
    setUnreadLettersCount((c) => Math.max(0, c - 1));
  };

  const handlePlantFlower = async (flowerId: string, nickname?: string) => {
    const res = await api.plantPot(flowerId, nickname);
    setPots((prev) => [res.pot, ...prev]);
  };

  const handleWaterPot = async (potId: number) => {
    const res = await api.waterPot(potId);
    setPots((prev) => prev.map((p) => (p.id === potId ? res.pot : p)));
    return res;
  };

  const handleChangeSun = async (potId: number, sunExposure: string) => {
    const res = await api.updatePotSun(potId, sunExposure);
    setPots((prev) => prev.map((p) => (p.id === potId ? res.pot : p)));
  };

  const handleAddNote = async (potId: number, content: string) => {
    const res = await api.addPotNote(potId, content);
    setPots((prev) => prev.map((p) => (p.id === potId ? res.pot : p)));
  };

  const handleDeleteNote = async (potId: number, noteId: number) => {
    const res = await api.deletePotNote(potId, noteId);
    setPots((prev) => prev.map((p) => (p.id === potId ? res.pot : p)));
  };

  const handleRefreshAi = async (potId: number) => {
    const res = await api.getPotAdvice(potId);
    return res.advice;
  };

  if (booting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#071810] text-emerald-200">
        <AmbientParticles />
        <div className="relative z-10 text-center space-y-3">
          <TreeDeciduous className="w-10 h-10 text-emerald-400 mx-auto animate-pulse" />
          <p className="font-romantic text-2xl">Cennet Bahçesi Hazırlanıyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#071c13] via-[#071810] to-[#04100a] relative">
        <AmbientParticles />
        <LoginScreen onSuccess={handleLoginSuccess} />
      </div>
    );
  }

  const pendingWishesCount = wishes.filter((w) => w.status === 'pending').length;
  const fulfilledWishesCount = wishes.filter((w) => w.status === 'fulfilled').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#081f15] via-[#071810] to-[#04100a] text-emerald-50 relative pb-24 md:pb-12">
      <AmbientParticles />

      {/* Üst Navigasyon */}
      <header className="sticky top-0 z-30 border-b border-emerald-500/15 bg-[#061810]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <TreeDeciduous className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-romantic text-xl sm:text-2xl font-semibold text-emerald-50 leading-none">
                Dilek Söğüdü
              </h1>
              <span className="text-[11px] text-emerald-300/70">
                {user.avatarEmoji} {user.displayName}
              </span>
            </div>
          </div>

          {/* Masaüstü Sekmeleri */}
          <nav className="hidden md:flex items-center gap-1.5 bg-emerald-950/70 border border-emerald-500/20 p-1 rounded-full">
            {[
              { id: 'garden', label: 'Bizim Bahçemiz', icon: TreeDeciduous },
              { id: 'pots', label: `Saksılarım (${pots.filter((p) => p.isMine).length})`, icon: Sprout },
              { id: 'catalog', label: 'Çiçek Kataloğu', icon: Flower2 },
            ].map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as ActiveTab)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                    active
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-emerald-950 font-semibold shadow'
                      : 'text-emerald-200/80 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Sağ Araçlar */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMailbox(true)}
              className="relative p-2 sm:px-3 sm:py-1.5 rounded-xl bg-teal-500/15 border border-teal-400/25 text-teal-200 hover:bg-teal-500/25 transition flex items-center gap-1.5 text-xs cursor-pointer"
              title="Gizli Mektup Kutusu"
            >
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Mektuplar</span>
              {unreadLettersCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                  {unreadLettersCount}
                </span>
              )}
            </button>

            {user.role === 'admin' && (
              <button
                onClick={() => setShowAdminLogs(true)}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-amber-400/15 border border-amber-300/30 text-amber-200 hover:bg-amber-400/25 transition flex items-center gap-1.5 text-xs cursor-pointer"
                title="Gizli Takip Paneli"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Takip Paneli</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl border border-emerald-500/20 text-emerald-300/75 hover:text-rose-200 hover:border-rose-400/30 transition cursor-pointer"
              title="Çıkış Yap"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Ana İçerik */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {activeTab === 'garden' && (
          <div className="space-y-8">
            {/* Başlık */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-emerald-300/80 bg-emerald-950/60 border border-emerald-500/20 px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Cennet Bahçemiz
              </span>
              <h2 className="font-romantic text-3xl sm:text-5xl font-semibold text-emerald-50">
                Dilek Söğüdünün Gölgesinde
              </h2>
              <p className="text-xs sm:text-sm text-emerald-200/75">
                Dallara dileklerini as, gerçekleşenleri altın yıldıza dönüştür ve ağacın altındaki mektup kutusunu aç.
              </p>
            </div>

            {/* İnteraktif Dev Söğüt Ağacı */}
            <WeepingWillow
              wishes={wishes}
              pots={pots}
              unreadLettersCount={unreadLettersCount}
              onSelectWish={(wish) => setSelectedWish(wish)}
              onSelectPot={(pot) => setSelectedPotId(pot.id)}
              onOpenMailbox={() => setShowMailbox(true)}
              onOpenNewWish={() => setShowWelcomeModal(true)}
            />

            {/* Alt Özet & Dilek Arşivi Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <button
                onClick={() => setShowWishArchive(true)}
                className="text-left rounded-2xl border border-emerald-500/20 bg-emerald-950/60 p-4 hover:border-emerald-400/45 transition cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs text-emerald-300/75">
                  <span>Dilek Defteri</span>
                  <BookOpen className="w-4 h-4 text-emerald-300" />
                </div>
                <div className="mt-2 font-romantic text-2xl font-semibold text-emerald-50">
                  {pendingWishesCount} Kurdele · {fulfilledWishesCount} Yıldız
                </div>
                <p className="text-xs text-emerald-300/70 mt-1">
                  Tüm geçmiş dilekleri gör &amp; gerçekleşenleri işaretle →
                </p>
              </button>

              <button
                onClick={() => setShowMailbox(true)}
                className="text-left rounded-2xl border border-teal-500/20 bg-emerald-950/60 p-4 hover:border-teal-400/45 transition cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs text-teal-300/75">
                  <span>Gizli Mektup Kutusu</span>
                  <Mail className="w-4 h-4 text-teal-300" />
                </div>
                <div className="mt-2 font-romantic text-2xl font-semibold text-emerald-50">
                  {letters.length} Özel Mektup
                </div>
                <p className="text-xs text-teal-300/75 mt-1">
                  {unreadLettersCount > 0
                    ? `${unreadLettersCount} okunmamış mektubun var! 💌`
                    : 'Sevgiline yeni bir mektup bırak →'}
                </p>
              </button>

              <button
                onClick={() => setActiveTab('pots')}
                className="text-left rounded-2xl border border-amber-400/20 bg-emerald-950/60 p-4 hover:border-amber-300/45 transition cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs text-amber-200/80">
                  <span>Saksılarımız</span>
                  <Sprout className="w-4 h-4 text-emerald-300" />
                </div>
                <div className="mt-2 font-romantic text-2xl font-semibold text-emerald-50">
                  {pots.length} Canlı Saksı
                </div>
                <p className="text-xs text-emerald-300/70 mt-1">
                  Çiçeklerini sula, not bırak ve AI tavsiyesi al →
                </p>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'pots' && (
          <PotsSection
            pots={pots}
            onWaterPot={handleWaterPot}
            onChangeSun={handleChangeSun}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
            onRefreshAi={handleRefreshAi}
            onGoToCatalog={() => setActiveTab('catalog')}
          />
        )}

        {activeTab === 'catalog' && (
          <CatalogSection flowers={catalog} onPlantFlower={handlePlantFlower} />
        )}
      </main>

      {/* Mobil Alt Navigasyon */}
      <nav className="md:hidden fixed bottom-3 left-3 right-3 z-30 rounded-2xl border border-emerald-500/25 bg-[#061810]/90 backdrop-blur-xl p-1.5 grid grid-cols-3 gap-1 shadow-2xl">
        {[
          { id: 'garden', label: 'Bahçe', icon: TreeDeciduous },
          { id: 'pots', label: 'Saksılarım', icon: Sprout },
          { id: 'catalog', label: 'Katalog', icon: Flower2 },
        ].map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as ActiveTab)}
              className={`flex flex-col items-center justify-center py-2 rounded-xl text-[11px] font-medium transition cursor-pointer ${
                active
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-emerald-950 font-semibold'
                  : 'text-emerald-200/75'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Modallar */}
      {showWelcomeModal && (
        <WelcomeWishModal
          user={user}
          onSubmitWish={handleCreateWish}
          onSkip={() => setShowWelcomeModal(false)}
        />
      )}

      {selectedWish && (
        <WishDetailModal
          wish={selectedWish}
          onClose={() => setSelectedWish(null)}
          onFulfill={handleFulfillWish}
        />
      )}

      {showWishArchive && (
        <WishArchiveModal
          wishes={wishes}
          onClose={() => setShowWishArchive(false)}
          onCreateWish={handleCreateWish}
          onFulfillWish={handleFulfillWish}
        />
      )}

      {showMailbox && (
        <MailboxModal
          currentUser={user}
          letters={letters}
          onClose={() => setShowMailbox(false)}
          onSendLetter={handleSendLetter}
          onMarkRead={handleMarkLetterRead}
        />
      )}

      {showAdminLogs && user.role === 'admin' && (
        <AdminLogsModal onClose={() => setShowAdminLogs(false)} />
      )}

      {selectedPotId !== null && (() => {
        const activePot = pots.find((p) => p.id === selectedPotId);
        if (!activePot) return null;
        return (
          <PotDetailModal
            pot={activePot}
            onClose={() => setSelectedPotId(null)}
            onWaterPot={handleWaterPot}
          />
        );
      })()}
    </div>
  );
}

export default App;
