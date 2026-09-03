import { ClipboardList, FileText, Library, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Link, useLocaleNavigate } from '@/i18n/navigation';

import { Badge } from '@/components/ui/Badge';
import { Button, IconButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Table, type Column } from '@/components/ui/Table';
import { formatDateTime, formatSom } from '@/lib/format';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { useGetSubjectRequestsListQuery } from '@/features/adminRequests/adminRequestsApi';
import { getApiErrorMessage } from '@/shared/api';
import {
  COURSE_OPTIONS,
  SEMESTER_OPTIONS,
  SUBJECT_SOURCE_LABELS,
  type Subject,
  type University,
} from '@/shared/types/catalogue';

import {
  useDeleteSubjectMutation,
  useGetSubjectCategoriesQuery,
  useGetSubjectsQuery,
  useGetUniversityQuery,
} from './catalogueApi';
import { DeleteCatalogueModal } from './DeleteCatalogueModal';
import { SubjectFormModal } from './SubjectFormModal';
import { UniversityBadge, UniversityPanel, universitySummary } from './UniversityPanel';

const SOURCE_TONES = {
  admin: 'success',
  user: 'info',
  freelancer: 'warning',
} as const;

export function SubjectsPage() {
  const navigate = useLocaleNavigate();

  /*
   * Tanlangan institut MANZILDA saqlanadi.
   *
   * Ilgari u faqat komponent holatida edi: sahifani yangilagan yoki
   * havolani ulashgan odam boshidan, «barcha institutlar» dan boshlardi.
   * `replace` — har tanlov brauzer tarixiga yozilmasin, aks holda
   * «orqaga» tugmasi sahifadan chiqish o'rniga oldingi institutga
   * qaytarardi.
   */
  const [searchParams, setSearchParams] = useSearchParams();
  const universityParam = searchParams.get('university');

  const [university, setUniversity] = useState<University | null>(null);

  /*
   * Manzilda faqat identifikator bor, panel esa butun obyektni kutadi —
   * shuning uchun u alohida so'raladi. Panelning o'z ro'yxatidan
   * kutilmaydi: kerakli institut o'sha ro'yxatning boshqa sahifasida
   * bo'lishi mumkin va u holda tanlov tiklanmasdan qolardi.
   */
  const { data: universityFromUrl } = useGetUniversityQuery(universityParam ?? '', {
    skip: !universityParam || university?.id === universityParam,
  });

  useEffect(() => {
    if (universityFromUrl) setUniversity(universityFromUrl);
  }, [universityFromUrl]);

  function selectUniversity(next: University | null) {
    setUniversity(next);

    const params = new URLSearchParams(searchParams);
    if (next) {
      params.set('university', next.id);
    } else {
      params.delete('university');
    }
    setSearchParams(params, { replace: true });
  }

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [course, setCourse] = useState('all');
  const [semester, setSemester] = useState('all');
  const [category, setCategory] = useState('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Subject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);

  const debouncedSearch = useDebouncedValue(search, 350);

  /*
   * Tugmadagi kichik son — nechta ariza javob kutayotgani.
   *
   * Faqat SON kerak, shuning uchun `page_size: 1`: ro'yxatning o'zi
   * arizalar sahifasida yuklanadi va uni bu yerda ikkinchi marta
   * tortib olishning ma'nosi yo'q.
   */
  const { data: pendingRequests } = useGetSubjectRequestsListQuery({
    status: 'pending',
    page: 1,
    page_size: 1,
  });

  const pendingCount = pendingRequests?.count ?? 0;

  /*
   * Institut almashganda filtrlar tozalanadi: oldingi institutda tanlangan
   * yo'nalish yangisida umuman yo'q bo'lishi mumkin va jadval sababsiz
   * bo'sh chiqardi.
   */
  useEffect(() => {
    setPage(1);
    setCourse('all');
    setSemester('all');
    setCategory('all');
    setSearch('');
  }, [university?.id]);

  /*
   * Toifalar universitetdan MUSTAQIL so'raladi.
   *
   * Ilgari bu yerda tanlangan institutning yo'nalishlari turardi va filtr
   * institut tanlanmaguncha umuman ko'rinmasdi. Toifa esa global: «Aniq
   * fanlar» bo'yicha filtrlash butun katalog bo'ylab ma'noli.
   */
  const { data: categoryPage } = useGetSubjectCategoriesQuery({
    page_size: 200,
    is_active: true,
  });

  /*
   * Institut tanlanmagan bo'lsa ham so'raladi — u shu yerda FILTR, majburiy
   * qadam emas. Tanlanmaganda barcha institutlarning fanlari ko'rinadi.
   */
  const { data, isLoading, isFetching, error } = useGetSubjectsQuery({
    page,
    page_size: perPage,
    ordering: 'name',
    ...(university ? { university: university.id } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(course !== 'all' ? { course: Number(course) } : {}),
    ...(semester !== 'all' ? { semester: Number(semester) } : {}),
    ...(category !== 'all' ? { category } : {}),
  });

  const [deleteSubject, deleteState] = useDeleteSubjectMutation();

  async function confirmDelete() {
    if (!deleteTarget) return;

    try {
      await deleteSubject(deleteTarget.id).unwrap();
    } catch {
      return;
    }

    setDeleteTarget(null);
  }

  const categoryOptions = [
    { value: 'all', label: 'Barcha toifalar' },
    ...(categoryPage?.results ?? []).map((item) => ({ value: item.id, label: item.name })),
  ];

  const columns: Column<Subject>[] = [
    {
      key: 'index',
      header: '#',
      className: 'w-12 text-fg-dim tabular-nums',
      cell: (_row, index) => (page - 1) * perPage + index + 1,
    },
    {
      key: 'name',
      header: 'Fan nomi',
      className: 'max-w-[260px]',
      cell: (row) => (
        <span className="block truncate font-medium text-fg" title={row.name}>
          {row.name}
        </span>
      ),
    },
    /*
     * Institut ustuni faqat filtr qo'yilmaganda: tanlangan institut
     * ichida har qatorda o'sha nomni takrorlash bo'sh joy sarfi.
     */
    ...(university
      ? []
      : [
          {
            key: 'university',
            header: 'Institut',
            className: 'max-w-[200px]',
            cell: (row: Subject) => (
              <span className="block truncate text-fg-soft" title={row.university_name}>
                {row.university_name}
              </span>
            ),
          },
        ]),
    {
      key: 'course',
      header: 'Kurs',
      cell: (row) => (
        <span className="whitespace-nowrap text-fg-soft">
          {row.course === null ? '—' : `${row.course}-kurs`}
        </span>
      ),
    },
    {
      key: 'semester',
      header: 'Semestr',
      cell: (row) => (
        <span className="whitespace-nowrap text-fg-soft">
          {row.semester === null ? '—' : `${row.semester}-semestr`}
        </span>
      ),
    },
    {
      key: 'assignment_count',
      header: 'Topshiriqlar soni',
      align: 'center',
      cell: (row) => <span className="tabular-nums">{formatSom(row.assignment_count)}</span>,
    },
    {
      key: 'variant_count',
      header: 'Variantlar soni',
      align: 'center',
      cell: (row) => <span className="tabular-nums">{formatSom(row.variant_count)}</span>,
    },
    {
      key: 'created_at',
      header: "Qo'shilgan sana",
      cell: (row) => (
        <span className="whitespace-nowrap text-fg-muted">{formatDateTime(row.created_at)}</span>
      ),
    },
    {
      key: 'source',
      header: 'Manba',
      cell: (row) => (
        <Badge tone={SOURCE_TONES[row.source] ?? 'neutral'}>
          {SUBJECT_SOURCE_LABELS[row.source] ?? row.source}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Amallar',
      align: 'right',
      // O'ng chetga yopishadi — jadval siljiganda ham ko'rinadi.
      sticky: true,
      cell: (row) => (
        <span className="flex items-center justify-end gap-2">
          {/*
            Topshiriqlar ro'yxatiga o'tadi va shu fan bo'yicha filtrlaydi.
            Filtr manzilda uzatiladi, shunda havola ulashilsa ham o'sha
            ko'rinish ochiladi.
          */}
          <IconButton
            label={`${row.name} — topshiriqlari`}
            tone="success"
            size="sm"
            onClick={() =>
              void navigate(`/topshiriqlar?university=${row.university}&subject=${row.id}`)
            }
          >
            <ClipboardList className="size-4" strokeWidth={1.75} />
          </IconButton>
          <IconButton
            label={`${row.name} — tahrirlash`}
            tone="warning"
            size="sm"
            onClick={() => {
              setEditTarget(row);
              setFormOpen(true);
            }}
          >
            <Pencil className="size-4" strokeWidth={1.75} />
          </IconButton>
          <IconButton
            label={`${row.name} — o'chirish`}
            tone="danger"
            size="sm"
            onClick={() => setDeleteTarget(row)}
          >
            <Trash2 className="size-4" strokeWidth={1.75} />
          </IconButton>
        </span>
      ),
    },
  ];

  return (
    <>
      {/*
        Tugmalar sarlavhada, institut kartasi ichida emas: ikkalasi ham
        BUTUN fanlar bo'limiga tegishli. Kartaning ichida turganda ular
        tanlangan institutga tegishlidek ko'rinardi — arizalar esa
        hammasiga umumiy, fan qo'shishda ham institutni tanlash mumkin.
      */}
      <PageHeader
        title="Fanlar"
        breadcrumbs={[{ label: 'Bosh sahifa', to: '/' }, { label: 'Fanlar' }]}
        actions={
          <>
            <Link to="/fanlar/arizalar">
              <Button variant="secondary" icon={<FileText className="size-4" />}>
                Fan qo&apos;shish arizalari
                {pendingCount > 0 && (
                  <span
                    aria-label={`${pendingCount} ta ariza javob kutmoqda`}
                    className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-warning/20 px-1.5 py-0.5 text-[11px] font-semibold text-warning tabular-nums"
                  >
                    {pendingCount}
                  </span>
                )}
              </Button>
            </Link>

            <Button
              icon={<Plus className="size-4" strokeWidth={2} />}
              onClick={() => {
                setEditTarget(null);
                setFormOpen(true);
              }}
            >
              Yangi fan qo&apos;shish
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <UniversityPanel selectedId={university?.id ?? null} onSelect={selectUniversity} />

        <div className="min-w-0 flex-1">
          {/*
                Institut TANLANISHI SHART EMAS — u shu yerda filtr. Tanlanmagan
                holatda barcha institutlarning fanlari ko'rinadi, sarlavha esa
                shuni aytib turadi.
              */}
          <Card className="flex flex-wrap items-center gap-4 p-5">
            {university ? (
              <>
                <UniversityBadge university={university} size="lg" />

                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-[15px] font-semibold text-fg">
                    <span className="truncate">{university.name}</span>
                    {university.short_name && <Badge tone="neutral">{university.short_name}</Badge>}
                  </p>
                  <p className="mt-0.5 text-[13px] text-fg-muted">
                    {universitySummary(university)}
                  </p>
                </div>

                <Button variant="secondary" size="sm" onClick={() => setUniversity(null)}>
                  Filtrni olib tashlash
                </Button>
              </>
            ) : (
              <>
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                  <Library className="size-5" strokeWidth={1.75} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold text-fg">Barcha institutlar</p>
                  <p className="mt-0.5 text-[13px] text-fg-muted">
                    {data ? `${formatSom(data.count)} ta fan` : 'Fanlar yuklanmoqda…'} · chapdan
                    institutni tanlab toraytiring
                  </p>
                </div>
              </>
            )}
          </Card>

          {error ? (
            <div className="mt-4 rounded-card border border-danger/25 bg-danger/10 p-5 text-sm text-danger">
              {getApiErrorMessage(error)}
            </div>
          ) : (
            <>
              <section className="mt-4 flex flex-wrap items-center gap-3">
                <SearchInput
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Fan nomini qidirish..."
                  className="w-full sm:w-64"
                />

                <Select
                  aria-label="Kurs bo'yicha filtr"
                  options={[{ value: 'all', label: 'Barcha kurslar' }, ...COURSE_OPTIONS]}
                  value={course}
                  onChange={(event) => {
                    setCourse(event.target.value);
                    setPage(1);
                  }}
                  className="w-44"
                />

                <Select
                  aria-label="Semestr bo'yicha filtr"
                  options={[{ value: 'all', label: 'Barcha semestrlar' }, ...SEMESTER_OPTIONS]}
                  value={semester}
                  onChange={(event) => {
                    setSemester(event.target.value);
                    setPage(1);
                  }}
                  className="w-48"
                />

                {/* Institut tanlanmagan bo'lsa ham ko'rinadi: toifa global. */}
                {categoryOptions.length > 1 ? (
                  <Select
                    aria-label="Toifa bo'yicha filtr"
                    /* Uzun ro'yxatda aylantirishdan ko'ra yozib topish tezroq. */
                    searchable={categoryOptions.length > 8}
                    searchPlaceholder="Toifa nomi..."
                    options={categoryOptions}
                    value={category}
                    onChange={(event) => {
                      setCategory(event.target.value);
                      setPage(1);
                    }}
                    className="w-52"
                  />
                ) : null}
              </section>

              <Card className="mt-4 overflow-hidden">
                <Table
                  columns={columns}
                  rows={data?.results ?? []}
                  rowKey={(row) => row.id}
                  /*
                        Skeleton faqat ko'rsatadigan narsa bo'lmaganda: sahifa
                        yoki filtr almashsa `data` bo'shaydi, mutatsiyadan
                        keyingi fon yangilanishida esa joyida qoladi va jadval
                        miltillamaydi.
                      */
                  isLoading={isLoading || (isFetching && !data)}
                  skeletonRows={perPage > 20 ? 20 : perPage}
                  emptyMessage="Bunday fan topilmadi"
                />

                <Pagination
                  page={page}
                  totalPages={data?.total_pages ?? 1}
                  onPageChange={setPage}
                  perPage={perPage}
                  onPerPageChange={(value) => {
                    setPerPage(value);
                    setPage(1);
                  }}
                  summary={data ? `Jami ${formatSom(data.count)} fan` : undefined}
                />
              </Card>
            </>
          )}
        </div>
      </div>

      <SubjectFormModal
        open={formOpen}
        subject={editTarget}
        defaultUniversityId={university?.id ?? null}
        onClose={() => setFormOpen(false)}
      />

      <DeleteCatalogueModal
        title="Fanni o'chirish"
        itemName={deleteTarget?.name ?? null}
        description="Fan katalogdan yashiriladi, lekin bazadan butunlay o'chmaydi — unga bog'langan topshiriqlar va yechimlar tarixi saqlanib qoladi."
        isLoading={deleteState.isLoading}
        error={deleteState.error}
        onConfirm={() => void confirmDelete()}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}
