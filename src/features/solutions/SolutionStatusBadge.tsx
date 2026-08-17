import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { SOLUTION_STATUS_LABELS, type SolutionStatus } from '@/shared/types/solutions';

/**
 * Rang holatga qarab TO'G'RIDAN-TO'G'RI tanlanadi, o'zbekcha yorliq
 * orqali emas: umumiy `StatusBadge` matnni kalit sifatida ishlatadi va
 * "Tasdiqlangan" bilan "E'lon qilingan" kabi yangi holatlar u yerda
 * jimgina kulrang bo'lib qolardi.
 */
const tones: Record<SolutionStatus, BadgeTone> = {
  pending: 'warning',
  approved: 'info',
  published: 'success',
  rejected: 'danger',
  archived: 'neutral',
};

export function SolutionStatusBadge({ status }: { status: SolutionStatus }) {
  return <Badge tone={tones[status]}>{SOLUTION_STATUS_LABELS[status]}</Badge>;
}
