import { FileText, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';

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
  useGetDirectionsQuery,
  useGetSubjectsQuery,
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
  const [university, setUniversity] = useState<University | null>(null);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [course, setCourse] = useState('all');
  const [semester, setSemester] = useState('all');
  const [direction, setDirection] = useState('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Subject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);

  const debouncedSearch = useDebouncedValue(search, 350);

  /*
   * Institut almashganda filtrlar tozalanadi: oldingi institutda tanlangan
   * yo'nalish yangisida umuman yo'q bo'lishi mumkin va jadval sababsiz
   * bo'sh chiqardi.
   */
  useEffect(() => {
    setPage(1);
    setCourse('all');
    setSemester('all');
    setDirection('all');
    setSearch('');
  }, [university?.id]);

  const { data: directions } = useGetDirectionsQuery({ page_size: 200 }, { skip: !university });

  const { data, isLoading, isFetching, error } = useGetSubjectsQuery(
    {
      page,
      page_size: perPage,
      ordering: 'name',
      university: university?.id ?? '',
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(course !== 'all' ? { course: Number(course) } : {}),
      ...(semester !== 'all' ? { semester: Number(semester) } : {}),
      ...(direction !== 'all' ? { direction } : {}),
    },
    { skip: !university },
  );

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

  const directionOptions = [
    { value: 'all', label: "Barcha yo'nalishlar" },
    ...(directions?.results ?? []).map((item) => ({ value: item.id, label: item.name })),
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
      cell: (row) => (
        <span className="flex items-center justify-end gap-2">
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
        <UniversityPanel selectedId={university?.id ?? null} onSelect={setUniversity} />

        <div className="min-w-0 flex-1">
          {!university ? (
            <Card className="grid place-items-center px-6 py-20 text-center">
              <p className="text-sm font-medium text-fg">Institut tanlanmagan</p>
              <p className="mt-1 max-w-sm text-[13px] text-fg-muted">
                Chapdagi ro&apos;yxatdan institutni tanlang — uning fanlari shu yerda
                ko&apos;rinadi.
              </p>
            </Card>
          ) : (
            <>
              <Card className="flex flex-wrap items-center gap-4 p-5">
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

                    <Select
                      aria-label="Yo'nalish bo'yicha filtr"
                      options={directionOptions}
                      value={direction}
                      onChange={(event) => {
                        setDirection(event.target.value);
                        setPage(1);
                      }}
                      className="w-52"
                    />
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
