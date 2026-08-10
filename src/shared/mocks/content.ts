import type { ContentOverview } from '../types/content';

/** Qiymatlar `design/admin/image 6.png` dagi bilan bir xil. */
export const mockContentOverview: ContentOverview = {
  stats: [
    {
      key: 'institutes',
      label: 'Institutlar soni',
      value: '128',
      details: [
        { label: 'Faol', value: '115' },
        { label: 'Tasdiqlanishi kerak', value: '13' },
      ],
    },
    {
      key: 'subjects',
      label: 'Fanlar soni',
      value: '1 256',
      details: [
        { label: 'Faol', value: '1 102' },
        { label: 'Tasdiqlanishi kerak', value: '154' },
      ],
    },
    {
      key: 'tasks',
      label: 'Topshiriqlar soni',
      value: '12 842',
      details: [
        { label: 'Mustaqil ish', value: '6 512' },
        { label: 'Amaliy ish', value: '4 125' },
        { label: 'Laboratoriya', value: '2 205' },
      ],
    },
    {
      key: 'variants',
      label: 'Variantlar soni',
      value: '68 953',
      details: [
        { label: 'Yechimi mavjud', value: '45 612' },
        { label: "So'rov mavjud", value: '12 340' },
        { label: 'Yechim yo‘q', value: '11 001' },
      ],
    },
    {
      key: 'solutions',
      label: 'Yechimlar soni',
      value: '45 612',
      details: [
        { label: 'Tasdiqlangan', value: '38 742' },
        { label: 'Tasdiqlanishi kerak', value: '5 842' },
        { label: 'Rad etilgan', value: '1 028' },
      ],
    },
    {
      key: 'requested',
      label: "So'rov qoldirilgan variantlar",
      value: '12 340',
      details: [
        { label: 'Kutayotgan', value: '9 876' },
        { label: 'Javob berilgan', value: '2 464' },
      ],
    },
    {
      key: 'sales',
      label: 'Sotuvlar soni',
      value: '23 456',
      details: [
        { label: 'Bu oy', value: '4 235' },
        { label: 'Bugun', value: '312' },
      ],
    },
  ],

  sales: {
    total: "28 450 000 so'm",
    changePercent: '+18.6%',
    changeNote: '(oldingi 7 kun bilan solishtirganda)',
    points: [
      { date: '01.07', amount: 2_000_000 },
      { date: '02.07', amount: 3_050_000 },
      { date: '03.07', amount: 2_050_000 },
      { date: '04.07', amount: 2_700_000 },
      { date: '05.07', amount: 1_750_000 },
      { date: '06.07', amount: 2_400_000 },
      { date: '07.07', amount: 3_500_000 },
      { date: '08.07', amount: 2_350_000 },
      { date: '09.07', amount: 2_900_000 },
      { date: '10.07', amount: 3_150_000 },
      { date: '11.07', amount: 4_650_000 },
    ],
  },

  topBlocks: [
    {
      key: 'institutes',
      title: 'Top institutlar',
      subtitle: "(sotuvlar bo'yicha)",
      columns: ['Institut', 'Sotuvlar', "Daromad (so'm)"],
      rows: [
        { id: '1', name: 'TATU', count: 3245, income: 24_560_000 },
        { id: '2', name: 'TDIU', count: 2145, income: 16_230_000 },
        { id: '3', name: "O'zMU", count: 1856, income: 13_450_000 },
        { id: '4', name: 'BuxDU', count: 1234, income: 9_870_000 },
        { id: '5', name: 'NamDU', count: 987, income: 7_450_000 },
      ],
    },
    {
      key: 'subjects',
      title: 'Top fanlar',
      subtitle: "(sotuvlar bo'yicha)",
      columns: ['Fan', 'Sotuvlar', "Daromad (so'm)"],
      rows: [
        { id: '1', name: "Ma'lumotlar bazasi", count: 2845, income: 21_450_000 },
        { id: '2', name: 'Dasturlash (Python)', count: 2123, income: 15_980_000 },
        { id: '3', name: 'Elektronika', count: 1654, income: 11_870_000 },
        { id: '4', name: 'Web dasturlash', count: 1245, income: 9_230_000 },
        { id: '5', name: 'Hisoblash matematikasi', count: 987, income: 7_120_000 },
      ],
    },
    {
      key: 'tasks',
      title: 'Top topshiriqlar',
      subtitle: "(sotuvlar bo'yicha)",
      columns: ['Topshiriq', 'Sotuvlar', "Daromad (so'm)"],
      rows: [
        {
          id: '1',
          name: "Ma'lumotlar bazasi",
          note: 'Mustaqil ish №3',
          count: 853,
          income: 6_400_000,
        },
        {
          id: '2',
          name: 'Python asoslari',
          note: 'Amaliy ish №2',
          count: 742,
          income: 5_550_000,
        },
        {
          id: '3',
          name: 'Elektronika',
          note: 'Laboratoriya №1',
          count: 654,
          income: 4_900_000,
        },
        {
          id: '4',
          name: 'Web dasturlash',
          note: 'Amaliy ish №1',
          count: 532,
          income: 3_990_000,
        },
        {
          id: '5',
          name: 'C++ dasturlash',
          note: 'Mustaqil ish №2',
          count: 489,
          income: 3_600_000,
        },
      ],
    },
    {
      key: 'authors',
      title: 'Eng faol mualliflar',
      subtitle: '',
      columns: ['Muallif', 'Yechimlar', "Daromad (so'm)"],
      rows: [
        { id: '1', name: 'Sardor Mirzayev', count: 432, income: 4_320_000 },
        { id: '2', name: 'Javohir Ortiqov', count: 389, income: 3_890_000 },
        { id: '3', name: 'Dilshodbek Yusupov', count: 356, income: 3_420_000 },
        { id: '4', name: 'Abdulloh Karimov', count: 298, income: 2_980_000 },
        { id: '5', name: "Ozodbek To'xtayev", count: 267, income: 2_560_000 },
      ],
    },
  ],

  contentStatus: [
    { label: 'Tasdiqlangan institutlar', value: '115', tone: 'success' },
    { label: 'Tasdiqlangan fanlar', value: '1 102', tone: 'info' },
    { label: 'Tasdiqlangan topshiriqlar', value: '12 126', tone: 'purple' },
    { label: 'Tasdiqlangan variantlar', value: '45 612', tone: 'warning' },
    { label: 'Tasdiqlangan yechimlar', value: '38 742', tone: 'cyan' },
    { label: 'Tasdiqlanishi kerak yechimlar', value: '5 842', tone: 'orange' },
    { label: 'Rad etilgan yechimlar', value: '1 028', tone: 'danger' },
  ],
};
