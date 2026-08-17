import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { getApiErrorMessage } from '@/shared/api';
import type { Variant } from '@/shared/types/assignments';

import {
  useCreateVariantMutation,
  useGetAssignmentsQuery,
  useUpdateVariantMutation,
} from './assignmentsApi';

/** Backend standarti — bitta variantga uchtagacha yechim e'lon qilinadi. */
const DEFAULT_MAX_SOLUTIONS = 3;

export function VariantFormModal({
  open,
  variant,
  /** Oldindan tanlangan topshiriq (topshiriq sahifasidan ochilganda). */
  assignmentId,
  onClose,
}: {
  open: boolean;
  variant: Variant | null;
  assignmentId?: string;
  onClose: () => void;
}) {
  const [createVariant, createState] = useCreateVariantMutation();
  const [updateVariant, updateState] = useUpdateVariantMutation();

  const { data: assignments } = useGetAssignmentsQuery(
    { page_size: 200, ordering: 'title' },
    { skip: !open || Boolean(assignmentId) },
  );

  const [assignment, setAssignment] = useState('');
  const [number, setNumber] = useState('');
  const [maxSolutions, setMaxSolutions] = useState(String(DEFAULT_MAX_SOLUTIONS));
  const [isActive, setIsActive] = useState(true);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;

    setAssignment(variant?.assignment ?? assignmentId ?? '');
    setNumber(variant ? String(variant.number) : '');
    setMaxSolutions(String(variant?.max_published_solutions ?? DEFAULT_MAX_SOLUTIONS));
    setIsActive(variant?.is_active ?? true);
    setTouched(false);
  }, [open, variant, assignmentId]);

  const assignmentOptions = [
    { value: '', label: 'Topshiriqni tanlang' },
    ...(assignments?.results ?? []).map((item) => ({
      value: item.id,
      label: `${item.title} — ${item.subject_name}`,
    })),
  ];

  const parsedNumber = Number(number);
  const numberError =
    touched && (!number.trim() || Number.isNaN(parsedNumber) || parsedNumber < 1)
      ? "Variant raqamini kiriting (1 dan boshlab)"
      : undefined;
  const assignmentError = touched && !assignment ? 'Topshiriqni tanlang' : undefined;

  const isSaving = createState.isLoading || updateState.isLoading;
  const error = createState.error ?? updateState.error;

  async function handleSubmit() {
    setTouched(true);
    if (!assignment || numberError || !number.trim()) return;

    const body = {
      assignment,
      number: parsedNumber,
      max_published_solutions: Number(maxSolutions) || DEFAULT_MAX_SOLUTIONS,
      is_active: isActive,
    };

    try {
      if (variant) await updateVariant({ id: variant.id, ...body }).unwrap();
      else await createVariant(body).unwrap();
    } catch {
      // Xato quyida ko'rsatiladi (masalan shu raqamli variant mavjud).
      return;
    }

    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={variant ? 'Variantni tahrirlash' : 'Yangi variant'}
      description={variant?.assignment_title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={isSaving}>
            {isSaving ? 'Saqlanmoqda…' : 'Saqlash'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Topshiriq sahifasidan ochilganda u allaqachon ma'lum. */}
        {!assignmentId && (
          <div>
            <span className="mb-2 block text-sm font-medium text-fg-soft">
              Topshiriq
              <span aria-hidden className="ml-0.5 text-danger">
                *
              </span>
            </span>
            <Select
              aria-label="Topshiriq"
              options={assignmentOptions}
              value={assignment}
              onChange={(event) => setAssignment(event.target.value)}
            />
            {assignmentError && <p className="mt-1.5 text-xs text-danger">{assignmentError}</p>}
          </div>
        )}

        <TextField
          label="Variant raqami"
          required
          type="number"
          min={1}
          placeholder="1"
          value={number}
          error={numberError}
          onChange={(event) => setNumber(event.target.value)}
        />

        <TextField
          label="Maksimal e'lon qilingan yechimlar"
          type="number"
          min={1}
          value={maxSolutions}
          hint="Shu songa yetganda yangi yechimni e'lon qilib bo'lmaydi."
          onChange={(event) => setMaxSolutions(event.target.value)}
        />

        <label className="flex cursor-pointer items-center gap-2.5">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            className="size-4 accent-primary"
          />
          <span className="text-sm text-fg-soft">Faol — katalogda ko&apos;rinadi</span>
        </label>

        {error && (
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
