import type { AdminUser, UserStatus } from '../types/users';

/** 2-rasmdagi birinchi 11 qator — aynan dizayndagidek. */
const designRows: AdminUser[] = [
  {
    id: '12482',
    displayId: '#U-12482',
    name: 'Abdullaev Sardor',
    phone: '+998 90 123 45 67',
    email: 'sardor.abdullaev@gmail.com',
    registeredAt: '2025-07-10 14:32',
    balance: 125_000,
    status: 'Faol',
  },
  {
    id: '12481',
    displayId: '#U-12481',
    name: 'Xolmurodova Shahnoza',
    phone: '+998 91 234 56 78',
    email: 'shahnoza.xolmurodova@mail.ru',
    registeredAt: '2025-07-10 12:15',
    balance: 80_500,
    status: 'Faol',
  },
  {
    id: '12480',
    displayId: '#U-12480',
    name: "To'xtayev Javohir",
    phone: '+998 93 345 67 89',
    email: 'javohir.toxtayev@gmail.com',
    registeredAt: '2025-07-09 18:45',
    balance: 210_000,
    status: 'Faol',
  },
  {
    id: '12479',
    displayId: '#U-12479',
    name: 'Karimova Dildora',
    phone: '+998 94 456 78 90',
    email: 'dildora.karimova@gmail.com',
    registeredAt: '2025-07-09 16:20',
    balance: 45_000,
    status: 'Faol',
  },
  {
    id: '12478',
    displayId: '#U-12478',
    name: 'Mirzayev Azizbek',
    phone: '+998 99 567 89 01',
    email: 'azizbek.mirzayev@mail.ru',
    registeredAt: '2025-07-09 11:05',
    balance: 0,
    status: 'Kutilmoqda',
  },
  {
    id: '12477',
    displayId: '#U-12477',
    name: 'Ismoilova Sevinch',
    phone: '+998 90 678 90 12',
    email: 'sevinch.ismoilova@gmail.com',
    registeredAt: '2025-07-08 23:30',
    balance: 320_000,
    status: 'Faol',
  },
  {
    id: '12476',
    displayId: '#U-12476',
    name: 'Rahmonov Behruz',
    phone: '+998 91 789 01 23',
    email: 'behruz.rahmonov@mail.ru',
    registeredAt: '2025-07-08 21:10',
    balance: 67_500,
    status: 'Bloklangan',
  },
  {
    id: '12475',
    displayId: '#U-12475',
    name: 'Qodirov Jasurbek',
    phone: '+998 93 890 12 34',
    email: 'jasurbek.qodirov@gmail.com',
    registeredAt: '2025-07-08 17:55',
    balance: 150_000,
    status: 'Faol',
  },
  {
    id: '12474',
    displayId: '#U-12474',
    name: 'Nurmatova Barno',
    phone: '+998 94 901 23 45',
    email: 'barno.nurmatova@gmail.com',
    registeredAt: '2025-07-07 15:40',
    balance: 0,
    status: 'Bloklangan',
  },
  {
    id: '12473',
    displayId: '#U-12473',
    name: 'Rasulov Oybek',
    phone: '+998 99 012 34 56',
    email: 'oybek.rasulov@gmail.com',
    registeredAt: '2025-07-07 13:25',
    balance: 230_000,
    status: 'Faol',
  },
];

const firstNames = [
  'Aziz',
  'Dilnoza',
  'Sanjar',
  'Madina',
  'Oybek',
  'Yulduz',
  'Bekzod',
  'Shahnoza',
  'Jasur',
  'Gulnora',
  'Alisher',
  'Mohira',
  'Shohruh',
  'Nilufar',
  'Ozodbek',
];
const lastNames = [
  'Karimov',
  'Toshmatov',
  'Akbarov',
  'Nurmatov',
  'Jalolov',
  'Mirzayev',
  'Usmonov',
  'Ibragimov',
  'Homidov',
  'Sayidov',
  'Rahimov',
  'Ismoilov',
  'Sobirov',
  'Yusupov',
  'Ortiqov',
];
const statuses: UserStatus[] = ['Faol', 'Faol', 'Faol', 'Faol', 'Kutilmoqda', 'Bloklangan'];

/**
 * Sahifalash va filtrni sinash uchun qo'shimcha qatorlar.
 * Determinlashtirilgan (`Math.random` yo'q) — har yuklashda bir xil,
 * shuning uchun skrinshot solishtirish barqaror bo'ladi.
 */
function generated(count: number): AdminUser[] {
  return Array.from({ length: count }, (_, index) => {
    const id = 12_472 - index;
    const first = firstNames[index % firstNames.length]!;
    const last = lastNames[(index * 7) % lastNames.length]!;
    const day = 7 - (index % 7);
    const hour = 8 + (index % 12);

    return {
      id: String(id),
      displayId: `#U-${id}`,
      name: `${last} ${first}`,
      phone: `+998 9${index % 10} ${100 + (index % 800)} ${10 + (index % 80)} ${10 + (index % 85)}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@gmail.com`,
      registeredAt: `2025-07-0${day} ${String(hour).padStart(2, '0')}:${String((index * 7) % 60).padStart(2, '0')}`,
      balance: (index % 9) * 35_000,
      status: statuses[index % statuses.length]!,
    } satisfies AdminUser;
  });
}

export const mockAdminUsers: AdminUser[] = [...designRows, ...generated(50)];
