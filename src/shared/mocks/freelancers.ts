import type { Freelancer, FreelancerStatus } from '../types/freelancers';

/** 3-rasmdagi qatorlar — aynan dizayndagidek. */
const designRows: Freelancer[] = [
  {
    id: '1248',
    displayId: '#F-1248',
    name: 'Abdullaev Sardor',
    phone: '+998 90 123 45 67',
    speciality: 'Dasturlash (Python)',
    institute: 'TATU',
    rating: 4.8,
    ratingCount: 128,
    completedJobs: 156,
    income: 24_560_000,
    status: 'Faol',
  },
  {
    id: '1247',
    displayId: '#F-1247',
    name: 'Xolmurodova Shahnoza',
    phone: '+998 91 234 56 78',
    speciality: 'Matematika',
    institute: "O'zMU",
    rating: 4.9,
    ratingCount: 97,
    completedJobs: 132,
    income: 18_750_000,
    status: 'Faol',
  },
  {
    id: '1246',
    displayId: '#F-1246',
    name: 'Mirzayev Azizbek',
    phone: '+998 93 345 67 89',
    speciality: 'AutoCAD',
    institute: 'TIQXMMI',
    rating: 4.6,
    ratingCount: 76,
    completedJobs: 98,
    income: 15_320_000,
    status: 'Faol',
  },
  {
    id: '1245',
    displayId: '#F-1245',
    name: "To'xtayev Javohir",
    phone: '+998 94 456 78 90',
    speciality: 'Web dasturlash (React)',
    institute: 'INHA',
    rating: 4.7,
    ratingCount: 112,
    completedJobs: 187,
    income: 28_900_000,
    status: 'Faol',
  },
  {
    id: '1244',
    displayId: '#F-1244',
    name: 'Karimova Dildora',
    phone: '+998 90 567 89 01',
    speciality: 'Ingliz tili',
    institute: 'TSUE',
    rating: 4.5,
    ratingCount: 64,
    completedJobs: 76,
    income: 9_850_000,
    status: 'Vaqtinchalik bloklangan',
  },
  {
    id: '1243',
    displayId: '#F-1243',
    name: 'Qodirov Jasurbek',
    phone: '+998 91 678 90 12',
    speciality: "Ma'lumotlar bazasi (SQL)",
    institute: 'TATU',
    rating: 4.8,
    ratingCount: 145,
    completedJobs: 203,
    income: 33_400_000,
    status: 'Faol',
  },
  {
    id: '1242',
    displayId: '#F-1242',
    name: 'Ismoilova Sevinch',
    phone: '+998 93 789 01 23',
    speciality: 'Grafik dizayn (Photoshop)',
    institute: 'NamDU',
    rating: 4.4,
    ratingCount: 59,
    completedJobs: 64,
    income: 7_600_000,
    status: 'Faol',
  },
  {
    id: '1241',
    displayId: '#F-1241',
    name: 'Rahmonov Behruz',
    phone: '+998 94 890 12 34',
    speciality: 'Mobil dasturlash (Flutter)',
    institute: 'TATU',
    rating: 4.9,
    ratingCount: 133,
    completedJobs: 189,
    income: 27_800_000,
    status: 'Faol',
  },
];

export const specialities = [
  'Dasturlash (Python)',
  'Web dasturlash (React)',
  'Mobil dasturlash (Flutter)',
  "Ma'lumotlar bazasi (SQL)",
  'Grafik dizayn (Photoshop)',
  'AutoCAD',
  'Matematika',
  'Ingliz tili',
  'Elektronika',
];

export const institutes = [
  'TATU',
  "O'zMU",
  'TIQXMMI',
  'INHA',
  'TSUE',
  'NamDU',
  'BuxDU',
  'SamDU',
  'AndDU',
];

const names = [
  'Yusupov Alisher',
  'Karimova Nilufar',
  'Toshmatov Bekzod',
  'Nurmatova Madina',
  'Jalolov Oybek',
  'Ibragimova Gulnora',
  'Homidov Jasur',
  'Sayidova Dilnoza',
  'Usmonov Sanjar',
  'Rahimova Yulduz',
  'Sobirov Shohruh',
  'Ortiqova Mohira',
];

const statuses: FreelancerStatus[] = [
  'Faol',
  'Faol',
  'Faol',
  'Faol',
  'Vaqtinchalik bloklangan',
  'Bloklangan',
];

/** Determinlashtirilgan — har yuklashda bir xil. */
function generated(count: number): Freelancer[] {
  return Array.from({ length: count }, (_, index) => {
    const id = 1240 - index;
    return {
      id: String(id),
      displayId: `#F-${id}`,
      name: names[index % names.length]!,
      phone: `+998 9${index % 10} ${100 + index} ${20 + (index % 70)} ${11 + (index % 80)}`,
      speciality: specialities[index % specialities.length]!,
      institute: institutes[(index * 3) % institutes.length]!,
      rating: Number((4.0 + ((index * 7) % 10) / 10).toFixed(1)),
      ratingCount: 40 + ((index * 13) % 120),
      completedJobs: 30 + ((index * 17) % 190),
      income: (5 + ((index * 11) % 30)) * 1_000_000,
      status: statuses[index % statuses.length]!,
    } satisfies Freelancer;
  });
}

export const mockFreelancers: Freelancer[] = [...designRows, ...generated(44)];
