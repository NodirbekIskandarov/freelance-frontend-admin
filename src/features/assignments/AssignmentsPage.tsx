import { Eye, FileText, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Link, useLocaleNavigate } from '@/i18n/navigation';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DateCell } from '@/components/ui/Cells';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { RowActions } from '@/components/ui/RowActions';
import { TableToolbar } from '@/components/ui/TableToolbar';
import { Table, type Column } from '@/components/ui/Table';
import { formatSom } from '@/lib/format';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { useGetAssignmentRequestsListQuery } from '@/features/adminRequests/adminRequestsApi';
import { CatalogueNavPanel } from '@/features/catalogue/CatalogueNavPanel';
import { useGetUniversityQuery } from '@/features/catalogue/catalogueApi';
import { getApiErrorMessage } from '@/shared/api';
import {
  ASSIGNMENT_ORDERING_OPTIONS,
  ASSIGNMENT_TYPE_LABELS,
  ASSIGNMENT_TYPES,
  assignmentTypeLabel,
  type Assignment,
} from '@/shared/types/assignments';
import { COURSE_OPTIONS, SEMESTER_OPTIONS, type University } from '@/shared/types/catalogue';

import { AssignmentFormModal } from './AssignmentFormModal';
import { useGetAssignmentsQuery } from './assignmentsApi';
import { DeleteAssignmentModal } from './DeleteAssignmentModal';

const activeOptions = [
  { value: 'all', label: 'Barchasi' },
  { value: 'true', label: 'Faol' },
  { value: 'false', label: 'Nofaol' },
];

