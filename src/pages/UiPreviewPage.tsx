import { Download, Inbox, Pencil, Plus, SearchX, Trash2, TriangleAlert } from 'lucide-react';
import { useState, useSyncExternalStore, type ReactNode } from 'react';

import { Badge, StatusBadge, type BadgeTone } from '@/components/ui/Badge';
import { Button, IconButton } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { TextAreaField, TextField } from '@/components/ui/Field';
import { RowActions } from '@/components/ui/RowActions';
import { SearchInput } from '@/components/ui/SearchInput';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Select } from '@/components/ui/Select';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';
import { Tabs } from '@/components/ui/Tabs';
import { Tooltip } from '@/components/ui/Tooltip';
import { getThemeMode, resolveTheme, setThemeMode, subscribeToTheme } from '@/lib/theme';

/**
 * Primitivlar ko'rgazmasi — FAQAT ishlab chiqish rejimida (`/uz/_ui`).
 *
 * Nega kerak: ular o'nlab sahifada ishlatiladi va bitta variantning
 * buzilgani faqat o'sha sahifaga kirganda ko'rinadi. Bu yerda hammasi
 * bir ekranda va ikkala mavzuda ham darrov tekshiriladi.
 *
 * Productionga chiqmaydi — `router.tsx` uni `import.meta.env.DEV` bilan
 * qo'shadi.
 */

