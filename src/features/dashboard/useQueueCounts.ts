import { useGetAdminDashboardQuery } from '@/features/adminFreelance/adminFreelanceApi';
import type { DashboardQueueBucket } from '@/shared/types/adminDashboard';

/**
 * Dashboard davri — sidebar va Dashboard sahifasi UCHUN BIR XIL.
 *
 * Ikkalasi bir xil argument bilan so'rasa RTK Query bitta keshdan
 * foydalanadi: sidebar qo'shimcha so'rov yubormaydi. Boshqa qiymat
 * berilsa, har sahifada ikkinchi marta so'ralardi.
 */
export const DASHBOARD_DAYS = 7;

const EMPTY: DashboardQueueBucket = { count: 0, waiting_hours: 0 };

export interface QueueCounts {
  solutions: DashboardQueueBucket;
  subjectRequests: DashboardQueueBucket;
  assignmentRequests: DashboardQueueBucket;
  reports: DashboardQueueBucket;
  disputes: DashboardQueueBucket;
}

/**
 * Menyudagi ish navbatlari — sanoq va eng eski ishning yoshi.
 *
 * Yosh SANOQ BILAN BIRGA keladi va menyudagi rang aynan shundan
 * hisoblanadi: sanoqning o'zi shoshilinchlikni aytmaydi. Ilgari bu
 * yerda faqat sanoq bor edi va shu sababli har bir tamg'a bir xil
 * sariq bo'lib turardi — ya'ni rang hech nima anglatmasdi.
 *
 * Nizolar ham shu javobdan: ilgari ular alohida `dispute-stats`
 * so'rovidan olinardi va menyu har sahifada ikkita so'rov yuborardi.
 *
 * Har bosqichda `?.` — javob to'liq kelmasa ham menyu yiqilmasligi
 * kerak: sidebar har sahifada chiziladi va bu yerdagi xato butun
 * panelni o'chirардi.
 */
export function useQueueCounts(): QueueCounts {
  const { data } = useGetAdminDashboardQuery({ days: DASHBOARD_DAYS });
  const queue = data?.queue;

  return {
    solutions: queue?.solutions ?? EMPTY,
    subjectRequests: queue?.subject_requests ?? EMPTY,
    assignmentRequests: queue?.assignment_requests ?? EMPTY,
    reports: queue?.reports ?? EMPTY,
    disputes: queue?.disputes ?? EMPTY,
  };
}
