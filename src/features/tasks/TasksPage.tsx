import { BookOpen, ChevronRight, FileStack, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/Badge';
import { Button, IconButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Table, type Column } from '@/components/ui/Table';
import { formatSom } from '@/lib/format';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { getApiErrorMessage } from '@/shared/api';
import type { SubjectRow } from '@/shared/types/tasks';

import { InstitutePanel } from '../subjects/InstitutePanel';
import { useGetInstituteSubjectsQuery } from './tasksApi';

/** 13-rasmdagi binafsha banner. */
function RequestsBanner({ count, onOpen }: { count: number; onOpen: () => void }) {
  return (
    <Card className="mb-4 flex flex-wrap items-center gap-4 border-purple/25 bg-purple/8 p-5">
      <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-purple/15 text-purple">
        <FileStack className="size-6" strokeWidth={1.75} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold text-fg">Topshiriq qo‘shish bo‘yicha arizalar</p>
        <p className="mt-1 text-sm text-fg-muted">
          Foydalanuvchilar va freelancerlar tomonidan yuborilgan topshiriq qo‘shish arizalarini
          ko‘rib chiqing va tasdiqlang.
        </p>
      </div>

      <div className="relative shrink-0">
        <Button variant="secondary" className="border-purple/40 text-fg" onClick={onOpen}>
          Arizalarni ko‘rish
        </Button>
        {count > 0 && (
          <span className="absolute -top-2 -right-2 grid min-w-5 place-items-center rounded-full bg-danger px-1.5 text-[11px] leading-5 font-semibold text-white">
            {count}
          </span>
        )}
      </div>
    </Card>
  );
}

export function TasksPage() {
  const navigate = useNavigate();

  const [instituteId, setInstituteId] = useState('1');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [course, setCourse] = useState('all');
  const [semester, setSemester] = useState('all');
  const [taskType, setTaskType] = useState('all');
  const [status, setStatus] = useState('all');

  const debouncedSearch = useDebouncedValue(search, 350);

  const { data, isLoading, isFetching, error } = useGetInstituteSubjectsQuery({
    instituteId,
    page,
    limit: perPage,
    search: debouncedSearch || undefined,
    course: course === 'all' ? undefined : course,
    semester: semester === 'all' ? undefined : semester,
    status: status === 'all' ? undefined : status,
  });

  const resetToFirstPage = () => setPage(1);

  const clearFilters = () => {
    setCourse('all');
    setSemester('all');
    setTaskType('all');
    setStatus('all');
    resetToFirstPage();
  };

  const columns: Column<SubjectRow>[] = [
    {
      key: 'name',
      header: 'Fan nomi',
      cell: (row) => (
        <span className="flex items-center gap-2.5">
          <BookOpen className="size-4 shrink-0 text-primary" strokeWidth={1.75} />
          <span className="text-fg">{row.name}</span>
        </span>
      ),
    },
    { key: 'code', header: 'Qisqartma nomi', cell: (row) => row.code },
    { key: 'course', header: 'Kurs', cell: (row) => row.course },
    { key: 'semester', header: 'Semestr', cell: (row) => row.semester },
    { key: 'taskCount', header: 'Topshiriqlar soni', cell: (row) => row.taskCount },
    { key: 'status', header: 'Holati', cell: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: 'Amallar',
      align: 'right',
      cell: (row) => (
        <IconButton
          label={`${row.name} — ochish`}
          size="sm"
          onClick={() => navigate(`/topshiriqlar/${row.id}`)}
        >
          <ChevronRight className="size-4" strokeWidth={2} />
        </IconButton>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Topshiriqlar"
        breadcrumbs={[{ label: 'Bosh sahifa', to: '/' }, { label: 'Topshiriqlar' }]}
      />

      <RequestsBanner
        count={data?.pendingRequestCount ?? 0}
        onOpen={() => navigate('/fanlar/arizalar')}
      />

      <div className="flex flex-col gap-4 xl:flex-row">
        <InstitutePanel selectedId={instituteId} onSelect={setInstituteId} title="Institutlar" />

        <div className="min-w-0 flex-1">
          {error ? (
            <div className="rounded-card border border-danger/25 bg-danger/10 p-5 text-sm text-danger">
              {getApiErrorMessage(error)}
            </div>
          ) : (
            <Card className="overflow-hidden">
              <div className="px-5 pt-5">
                <h2 className="flex flex-wrap items-center gap-2 text-lg font-semibold text-fg">
                  <Avatar name={data?.institute.short ?? '—'} size="sm" />
                  {data?.institute.name ?? '—'} <span className="text-fg-muted">– Fanlar</span>
                </h2>

                <SearchInput
                  placeholder="Fan nomini qidiring..."
                  iconPosition="right"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    resetToFirstPage();
                  }}
                  className="mt-4"
                />
              </div>

              {/* Filtr paneli — dizaynda alohida ramkali blok */}
              <div className="mx-5 mt-4 rounded-card border border-line bg-canvas p-4">
                <p className="mb-3 text-sm font-semibold text-fg">Filter</p>

                <div className="flex flex-wrap items-end gap-3">
                  {[
                    {
                      label: 'Kurs',
                      value: course,
                      set: setCourse,
                      options: (data?.filters.courses ?? []).map((item) => ({
                        value: item,
                        label: `${item}-kurs`,
                      })),
                    },
                    {
                      label: 'Semestr',
                      value: semester,
                      set: setSemester,
                      options: (data?.filters.semesters ?? []).map((item) => ({
                        value: item,
                        label: `${item}-semestr`,
                      })),
                    },
                    {
                      label: 'Fan turi',
                      value: taskType,
                      set: setTaskType,
                      options: (data?.filters.taskTypes ?? []).map((item) => ({
                        value: item,
                        label: item,
                      })),
                    },
                    {
                      label: 'Holati',
                      value: status,
                      set: setStatus,
                      options: (data?.filters.statuses ?? []).map((item) => ({
                        value: item,
                        label: item,
                      })),
                    },
                  ].map((field) => (
                    <div key={field.label} className="min-w-[150px] flex-1">
                      <p className="mb-1.5 text-xs text-fg-muted">{field.label}</p>
                      <Select
                        aria-label={field.label}
                        options={[{ value: 'all', label: 'Barchasi' }, ...field.options]}
                        value={field.value}
                        onChange={(event) => {
                          field.set(event.target.value);
                          resetToFirstPage();
                        }}
                        className="w-full"
                      />
                    </div>
                  ))}

                  <Button
                    variant="secondary"
                    icon={<RotateCcw className="size-4" strokeWidth={1.75} />}
                    onClick={clearFilters}
                  >
                    Tozalash
                  </Button>
                </div>
              </div>

              <div className="mt-4">
                <Table
                  columns={columns}
                  rows={data?.items ?? []}
                  rowKey={(row) => row.id}
                  isLoading={isLoading || isFetching}
                  skeletonRows={perPage}
                  density="compact"
                  emptyMessage="Bunday fan topilmadi"
                />
              </div>

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
                summary={data ? `Jami ${formatSom(data.pagination.total)} ta fan` : undefined}
              />
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
