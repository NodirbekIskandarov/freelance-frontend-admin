import { Loader2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router';

import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import { useLoginMutation } from '@/features/auth/authApi';
import { getApiErrorMessage } from '@/shared/api';
import { tokenStore } from '@/store/api';

export function LoginPage() {
  const navigate = useNavigate();
  const [login, { isLoading, error }] = useLoginMutation();

  const [phone, setPhone] = useState('+998');
  const [password, setPassword] = useState('');

  // Kirgan foydalanuvchi login sahifasida qolib ketmasin.
  if (tokenStore.getAccessToken()) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await login({ phone: phone.trim(), password }).unwrap();
    } catch {
      // Xato quyida `error` orqali ko'rsatiladi; forma to'ldirilgancha qoladi.
      return;
    }

    void navigate('/dashboard', { replace: true });
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-canvas px-6">
      <div className="w-full max-w-sm rounded-card border border-line bg-card p-8 shadow-card">
        <h1 className="text-xl font-semibold text-fg">Admin panelga kirish</h1>
        <p className="mt-2 text-sm text-fg-muted">
          Moderatsiya bo&apos;limlari faqat admin va moderatorlar uchun ochiq.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <TextField
            label="Telefon raqam"
            type="tel"
            required
            autoComplete="username"
            placeholder="+998901234567"
            maxLength={13}
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
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
        </form>
      </div>
    </div>
  );
}
