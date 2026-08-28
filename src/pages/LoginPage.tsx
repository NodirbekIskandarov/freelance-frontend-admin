import { Loader2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router';

import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import { useLoginMutation } from '@/features/auth/authApi';
import { getApiErrorMessage } from '@/shared/api';
import { tokenStore } from '@/store/api';

import { ForgotPasswordCard } from './ForgotPasswordCard';

export function LoginPage() {
  const navigate = useNavigate();
  const [login, { isLoading, error }] = useLoginMutation();

  /*
   * Bitta maydon — telefon ham, email ham. Panel xodimi hisobi saytdagi
   * hisobning o'zi va u email bilan ochilgan bo'lishi mumkin: faqat
   * telefonni qabul qilgan maydon bunday odamni paneldan tashqarida
   * qoldirardi.
   */
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  // Kirgan foydalanuvchi login sahifasida qolib ketmasin.
  if (tokenStore.getAccessToken()) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await login({ identifier: identifier.trim(), password }).unwrap();
    } catch {
      // Xato quyida `error` orqali ko'rsatiladi; forma to'ldirilgancha qoladi.
      return;
    }

    void navigate('/dashboard', { replace: true });
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-canvas px-6">
      <div className="w-full max-w-sm rounded-card border border-line bg-card p-8 shadow-card">
        {resetting ? (
          <ForgotPasswordCard onBack={() => setResetting(false)} />
        ) : (
          <>
            <h1 className="text-xl font-semibold text-fg">Admin panelga kirish</h1>
            <p className="mt-2 text-sm text-fg-muted">
              Moderatsiya bo&apos;limlari faqat admin va moderatorlar uchun ochiq.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <TextField
                label="Telefon raqam yoki email"
                required
                autoComplete="username"
                placeholder="+998901234567"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
              />

              <TextField
                label="Parol"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />

              {error && (
                <p
                  role="alert"
                  className="rounded-control border border-danger/25 bg-danger/10 px-3.5 py-2.5 text-sm text-danger"
                >
                  {getApiErrorMessage(error, "Kirish amalga oshmadi. Ma'lumotlarni tekshiring.")}
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                className="mt-1 w-full"
                icon={isLoading ? <Loader2 className="size-4 animate-spin" /> : undefined}
              >
                {isLoading ? 'Kirilmoqda…' : 'Kirish'}
              </Button>

              {/* Ilgari parolni unutgan xodim uchun yo'l umuman yo'q edi. */}
              <button
                type="button"
                onClick={() => setResetting(true)}
                className="text-sm text-fg-muted transition-colors hover:text-fg"
              >
                Parolni unutdingizmi?
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