export function AssignmentsPage() {
  const navigate = useLocaleNavigate();

  /*
   * Boshlang'ich filtr manzildan olinadi: fanlar bo'limidagi «Topshiriqlar»
   * tugmasi shu yerga `?university=..&subject=..` bilan olib keladi.
   */
  const [searchParams, setSearchParams] = useSearchParams();
  const universityParam = searchParams.get('university');
  const subjectParam = searchParams.get('subject');

  const [university, setUniversity] = useState<University | null>(null);

  /*
   * Manzilda ID bor, panelga esa to'liq obyekt kerak (nom, logotip,
   * sanoqlar) — shuning uchun bitta institut alohida so'raladi.
   */
  const { data: universityFromUrl } = useGetUniversityQuery(universityParam ?? '', {
    skip: !universityParam,
  });

  useEffect(() => {
    if (universityFromUrl) setUniversity(universityFromUrl);
  }, [universityFromUrl]);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [subject, setSubject] = useState(subjectParam ?? 'all');
  const [course, setCourse] = useState('all');
  const [semester, setSemester] = useState('all');
  const [type, setType] = useState('all');
  const [active, setActive] = useState('all');
  const [ordering, setOrdering] = useState<string>('-created_at');
  const [search, setSearch] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Assignment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Assignment | null>(null);

  const debouncedSearch = useDebouncedValue(search, 350);

  /*
   * Tugmadagi son — nechta ariza javob kutayotgani. Faqat SON kerak,
   * shuning uchun `page_size: 1`.
   */
  const { data: pendingRequests } = useGetAssignmentRequestsListQuery({
    status: 'pending',
    page: 1,
    page_size: 1,
  });

  const pendingCount = pendingRequests?.count ?? 0;

  /*
   * Institut ham, fan ham TANLANISHI SHART EMAS — ikkalasi ham filtr.
   * Tanlanmagan holatda barcha institutlarning barcha topshiriqlari
   * ko'rinadi.
   */
  const { data, isLoading, isFetching, error } = useGetAssignmentsQuery({
    page,
    page_size: perPage,
    ordering,
    ...(university ? { subject__university: university.id } : {}),
    ...(subject !== 'all' ? { subject } : {}),
    ...(course !== 'all' ? { subject__course: Number(course) } : {}),
    ...(semester !== 'all' ? { subject__semester: Number(semester) } : {}),
    ...(type !== 'all' ? { type } : {}),
    ...(active !== 'all' ? { is_active: active === 'true' } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });

  const typeOptions = [
    { value: 'all', label: 'Barcha turlar' },
    ...ASSIGNMENT_TYPES.map((item) => ({ value: item, label: ASSIGNMENT_TYPE_LABELS[item] })),
  ];

  /*
   * Filtr manzilda ham saqlanadi: sahifani yangilaganda yoki havolani
   * ulashganda o'sha ko'rinish qaytadi. `replace` — har filtr o'zgarishi
   * brauzer tarixiga yozilmasligi uchun.
   */
  function syncUrl(universityId: string | null, subjectId: string | null) {
    const next = new URLSearchParams();
    if (universityId) next.set('university', universityId);
    if (subjectId) next.set('subject', subjectId);
    setSearchParams(next, { replace: true });
  }

  function openCreate() {
    setEditTarget(null);
    setFormOpen(true);
  }

  function openEdit(assignment: Assignment) {
    setEditTarget(assignment);
    setFormOpen(true);
  }

  /* Sukut qiymatidan farq qiladigan filtrlar soni — «hammasi»
     hisoblanmaydi. */
  const activeFilterCount = [
    search,
    subject !== 'all' ? subject : '',
    course !== 'all' ? course : '',
    semester !== 'all' ? semester : '',
    type !== 'all' ? type : '',
    active !== 'all' ? active : '',
  ].filter(Boolean).length;

  function resetFilters() {
    setSearch('');
    setSubject('all');
    setCourse('all');
    setSemester('all');
    setType('all');
    setActive('all');
    setPage(1);
  }

  const columns: Column<Assignment>[] = [
    {
      key: 'index',
      header: '#',
      className: 'w-12 tabular-nums text-fg-dim',
      cell: (_row, index) => (page - 1) * perPage + index + 1,
    },
    {
      key: 'title',
      header: 'Topshiriq nomi',
      className: 'max-w-[280px]',
      cell: (row) => (
        <span className="block">
          <span className="block truncate font-medium text-fg" title={row.title}>
            {row.title}
          </span>
          <span className="mt-0.5 block truncate text-[11px] text-fg-dim">
            {row.subject_name}
            {row.subject_course ? ` · ${row.subject_course}-kurs` : ''}
            {row.subject_semester ? ` · ${row.subject_semester}-semestr` : ''}
          </span>
        </span>
      ),
    },
    /*
     * Institut ustuni faqat filtr qo'yilmaganda: tanlangan institut ichida
     * har qatorda o'sha nomni takrorlash bo'sh joy sarfi.
     */
    ...(university
      ? []
      : [
          {
            key: 'university_name',
            header: 'Institut',
            className: 'max-w-[190px]',
            cell: (row: Assignment) => (
              <span className="block truncate text-fg-soft" title={row.university_name}>
                {row.university_name}
              </span>
            ),
          },
        ]),
    {
      key: 'type',
      header: 'Topshiriq turi',
      cell: (row) => <Badge tone="info">{assignmentTypeLabel(row.type, 'Boshqa')}</Badge>,
    },
    {
      key: 'variant_count',
      header: 'Variantlar soni',
      align: 'center',
      cell: (row) =>
        row.variant_count > 0 ? (
          <span className="tabular-nums">{formatSom(row.variant_count)} ta</span>
        ) : (
          /* Variantsiz topshiriqda nol emas, chiziqcha: nol «variant
             kutilmoqda» degan taassurot berardi. */
          <span className="text-fg-dim">—</span>
        ),
    },
    {
      key: 'solved_variant_count',
      header: 'Yechilgan variantlar',
      align: 'center',
      cell: (row) =>
        row.variant_count > 0 ? (
          <span className="tabular-nums">{formatSom(row.solved_variant_count)} ta</span>
        ) : (
          <span className="text-fg-dim">—</span>
        ),
    },
    {
      key: 'open_request_count',
      header: "So'rovlar",
      align: 'center',
      cell: (row) =>
        row.open_request_count > 0 ? (
          /*
            Faqat javobi yo'q variantlarning so'rovi. Nol bo'lsa chiziqcha:
            «0 ta so'rov» bilan «so'rov yopilgan» bir xil ko'rinardi, holbuki
            bu yerda muhimi — nimadir kutilyaptimi, yo'qmi.
          */
          <Badge tone="warning">{formatSom(row.open_request_count)} ta</Badge>
        ) : (
          <span className="text-fg-dim">—</span>
        ),
    },
    {
      key: 'is_active',
      header: 'Status',
      cell: (row) => (
        <Badge tone={row.is_active ? 'success' : 'warning'}>
          {row.is_active ? 'Faol' : 'Kutilyapti'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: "Qo'shilgan sana",
      cell: (row) => <DateCell value={row.created_at} />,
    },
    {
      key: 'actions',
      header: 'Amallar',
      align: 'right',
      // O'ng chetga yopishadi — jadval siljiganda ham ko'rinadi.
      sticky: true,
      cell: (row) => (
        <RowActions
          inlineCount={1}
          actions={[
            {
              label: `${row.title} — variantlar`,
              icon: <Eye className="size-4" strokeWidth={1.75} />,
              onSelect: () => void navigate(`/topshiriqlar/${row.id}`),
            },
            {
              label: `${row.title} — tahrirlash`,
              icon: <Pencil className="size-4" strokeWidth={1.75} />,
              onSelect: () => openEdit(row),
            },
            {
              label: `${row.title} — o'chirish`,
              icon: <Trash2 className="size-4" strokeWidth={1.75} />,
              onSelect: () => setDeleteTarget(row),
              destructive: true,
            },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Topshiriqlar"
        breadcrumbs={[{ label: 'Bosh sahifa', to: '/' }, { label: 'Topshiriqlar' }]}
        actions={
          <>
            <Link to="/topshiriqlar/arizalar">
              <Button variant="secondary" icon={<FileText className="size-4" />}>
                Topshiriq arizalari
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

            <Button icon={<Plus className="size-4" strokeWidth={2} />} onClick={openCreate}>
              Yangi topshiriq qo&apos;shish
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        {/*
          Fan filtri shu panelda — tepadagi tanlagichdan olib tashlandi.
          Panel institut va fan qavatlari orasida almashadi.
        */}
        <CatalogueNavPanel
          university={university}
          subjectId={subject !== 'all' ? subject : null}
          onSelectUniversity={(next) => {
            setUniversity(next);
            setSubject('all');
            setPage(1);
            syncUrl(next?.id ?? null, null);
          }}
          onSelectSubject={(next) => {
            setSubject(next?.id ?? 'all');
            setPage(1);
            syncUrl(university?.id ?? null, next?.id ?? null);
          }}
        />

        <div className="min-w-0 flex-1">
          {error ? (
            <Card>
              <ErrorState message={getApiErrorMessage(error)} />
            </Card>
          ) : (
            <>
              <TableToolbar
                activeFilters={activeFilterCount}
                onResetFilters={resetFilters}
                filters={
                  <>
                    <SearchInput
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value);
                        setPage(1);
                      }}
                      placeholder="Topshiriq nomini qidirish..."
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
                      aria-label="Topshiriq turi bo'yicha filtr"
                      options={typeOptions}
                      value={type}
                      onChange={(event) => {
                        setType(event.target.value);
                        setPage(1);
                      }}
                      className="w-48"
                    />

                    <Select
                      aria-label="Holat bo'yicha filtr"
                      options={activeOptions}
                      value={active}
                      onChange={(event) => {
                        setActive(event.target.value);
                        setPage(1);
                      }}
                      className="w-40"
                    />

                    <div className="ml-auto">
                      <Select
                        aria-label="Saralash"
                        options={[...ASSIGNMENT_ORDERING_OPTIONS]}
                        value={ordering}
                        onChange={(event) => {
                          setOrdering(event.target.value);
                          setPage(1);
                        }}
                        className="w-52"
                      />
                    </div>
                  </>
                }
              />

              <Card className="mt-4 overflow-hidden">
                <Table
                  columns={columns}
                  rows={data?.results ?? []}
                  rowKey={(row) => row.id}
                  /*
                Skeleton faqat ko'rsatadigan narsa bo'lmaganda: sahifa yoki
                filtr almashsa `data` bo'shaydi, mutatsiyadan keyingi fon
                yangilanishida esa joyida qoladi va jadval miltillamaydi.
              */
                  isLoading={isLoading || (isFetching && !data)}
                  skeletonRows={perPage > 20 ? 20 : perPage}
                  emptyMessage="Bunday topshiriq topilmadi"
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
                  summary={data ? `Jami ${formatSom(data.count)} ta topshiriq` : undefined}
                />
              </Card>
            </>
          )}
        </div>
      </div>

      <AssignmentFormModal
        open={formOpen}
        assignment={editTarget}
        defaultSubjectId={subject !== 'all' ? subject : null}
        defaultUniversityId={university?.id ?? null}
        onClose={() => setFormOpen(false)}
      />
      <DeleteAssignmentModal assignment={deleteTarget} onClose={() => setDeleteTarget(null)} />
    </>
  );
}
