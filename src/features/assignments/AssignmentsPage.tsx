import { Eye, FileText, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';

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
import { useGetAssignmentRequestsListQuery } from '@/features/adminRequests/adminRequestsApi';
import { UniversityPanel } from '@/features/catalogue/UniversityPanel';
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
import { useGetAssignmentsQuery, useGetSubjectsQuery } from './assignmentsApi';
import { DeleteAssignmentModal } from './DeleteAssignmentModal';

const activeOptions = [
  { value: 'all', label: 'Barchasi' },
  { value: 'true', label: 'Faol' },
  { value: 'false', label: 'Nofaol' },
];

export function AssignmentsPage() {
  const navigate = useNavigate();

  const [university, setUniversity] = useState<University | null>(null);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [subject, setSubject] = useState('all');
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
   * Institut almashganda fan filtri tozalanadi: oldingi institutning fani
   * yangisida yo'q va jadval sababsiz bo'sh chiqardi.
   */
  useEffect(() => {
    setSubject('all');
    setPage(1);
  }, [university?.id]);

  // Fanlar ro'yxati tanlangan institutniki; institut tanlanmasa hammasi.
  const { data: subjects } = useGetSubjectsQuery({
    page_size: 200,
    ordering: 'name',
    ...(university ? { university: university.id } : {}),
  });

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

  const subjectOptions = [
    { value: 'all', label: 'Barcha fanlar' },
    ...(subjects?.results ?? []).map((item) => ({ value: item.id, label: item.name })),
  ];

  const typeOptions = [
    { value: 'all', label: 'Barcha turlar' },
    ...ASSIGNMENT_TYPES.map((item) => ({ value: item, label: ASSIGNMENT_TYPE_LABELS[item] })),
  ];

  function openCreate() {
    setEditTarget(null);
    setFormOpen(true);
  }

  function openEdit(assignment: Assignment) {
    setEditTarget(assignment);
    setFormOpen(true);
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
      cell: (row) => (
        <span className="whitespace-nowrap text-fg-muted">{formatDateTime(row.created_at)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Amallar',
      align: 'right',
      cell: (row) => (
        <span className="flex items-center justify-end gap-2">
          <IconButton
            label={`${row.title} — variantlar`}
            tone="success"
            size="sm"
            onClick={() => void navigate(`/topshiriqlar/${row.id}`)}
          >
            <Eye className="size-4" strokeWidth={1.75} />
          </IconButton>
          <IconButton
            label={`${row.title} — tahrirlash`}
            tone="warning"
            size="sm"
            onClick={() => openEdit(row)}
          >
            <Pencil className="size-4" strokeWidth={1.75} />
          </IconButton>
          <IconButton
            label={`${row.title} — o'chirish`}
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
        <UniversityPanel selectedId={university?.id ?? null} onSelect={setUniversity} />

        <div className="min-w-0 flex-1">
          {error ? (
            <div className="rounded-card border border-danger/25 bg-danger/10 p-5 text-sm text-danger">
              {getApiErrorMessage(error)}
            </div>
          ) : (
            <>
              <section className="flex flex-wrap items-center gap-3">
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
                  aria-label="Fan bo'yicha filtr"
                  options={subjectOptions}
                  value={subject}
                  onChange={(event) => {
                    setSubject(event.target.value);
                    setPage(1);
                  }}
                  /* Fanlar ko'p — aylantirishdan ko'ra yozib topish tezroq. */
                  searchable={subjectOptions.length > 8}
                  searchPlaceholder="Fan nomi..."
                  className="w-56"
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
              </section>

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
