import { useGetAdminDashboardQuery } from '@/features/adminFreelance/adminFreelanceApi';
import { useGetDisputeStatsQuery } from '@/features/adminDisputes/disputesApi';

/**
 * Dashboard davri — sidebar va Dashboard sahifasi UCHUN BIR XIL.
 *
 * Ikkalasi bir xil argument bilan so'rasa RTK Query bitta keshdan
 * foydalanadi: sidebar qo'shimcha so'rov yubormaydi. Boshqa qiymat
 * berilsa, har sahifada ikkinchi marta so'ralardi.
 *
 * 7 kun, 30 emas: platformada ma'lumot yaqinda paydo bo'lgan va 30
 * kunlik oynada grafikning katta qismi nolda yotgan tekis chiziq
 * bo'lardi — u trendni ko'rsatmaydi, faqat joy egallaydi.
 */
export const DASHBOARD_DAYS = 7;

export interface QueueCounts {
  solutions: number;
  subjectRequests: number;
  assignmentRequests: number;
  reports: number;
  disputes: number;
}

/**
 * Menyudagi ish navbati sonlari.
 *
 * Manba — dashboard so'rovi. Alohida yengil endpoint yo'q, lekin
 * so'rov Dashboard sahifasi bilan umumiy: admin odatda undan
 * boshlaydi, ya'ni kesh issiq bo'ladi va sidebar tekinga oladi.
 */
export function useQueueCounts(): QueueCounts {
  const { data } = useGetAdminDashboardQuery({ days: DASHBOARD_DAYS });
  // Xarid shikoyatlari dashboard javobida yo'q — ularning o'z yengil
  // statistikasi bor va u ochiqlar sonini beradi.
  const { data: disputes } = useGetDisputeStatsQuery();

  /*
    Har bosqichda `?.` — `data?.solutions.pending` YETARLI EMAS edi: u
    faqat `data` ni tekshiradi, ichki obyekt yo'q bo'lsa esa xato
    tashlaydi. Sidebar har sahifada chiziladi, ya'ni bunday xato butun
    panelni yiqitardi — javob to'liq kelmagani uchun menyu yo'qolishi
    mumkin bo'lmagan narsa.
  */
  return {
    solutions: data?.solutions?.pending ?? 0,
    subjectRequests: data?.requests?.subject_pending ?? 0,
    assignmentRequests: data?.requests?.assignment_pending ?? 0,
    reports: data?.requests?.report_pending ?? 0,
    disputes: disputes?.open ?? 0,
  };
}
