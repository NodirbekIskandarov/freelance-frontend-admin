import { Paperclip } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { TextAreaField } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { getApiErrorMessage } from '@/shared/api';
import { APPEAL_TOPIC_LABELS, type AdminAppeal } from '@/shared/types/adminAppeals';

import { useReplyToAppealMutation } from './adminAppealsApi';

/**
 * Javob yozish murojaatni AVTOMATIK `resolved` qiladi — backendda
 * alohida "yopish" amali yo'q. Shuning uchun javob matni majburiy:
 * bo'sh javob bilan murojaat yopilib qolmasin.
 */
export function ReplyModal({
  appeal,
  onClose,
}: {
  appeal: AdminAppeal | null;
  onClose: () => void;
}) {
  const [replyToAppeal, { isLoading, error, reset }] = useReplyToAppealMutation();
  const [reply, setReply] = useState('');

  function close() {
    setReply('');
    reset();
    onClose();
  }

  async function submit() {
    if (!appeal) return;

    try {
      await replyToAppeal({ id: appeal.id, reply: reply.trim() }).unwrap();
    } catch {
      // Xato quyida ko'rsatiladi; yozilgan matn saqlanib qoladi.
      return;
    }

    close();
  }

  return (
    <Modal
      open={appeal !== null}
      onClose={close}
      title="Murojaatga javob"
      description={
        appeal ? `${APPEAL_TOPIC_LABELS[appeal.topic]} · ${appeal.reference}` : undefined
      }
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Bekor qilish
          </Button>
          <Button
            variant="primary"
            disabled={isLoading || !reply.trim()}
            onClick={() => void submit()}
          >
            {isLoading ? 'Yuborilmoqda…' : 'Javob yuborish'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {appeal && (
          <div className="rounded-control border border-line bg-input px-3.5 py-3">
            <p className="text-sm font-medium text-fg">{appeal.subject}</p>
            <p className="mt-1 text-sm whitespace-pre-line text-fg-soft">{appeal.message}</p>

            {/*
              Ilovalar javob maydonining TEPASIDA.

              Operator eng ko'p so'raydigan narsa — skrinshot, va u
              javobni yozishdan oldin ochilishi kerak. Yangi oynada:
              fayl PDF ham, rasm ham bo'lishi mumkin va uni shu yerda
              chizishga urinish ikkinchisini buzardi.
            */}
            {appeal.attachments.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {appeal.attachments.map((attachment, index) => (
                  <li key={attachment.id}>
                    <a
                      href={attachment.file}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 rounded-control border border-line px-2.5 py-1.5 text-xs text-fg transition-colors hover:border-primary/40"
                    >
                      <Paperclip className="size-3.5 shrink-0" strokeWidth={1.75} />
                      Fayl {index + 1}
                    </a>
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-2 text-xs text-fg-muted">
              {appeal.user.full_name || appeal.user.phone} · {appeal.user.email || '—'}
            </p>
          </div>
        )}

        <TextAreaField
          label="Javob"
          required
          maxLength={2000}
          rows={5}
          placeholder="Javob foydalanuvchiga ko'rinadi — aniq va to'liq yozing."
          value={reply}
          onChange={(event) => setReply(event.target.value)}
        />

        <p className="text-xs text-fg-muted">
          Javob yuborilgach murojaat &laquo;Hal qilindi&raquo; holatiga o&apos;tadi.
        </p>

        {error !== undefined && error !== null && (
          <p
            role="alert"
            className="rounded-control border border-danger/25 bg-danger/10 px-3.5 py-2.5 text-sm text-danger"
          >
            {getApiErrorMessage(error)}
          </p>
        )}
      </div>
    </Modal>
  );
}
