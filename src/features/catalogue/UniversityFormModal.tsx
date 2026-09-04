import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { TextField } from '@/components/ui/Field';
import { FileDropzone } from '@/components/ui/FileDropzone';
import { FormFull, FormSection } from '@/components/ui/FormSection';
import { Modal } from '@/components/ui/Modal';
import { showToast } from '@/lib/toast';
import { getApiErrorMessage } from '@/shared/api';
import type { University } from '@/shared/types/catalogue';

import { useCreateUniversityMutation, useUpdateUniversityMutation } from './catalogueApi';

/**
 * Yaratish va tahrirlash uchun BITTA modal — ikkita alohida komponent
 * maydonlar va validatsiyani ikki nusxada saqlashni anglatardi.
 */
export function UniversityFormModal({
  open,
  university,
  onClose,
}: {
  open: boolean;
  /** `null` — yangi institut yaratiladi. */
  university: University | null;
  onClose: () => void;
}) {
  const [createUniversity, createState] = useCreateUniversityMutation();
  const [updateUniversity, updateState] = useUpdateUniversityMutation();

  const [name, setName] = useState('');
  const [nameRu, setNameRu] = useState('');
  const [shortName, setShortName] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [city, setCity] = useState('');
  const [code, setCode] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [touched, setTouched] = useState(false);

  // Modal ochilganda forma tanlangan yozuvdan to'ldiriladi: bir xil modal
  // turli qatorlar uchun qayta ishlatiladi va `useState` boshlang'ich
  // qiymati faqat birinchi renderda o'qiladi.
  useEffect(() => {
    if (!open) return;

    /*
     * `name` joriy tilga qarab yechilgan qiymat, `name_uz` esa ustunning
     * o'zi — ruscha interfeysda o'zbekcha maydonga ruscha nom tushib
     * qolmasligi uchun ustun o'qiladi.
     */
    setName(university?.name_uz ?? university?.name ?? '');
    setNameRu(university?.name_ru ?? '');
    setShortName(university?.short_name ?? '');
    setLogo(null);
    setCity(university?.city ?? '');
    setCode(university?.code ?? '');
    setIsActive(university?.is_active ?? true);
    setTouched(false);
  }, [open, university]);

  const nameError = touched && !name.trim() ? 'Nomni kiriting' : undefined;

  const isSaving = createState.isLoading || updateState.isLoading;
  const error = createState.error ?? updateState.error;

  async function handleSubmit() {
    setTouched(true);
    if (!name.trim()) return;

    const body = {
      name: name.trim(),
      name_ru: nameRu.trim(),
      short_name: shortName.trim(),
      // Fayl tanlanmagan bo'lsa maydon umuman yuborilmaydi — aks holda
      // tahrirlashda mavjud logotip o'chib ketardi.
      ...(logo ? { logo } : {}),
      city: city.trim(),
      is_active: isActive,
      // Bo'sh qoldirilsa backend `short_name` dan o'zi yasaydi —
      // bo'sh satr yuborish uni majburan bo'sh qilib qo'yardi.
      ...(code.trim() ? { code: code.trim() } : {}),
    };

    try {
      if (university) await updateUniversity({ id: university.id, ...body }).unwrap();
      else await createUniversity(body).unwrap();
    } catch {
      // Xato quyida ko'rsatiladi.
      return;
    }

    /* Saqlangani AYTILADI. Ilgari yagona belgi modalning yopilishi edi —
       lekin u bekor qilishda ham yopiladi, ya'ni ikkalasi bir xil
       ko'rinardi. */
    showToast(university ? 'Institut yangilandi' : "Institut qo'shildi");
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={university ? 'Institutni tahrirlash' : "Yangi institut qo'shish"}
      footer={
        <>
          <Button variant="secondary" size="lg" onClick={onClose}>
            Bekor qilish
          </Button>
          {/* Asosiy tugma OXIRIDA — o'qish yo'nalishi bo'yicha oxirgi
              qadam. Aylanma tugmaning ichida: yonida chizilsa qator
              kengligi sakrardi. */}
          <Button size="lg" loading={isSaving} onClick={() => void handleSubmit()}>
            Saqlash
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <FormSection title="Asosiy ma'lumot" columns>
          <FormFull>
            <TextField
              label="To'liq nomi (o'zbekcha)"
              required
              placeholder="Institutning to'liq nomini kiriting"
              value={name}
              error={nameError}
              onChange={(event) => setName(event.target.value)}
            />
          </FormFull>

          <FormFull>
            <TextField
              label="To'liq nomi (ruscha)"
              placeholder="Ташкентский университет информационных технологий"
              value={nameRu}
              hint="Ixtiyoriy — bo'sh qoldirilsa faqat o'zbekcha nom saqlanadi."
              onChange={(event) => setNameRu(event.target.value)}
            />
          </FormFull>

          <TextField
            label="Qisqartma nomi"
            required
            placeholder="Masalan: TATU, TDYU, ADU"
            value={shortName}
            onChange={(event) => setShortName(event.target.value)}
          />

          <TextField
            label="Shahar"
            placeholder="Toshkent"
            value={city}
            onChange={(event) => setCity(event.target.value)}
          />

          <TextField
            label="Kod"
            placeholder="Bo'sh qoldirsangiz qisqa nomdan yasaladi"
            value={code}
            hint="Faqat harf, raqam, defis va pastki chiziq."
            onChange={(event) => setCode(event.target.value)}
          />
        </FormSection>

        <FormSection title="Ko'rinish">
          <FileDropzone
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            actionLabel="tanlang"
            hint="PNG, JPG yoki SVG. Maksimal hajm: 2MB"
            onFiles={(files) => setLogo(files[0] ?? null)}
          />

          {/*
            Tanlangan fayl nomi — yuklandi degan yagona belgi. Usiz
            foydalanuvchi bosgan-bosmagani bilinmasdi.
          */}
          {logo ? (
            <p className="flex items-center gap-2 text-xs text-fg-muted">
              <span className="truncate text-fg-soft">{logo.name}</span>
              <button
                type="button"
                onClick={() => setLogo(null)}
                className="shrink-0 text-danger hover:underline"
              >
                olib tashlash
              </button>
            </p>
          ) : university?.logo ? (
            <p className="text-xs text-fg-muted">
              Hozirgi logotip saqlanadi — almashtirish uchun yangi fayl tanlang.
            </p>
          ) : null}
        </FormSection>

        <FormSection title="Holat">
          <Checkbox
            checked={isActive}
            onChange={setIsActive}
            label="Faol"
            hint="Nofaol institut katalogda ko'rinmaydi, lekin fanlari saqlanib qoladi."
          />
        </FormSection>

        {error && (
          <p
            role="alert"
            className="rounded-control border border-danger-line bg-danger-quiet px-3.5 py-2.5 text-[13px] text-danger"
          >
            {getApiErrorMessage(error)}
          </p>
        )}
      </div>
    </Modal>
  );
}
