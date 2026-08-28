import { MessageSquare, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from '@/i18n/navigation';

import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { formatDateTime } from '@/lib/format';
import { getApiErrorMessage } from '@/shared/api';
import type { AdminComment } from '@/shared/types/comments';

import { DeleteCommentModal } from './DeleteCommentModal';
import { useDeleteCommentMutation, useGetCommentsQuery } from './commentsApi';

/**
 * Bitta topshiriqning izohlari — tafsilot sahifasidagi karta.
 *
 * Moderator uchun izoh topshiriq haqidagi ma'lumotning bir qismi:
 * «3-variant noto'g'ri» degan yozuv aynan shu yerda, variantlar yonida
 * turgani foydali. Alohida bo'limga borib qidirish shu bog'lanishni
 * yo'qotardi.
 *
 * Ro'yxat qisqartirilgan: tafsilot sahifasi izohlar arxivi emas.
 * Ko'proq bo'lsa to'liq bo'limga havola beriladi.
 */
const PREVIEW_LIMIT = 10;

export function AssignmentCommentsCard({ assignmentId }: { assignmentId: string }) {
  /* `null` — o'chirish oynasi yopiq. */
  const [deleteTarget, setDeleteTarget] = useState<AdminComment | null>(null);

  const { data, isLoading, error } = useGetCommentsQuery({
    assignment: assignmentId,
    page_size: PREVIEW_LIMIT,
  });
  const [remove, removeState] = useDeleteCommentMutation();

  const comments = data?.results ?? [];
  const total = data?.count ?? 0;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-base font-semibold text-fg">
          <MessageSquare className="size-4 text-primary" strokeWidth={1.75} />
          Izohlar
          <span className="rounded-badge border border-line bg-elevated px-2.5 py-1 text-xs text-fg-muted">
            {total} ta
          </span>
        </h2>

        {/* Havola faqat qisqartirish sodir bo'lganda: aks holda u
            allaqachon ko'rinib turgan narsaga olib borardi. */}
        {total > PREVIEW_LIMIT && (
          <Link
            to={`/izohlar?assignment=${assignmentId}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            Hammasini ko&apos;rish
          </Link>
        )}
      </div>

      {error ? (
        <p role="alert" className="mt-4 text-sm text-danger">
          {getApiErrorMessage(error)}
        </p>
      ) : isLoading ? (
        <div className="mt-4 space-y-2">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="h-14 animate-pulse rounded-control bg-elevated" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="py-8 text-center text-sm text-fg-muted">Bu topshiriqqa izoh yozilmagan.</p>
      ) : (
        <ul className="mt-3">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-3 border-b border-line py-3 last:border-0">
              <Avatar name={comment.author?.full_name || '?'} size="sm" />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2">
                  <span className="text-[13px] font-medium text-fg">
                    {comment.author?.full_name?.trim() || 'Foydalanuvchi'}
                  </span>
                  <span className="text-[11px] text-fg-muted">
                    {formatDateTime(comment.created_at)}
                  </span>
                </div>
                {/* `whitespace-pre-line` — odam qatorlarga bo'lib yozgan
                    bo'lsa shundayligicha qolsin. */}
                <p className="mt-1 text-sm leading-relaxed break-words whitespace-pre-line text-fg-soft">
                  {comment.body}
                </p>
              </div>

              <button
                type="button"
                aria-label="Izohni olib tashlash"
                onClick={() => setDeleteTarget(comment)}
                className="grid size-7 shrink-0 place-items-center self-start rounded-control text-fg-muted transition-colors hover:bg-danger/10 hover:text-danger"
              >
                <Trash2 className="size-3.5" strokeWidth={1.75} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <DeleteCommentModal
        comment={deleteTarget}
        isLoading={removeState.isLoading}
        error={removeState.error}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;

          try {
            await remove(deleteTarget.id).unwrap();
          } catch {
            return;
          }

          setDeleteTarget(null);
        }}
      />
    </Card>
  );
}
