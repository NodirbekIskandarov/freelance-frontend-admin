import { CirclePlus, Eye, FileText, Filter, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Avatar } from '@/components/ui/Avatar';
import { Alert } from '@/components/ui/Alert';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Button, IconButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextAreaField, TextField } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Table, type Column } from '@/components/ui/Table';
import { formatSom } from '@/lib/format';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { getApiErrorMessage } from '@/shared/api';
import type { Subject, SubjectSource } from '@/shared/types/subjects';

import { InstitutePanel } from './InstitutePanel';
import { useGetInstitutePanelQuery, useGetSubjectsQuery } from './subjectsApi';

/** Manba badge'ining rangi (10-rasm). */
const sourceTones: Record<SubjectSource, BadgeTone> = {
  Admin: 'success',
  Foydalanuvchi: 'info',
  Freelancer: 'orange',
};

export function SubjectsPage() {
  const navigate = useNavigate();

  const [instituteId, setInstituteId] = useState('1');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [course, setCourse] = useState('all');
  const [isCreateOpen, setCreateOpen] = useState(false);

  const debouncedSearch = useDebouncedValue(search, 350);

  const { data, isLoading, isFetching, error } = useGetSubjectsQuery({
    instituteId,
    page,
    limit: perPage,
    search: debouncedSearch || undefined,
    course: course === 'all' ? undefined : course,
  });

  const resetToFirstPage = () => setPage(1);

  const columns: Column<Subject>[] = [
    {
      key: 'index',
      header: '#',
      className: 'w-10 text-fg-dim',
      cell: (_row, index) => (page - 1) * perPage + index + 1,
    },
    { key: 'name', header: 'Fan nomi', cell: (row) => <span className="text-fg">{row.name}</span> },
    { key: 'course', header: 'Kurs', cell: (row) => row.course },
    {
      key: 'tasks',
      header: 'Topshiriqlar soni',
      cell: (row) => formatSom(row.taskCount),
    },
    {
      key: 'variants',
      header: 'Variantlar soni',
      cell: (row) => formatSom(row.variantCount),
    },
    {
      key: 'addedAt',
      header: "Qo'shilgan sana",
      cell: (row) => <span className="whitespace-nowrap">{row.addedAt}</span>,
    },
    {
      key: 'source',
      header: 'Manba',
      cell: (row) => <Badge tone={sourceTones[row.source]}>{row.source}</Badge>,
    },
    {
      key: 'actions',
      header: 'Amallar',
      cell: (row) => (
        <span className="flex items-center gap-1.5">
          <IconButton label={`${row.name} — ko'rish`} size="sm">
            <Eye className="size-4" strokeWidth={1.75} />
          </IconButton>
          <IconButton label={`${row.name} — tahrirlash`} size="sm">
            <Pencil className="size-4" strokeWidth={1.75} />
          </IconButton>
          <IconButton label={`${row.name} — o'chirish`} size="sm">
            <Trash2 className="size-4" strokeWidth={1.75} />
          </IconButton>
        </span>
      ),
    },
  ];

  const institute = data?.institute;

  return (
    <>
      <PageHeader
        title="Fanlar"
        breadcrumbs={[{ label: 'Bosh sahifa', to: '/' }, { label: 'Fanlar' }]}
      />

      <div className="flex flex-col gap-4 xl:flex-row">
        <InstitutePanel selectedId={instituteId} onSelect={setInstituteId} />

        <div className="min-w-0 flex-1">
          {error ? (
            <div className="rounded-card border border-danger/25 bg-danger/10 p-5 text-sm text-danger">
              {getApiErrorMessage(error)}
            </div>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={institute?.short ?? '—'} src={institute?.logoUrl} size="lg" />
                  <div className="min-w-0">
                    <h2 className="flex flex-wrap items-center gap-2 text-lg font-semibold text-fg">
                      {institute?.name ?? '—'}
                      {institute && <Badge tone="success">{institute.short}</Badge>}
                    </h2>
                    {institute && (
                      <p className="text-sm text-fg-muted">
                        {institute.subjectCount} fan • {formatSom(institute.taskCount)} topshiriq
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="secondary"
                    icon={<FileText className="size-4" strokeWidth={1.75} />}
                    onClick={() => navigate('/fanlar/arizalar')}
                  >
                    Fan qo‘shish arizalari
                  </Button>
                  <Button
                    icon={<CirclePlus className="size-4" strokeWidth={1.75} />}
                    onClick={() => setCreateOpen(true)}
                  >
                    Yangi fan qo‘shish
                  </Button>
                </div>
              </div>

              <div className="mb-4 flex flex-wrap items-center gap-3">
                <SearchInput
                  placeholder="Fan nomini qidirish..."
                  iconPosition="right"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    resetToFirstPage();
                  }}
                  className="min-w-[240px] flex-1"
                />
                <Select
                  aria-label="Kurs bo'yicha filtr"
                  options={[
                    { value: 'all', label: 'Barcha kurslar' },
                    ...(data?.courses ?? []).map((item) => ({ value: item, label: item })),
                  ]}
                  value={course}
                  onChange={(event) => {
                    setCourse(event.target.value);
                    resetToFirstPage();
                  }}
                  className="w-48"
                />
                <Button variant="secondary" icon={<Filter className="size-4" strokeWidth={1.75} />}>
                  Filter
                </Button>
              </div>

              <Card className="overflow-hidden">
                <Table
                  columns={columns}
                  rows={data?.items ?? []}
                  rowKey={(row) => row.id}
                  isLoading={isLoading || isFetching}
                  skeletonRows={perPage}
                  density="compact"
                  emptyMessage="Bunday fan topilmadi"
                />

                <Pagination
                  page={page}
                  totalPages={data?.pagination.totalPages ?? 1}
                  onPageChange={setPage}
                  perPage={perPage}
                  onPerPageChange={(value) => {
                    setPerPage(value);
                    resetToFirstPage();
                  }}
                  perPageOptions={[10, 20, 50]}
                  summary={data ? `Jami ${formatSom(data.pagination.total)} fan` : undefined}
                />
              </Card>
            </>
          )}
        </div>
      </div>

      <CreateSubjectModal open={isCreateOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}

/** 12-rasmdagi modal. */
function CreateSubjectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState('');
  const [summary, setSummary] = useState('');

  const { data } = useGetInstitutePanelQuery({ page: 1, limit: 50 });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Yangi fan qo‘shish"
      footer={
        // Dizaynda "Ma'lumot" bloki tugmalardan KEYIN turadi, shuning uchun
        // footer bitta ustun: avval tugmalar qatori, so'ng izoh bloki.
        <div className="flex w-full flex-col gap-4">
          <div className="flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={onClose}>
              Bekor qilish
            </Button>
            <Button onClick={onClose}>Saqlash</Button>
          </div>

          <Alert title="Ma’lumot">
            Fan qo‘shilgandan so‘ng, unga topshiriqlar va variantlar qo‘shish imkoniyati yaratiladi.
          </Alert>
        </div>
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
            options={(data?.items ?? []).map((item) => ({
              value: item.id,
              label: `${item.name} (${item.short})`,
            }))}
            className="w-full"
          />
        </div>

        <TextField
          label="Fan nomi"
          required
          placeholder="Fan nomini kiriting"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium text-fg-soft">
              Kurs (nechinchi kurs)
              <span aria-hidden className="ml-0.5 text-danger">
                *
              </span>
            </p>
            <Select
              aria-label="Kurs"
              options={[
                { value: '', label: 'Kursni tanlang' },
                { value: '1', label: '1-kurs' },
                { value: '2', label: '2-kurs' },
                { value: '3', label: '3-kurs' },
                { value: '4', label: '4-kurs' },
              ]}
              className="w-full"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-fg-soft">
              Semestr
              <span aria-hidden className="ml-0.5 text-danger">
                *
              </span>
            </p>
            <Select
              aria-label="Semestr"
              options={[
                { value: '', label: 'Semestrni tanlang' },
                ...Array.from({ length: 8 }, (_, index) => ({
                  value: String(index + 1),
                  label: `${index + 1}-semestr`,
                })),
              ]}
              className="w-full"
            />
          </div>
        </div>

        <TextAreaField
          label="Qisqacha izoh"
          required
          maxLength={300}
          placeholder="Fan haqida qisqacha ma’lumot kiriting..."
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
        />
      </div>
    </Modal>
  );
}
