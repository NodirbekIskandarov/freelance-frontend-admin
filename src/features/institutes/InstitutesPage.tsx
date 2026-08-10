import { CirclePlus, Eye, FileText, Filter, Pencil, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/Badge';
import { Button, IconButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FileDropzone } from '@/components/ui/FileDropzone';
import { TextField } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Table, type Column } from '@/components/ui/Table';
import { formatSom } from '@/lib/format';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { getApiErrorMessage } from '@/shared/api';
import type { Institute } from '@/shared/types/institutes';

import { useGetInstitutesQuery } from './institutesApi';

const statusOptions = [
  { value: 'all', label: 'Barcha statuslar' },
  { value: 'Faol', label: 'Faol' },
  { value: 'Kutilmoqda', label: 'Kutilmoqda' },
  { value: 'Bloklangan', label: 'Bloklangan' },
];

export function InstitutesPage() {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('all');
  const [status, setStatus] = useState('all');
  const [isCreateOpen, setCreateOpen] = useState(false);

  const debouncedSearch = useDebouncedValue(search, 350);

  const { data, isLoading, isFetching, error, refetch } = useGetInstitutesQuery({
    page,
    limit: perPage,
    search: debouncedSearch || undefined,
    region: region === 'all' ? undefined : region,
    status: status === 'all' ? undefined : status,
  });

  const resetToFirstPage = () => setPage(1);

  const columns: Column<Institute>[] = [
    {
      key: 'index',
      header: '#',
      className: 'w-10 text-fg-dim',
      cell: (_row, index) => (page - 1) * perPage + index + 1,
    },
    {
      key: 'name',
      header: 'Institut nomi',
      className: 'max-w-[230px]',
      cell: (row) => (
        <span className="flex items-center gap-3">
          <Avatar name={row.short} src={row.logoUrl} size="sm" />
          <span className="leading-snug text-fg">{row.name}</span>
        </span>
      ),
    },
    { key: 'short', header: 'Qisqartma', cell: (row) => row.short },
    {
      key: 'region',
      header: 'Viloyat',
      cell: (row) => <span className="whitespace-nowrap">{row.region}</span>,
    },
    { key: 'subjects', header: 'Fanlar soni', cell: (row) => formatSom(row.subjectCount) },
    { key: 'tasks', header: 'Topshiriqlar', cell: (row) => formatSom(row.taskCount) },
    { key: 'variants', header: 'Variantlar', cell: (row) => formatSom(row.variantCount) },
    { key: 'status', header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'addedAt',
      header: "Qo'shilgan sana",
      cell: (row) => <span className="whitespace-nowrap">{row.addedAt}</span>,
    },
    {
      key: 'actions',
      header: 'Amallar',
      cell: (row) => (
        <span className="flex items-center gap-1.5">
          <IconButton label={`${row.short} — ko'rish`} size="sm">
            <Eye className="size-4" strokeWidth={1.75} />
          </IconButton>
          <IconButton label={`${row.short} — tahrirlash`} size="sm">
            <Pencil className="size-4" strokeWidth={1.75} />
          </IconButton>
          <IconButton label={`${row.short} — o'chirish`} size="sm">
            <Trash2 className="size-4" strokeWidth={1.75} />
          </IconButton>
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Institutlar"
        breadcrumbs={[
          { label: 'Bosh sahifa', to: '/' },
          { label: 'Kontent boshqaruvi', to: '/kontent' },
          { label: 'Institutlar' },
        ]}
        actions={
          <>
            <Button
              variant="secondary"
              icon={<FileText className="size-4" strokeWidth={1.75} />}
              onClick={() => navigate('/institutlar/arizalar')}
            >
              Institut qo‘shish arizalari
            </Button>
            <Button
              icon={<CirclePlus className="size-4" strokeWidth={1.75} />}
              onClick={() => setCreateOpen(true)}
            >
              Yangi institut qo‘shish
            </Button>
          </>
        }
      />

      {error ? (
        <div className="rounded-card border border-danger/25 bg-danger/10 p-5 text-sm text-danger">
          {getApiErrorMessage(error)}
        </div>
      ) : (
        <>
          <section className="mb-4 flex flex-wrap items-center gap-3">
            <SearchInput
              placeholder="Qidirish (nom, qisqartma...)"
              iconPosition="right"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                resetToFirstPage();
              }}
              className="min-w-[260px] flex-1"
            />
            <Select
              aria-label="Viloyat bo'yicha filtr"
              options={[
                { value: 'all', label: 'Barcha viloyatlar' },
                ...(data?.regions ?? []).map((item) => ({ value: item, label: item })),
              ]}
              value={region}
              onChange={(event) => {
                setRegion(event.target.value);
                resetToFirstPage();
              }}
              className="w-52"
            />
            <Select
              aria-label="Status bo'yicha filtr"
              options={statusOptions}
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                resetToFirstPage();
              }}
              className="w-48"
            />
            <Button variant="secondary" icon={<Filter className="size-4" strokeWidth={1.75} />}>
              Filtr
            </Button>

            <IconButton label="Yangilash" size="lg" onClick={() => void refetch()}>
              <RefreshCw className="size-4" strokeWidth={1.75} />
            </IconButton>
          </section>

          <Card className="overflow-hidden">
            <Table
              columns={columns}
              rows={data?.items ?? []}
              rowKey={(row) => row.id}
              isLoading={isLoading || isFetching}
              skeletonRows={perPage}
              density="compact"
              emptyMessage="Bunday institut topilmadi"
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
              summary={data ? `Jami ${formatSom(data.pagination.total)} ta institut` : undefined}
            />
          </Card>
        </>
      )}

      <CreateInstituteModal open={isCreateOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}

/** 9-rasmdagi modal. */
function CreateInstituteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [short, setShort] = useState('');
  const [name, setName] = useState('');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Yangi institut qo‘shish"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button onClick={onClose}>Saqlash</Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <FileDropzone
          label="Logotip yuklash"
          description="PNG, JPG yoki SVG formatda. Maksimal hajm: 2MB"
          accept="image/png,image/jpeg,image/svg+xml"
        />

        <TextField
          label="Qisqartma nomi"
          required
          placeholder="Masalan: TATU, TDYU, ADU"
          value={short}
          onChange={(event) => setShort(event.target.value)}
        />

        <TextField
          label="To‘liq nomi"
          required
          placeholder="Institutning to‘liq nomini kiriting"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
    </Modal>
  );
}
