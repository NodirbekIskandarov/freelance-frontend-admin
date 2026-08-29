import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { RadioGroup, SegmentedControl } from '@/components/ui/Choice';
import { TextAreaField, TextField } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { useGetUniversitiesQuery } from '@/features/catalogue/catalogueApi';
import { getApiErrorMessage } from '@/shared/api';
import {
  ASSIGNMENT_TYPE_LABELS,
  ASSIGNMENT_TYPES,
  MAX_ASSIGNMENT_VARIANTS,
  VARIANT_COUNT_PRESETS,
  type Assignment,
} from '@/shared/types/assignments';

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
  defaultSubjectId = null,
  defaultUniversityId = null,
  onClose,
}: {
  open: boolean;
  /** `null` — yangi topshiriq yaratiladi. */
  assignment: Assignment | null;
  /** Ro'yxatda tanlab turilgan fan — yangi topshiriq uchun oldindan qo'yiladi. */
  defaultSubjectId?: string | null;
  /** Filtrda tanlab turilgan institut — u ham oldindan qo'yiladi. */
  defaultUniversityId?: string | null;
  onClose: () => void;
}) {
  const isEdit = assignment !== null;

  const [createAssignment, createState] = useCreateAssignmentMutation();
  const [updateAssignment, updateState] = useUpdateAssignmentMutation();

  const [university, setUniversity] = useState('');
  const [subject, setSubject] = useState('');

  // Institutlar ro'yxati faqat modal ochilganda kerak.
  const { data: universities } = useGetUniversitiesQuery(
    { page_size: 200, ordering: 'short_name' },
    { skip: !open },
  );

  /*
   * Fanlar tanlangan institutniki. Institut tanlanmagan bo'lsa hammasi —
   * shunda tahrirlashda mavjud fan ro'yxatdan tushib qolmaydi.
   */
  const { data: subjects, isLoading: isLoadingSubjects } = useGetSubjectsQuery(
    { page_size: 200, ordering: 'name', ...(university ? { university } : {}) },
    { skip: !open },
  );
  const [title, setTitle] = useState('');
  const [titleRu, setTitleRu] = useState('');
  const [type, setType] = useState<string>(ASSIGNMENT_TYPES[0]);
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  /*
   * `null` — hali tanlanmagan. Ataylab sukut qiymati yo'q: variantli va
   * variantsiz topshiriq katalogda butunlay boshqacha ko'rinadi, birini
   * o'zicha tanlab qo'yish esa admin ko'rmagan qarorni qabul qilish edi.
   */
  const [hasVariants, setHasVariants] = useState<boolean | null>(null);
  const [variantCount, setVariantCount] = useState('');
  const [touched, setTouched] = useState(false);

  // Modal ochilganda forma tanlangan topshiriqdan to'ldiriladi. Bu
  // `useEffect` siz bo'lmaydi: bir xil modal turli qatorlar uchun
  // qayta ishlatiladi va `useState` boshlang'ich qiymati faqat birinchi
  // renderda o'qiladi.
  useEffect(() => {
    if (!open) return;

    setUniversity(assignment?.university ?? defaultUniversityId ?? '');
    setSubject(assignment?.subject ?? defaultSubjectId ?? '');
    /*
     * `title` joriy tilga qarab yechilgan qiymat, `title_uz` esa ustunning
     * o'zi — ruscha interfeysda o'zbekcha maydonga ruscha nom tushib
     * qolmasligi uchun ustun o'qiladi.
     */
    setTitle(assignment?.title_uz ?? assignment?.title ?? '');
    setTitleRu(assignment?.title_ru ?? '');
    setType(assignment?.type ?? ASSIGNMENT_TYPES[0]);
    setDescription(assignment?.description ?? '');
    setIsActive(assignment?.is_active ?? true);
    setHasVariants(null);
    setVariantCount('');
    setTouched(false);
  }, [open, assignment, defaultSubjectId, defaultUniversityId]);

  const universityOptions = [
    { value: '', label: 'Institutni tanlang' },
    ...(universities?.results ?? []).map((item) => ({
      value: item.id,
      label: item.short_name ? `${item.short_name} — ${item.name}` : item.name,
    })),
  ];

  /*
   * Institut tanlangan bo'lsa fan nomi yolg'iz yetarli. Aks holda
   * ro'yxatda «Falsafa» bir necha institutdan chiqib, qaysi biri
   * ekanini ajratib bo'lmasdi.
   */
  const subjectOptions = [
    { value: '', label: 'Fanni tanlang' },
    ...(subjects?.results ?? []).map((item) => ({
      value: item.id,
      label: university ? item.name : `${item.name} — ${item.university_name}`,
    })),
  ];

  const subjectError = touched && !subject ? 'Fanni tanlang' : undefined;
  const titleError = touched && !title.trim() ? 'Sarlavhani kiriting' : undefined;

  /*
   * Variantlar FAQAT yaratishda so'raladi. Mavjud topshiriqda ular allaqachon
   * bor va o'z ekranida boshqariladi — bu yerdagi son ularni qayta yaratishga
   * urinardi.
   */
  const parsedCount = Number(variantCount);
  const isCountValid =
    Number.isInteger(parsedCount) && parsedCount >= 1 && parsedCount <= MAX_ASSIGNMENT_VARIANTS;
  const variantsError =
    touched && !isEdit && hasVariants === null
      ? "Variantli yoki variantsiz ekanini tanlang"
      : undefined;
  const countError =
    touched && !isEdit && hasVariants === true && !isCountValid
      ? `1 dan ${MAX_ASSIGNMENT_VARIANTS} gacha son kiriting`
      : undefined;

  const isSaving = createState.isLoading || updateState.isLoading;
  const error = createState.error ?? updateState.error;

  async function handleSubmit() {
    setTouched(true);
    if (!subject || !title.trim()) return;
    if (!isEdit && hasVariants === null) return;
    if (!isEdit && hasVariants && !isCountValid) return;

    const body = {
      subject,
      title: title.trim(),
      title_ru: titleRu.trim(),
      type,
      description: description.trim(),
      is_active: isActive,
    };

    try {
      if (assignment) await updateAssignment({ id: assignment.id, ...body }).unwrap();
      else
        await createAssignment({
          ...body,
          // Variantsizida umuman yuborilmaydi: server uchun «maydon yo'q»
          // degani aynan variantsiz topshiriq.
          ...(hasVariants ? { variant_count: parsedCount } : {}),
        }).unwrap();
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
      title={isEdit ? 'Topshiriqni tahrirlash' : "Yangi topshiriq qo'shish"}
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
          <span className="mb-2 block text-sm font-medium text-fg-soft">Institut</span>
          <Select
            aria-label="Institut"
            className="w-full"
            searchable
            searchPlaceholder="Institut nomi..."
            options={universityOptions}
            value={university}
            onChange={(event) => {
              setUniversity(event.target.value);
              // Institut o'zgarsa eski fan endi unga tegishli emas.
              setSubject('');
            }}
          />
          <p className="mt-1.5 text-xs text-fg-muted">
            Fanlar ro&apos;yxatini toraytiradi. Bo&apos;sh qoldirsangiz barcha fanlar
            ko&apos;rinadi.
          </p>
        </div>

        <div>
          <span className="mb-2 block text-sm font-medium text-fg-soft">
            Fan
            <span aria-hidden className="ml-0.5 text-danger">
              *
            </span>
          </span>
          <Select
            aria-label="Fan"
            className="w-full"
            searchable={subjectOptions.length > 8}
            searchPlaceholder="Fan nomi..."
            options={subjectOptions}
            value={subject}
            disabled={isLoadingSubjects}
            onChange={(event) => setSubject(event.target.value)}
          />
          {subjectError && <p className="mt-1.5 text-xs text-danger">{subjectError}</p>}
        </div>

        <div>
          <span className="mb-2 block text-sm font-medium text-fg-soft">
            Ish turi
            <span aria-hidden className="ml-0.5 text-danger">
              *
            </span>
          </span>
          <Select
            aria-label="Ish turi"
            className="w-full"
            options={ASSIGNMENT_TYPES.map((item) => ({
              value: item,
              label: ASSIGNMENT_TYPE_LABELS[item],
            }))}
            value={type}
            onChange={(event) => setType(event.target.value)}
          />
        </div>

        {/* Variantlar faqat yaratishda: mavjud topshiriqda ular «Variantlar»
            ekranida qo'shiladi va o'chiriladi. */}
        {!isEdit && (
          <div className="rounded-control border border-line p-3.5">
            <RadioGroup
              label="Variantlar"
              description="Har bir talabaga alohida raqamli variant beriladimi?"
              required
              options={[
                { value: 'with', label: 'Variantli' },
                { value: 'without', label: 'Variantsiz' },
              ]}
              value={hasVariants === null ? '' : hasVariants ? 'with' : 'without'}
              onChange={(value) => {
                const next = value === 'with';
                setHasVariants(next);
                if (!next) setVariantCount('');
              }}
            />

            {variantsError && <p className="mt-2 text-xs text-danger">{variantsError}</p>}

            {/* Son FAQAT variantlida so'raladi — variantsizida u ma'nosiz va
                serverga ham yuborilmaydi. */}
            {hasVariants === true && (
              <div className="mt-4 flex flex-col gap-3">
                <SegmentedControl
                  label="Ko'p uchraydiganlari"
                  options={[...VARIANT_COUNT_PRESETS]}
                  value={variantCount}
                  onChange={setVariantCount}
                />

                <TextField
                  label="Nechta variant?"
                  required
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={MAX_ASSIGNMENT_VARIANTS}
                  placeholder="Masalan: 25"
                  value={variantCount}
                  error={countError}
                  hint={`1 dan ${MAX_ASSIGNMENT_VARIANTS} gacha. 1..N qilib raqamlanadi.`}
                  onChange={(event) => setVariantCount(event.target.value)}
                />
              </div>
            )}

            {hasVariants === false && (
              <p className="mt-3 text-xs text-fg-muted">
                Topshiriq bitta — katalogda variantlar to&apos;ri ko&apos;rsatilmaydi.
              </p>
            )}
          </div>
        )}

        <TextField
          label="Topshiriq nomi (o'zbekcha)"
          required
          maxLength={255}
          placeholder="Masalan: Mustaqil ish 12-variant"
          value={title}
          error={titleError}
          onChange={(event) => setTitle(event.target.value)}
        />

        <TextField
          label="Topshiriq nomi (ruscha)"
          maxLength={255}
          placeholder="Например: Самостоятельная работа 12"
          value={titleRu}
          hint="Ixtiyoriy — bo'sh qoldirilsa faqat o'zbekcha nom saqlanadi."
          onChange={(event) => setTitleRu(event.target.value)}
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
