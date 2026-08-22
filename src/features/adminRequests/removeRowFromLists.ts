import type { ApiPaginated } from '@/shared/types/api';
import type { AppDispatch, RootState } from '@/store';

import { adminRequestsApi } from './adminRequestsApi';

/** Qatorni olib tashlash mumkin bo'lgan ro'yxat endpoint'lari. */
export type RequestListEndpoint =
  | 'getUniversityRequestsList'
  | 'getSubjectRequestsList'
  | 'getAssignmentRequestsList'
  | 'getSolutionReports';

/** `updateQueryData` qaytaradigan bekor qilish tutqichi. */
type Patch = ReturnType<ReturnType<typeof adminRequestsApi.util.updateQueryData>>;

/** `onQueryStarted` ga keladigan obyektning bizga kerakli qismi. */
export interface LifecycleApi {
  dispatch: AppDispatch;
  getState: () => RootState;
  queryFulfilled: Promise<unknown>;
}

/**
 * Tasdiqlangan yoki rad etilgan qatorni ro'yxat keshidan DARHOL olib
 * tashlaydi.
 *
 * Nega kerak: `invalidatesTags` ro'yxatni qayta so'raydi, lekin javob
 * kelguncha qator joyida turadi va butun jadval yangilangandek
 * ko'rinadi. Optimistik olib tashlash bilan foydalanuvchi faqat o'zi
 * tegan qatorning yo'qolishini ko'radi.
 *
 * Sahifa, filtr va qidiruvning har bir kombinatsiyasi alohida kesh
 * yozuvi, shuning uchun `selectCachedArgsForQuery` orqali HAMMASI
 * aylanib chiqiladi — foydalanuvchi qaysi sahifada turganini bilishga
 * hojat qolmaydi.
 */
export function removeRowFromLists(
  endpoint: RequestListEndpoint,
  id: string,
  api: Pick<LifecycleApi, 'dispatch' | 'getState'>,
): Patch[] {
  const cachedArgs = adminRequestsApi.util.selectCachedArgsForQuery(api.getState(), endpoint);
  const patches: Patch[] = [];

  for (const args of cachedArgs) {
    patches.push(
      api.dispatch(
        /*
         * To'rtala endpoint javobi bir xil shaklda (`ApiPaginated<{id}>`),
         * lekin ARGUMENT tiplari har xil. Generik yozuv o'rniga shu
         * joyda tor cast qilinadi — funksiya tanasi baribir faqat
         * `results` va `count` bilan ishlaydi.
         */
        adminRequestsApi.util.updateQueryData(
          endpoint as 'getSolutionReports',
          args as never,
          (draft: ApiPaginated<{ id: string }>) => {
            const index = draft.results.findIndex((row) => row.id === id);
            if (index === -1) return;

            draft.results.splice(index, 1);
            draft.count = Math.max(0, draft.count - 1);
          },
        ),
      ),
    );
  }

  return patches;
}

/**
 * Tasdiqlash/rad etish uchun umumiy `onQueryStarted`.
 *
 * `invalidatesTags` joyida qoladi — u sanoq va sahifalashni haqiqiy
 * holatga keltiradi, lekin jadval endi skeletonga aylanmagani uchun
 * foydalanuvchi buni sezmaydi.
 */
export function optimisticRemove(endpoint: RequestListEndpoint) {
  return async function onQueryStarted(
    arg: string | { id: string },
    api: LifecycleApi,
  ): Promise<void> {
    const id = typeof arg === 'string' ? arg : arg.id;
    const patches = removeRowFromLists(endpoint, id, api);

    try {
      await api.queryFulfilled;
    } catch {
      for (const patch of patches) patch.undo();
    }
  };
}
