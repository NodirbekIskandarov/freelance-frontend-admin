#!/usr/bin/env bash
# GitHub Actions ishlamay qolganda (billing bloki va h.k.) zaxira deploy yo'li.
# Serverda cron orqali ishlaydi: origin/main da yangi commit bo'lsa tortib oladi,
# konteynerni qayta quradi va natijani Telegram'ga yuboradi.
#
# O'rnatish README dagi "Zaxira deploy (cron)" bo'limida.
# Telegram tokeni bu faylda EMAS — /etc/yopamiz-admin-deploy.env dan o'qiladi.
set -euo pipefail

REPO_DIR="${REPO_DIR:-/var/www/yopamiz-front/freelance-frontend-admin}"
BRANCH="${BRANCH:-main}"
ENV_FILE="${ENV_FILE:-/etc/yopamiz-admin-deploy.env}"
LOG_FILE="${LOG_FILE:-/var/log/yopamiz-admin-deploy.log}"
LOCK_FILE="${LOCK_FILE:-/var/lock/yopamiz-admin-deploy.lock}"

# Oldingi deploy tugamagan bo'lsa, ustidan yangisini boshlamaymiz.
exec 9>"$LOCK_FILE"
flock -n 9 || exit 0

# TG_TOKEN / TG_CHAT / TG_THREAD shu yerdan keladi. Fayl bo'lmasa skript
# baribir deploy qiladi, faqat xabar yubormaydi.
# shellcheck source=/dev/null
[ -f "$ENV_FILE" ] && . "$ENV_FILE"

html_escape() { sed -e 's/&/\&amp;/g' -e 's/</\&lt;/g' -e 's/>/\&gt;/g'; }

notify() {
  [ -n "${TG_TOKEN:-}" ] && [ -n "${TG_CHAT:-}" ] || return 0
  local args=(--silent --show-error --max-time 20
    -X POST "https://api.telegram.org/bot${TG_TOKEN}/sendMessage"
    -d chat_id="${TG_CHAT}"
    -d parse_mode="HTML"
    -d disable_web_page_preview="true"
    --data-urlencode "text=$1")
  # Thread (forum mavzusi) id berilgan bo'lsagina qo'shiladi.
  if [ -n "${TG_THREAD:-}" ]; then
    args+=(-d message_thread_id="${TG_THREAD}")
  fi
  curl "${args[@]}" >/dev/null || true
}

deploy() {
  # `&&` zanjiri: birinchi xatoda to'xtaydi (funksiya `if` ichida chaqirilgani
  # uchun `set -e` bu yerda ishlamaydi).
  git merge --ff-only "origin/$BRANCH" \
    && docker compose -f docker-compose.prod.yml up -d --build \
    && docker image prune -f
}

cd "$REPO_DIR"

git fetch --quiet origin "$BRANCH"
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse "origin/$BRANCH")

# Yangilik yo'q — jim chiqamiz (cron har necha daqiqada ishlaydi).
[ "$LOCAL" = "$REMOTE" ] && exit 0

SUBJECT=$(git log -1 --pretty=%s "$REMOTE" | html_escape)
AUTHOR=$(git log -1 --pretty=%an "$REMOTE" | html_escape)
SHORT=$(git rev-parse --short "$REMOTE")

printf '\n=== %s  deploy %s -> %s\n' "$(date '+%F %T')" "${LOCAL:0:7}" "$SHORT" >>"$LOG_FILE"

OUT=$(mktemp)
trap 'rm -f "$OUT"' EXIT

if deploy >"$OUT" 2>&1; then
  cat "$OUT" >>"$LOG_FILE"
  notify "$(printf '✅ <b>Admin deploy muvaffaqiyatli yakunlandi</b>\n\n<b>Server:</b> cron (Actions o'\''rniga)\n<b>Branch:</b> %s\n<b>Commit:</b> <code>%s</code>\n<b>Xabar:</b> %s\n<b>Muallif:</b> %s' \
    "$BRANCH" "$SHORT" "$SUBJECT" "$AUTHOR")"
else
  cat "$OUT" >>"$LOG_FILE"
  # Telegram xabari 4096 belgidan oshmasligi uchun oxirgi qismini olamiz.
  TAIL=$(tail -c 1200 "$OUT" | html_escape)
  notify "$(printf '❌ <b>Admin deploy xatolik bilan tugadi</b>\n\n<b>Server:</b> cron (Actions o'\''rniga)\n<b>Branch:</b> %s\n<b>Commit:</b> <code>%s</code>\n<b>Xabar:</b> %s\n\n<pre>%s</pre>\n\nTo'\''liq log: <code>%s</code>' \
    "$BRANCH" "$SHORT" "$SUBJECT" "$TAIL" "$LOG_FILE")"
  exit 1
fi
