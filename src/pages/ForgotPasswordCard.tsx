import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import {
  useConfirmForgotPasswordMutation,
  useForgotPasswordMutation,
} from '@/features/auth/authApi';
import { useT } from '@/i18n/I18nProvider';
import { getApiErrorMessage } from '@/shared/api';

/**
 * Parolni tiklash — login kartasining ikkinchi ko'rinishi.
 *
 * Panel xodimining hisobi saytdagi hisobning O'ZI, shuning uchun tiklash
 * ham bir xil endpointlar orqali ketadi: kod telefonga SMS yoki
 * tasdiqlangan manzilga xat bo'lib boradi.
 *
 * Birinchi qadam hisob bor-yo'qligini AYTMAYDI — noma'lum qiymat ham kod
 * qadamiga o'tadi. Aks holda bu forma «bu odam tizimda bormi?» degan
 * savolga javob beradigan ochiq vositaga aylanardi.
 */
export function ForgotPasswordCard({ onBack }: { onBack: () => void }) {
  const { t, m } = useT();
  const [requestCode, { isLoading: isSending }] = useForgotPasswordMutation();
  const [confirm, { isLoading: isConfirming }] = useConfirmForgotPasswordMutation();

  const [identifier, setIdentifier] = useState('');
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hint, setHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      const result = await requestCode({ identifier: identifier.trim() }).unwrap();
      setHint(result.demo_code ?? null);
      setSent(true);
    } catch (sendError) {
      setError(getApiErrorMessage(sendError, m.forgot.sendFailed));
    }
  }

  async function handleConfirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(m.forgot.mismatch);
      return;
    }

    try {
      await confirm({
        identifier: identifier.trim(),
        code: code.trim(),
        new_password: password,
      }).unwrap();
      setDone(true);
    } catch (confirmError) {
      setError(getApiErrorMessage(confirmError, m.forgot.submitFailed));
    }
  }

  if (done) {
    return (
      <div>
        <CheckCircle2 className="size-8 text-success" strokeWidth={1.75} />
        <h1 className="mt-3 text-xl font-semibold text-fg">{m.forgot.doneTitle}</h1>
        <p className="mt-2 text-sm text-fg-muted">{m.forgot.doneSubtitle}</p>

        <Button size="lg" className="mt-6 w-full" onClick={onBack}>
          {m.forgot.doneAction}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-fg">{m.forgot.title}</h1>
      <p className="mt-2 text-sm text-fg-muted">
        {sent ? m.forgot.subtitleCode : m.forgot.subtitleStart}
      </p>

      {sent ? (
        <form onSubmit={handleConfirm} className="mt-6 flex flex-col gap-4">
          <TextField
            label={m.forgot.code}
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            maxLength={8}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            hint={
              /* Yetkazish ulanmaganda backend kodni javobda qaytaradi.
                 Provayder ulangach bu maslahat o'z-o'zidan yo'qoladi. */
              hint ? t((x) => x.forgot.demoHint, { code: hint }) : undefined
            }
          />

          <TextField
            label={m.forgot.newPassword}
            type="password"
            required
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            hint={m.forgot.passwordHint}
          />

          <TextField
            label={m.forgot.repeatPassword}
            type="password"
            required
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />

          {error && (
            <p
              role="alert"
              className="rounded-control border border-danger/25 bg-danger/10 px-3.5 py-2.5 text-sm text-danger"
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={isConfirming}
            className="mt-1 w-full"
            icon={isConfirming ? <Loader2 className="size-4 animate-spin" /> : undefined}
          >
            {isConfirming ? m.forgot.submitting : m.forgot.submit}
          </Button>

          <button
            type="button"
            onClick={() => {
              setSent(false);
              setError(null);
            }}
            className="inline-flex items-center justify-center gap-1.5 text-sm text-fg-muted transition-colors hover:text-fg"
          >
            <ArrowLeft className="size-4" strokeWidth={1.75} />
            {m.forgot.changeAccount}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSend} className="mt-6 flex flex-col gap-4">
          <TextField
            label={m.forgot.identifier}
            required
            autoComplete="username"
            placeholder="+998901234567"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
          />

          {error && (
            <p
              role="alert"
              className="rounded-control border border-danger/25 bg-danger/10 px-3.5 py-2.5 text-sm text-danger"
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={isSending}
            className="mt-1 w-full"
            icon={isSending ? <Loader2 className="size-4 animate-spin" /> : undefined}
          >
            {isSending ? m.forgot.sending : m.forgot.sendCode}
          </Button>

          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center justify-center gap-1.5 text-sm text-fg-muted transition-colors hover:text-fg"
          >
            <ArrowLeft className="size-4" strokeWidth={1.75} />
            {m.forgot.backToLogin}
          </button>
        </form>
      )}
    </div>
  );
}
