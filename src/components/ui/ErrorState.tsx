import { TriangleAlert } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

/**
 * Ro'yxat yoki panel yuklanmaganda.
 *
 * Ilgari bu har sahifada qo'lda yozilgan qizil qutича edi — bir qatorlik
 * texnik xabar va boshqa hech nima. Odam nima qilishini bilmasdi: sahifani
 * yangilaydimi, kutadimi, kimgadir aytadimi. Endi u boshqa bo'sh
 * holatlar bilan bir xil shaklda va ichida qayta urinish tugmasi bor.
 */
export function ErrorState({
  message,
  onRetry,
  title = "Ma'lumot yuklanmadi",
}: {
  message?: string;
  /** Berilmasa tugma chizilmaydi — ishlamaydigan tugmadan yo'qligi yaxshi. */
  onRetry?: () => void;
  title?: string;
}) {
  return (
    <EmptyState
      icon={TriangleAlert}
      tone="danger"
      title={title}
      description={message}
      action={
        onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Qayta urinish
          </Button>
        )
      }
    />
  );
}
