import { Check, KeyRound, Loader2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextField } from '@/components/ui/Field';
import { useChangePasswordMutation, useLoginMethodsQuery } from '@/features/auth/authApi';
import { getApiErrorMessage } from '@/shared/api';

/**
 * Paneldagi «parolni o'zgartirish».
 *
 * Ilgari bu yerda «parolni saytning o'z kabinetidan o'zgartiring» degan
 * yozuv turardi — panelga kirgan xodimni boshqa domenga jo'natardi va
 * u yerda yana kirish so'ralardi.
 *
 * Ikki holat, bitta forma: paroli BOR hisob eskisini yozadi, paroli
 * YO'Q hisob (Google yoki SMS kodi orqali ochilgani) esa birinchisini
 * qo'yadi. Qaysi holat ekani serverdan o'qiladi — hisob qanday
 * ochilganini faqat backend biladi.
 */
export function ChangePasswordCard() {
  const { data } = useLoginMethodsQuery();
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  /* Javob kelgunicha parol bor deb hisoblaymiz: keyin maydonni
     YO'QOTISH uni keraksiz joyda ko'rsatishdan kam chalg'itadi. */
  const hasPassword = data?.has_password ?? true;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setDone(false);

    if (password !== confirmPassword) {
      setError('Parollar mos kelmadi.');
      return;
    }

    try {
      await changePassword({
        // Paroli yo'q hisob uchun maydon UMUMAN yuborilmaydi — bo'sh
        // qator ham "eski parol" deb tekshirilardi va rad etilardi.
        ...(hasPassword ? { old_password: oldPassword } : {}),
        new_password: password,
        new_password_confirm: confirmPassword,
      }).unwrap();
    } catch (changeError) {
      setError(getApiErrorMessage(changeError, "Parolni o'zgartirib bo'lmadi."));
      return;
    }

    setOldPassword('');
    setPassword('');
    setConfirmPassword('');
    setDone(true);
  }

  return (
    <Card className="p-6">
      <h2 className="flex items-center gap-2 text-base font-semibold text-fg">
        <KeyRound className="size-4 text-primary" strokeWidth={1.75} />
        {hasPassword ? "Parolni o'zgartirish" : "Parol qo'yish"}
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-fg-muted">
        {hasPassword
          ? 'Hisob bitta — yangi parol saytda ham, panelda ham ishlaydi.'
          : "Hisobingiz parolsiz ochilgan. Parol qo'ysangiz, panelga u bilan ham kira olasiz."}
      </p>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
        {hasPassword && (
          <TextField
            label="Joriy parol"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={oldPassword}
            onChange={(event) => setOldPassword(event.target.value)}
          />
        )}

        <TextField
          label="Yangi parol"
          type="password"
          required
          autoComplete="new-password"
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          hint="Kamida 8 ta belgi, harf va raqam."
        />

        <TextField
          label="Yangi parolni takrorlang"
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

        {done && (
          <p className="flex items-center gap-2 rounded-control border border-success/25 bg-success/10 px-3.5 py-2.5 text-sm text-success">
            <Check className="size-4" strokeWidth={2} />
            Parol yangilandi.
          </p>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="self-start"
          icon={isLoading ? <Loader2 className="size-4 animate-spin" /> : undefined}
        >
          {isLoading ? 'Saqlanmoqda…' : 'Saqlash'}
        </Button>
      </form>
    </Card>
  );
}
