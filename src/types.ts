export type UserRole = 'admin' | 'partner';

export interface User {
  id: number;
  username: string;
  displayName: string;
  role: UserRole;
  avatarEmoji: string;
  ribbonColor: string;
}

export interface Wish {
  id: number;
  user_id: number;
  content: string;
  status: 'pending' | 'fulfilled';
  branch_slot: number;
  ribbon_color: string;
  created_at: string;
  fulfilled_at: string | null;
  fulfilled_by: number | null;
  author_name: string;
  author_emoji: string;
  fulfilled_by_name: string | null;
}

export interface Letter {
  id: number;
  sender_id: number;
  recipient_id: number;
  title: string;
  content: string;
  mood: string;
  is_read: number;
  read_at: string | null;
  created_at: string;
  sender_name: string;
  sender_emoji: string;
  recipient_name: string;
}

export interface FlowerCatalogItem {
  id: string;
  kind?: 'flower' | 'plant';
  canTouchScent?: boolean;
  name: string;
  latinName: string;
  category: string;
  sunlight: 'Tam Güneş' | 'Yarı Gölge' | 'Dolaylı Işık';
  waterNeed: 'Az' | 'Orta' | 'Yüksek';
  waterIntervalDays: number;
  growthDaysRequired: number;
  languageOfFlowers: string;
  romanticMeaning: string;
  careTip: string;
  petalColor: string;
  secondaryColor: string;
  accentColor: string;
  visualType: string;
}

export interface PotNote {
  id: number;
  pot_id: number;
  user_id: number;
  content: string;
  created_at: string;
  author_name: string;
}

export interface AiAdvice {
  source: string;
  headline: string;
  message: string;
  nextWaterInDays: number;
}

export interface StageInfo {
  stage: 0 | 1 | 2 | 3;
  label: string;
  badge: string;
  progress: number;
}

export interface Pot {
  id: number;
  userId: number;
  ownerName: string;
  ownerEmoji: string;
  isMine: boolean;
  flowerId: string;
  nickname: string;
  plantedAt: string;
  growthPoints: number;
  growthDaysRequired: number;
  waterLevel: number;
  sunExposure: 'Tam Güneş' | 'Yarı Gölge' | 'Dolaylı Işık';
  lastWateredAt: string | null;
  lastWateredDate: string | null;
  waterCount: number;
  wateredToday: boolean;
  stageInfo: StageInfo;
  flower: FlowerCatalogItem;
  notes: PotNote[];
  aiAdvice: AiAdvice;
}

export interface SessionLog {
  id: string;
  login_at: string;
  last_seen_at: string;
  logout_at: string | null;
  duration_seconds: number;
  user_agent: string;
  is_active: number;
}

export interface AdminLogsResponse {
  partner: {
    id: number;
    username: string;
    displayName: string;
    avatarEmoji: string;
  } | null;
  summary: {
    totalVisits: number;
    totalDurationSeconds: number;
    isCurrentlyOnline: boolean;
    lastLoginAt: string | null;
    lastSeenAt: string | null;
  };
  logs: SessionLog[];
}
