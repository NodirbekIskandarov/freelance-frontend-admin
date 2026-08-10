import type { ApplicationDetail } from '../types/applicationDetail';

/** 5-rasmdagi ma'lumot — aynan dizayndagidek. */
export const mockApplicationDetail: ApplicationDetail = {
  id: '248',
  displayId: '#A-0248',
  status: 'Kutilmoqda',

  name: 'Abdullaev Sardor',
  isOnline: true,
  rating: 4.8,
  badge: 'Top freelancer',
  phone: '+998 90 123 45 67',
  email: 'sardor.abdullaev@gmail.com',
  registeredAt: '2025-07-10 14:32',
  lastActiveAt: '2025-07-11 10:15',

  university: {
    short: 'TATU',
    full: 'Toshkent axborot texnologiyalari universiteti',
  },
  diplomaStage: '3-bosqich',

  personal: {
    fullName: 'Abdullaev Sardor',
    phone: '+998 90 123 45 67',
    email: 'sardor.abdullaev@gmail.com',
    birthDate: '2002-05-15',
    gender: 'Erkak',
    address: 'Toshkent shahri, Yunusobod tumani',
  },

  about:
    'Salom! Men dasturlash va elektronika sohalarida 2 yildan ortiq tajribaga egaman. Python, Django, Arduino, Raspberry Pi va boshqa texnologiyalar bilan ishlayman. Sifatli va o‘z vaqtida ish bajarishga har doim tayyorman.',

  specialities: [
    {
      id: '1',
      name: 'Dasturlash (Python)',
      experience: '2 yil',
      rating: 4.8,
      isPrimary: true,
      tone: 'info',
    },
    {
      id: '2',
      name: 'Elektronika',
      experience: '1.5 yil',
      rating: 4.6,
      isPrimary: false,
      tone: 'orange',
    },
    {
      id: '3',
      name: 'Web dasturlash (Django)',
      experience: '1 yil',
      rating: 4.5,
      isPrimary: false,
      tone: 'purple',
    },
  ],

  skills: [
    'Python',
    'Django',
    'JavaScript',
    'HTML/CSS',
    'Arduino',
    'Raspberry Pi',
    'C++',
    'SQL',
    'Git',
    'REST API',
    'Linux',
  ],

  documents: [
    {
      id: '1',
      title: 'Pasport / ID karta',
      fileName: 'passport_sardor.pdf',
      format: 'PDF',
      size: '1.2 MB',
    },
    {
      id: '2',
      title: 'Diplom / Sertifikatlar',
      fileName: 'diplom_tatu.pdf',
      format: 'PDF',
      size: '2.4 MB',
    },
    {
      id: '3',
      title: 'Boshqa hujjatlar',
      fileName: 'sertifikat_python.pdf',
      format: 'PDF',
      size: '1.1 MB',
    },
  ],

  portfolio: {
    total: 7,
    previews: [null, null, null, null, null],
  },

  timeline: [
    { label: 'Ariza yuborildi', date: '2025-07-10 14:32', tone: 'success' },
    { label: 'Hujjatlar yuklandi', date: '2025-07-10 14:35', tone: 'info' },
    { label: "Ko'rib chiqilmoqda", date: '2025-07-10 15:10', tone: 'warning' },
    { label: 'Hali qaror qabul qilinmagan', date: null, tone: 'muted' },
  ],
};
