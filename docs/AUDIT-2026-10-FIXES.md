# Исправления по аудиту 25.10.2026 — что сделано и как выкатить

Платёж (К1) и значки оплаты (В17) сознательно не трогали — будут вместе с подключением провайдера.

## Выкатка на прод

```bash
php artisan down
git pull origin main
composer install --no-dev --optimize-autoloader
npm ci && npm run build            # новые пакеты: @fontsource/* (шрифты со своего домена)
php artisan migrate --force        # новых миграций нет, команда безопасна
php artisan storage:link           # если ещё не сделано

# 1) Перенести фото с cdn.shopify.com к себе и ужать в WebP (нужен GD с WebP)
php artisan velour:media-localize --max=1600

# 2) Почистить каталог: бренд, материалы, тексты, характеристики, мерч, discreet-флаги
php artisan velour:catalog-clean

php artisan optimize:clear && php artisan optimize
php artisan queue:restart
php artisan up
```

Обе команды идемпотентны — можно запускать повторно. `catalog:import` теперь сам вызывает чистку.

## .env — новые переменные (необязательные)

```env
COMPANY_PHONE=""
COMPANY_VAT_NUMBER=""            # появится в legal notice и в PDF-инвойсе
COMPANY_RETURNS_ADDRESS=""       # адрес для возвратов; пусто — сообщаем по запросу
VELOUR_VAT_NOTE="incl. VAT"      # пометка у цен; пусто — не показывать
VELOUR_DISPATCH_DAYS="1–2"
VELOUR_CSP=true                  # CSP в production; при проблемах — false
VELOUR_CSP_EXTRA=""              # домены платёжного провайдера, когда подключите
```

Страны доставки и сроки — `config/velour.php → shipping.countries` (сейчас LV, LT, EE, FI, PL, DE, FR, NL, SE; GB и US убраны из-за таможни).

## nginx: сжатие статики (В13)

```nginx
gzip on;
gzip_comp_level 5;
gzip_min_length 1024;
gzip_vary on;
gzip_types text/css application/javascript application/json image/svg+xml font/woff2;

location /build/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Что осталось за владельцем

- Описания для 52 товаров, у которых у производителя текста нет (после чистки у них нет подзаголовка и блока Details).
- Значок «Body-safe» включается вручную (`products.is_body_safe`), только при документах производителя.
- Юридические тексты (Terms, Privacy, Returns, Delivery, Legal notice) — проверка юристом: UK-компания продаёт в ЕС (НДС/OSS/IOSS).
- Права на фото и тексты SVAKOM / Kaotik Labs — договор дистрибуции.
- Индексация поисковиками: сейчас Googlebot видит только /age и юридические страницы — решение о SSR/открытии страниц.
- Удалить тестовый заказ аудита (VLR-2026-000004).
