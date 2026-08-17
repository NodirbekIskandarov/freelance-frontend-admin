import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { getApiErrorMessage } from '@/shared/api';
import type { Subject } from '@/shared/types/catalogue';

import {
  useCreateSubjectMutation,
  useGetDirectionsQuery,
  useGetFacultiesQuery,
  useGetUniversitiesQuery,
  useUpdateSubjectMutation,
} from './catalogueApi';

/**
 * Yo'nalish universitetga BEVOSITA bog'lanmagan: universitet → fakultet
 * → yo'nalish. Backend "yo'nalish o'sha universitetga tegishli bo'lsin"
 * deb talab qiladi, shuning uchun ro'yxat ikki bosqichda yig'iladi:
 * avval universitetning fakultetlari, keyin ularning yo'nalishlari.
 */
function useDirectionsForUniversity(universityId: string, enabled: boolean) {
  const { data: faculties } = useGetFacultiesQuery(
    { university: universityId, page_size: 100 },
    { skip: !enabled || !universityId },
  );

  const facultyIds = new Set((faculties?.results ?? []).map((item) => item.id));

  const { data: directions, isLoading } = useGetDirectionsQuery(
    { page_size: 200 },
    { skip: !enabled || facultyIds.size === 0 },
  );

  return {
    directions: (directions?.results ?? []).filter((item) => facultyIds.has(item.faculty)),
    isLoading,
  };
}

export function SubjectFormModal({
  open,
  subject,
  onClose,
}: {
  open: boolean;
  /** `null` — yangi fan yaratiladi. */
  subject: Subject | null;
  onClose: () => void;
}) {
  const [createSubject, createState] = useCreateSubjectMutation();
  const [updateSubject, updateState] = useUpdateSubjectMutation();

  const { data: universities } = useGetUniversitiesQuery(
    { page_size: 200, ordering: 'short_name' },
    { skip: !open },
  );

  const [university, setUniversity] = useState('');
  const [direction, setDirection] = useState('');
  const [name, setName] = useState('');
  const [course, setCourse] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [touched, setTouched] = useState(false);

  const { directions } = useDirectionsForUniversity(university, open);

  useEffect(() => {
    if (!open) return;

    setUniversity(subject?.university ?? '');
    setDirection(subject?.direction ?? '');
    setName(subject?.name ?? '');
    setCourse(subject?.course === null || subject === null ? '' : String(subject.course));
    setIsActive(subject?.is_active ?? true);
    setTouched(false);
  }, [open, subject]);

  const universityOptions = [
    { value: '', label: 'Institutni tanlang' },
    ...(universities?.results ?? []).map((item) => ({
      value: item.id,
      label: item.short_name || item.name,
    })),
  ];

  const directionOptions = [
    { value: '', label: "Yo'nalishsiz" },
    ...directions.map((item) => ({ value: item.id, label: item.name })),
  ];

  const universityError = touched && !university ? 'Institutni tanlang' : undefined;
  const nameError = touched && !name.trim() ? 'Fan nomini kiriting' : undefined;

  const isSaving = createState.isLoading || updateState.isLoading;
  const error = createState.error ?? updateState.error;

  async function handleSubmit() {
    setTouched(true);
    if (!university || !name.trim()) return;

    const parsedCourse = course.trim() === '' ? null : Number(course);

    const body = {
      university,
      name: name.trim(),
      // Bo'sh tanlov `null` bo'lib ketadi — backend `direction` ni
      // ixtiyoriy deb belgilagan, bo'sh SATR esa UUID sifatida rad etilardi.
      direction: direction || null,
      course: Number.isNaN(parsedCourse) ? null : parsedCourse,
      is_active: isActive,
    };

    try {
      if (subject) await updateSubject({ id: subject.id, ...body }).unwrap();
      else await createSubject(body).unwrap();
    } catch {
      return;
    }

    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={subject ? 'Fanni tahrirlash' : 'Yangi fan'}
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
            Institut
            <span aria-hidden className="ml-0.5 text-danger">
              *
            </span>
          </span>
          <Select
            aria-label="Institut"
            options={universityOptions}
            value={university}
            onChange={(event) => {
              setUniversity(event.target.value);
              // Institut o'zgarsa eski yo'nalish endi mos kelmaydi.
              setDirection('');
            }}
          />
          {universityError && <p className="mt-1.5 text-xs text-danger">{universityError}</p>}
        </div>

        <div>
          <span className="mb-2 block text-sm font-medium text-fg-soft">
            Yo&apos;nalish (ixtiyoriy)
          </span>
          <Select
            aria-label="Yo'nalish"
            options={directionOptions}
            value={direction}
            disabled={!university || directions.length === 0}
            onChange={(event) => setDirection(event.target.value)}
          />
          {university && directions.length === 0 && (
            <p className="mt-1.5 text-xs text-fg-muted">
              Bu institutda yo&apos;nalishlar hali qo&apos;shilmagan.
            </p>
          )}
        </div>

        <TextField
          label="Fan nomi"
          required
          placeholder="Ma'lumotlar bazasi"
          value={name}
          error={nameError}
          onChange={(event) => setName(event.target.value)}
        />

        <TextField
          label="Kurs"
          type="number"
          min={1}
          max={6}
          placeholder="2"
          value={course}
          onChange={(event) => setCourse(event.target.value)}
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
