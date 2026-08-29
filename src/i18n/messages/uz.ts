/**
 * O'zbekcha matnlar — MANBA nusxa.
 *
 * Tuzilma shu yerda belgilanadi, `ru.ts` esa uni tip bo'yicha aynan
 * takrorlaydi: yangi kalit qo'shilib ruschada unutilsa, build yiqiladi.
 * Tarjimasiz qolgan qator saytda jimgina o'zbekcha bo'lib turmaydi.
 */
export const uz = {
  common: {
    loading: 'Yuklanmoqda…',
    save: 'Saqlash',
    saving: 'Saqlanmoqda…',
    cancel: 'Bekor qilish',
    close: 'Yopish',
    back: 'Orqaga',
    search: 'Qidirish',
    delete: "O'chirish",
    edit: 'Tahrirlash',
    confirm: 'Tasdiqlash',
    all: 'Barchasi',
    yes: 'Ha',
    no: "Yo'q",
    none: '—',
    empty: "Ma'lumot yo'q",
    error: 'Xatolik yuz berdi',
    retry: 'Qayta urinish',
    currency: "so'm",
  },

  locale: {
    switcherLabel: 'Panel tili',
    ariaSwitch: '{from} tilidan {to} tiliga almashtirish',
  },

  layout: {
    permissionsFailed:
      'Ruxsatlar yuklanmadi. Sahifani yangilang — muammo qolsa administratorga murojaat qiling.',
    supportTitle: 'Yordam kerakmi?',
    supportText: "Savollaringiz bo'lsa biz bilan bog'laning.",
    supportAction: "Qo'llab-quvvatlash",
    home: 'Bosh sahifa',
    notifications: 'Bildirishnomalar',
    closeSidebar: 'Yon menyuni yopish',
    toggleSidebar: 'Yon menyuni ochish/yopish',
    profile: 'Profil',
    logout: 'Chiqish',
    loggingOut: 'Chiqilmoqda…',
    superAdmin: 'Super Admin',
    staffMember: 'Panel xodimi',
    support: "Qo'llab-quvvatlash",
  },

  nav: {
    groupHome: 'Bosh sahifa',
    groupMaterials: 'Tayyor materiallar',
    groupFinance: 'Moliya',
    groupSettings: 'Sozlamalar',

    dashboard: 'Dashboard',
    users: 'Foydalanuvchilar',
    freelancers: 'Freelancerlar',
    applications: 'Freelancer arizalari',
    exchange: 'Birja nazorati',
    appeals: 'Murojaatlar',

    content: 'Kontent boshqaruvi',
    institutes: 'Institutlar',
    subjects: 'Fanlar',
    assignments: 'Topshiriqlar',
    variants: 'Variantlar',
    submittedSubjects: 'Yuborilgan fanlar',
    submittedSolutions: 'Yuborilgan javoblar',
    solutionModeration: 'Yechim moderatsiyasi',
    comments: 'Izohlar',
    reports: 'Shikoyatlar',
    approvedContent: 'Tasdiqlangan kontent',
    monitoring: 'Server monitoringi',
    salesStats: 'Sotuv statistikasi',

    wallets: 'Hamyonlar',
    withdrawals: "Pul yechish so'rovlari",
    ledger: 'Pul harakati',

    audit: 'Audit jurnali',
    roles: 'Rollar va ruxsatlar',
    staff: 'Admin foydalanuvchilar',
    settings: 'Sozlamalar',
  },

  login: {
    title: 'Admin panelga kirish',
    subtitle: "Moderatsiya bo'limlari faqat admin va moderatorlar uchun ochiq.",
    identifier: 'Telefon raqam yoki email',
    password: 'Parol',
    submit: 'Kirish',
    submitting: 'Kirilmoqda…',
    failed: "Kirish amalga oshmadi. Ma'lumotlarni tekshiring.",
    forgot: 'Parolni unutdingizmi?',
  },

  forgot: {
    title: 'Parolni tiklash',
    subtitleStart: "Hisobingizga bog'langan telefon raqam yoki tasdiqlangan emailni kiriting.",
    subtitleCode: 'Yuborilgan kodni va yangi parolni kiriting.',
    identifier: 'Telefon raqam yoki email',
    sendCode: 'Kod yuborish',
    sending: 'Yuborilmoqda…',
    sendFailed: "Kod yuborib bo'lmadi.",
    code: 'Tasdiqlash kodi',
    demoHint: 'Yetkazish ulanmagan. Sinov kodi: {code}',
    newPassword: 'Yangi parol',
    passwordHint: 'Kamida 8 ta belgi, harf va raqam.',
    repeatPassword: 'Yangi parolni takrorlang',
    mismatch: 'Parollar mos kelmadi.',
    submit: 'Parolni yangilash',
    submitting: 'Saqlanmoqda…',
    submitFailed: "Parolni yangilab bo'lmadi.",
    changeAccount: 'Boshqa hisob kiritish',
    backToLogin: 'Kirishga qaytish',
    doneTitle: 'Parol yangilandi',
    doneSubtitle: 'Endi yangi parolingiz bilan panelga kiring.',
    doneAction: 'Kirish sahifasiga qaytish',
  },

  profile: {
    title: 'Profil',
    subtitle: 'Hisobingiz va paneldagi huquqlaringiz.',
    phone: 'Telefon',
    email: 'Email',
    phoneVerified: 'Telefon tasdiqlangan',
    lastLogin: 'Oxirgi kirish',
    registered: "Ro'yxatdan o'tgan",
    permissions: 'Huquqlar',
    superAdminNote:
      "Barcha bo'limlarga to'liq kirish. Huquq rollardan emas, hisobning o'zidan keladi.",
    noRoles:
      "Hech qanday rol biriktirilmagan. Panelga kirasiz, lekin bo'limlar ko'rinmaydi — administratordan rol so'rang.",
    changePasswordTitle: "Parolni o'zgartirish",
    setPasswordTitle: "Parol qo'yish",
    changePasswordDesc: 'Hisob bitta — yangi parol saytda ham, panelda ham ishlaydi.',
    setPasswordDesc:
      "Hisobingiz parolsiz ochilgan. Parol qo'ysangiz, panelga u bilan ham kira olasiz.",
    currentPassword: 'Joriy parol',
    newPassword: 'Yangi parol',
    repeatPassword: 'Yangi parolni takrorlang',
    passwordHint: 'Kamida 8 ta belgi, harf va raqam.',
    mismatch: 'Parollar mos kelmadi.',
    changeFailed: "Parolni o'zgartirib bo'lmadi.",
    changed: 'Parol yangilandi.',
  },

  notFound: {
    title: 'Sahifa topilmadi',
    description: "So'ralgan sahifa mavjud emas yoki manzil noto'g'ri yozilgan.",
    action: 'Bosh sahifaga qaytish',
  },
};

/**
 * `as const` ATAYLAB yo'q: u har qiymatni o'z matniga bog'lab qo'yardi
 * va ruscha nusxa aynan o'zbekcha matnlarni talab qilardi.
 */
export type Messages = typeof uz;
