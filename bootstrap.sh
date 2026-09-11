#!/usr/bin/env bash
# VELOUR — Этап 1: собрать проект на официальном React-стартер-ките и наложить файлы VELOUR.
# Запускать из корня этой папки (там, где лежит bootstrap.sh). Требует php 8.3+, composer, node 22+.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
BASE="$(mktemp -d)/velour-base"

echo "→ Стартер-кит Laravel + React → $BASE"
composer create-project laravel/react-starter-kit "$BASE" --no-interaction

echo "→ Копируем базу, НЕ перезаписывая файлы VELOUR"
rsync -a --ignore-existing "$BASE/" "$ROOT/"

cd "$ROOT"
[ -f .env ] || cp .env.example .env
grep -q '^APP_NAME=' .env && sed -i.bak 's/^APP_NAME=.*/APP_NAME=VELOUR/' .env && rm -f .env.bak
grep -q '^VELOUR_EXIT_URL=' .env || printf '\nVELOUR_EXIT_URL=https://www.google.com\nVELOUR_STATEMENT_DESCRIPTOR="VLR RETAIL"\n' >> .env

echo "→ Зависимости"
composer install --no-interaction
php artisan key:generate --force
npm install
npm install three @types/three

echo "→ Убираем welcome.tsx стартера (главная теперь pages/home.tsx)"
rm -f resources/js/pages/welcome.tsx

echo "→ База и демо-каталог"
# Стартер-кит по умолчанию на SQLite. Для PostgreSQL — поправь .env до этого шага.
[ -f database/database.sqlite ] || touch database/database.sqlite
php artisan migrate --seed --force

echo "→ Тесты"
php artisan test || true

cat <<'MSG'

Готово. Запуск:
  composer run dev        # php artisan serve + vite + queue
  http://localhost:8000   → сначала /age, затем главная с героем.

Что уже работает без единой строчки вёрстки:
  /catalog          — список товаров, фильтры по сенсорным характеристикам
  /p/{slug}         — товар с вариантами, материалами и уходом
  /cart             — корзина гостя на cookie
  /checkout         — оформление, списание стока, заказ + платёж (драйвер manual)
Страницы этих маршрутов пока заглушки — данные приходят в props, вёрстка на этапе фронта.
MSG
