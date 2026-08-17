import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { TextAreaField, TextField } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { getApiErrorMessage } from '@/shared/api';
import type { Assignment } from '@/shared/types/assignments';

import {
  useCreateAssignmentMutation,
  useGetSubjectsQuery,
  useUpdateAssignmentMutation,
} from './assignmentsApi';

/**
 * Yaratish va tahrirlash uchun BITTA modal.
 *
 * Ikkita alohida komponent maydonlarni va validatsiyani ikki nusxada
 * saqlashni anglatardi — ular vaqt o'tib bir-biridan uzoqlashadi.
 * Farq faqat qaysi mutatsiya chaqirilishida.
 */
export function AssignmentFormModal({
  open,
  assignment,
  onClose,
}: {
  open: boolean;
  /** `null` — yangi topshiriq yaratiladi. */
  assignment: Assignment | null;
  onClose: () => void;
}) {
  const isEdit = assignment !== null;

  const [createAssignment, createState] = useCreateAssignmentMutation();
  const [updateAssignment, updateState] = useUpdateAssignmentMutation();

  // Fanlar ro'yxati faqat modal ochilganda kerak — yopiq turganda
  // so'rov yubormaymiz.
  const { data: subjects, isLoading: isLoadingSubjects } = useGetSubjectsQuery(
    { page_size: 200, ordering: 'name' },
    { skip: !open },
  );

  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [touched, setTouched] = useState(false);

  // Modal ochilganda forma tanlangan topshiriqdan to'ldiriladi. Bu
  // `useEffect` siz bo'lmaydi: bir xil modal turli qatorlar uchun
  // qayta ishlatiladi va `useState` boshlang'ich qiymati faqat birinchi
  // renderda o'qiladi.
  useEffect(() => {
    if (!open) return;

    setSubject(assignment?.subject ?? '');
    setTitle(assignment?.title ?? '');
    setDescription(assignment?.description ?? '');
    setIsActive(assignment?.is_active ?? true);
    setTouched(false);
  }, [open, assignment]);

  const subjectOptions = [
    { value: '', label: 'Fanni tanlang' },
    ...(subjects?.results ?? []).map((item) => ({
      value: item.id,
      label: `${item.name} — ${item.university_name}`,
    })),
  ];

  const subjectError = touched && !subject ? 'Fanni tanlang' : undefined;
  const titleError = touched && !title.trim() ? 'Sarlavhani kiriting' : undefined;

  const isSaving = createState.isLoading || updateState.isLoading;
  const error = createState.error ?? updateState.error;

  async function handleSubmit() {
    setTouched(true);
    if (!subject || !title.trim()) return;

    const body = {
      subject,
      title: title.trim(),
      description: description.trim(),
      is_active: isActive,
    };

    try {
      if (assignment) await updateAssignment({ id: assignment.id, ...body }).unwrap();
      else await createAssignment(body).unwrap();
    } catch {
      // Xato quyida ko'rsatiladi (masalan bir fanda bir xil sarlavha).
      return;
    }

    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Topshiriqni tahrirlash' : 'Yangi topshiriq'}
      description={isEdit ? assignment.subject_name : 'Topshiriq fanga biriktiriladi.'}
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
        <div>
          <span className="mb-2 block text-sm font-medium text-fg-soft">
            Fan
            <span aria-hidden className="ml-0.5 text-danger">
              *
            </span>
          </span>
          <Select
            aria-label="Fan"
            options={subjectOptions}
            value={subject}
            disabled={isLoadingSubjects}
            onChange={(event) => setSubject(event.target.value)}
          />
          {subjectError && <p className="mt-1.5 text-xs text-danger">{subjectError}</p>}
        </div>

        <TextField
          label="Sarlavha"
          required
          maxLength={255}
          placeholder="Masalan: Mustaqil ish №3"
          value={title}
          error={titleError}
          onChange={(event) => setTitle(event.target.value)}
        />

        <TextAreaField
          label="Tavsif"
          maxLength={2000}
          placeholder="Topshiriq shartlari va talablar."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
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
