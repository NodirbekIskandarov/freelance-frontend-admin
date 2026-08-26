import { Info } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { TextAreaField, TextField } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { getApiErrorMessage } from '@/shared/api';
import { COURSE_OPTIONS, SEMESTER_OPTIONS, type Subject } from '@/shared/types/catalogue';

import {
  useCreateSubjectMutation,
  useGetDirectionsQuery,
  useGetUniversitiesQuery,
  useUpdateSubjectMutation,
} from './catalogueApi';

/**
 * Yo'nalish universitetga BEVOSITA bog'lanmagan: universitet → fakultet
 * → yo'nalish. Backend "yo'nalish o'sha universitetga tegishli bo'lsin"
 * deb talab qiladi.
 *
 * Oldin ro'yxat ikki bosqichda yig'ilardi (avval fakultetlar, keyin butun
 * yo'nalishlar ro'yxati va uni qo'lda saralash). Endi `/directions/`
 * `?university=` ni o'zi qabul qiladi — bitta so'rov, ortiqcha ma'lumot
 * tortilmaydi.
 */
function useDirectionsForUniversity(universityId: string, enabled: boolean) {
  const { data, isLoading } = useGetDirectionsQuery(
    { page_size: 200, university: universityId },
    { skip: !enabled || !universityId },
  );

  return { directions: data?.results ?? [], isLoading };
}

/** Izoh maydonining chegarasi — backend ham shu sonni tekshiradi. */
const MAX_DESCRIPTION = 300;

export function SubjectFormModal({
  open,
  subject,
  defaultUniversityId = null,
  onClose,
}: {
  open: boolean;
  /** `null` — yangi fan yaratiladi. */
  subject: Subject | null;
  /** Ro'yxatda tanlab turilgan institut — yangi fan uchun oldindan qo'yiladi. */
  defaultUniversityId?: string | null;
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
  const [nameRu, setNameRu] = useState('');
  const [course, setCourse] = useState('');
  const [semester, setSemester] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [touched, setTouched] = useState(false);

  const { directions } = useDirectionsForUniversity(university, open);

  useEffect(() => {
    if (!open) return;

    setUniversity(subject?.university ?? defaultUniversityId ?? '');
    setDirection(subject?.direction ?? '');
    /*
     * `name` joriy tilga qarab yechilgan qiymat, `name_uz` esa ustunning
     * o'zi. Tahrirlashda ustun kerak: aks holda ruscha interfeysda
     * o'zbekcha maydonga ruscha nom tushib qolardi.
     */
    setName(subject?.name_uz ?? subject?.name ?? '');
    setNameRu(subject?.name_ru ?? '');
    setCourse(subject?.course ? String(subject.course) : '');
    setSemester(subject?.semester ? String(subject.semester) : '');
    setDescription(subject?.description ?? '');
    setIsActive(subject?.is_active ?? true);
    setTouched(false);
  }, [open, subject, defaultUniversityId]);

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

    const body = {
      university,
      name: name.trim(),
      name_ru: nameRu.trim(),
      // Bo'sh tanlov `null` bo'lib ketadi — backend `direction` ni
      // ixtiyoriy deb belgilagan, bo'sh SATR esa UUID sifatida rad etilardi.
      direction: direction || null,
      course: course ? Number(course) : null,
      semester: semester ? Number(semester) : null,
      description: description.trim(),
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
      title={subject ? 'Fanni tahrirlash' : "Yangi fan qo'shish"}
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
            className="w-full"
            searchable
            searchPlaceholder="Institut nomi..."
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
            className="w-full"
            searchable={directionOptions.length > 8}
            searchPlaceholder="Yo'nalish nomi..."
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
          label="Fan nomi (o'zbekcha)"
          required
          placeholder="Ma'lumotlar bazasi"
          value={name}
          error={nameError}
          onChange={(event) => setName(event.target.value)}
        />

        <TextField
          label="Fan nomi (ruscha)"
          placeholder="Базы данных"
          value={nameRu}
          hint="Ixtiyoriy — bo'sh qoldirilsa faqat o'zbekcha nom saqlanadi."
          onChange={(event) => setNameRu(event.target.value)}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <span className="mb-2 block text-sm font-medium text-fg-soft">
              Kurs (nechinchi kurs)
            </span>
            <Select
              aria-label="Kurs"
              className="w-full"
              options={[{ value: '', label: 'Kursni tanlang' }, ...COURSE_OPTIONS]}
              value={course}
              onChange={(event) => setCourse(event.target.value)}
            />
          </div>

          <div>
            <span className="mb-2 block text-sm font-medium text-fg-soft">Semestr</span>
            <Select
              aria-label="Semestr"
              className="w-full"
              options={[{ value: '', label: 'Semestrni tanlang' }, ...SEMESTER_OPTIONS]}
              value={semester}
              onChange={(event) => setSemester(event.target.value)}
            />
          </div>
        </div>

        {/* Hisoblagichni `TextAreaField` ning o'zi chizadi — `maxLength` yetarli. */}
        <TextAreaField
          label="Qisqacha izoh"
          rows={4}
          maxLength={MAX_DESCRIPTION}
          placeholder="Fan haqida qisqacha ma'lumot kiriting..."
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

        {!subject && (
          <div className="flex gap-2.5 rounded-control border border-primary/25 bg-primary/5 px-3.5 py-3">
            <Info className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={2} />
            <div>
              <p className="text-[13px] font-medium text-fg">Ma&apos;lumot</p>
              <p className="mt-0.5 text-xs leading-relaxed text-fg-muted">
                Fan qo&apos;shilgandan so&apos;ng, unga topshiriqlar va variantlar qo&apos;shish
                imkoniyati yaratiladi.
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