function Row({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-b border-line-subtle px-5 py-4 last:border-b-0">
      <p className="mb-3 text-[11px] font-medium tracking-[0.08em] text-fg-dim uppercase">
        {title}
      </p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

const TONES: BadgeTone[] = ['primary', 'success', 'warning', 'danger', 'info', 'neutral'];

export function UiPreviewPage() {
  const theme = useSyncExternalStore(subscribeToTheme, () => resolveTheme(getThemeMode()));
  const [tab, setTab] = useState('bir');
  const [segment, setSegment] = useState('7d');
  const [selectValue, setSelectValue] = useState('a');
  const [errorDemo, setErrorDemo] = useState(false);

  return (
    <div className="space-y-4 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-fg">Primitivlar</h1>
          <p className="mt-1 text-[13px] text-fg-muted">
            Faqat ishlab chiqish rejimida ochiladi. Har komponent barcha holatlari bilan.
          </p>
        </div>
        <SegmentedControl
          aria-label="Mavzu"
          options={[
            { value: 'dark', label: 'Qorong‘i' },
            { value: 'light', label: 'Yorug‘' },
          ]}
          value={theme}
          onChange={(next) => setThemeMode(next as 'dark' | 'light')}
        />
      </div>

      <Card>
        <CardHeader title="Button" divided />
        <Row title="variantlar">
          <Button variant="primary">Asosiy</Button>
          <Button variant="secondary">Ikkilamchi</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger-quiet">O‘chirish</Button>
          <Button variant="danger">Tasdiqlash (halokatli)</Button>
          <Button variant="success">Tasdiqlash</Button>
        </Row>
        <Row title="o‘lchamlar — 28 / 34 / 40">
          <Button size="sm">sm</Button>
          <Button size="md">md</Button>
          <Button size="lg">lg</Button>
        </Row>
        <Row title="holatlar">
          <Button icon={<Plus className="size-4" />}>Ikonka bilan</Button>
          <Button loading>Saqlanmoqda</Button>
          <Button disabled>O‘chirilgan</Button>
          <Button variant="secondary" loading>
            Yuklanmoqda
          </Button>
        </Row>
        <Row title="ikonka tugmasi — har birida tooltip">
          <IconButton label="Tahrirlash" size="sm">
            <Pencil className="size-4" strokeWidth={1.75} />
          </IconButton>
          <IconButton label="O‘chirish" tone="danger" size="sm">
            <Trash2 className="size-4" strokeWidth={1.75} />
          </IconButton>
          <IconButton label="Yuklab olish" tone="info" bordered>
            <Download className="size-4" strokeWidth={1.75} />
          </IconButton>
          <RowActions
            actions={[
              { label: 'Tahrirlash', icon: <Pencil className="size-4" />, onSelect: () => {} },
              { label: 'Yuklab olish', icon: <Download className="size-4" />, onSelect: () => {} },
              {
                label: 'O‘chirish',
                icon: <Trash2 className="size-4" />,
                onSelect: () => {},
                destructive: true,
              },
            ]}
          />
        </Row>
      </Card>

      <Card>
        <CardHeader title="Badge" divided />
        <Row title="ohanglar">
          {TONES.map((tone) => (
            <Badge key={tone} tone={tone}>
              {tone}
            </Badge>
          ))}
        </Row>
        <Row title="holat badge’i — ikonka bilan">
          {['Faol', 'Kutilmoqda', 'Rad etilgan', 'Bloklangan', 'Arxivlangan'].map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
        </Row>
      </Card>

      <Card>
        <CardHeader title="Maydonlar" divided />
        <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
          <TextField label="Nomi" required placeholder="Masalan: Aniq fanlar" />
          <TextField label="Izohli" hint="Bo‘sh qolsa avtomatik yasaladi." placeholder="Slug" />
          <TextField
            label="Xatoli"
            error={errorDemo ? 'Bu maydon to‘ldirilishi shart' : undefined}
            placeholder="Xatoni yoqib ko‘ring"
          />
          <div className="flex items-end pb-[26px]">
            <Button variant="secondary" size="sm" onClick={() => setErrorDemo((v) => !v)}>
              Xatoni almashtirish — qator sakramasligi kerak
            </Button>
          </div>
          <TextAreaField
            label="Tavsif"
            maxLength={300}
            value=""
            onChange={() => {}}
            className="sm:col-span-2"
          />
        </div>
        <Row title="qidiruv va tanlagich">
          <SearchInput className="w-64" />
          <Select
            aria-label="Namuna"
            value={selectValue}
            onChange={(event) => setSelectValue(event.target.value)}
            options={[
              { value: 'a', label: 'Birinchi variant' },
              { value: 'b', label: 'Ikkinchi variant' },
              { value: 'c', label: 'Uchinchi variant' },
            ]}
          />
          <Select aria-label="Kichik" size="sm" options={[{ value: 'x', label: 'Kichik' }]} />
          <Select aria-label="O‘chirilgan" disabled options={[{ value: 'x', label: 'O‘chirilgan' }]} />
        </Row>
      </Card>

      <Card>
        <CardHeader title="Tanlash" divided />
        <Row title="segmented">
          <SegmentedControl
            aria-label="Davr"
            options={[
              { value: 'today', label: 'Bugun' },
              { value: '7d', label: '7 kun' },
              { value: '30d', label: '30 kun' },
            ]}
            value={segment}
            onChange={setSegment}
          />
        </Row>
        <div className="px-5 pb-4">
          <Tabs
            items={[
              { id: 'bir', label: 'Birinchi', count: 12 },
              { id: 'ikki', label: 'Ikkinchi', count: 0 },
              { id: 'uch', label: 'Uchinchi' },
            ]}
            active={tab}
            onChange={setTab}
          />
        </div>
      </Card>

      <Card>
        <CardHeader title="Tooltip va menyu" divided />
        <Row title="joylashuv">
          <Tooltip label="Tepada">
            <Button variant="secondary">Tepada</Button>
          </Tooltip>
          <Tooltip label="Pastda" placement="bottom">
            <Button variant="secondary">Pastda</Button>
          </Tooltip>
          <Tooltip label="Chapda" placement="left">
            <Button variant="secondary">Chapda</Button>
          </Tooltip>
        </Row>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Skeleton" divided />
          <div className="space-y-3 px-5 py-4">
            <SkeletonText className="w-1/3" />
            <SkeletonText className="w-2/3" />
            <Skeleton className="h-24" />
          </div>
        </Card>

        <Card>
          <CardHeader title="Bo‘sh holat" divided />
          <EmptyState
            icon={Inbox}
            title="Hozircha hech nima yo‘q"
            description="Birinchi yozuvni qo‘shsangiz u shu yerda ko‘rinadi."
            action={
              <Button size="sm" icon={<Plus className="size-4" />}>
                Qo‘shish
              </Button>
            }
          />
        </Card>

        <Card>
          <CardHeader title="Topilmadi" divided />
          <EmptyState
            icon={SearchX}
            title="Qidiruv natija bermadi"
            description="Boshqa so‘z bilan urinib ko‘ring yoki filtrlarni tozalang."
          />
        </Card>

        <Card>
          <CardHeader title="Xato" divided />
          <EmptyState
            icon={TriangleAlert}
            tone="danger"
            title="Ma’lumot yuklanmadi"
            description="Server javob bermadi."
            action={
              <Button size="sm" variant="secondary">
                Qayta urinish
              </Button>
            }
          />
        </Card>
      </div>
    </div>
  );
}
