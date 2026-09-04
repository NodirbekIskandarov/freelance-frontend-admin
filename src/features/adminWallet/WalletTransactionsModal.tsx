import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { formatDecimalSom } from '@/lib/format';
import { getApiErrorMessage } from '@/shared/api';
import {
  absoluteAmount,
  isCreditTransaction,
  TRANSACTION_TYPE_LABELS,
  type AdminWallet,
} from '@/shared/types/adminWallet';

import { useGetWalletTransactionsQuery } from './adminWalletApi';

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('ru-RU').slice(0, 16);
}

/**
 * Tranzaksiya tarixi — faqat o'qish uchun.
 *
 * `skip` shart: modal yopiq turganda ham so'rov ketmasin. Hamyon
 * tanlanmagan bo'lsa `id` ham yo'q, shuning uchun so'rov o'tkazib
 * yuboriladi.
 */
export function WalletTransactionsModal({
  wallet,
  onClose,
}: {
  wallet: AdminWallet | null;
  onClose: () => void;
}) {
  const { data, isLoading, error } = useGetWalletTransactionsQuery(
    { id: wallet?.id ?? '', page_size: 50, ordering: '-created_at' },
    { skip: wallet === null },
  );

  return (
    <Modal
      open={wallet !== null}
      onClose={onClose}
      title="Tranzaksiyalar"
      description={
        wallet
          ? `${wallet.user.full_name || wallet.user.phone} · ${formatDecimalSom(wallet.balance)}`
          : undefined
      }
      className="max-w-3xl"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Yopish
        </Button>
      }
    >
      {error !== undefined && error !== null ? (
        <p
          role="alert"
          className="rounded-control border border-danger/25 bg-danger/10 px-3.5 py-2.5 text-sm text-danger"
        >
          {getApiErrorMessage(error)}
        </p>
      ) : isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="h-14 bg-skeleton rounded-control" />
          ))}
        </div>
      ) : !data || data.results.length === 0 ? (
        <p className="rounded-control border border-dashed border-line px-4 py-10 text-center text-sm text-fg-muted">
          Bu hamyonda hali tranzaksiya yo&apos;q.
        </p>
      ) : (
        <ul className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto">
          {data.results.map((tx) => {
            const isCredit = isCreditTransaction(tx.amount);

            return (
              <li
                key={tx.id}
                className="flex flex-wrap items-center gap-3 rounded-control border border-line px-3.5 py-3"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-fg">
                    {TRANSACTION_TYPE_LABELS[tx.type]}
                  </span>
                  <span className="block truncate text-xs text-fg-muted" title={tx.description}>
                    {tx.description || '—'} · {formatDate(tx.created_at)}
                  </span>
                </span>

                <span className="text-right">
                  <span
                    className={`block text-sm font-semibold tabular-nums ${isCredit ? 'text-success' : 'text-danger'}`}
                  >
                    {isCredit ? '+' : '−'}
                    {formatDecimalSom(absoluteAmount(tx.amount))}
                  </span>
                  <span className="block text-xs text-fg-muted">
                    balans: {formatDecimalSom(tx.balance_after)}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}
