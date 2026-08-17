import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { getApiErrorMessage } from '@/shared/api';
import type { Assignment } from '@/shared/types/assignments';

import { useDeleteAssignmentMutation } from './assignmentsApi';

export function DeleteAssignmentModal({
  assignment,
  onClose,
}: {
  /** `null` — modal yopiq. */
  assignment: Assignment | null;
  onClose: () => void;
}) {
  const [deleteAssignment, { isLoading, error }] = useDeleteAssignmentMutation();

  async function handleDelete() {
    if (!assignment) return;

    try {
      await deleteAssignment(assignment.id).unwrap();
    } catch {
      return;
    }

    onClose();
  }

  return (
    <Modal
      open={assignment !== null}
      onClose={onClose}
      title="Topshiriqni o'chirish"
      description={assignment?.title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button variant="danger" onClick={() => void handleDelete()} disabled={isLoading}>
            {isLoading ? "O'chirilmoqda…" : "O'chirish"}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-fg-soft">
        Topshiriq katalogdan yashiriladi, lekin bazadan butunlay o&apos;chmaydi — unga bog&apos;langan
        variantlar va yechimlar tarixi saqlanib qoladi.
      </p>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-control border border-danger/25 bg-danger/10 px-3.5 py-2.5 text-sm text-danger"
        >
          {getApiErrorMessage(error)}
        </p>
      )}
    </Modal>
  );
}
