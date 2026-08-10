import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { RadioGroup, SegmentedControl } from '@/components/ui/Choice';
import { TextField } from '@/components/ui/Field';
import { FileDropzone } from '@/components/ui/FileDropzone';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';

const VARIANT_PRESETS = ['10', '15', '20', '25', '30'];

/** 15-rasmdagi modal. */
export function CreateTaskModal({
  open,
  onClose,
  subjectName,
  instituteName,
}: {
  open: boolean;
  onClose: () => void;
  subjectName: string;
  instituteName: string;
}) {
  const [kind, setKind] = useState('variantli');
  const [variantCount, setVariantCount] = useState('20');
  const [name, setName] = useState('');
  const [note, setNote] = useState('');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Yangi topshiriq qo‘shish"
      description="Ariza admin tasdiqlagach ro‘yxatga qo‘shiladi. Bonus olish imkoniyati ham bor."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button onClick={onClose}>Yuborish</Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div>
          <p className="mb-2 text-sm font-medium text-fg-soft">
            Institut
            <span aria-hidden className="ml-0.5 text-danger">
              *
            </span>
          </p>
          <Select
            aria-label="Institut"
            options={[{ value: 'tatu', label: instituteName }]}
            className="w-full"
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-fg-soft">
            Fan
            <span aria-hidden className="ml-0.5 text-danger">
              *
            </span>
          </p>
          <Select
            aria-label="Fan"
            options={[{ value: 'subject', label: subjectName }]}
            className="w-full"
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-fg-soft">
            Ish turi
            <span aria-hidden className="ml-0.5 text-danger">
              *
            </span>
          </p>
          <Select
            aria-label="Ish turi"
            options={[
              { value: 'independent', label: 'Mustaqil ish' },
              { value: 'practical', label: 'Amaliy ish' },
              { value: 'laboratory', label: 'Laboratoriya ishi' },
            ]}
            className="w-full"
          />
        </div>

        <RadioGroup
          label="Variantlik"
          required
          description="Mustaqil, amaliy va laboratoriya ishlarida ham tanlanadi."
          options={[
            { value: 'variantli', label: 'Variantli' },
            { value: 'variantsiz', label: 'Variantsiz' },
          ]}
          value={kind}
          onChange={setKind}
        />

        {/* Variantsiz topshiriqda variantlar soni so'ralmaydi. */}
        {kind === 'variantli' && (
          <div>
            <SegmentedControl
              label="Nechta variant?"
              options={VARIANT_PRESETS}
              value={variantCount}
              onChange={setVariantCount}
            />
            <input
              type="number"
              min={1}
              aria-label="Variantlar soni"
              value={variantCount}
              onChange={(event) => setVariantCount(event.target.value)}
              className="mt-3 h-11 w-full rounded-control border border-line bg-input px-3.5 text-sm text-fg"
            />
          </div>
        )}

        <TextField
          label="Topshiriq nomi"
          required
          placeholder="Masalan: Mustaqil ish 12-variant"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        <TextField
          label="Izoh (ixtiyoriy)"
          placeholder="Qo‘shimcha ma’lumot"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />

        <FileDropzone
          label="Topshiriq fayli"
          multiple
          accept=".pdf,.docx,.doc,.txt,.zip,.rar"
          actionLabel="Fayl tanlash"
          hint="PDF, DOCX, DOC, TXT, ZIP, RAR (Maks. 50MB)"
        >
          <>
            Fayl(lar)ni shu yerga sudrab olib keling
            <br />
            yoki
          </>
        </FileDropzone>
      </div>
    </Modal>
  );
}
