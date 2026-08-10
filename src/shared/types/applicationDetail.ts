import type { ApplicationStatus } from './applications';

export interface SpecialityEntry {
  id: string;
  name: string;
  /** "Tajribasi: 2 yil" qatoridagi qiymat. */
  experience: string;
  rating: number;
  /** Asosiy mutaxassislik yonida yashil yorliq turadi. */
  isPrimary: boolean;
  /** Ikonka chipining rangi. */
  tone: 'info' | 'orange' | 'purple' | 'success' | 'cyan';
}

export interface DocumentEntry {
  id: string;
  /** "Pasport / ID karta" kabi turi. */
  title: string;
  fileName: string;
  format: string;
  size: string;
  thumbUrl?: string | null;
  url?: string | null;
}

export interface TimelineEntry {
  label: string;
  date: string | null;
  tone: 'success' | 'info' | 'warning' | 'muted';
}

/** 5-rasmdagi to'liq ariza ma'lumoti. */
export interface ApplicationDetail {
  id: string;
  displayId: string;
  status: ApplicationStatus;

  name: string;
  avatarUrl?: string | null;
  isOnline: boolean;
  rating: number;
  badge?: string;
  phone: string;
  email: string;
  registeredAt: string;
  lastActiveAt: string;

  university: { short: string; full: string };
  diplomaStage: string;

  personal: {
    fullName: string;
    phone: string;
    email: string;
    birthDate: string;
    gender: string;
    address: string;
  };

  about: string;
  specialities: SpecialityEntry[];
  skills: string[];
  documents: DocumentEntry[];
  portfolio: { total: number; previews: (string | null)[] };
  timeline: TimelineEntry[];
}
