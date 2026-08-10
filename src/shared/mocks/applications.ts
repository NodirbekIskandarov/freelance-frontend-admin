import type { ApplicationStatus, FreelancerApplication } from '../types/applications';

/** 4-rasmdagi qatorlar — aynan dizayndagidek. */
const designRows: FreelancerApplication[] = [
  {
    id: '248',
    displayId: '#A-0248',
    userName: 'Abdullaev Sardor',
    phone: '+998 90 123 45 67',
    university: 'TATU',
    speciality: 'Dasturlash (Python)',
    document: { name: 'passport_sardor.pdf', format: 'PDF' },
    portfolioCount: 3,
    status: 'Kutilmoqda',
  },
  {
    id: '247',
    displayId: '#A-0247',
    userName: 'Xolmurodova Shahnoza',
    phone: '+998 91 234 56 78',
    university: "O'zMU",
    speciality: 'Matematika',
    document: { name: 'id_shahnoza.jpg', format: 'JPG' },
    portfolioCount: 5,
    status: 'Tasdiqlangan',
  },
  {
    id: '246',
    displayId: '#A-0246',
    userName: 'Mirzayev Azizbek',
    phone: '+998 93 345 67 89',
    university: 'TIQXMMI',
    speciality: 'AutoCAD',
    document: { name: 'passport_azizbek.pdf', format: 'PDF' },
    portfolioCount: 4,
    status: 'Tasdiqlangan',
  },
  {
    id: '245',
    displayId: '#A-0245',
    userName: "To'xtayev Javohir",
    phone: '+998 94 456 78 90',
    university: 'INHA',
    speciality: 'Web dasturlash (React)',
    document: { name: 'id_javohir.jpg', format: 'JPG' },
    portfolioCount: 6,
    status: 'Rad etilgan',
  },
  {
    id: '244',
    displayId: '#A-0244',
    userName: 'Karimova Dildora',
    phone: '+998 90 567 89 01',
    university: 'TSUE',
    speciality: 'Ingliz tili',
    document: { name: 'passport_dildora.pdf', format: 'PDF' },
    portfolioCount: 2,
    status: 'Kutilmoqda',
  },
  {
    id: '243',
    displayId: '#A-0243',
    userName: 'Qodirov Jasurbek',
    phone: '+998 91 678 90 12',
    university: 'TATU',
    speciality: "Ma'lumotlar bazasi (SQL)",
    document: { name: 'id_jasurbek.jpg', format: 'JPG' },
    portfolioCount: 3,
    status: 'Tasdiqlangan',
  },
  {
    id: '242',
    displayId: '#A-0242',
    userName: 'Ismoilova Sevinch',
    phone: '+998 93 789 01 23',
    university: 'NamDU',
    speciality: 'Grafik dizayn (Photoshop)',
    document: { name: 'passport_sevinch.pdf', format: 'PDF' },
    portfolioCount: 7,
    status: 'Kutilmoqda',
  },
  {
    id: '241',
    displayId: '#A-0241',
    userName: 'Rahmonov Behruz',
    phone: '+998 94 890 12 34',
    university: 'TATU',
    speciality: 'Mobil dasturlash (Flutter)',
    document: { name: 'id_behruz.jpg', format: 'JPG' },
    portfolioCount: 4,
    status: 'Rad etilgan',
  },
];

export const universities = ['TATU', "O'zMU", 'TIQXMMI', 'INHA', 'TSUE', 'NamDU', 'BuxDU', 'SamDU'];

const names = [
  'Yusupov Alisher',
  'Karimova Nilufar',
  'Toshmatov Bekzod',
  'Nurmatova Madina',
  'Jalolov Oybek',
  'Ibragimova Gulnora',
  'Homidov Jasur',
  'Sayidova Dilnoza',
];

const specialityPool = [
  'Dasturlash (Python)',
  'Web dasturlash (React)',
  'Mobil dasturlash (Flutter)',
  "Ma'lumotlar bazasi (SQL)",
  'Grafik dizayn (Photoshop)',
  'AutoCAD',
  'Matematika',
  'Ingliz tili',
];

const statuses: ApplicationStatus[] = [
  'Kutilmoqda',
  'Tasdiqlangan',
  'Tasdiqlangan',
  'Rad etilgan',
  'Kutilmoqda',
];

/** Determinlashtirilgan — har yuklashda bir xil. */
function generated(count: number): FreelancerApplication[] {
  return Array.from({ length: count }, (_, index) => {
    const id = 240 - index;
    const name = names[index % names.length]!;
    const first = name.split(' ')[1]!.toLowerCase();
    const isPdf = index % 2 === 0;

    return {
      id: String(id),
      displayId: `#A-0${id}`,
      userName: name,
      phone: `+998 9${index % 10} ${200 + index} ${30 + (index % 60)} ${12 + (index % 80)}`,
      university: universities[index % universities.length]!,
      speciality: specialityPool[(index * 3) % specialityPool.length]!,
      document: {
        name: isPdf ? `passport_${first}.pdf` : `id_${first}.jpg`,
        format: isPdf ? 'PDF' : 'JPG',
      },
      portfolioCount: 1 + (index % 8),
      status: statuses[index % statuses.length]!,
    } satisfies FreelancerApplication;
  });
}

export const mockApplications: FreelancerApplication[] = [...designRows, ...generated(40)];
