import { Download, FileArchive, FileSpreadsheet, FileText, MousePointerClick } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatDateTime, formatDecimalSom } from '@/lib/format';
import {
  fileExtensionOf,
  previewKindOf,
  SOLUTION_STATUS_LABELS,
  type Submission,
} from '@/shared/types/submissions';

import { statusTones } from './SubmissionsPage';

/** Kengaytmaga qarab belgicha — hujjat, jadval, arxiv. */
function iconFor(extension: string) {
  if (['zip', 'rar', '7z'].includes(extension)) return FileArchive;
  if (['xls', 'xlsx', 'csv'].includes(extension)) return FileSpreadsheet;
  return FileText;
}

/**
 * Yuborilgan javobni ochib ko'rish paneli.
 *
 * PDF `<iframe>` da, rasm `<img>` da chiziladi — ikkalasini ham brauzer
 * o'zi uddalaydi. Qolgan formatlar (doc, docx, xls, zip) uchun brauzerda
 * ko'rsatuvchi yo'q va konvertor ham yo'q, shuning uchun panel ochiq
 * aytadi va yuklab olishga yo'naltiradi. Ularni ham «ko'rib chiqish» deb
 * ko'rsatib, keyin bo'sh oyna chiqarish moderatorni faylni tekshirdim deb
 * o'ylashga majbur qilardi.
 */
export function SubmissionPreview({ submission }: { submission: Submission | null }) {
  /*
   * Fayl yuklanmaganini bilishning ishonchli yo'li yo'q: `<iframe>` xato
   * hodisasi bermaydi, S3 esa `Content-Disposition: attachment` bilan
   * qaytarsa oyna bo'sh qoladi. Shuning uchun panel ostida doim yuklab
   * olish tugmasi turadi.
   */
  const [failed, setFailed] = useState(false);

  // Boshqa javobga o'tilganda oldingi xato holati qolib ketmasin.
  useEffect(() => setFailed(false), [submission?.id]);

  if (!submission) {
    return (
      <Card className="flex min-h-[320px] flex-col items-center justify-center gap-3 p-8 text-center">
        <MousePointerClick className="size-8 text-fg-dim" strokeWidth={1.5} />
        <p className="text-sm text-fg-muted">
          Javobni ko&apos;rish uchun quyidagi ro&apos;yxatdan birini tanlang.
        </p>
      </Card>
    );
  }

  const extension = fileExtensionOf(submission.file_name);
  const kind = previewKindOf(submission.file_name);
  const Icon = iconFor(extension);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-base font-semibold text-fg" title={submission.title}>
              {submission.title}
            </h2>
            <Badge tone={statusTones[submission.status]}>
              {SOLUTION_STATUS_LABELS[submission.status]}
            </Badge>
            {extension && <Badge tone="neutral">{extension.toUpperCase()}</Badge>}
          </div>

          <p className="mt-1 text-xs text-fg-muted">
            {submission.uploader?.full_name || submission.uploader?.phone || '—'} ·{' '}
            {formatDateTime(submission.created_at)} ·{' '}
            {/* So'ralgan narx — admin nimani baholayotganini bilsin. Chop
                etilgandan keyin `price` boshqa raqam bo'lishi mumkin. */}
            So&apos;ragan narxi: {formatDecimalSom(submission.asking_price)}
          </p>

          {submission.description && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-fg-soft">
              {submission.description}
            </p>
          )}
        </div>

        {submission.file_url && (
          <Button
            variant="secondary"
            icon={<Download className="size-4" strokeWidth={1.75} />}
            onClick={() => window.open(submission.file_url, '_blank', 'noopener')}
          >
            Yuklab olish
          </Button>
        )}
      </div>

      {!submission.file_url ? (
        <p className="p-8 text-center text-sm text-fg-muted">Faylsiz javob.</p>
      ) : kind === 'pdf' && !failed ? (
        <iframe
          // `key` — yangi javobga o'tganda iframe qayta yaratilsin, aks
          // holda ba'zi brauzerlar eski hujjatni ko'rsatib turadi.
          key={submission.id}
          src={submission.file_url}
          title={submission.file_name}
          className="h-[560px] w-full border-0 bg-white"
          onError={() => setFailed(true)}
        />
      ) : kind === 'image' && !failed ? (
        <div className="flex justify-center bg-canvas p-4">
          <img
            src={submission.file_url}
            alt={submission.file_name}
            className="max-h-[560px] w-auto max-w-full rounded-control object-contain"
            onError={() => setFailed(true)}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
          <Icon className="size-9 text-fg-dim" strokeWidth={1.5} />
          <p className="text-sm font-medium text-fg">{submission.file_name}</p>
          <p className="max-w-sm text-sm text-fg-muted">
            {failed
              ? 'Fayl brauzerda ochilmadi — yuklab olib tekshiring.'
              : "Bu format brauzerda ko'rsatilmaydi. Tekshirish uchun yuklab oling."}
          </p>
          <Button
            variant="secondary"
            icon={<Download className="size-4" strokeWidth={1.75} />}
            onClick={() => window.open(submission.file_url, '_blank', 'noopener')}
          >
            Yuklab olish
          </Button>
        </div>
      )}
    </Card>
  );
}
