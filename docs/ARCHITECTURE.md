# VELOUR — архитектура MVP

## 1. Роадмап

| Этап | Что | Результат |
|---|---|---|
| **1. Фундамент** | Стартер-кит, токены, layout, age-gate, скрытный режим, кинематографичный герой | Открывается главная с героем, гость проходит 18+ |
| **2. Каталог (данные)** | Миграции `categories / products / variants / media / attribute_definitions`, сидеры, Policies, админ-CRUD (минимум) | Наполняемая витрина |
| **3. Витрина** | `/catalog`, `/catalog/{category}`, `/p/{slug}` — фильтры по сенсорным атрибутам, галерея с blur в скрытном режиме | «Тихая роскошь» |
| **4. Корзина** | `carts / cart_items`, cookie-токен для гостя, merge при логине, мини-корзина | Работает без регистрации |
| **5. Checkout и заказ** | `orders / order_items / addresses`, анонимная упаковка, нейтральный дескриптор в выписке, статусы, письма | Первый заказ |
| **6. Платежи** | Провайдер с adult-разрешением (см. подводные камни), webhooks, идемпотентность | Оплата картой |
| **7. Полировка** | SEO (noindex для 18+ по необходимости), быстрый выход, аналитика без PII, тесты Pest, перф | Релиз |

Не идём к следующему этапу без «ок».

## 2. Схема БД

```
categories        id, parent_id?, slug, name, description, position, is_visible
products          id, category_id, slug, name, tagline, description(md), story(md),
                  materials(json), care(md), attributes(json — сенсорные),
                  price_cents, currency, status(draft|live|archived),
                  is_body_safe(bool), published_at, timestamps, softDeletes
variants          id, product_id, sku, name (цвет/размер/интенсивность), options(json),
                  price_cents?, stock, weight_g, is_default
attribute_definitions
                  id, key (texture|firmness|temperature|noise|intensity…),
                  label, type(scale|enum|bool), scale(json: 1..5 + подписи), position
product_attribute  (опц. индекс для фильтров) product_id, key, value_numeric, value_text
media             id, mediable_type/id, disk, path, alt, kind(image|video|poster),
                  is_discreet_safe(bool), position, meta(json: w/h/blurhash)
carts             id, user_id?, token(uuid, cookie), currency, expires_at
cart_items        id, cart_id, variant_id, qty, unit_price_cents (снимок)
orders            id, user_id?, number, email, status, currency,
                  subtotal/discount/shipping/tax/total_cents,
                  is_discreet_packaging(bool, по умолч. true),
                  statement_descriptor(string, нейтральное имя),
                  shipping_address(json), notes, placed_at, paid_at
order_items       id, order_id, variant_id, name_snapshot, sku_snapshot, qty, unit_price_cents
payments          id, order_id, provider, provider_ref, status, amount_cents, payload(json)
```

Связи: `Category 1—n Product 1—n Variant`; `Media` полиморфна (Product/Variant/Category); `Cart 1—n CartItem → Variant`; `Order 1—n OrderItem`, `Order 1—n Payment`. Сенсорные характеристики хранятся в `products.attributes` (json) и валидируются по `attribute_definitions` — гибко и без миграций на каждый новый атрибут.

## 3. Структура фронта

```
resources/js/
  app.tsx                         — точка входа Inertia (из стартер-кита)
  layouts/velour-layout.tsx       — обёртка: Header, Footer, скрытный режим, быстрый выход
  pages/
    home.tsx                      — герой (кинематограф) + тихие секции
    age-gate.tsx                  — 18+
    catalog/index.tsx, catalog/show.tsx, product/show.tsx
    cart/index.tsx, checkout/index.tsx, checkout/success.tsx
  components/velour/
    CinematicHero.tsx             — canvas + шейдер «текучий шёлк»
    Header.tsx, Footer.tsx, DiscreetToggle.tsx, QuickExit.tsx
    Wordmark.tsx
  lib/velour.ts                   — утилиты (discreet, prefers-reduced-motion)
  types/velour.d.ts               — типы shared props и моделей
resources/css/app.css             — токены (@theme) + базовые стили
```

Токены живут в одном месте — `resources/css/app.css` (`@theme` Tailwind v4 → CSS-переменные и утилиты `bg-void`, `text-ivory`, `font-display`). Шейдер читает те же значения.

## 4. Приватность как архитектура

- **Age-gate** — `EnsureAgeVerified` middleware в группе `web`, зашифрованная cookie `velour_age` (365 дней). Исключения: `/age`, `/privacy`, `/terms`, health-check.
- **Скрытный режим** — cookie `velour_discreet` (1|0), пробрасывается через `HandleInertiaRequests::share()` в `discreet: boolean`. Компоненты изображений применяют blur, header — нейтральный. Переключение — `POST /discreet`.
- **Быстрый выход** — кнопка/Esc×2 → `location.replace()` на нейтральный сайт + `history.replaceState`.
- **Заказ** — `is_discreet_packaging` по умолчанию `true`, `statement_descriptor` нейтральное.
- **Аналитика** — только агрегаты, без PII, без пикселей соцсетей (см. ниже).

## 5. Подводные камни

- **Платежи.** Stripe, PayPal, Apple Pay/Google Pay в большинстве регионов запрещают или ограничивают adult. Нужен провайдер с high-risk/adult вертикалью (CCBill, Segpay, Epoch, Verotel; в ЕС — местные эквайеры по договору). Закладываем `payments.provider` абстрактно — интерфейс `PaymentGateway` с драйверами.
- **Реклама.** Google Ads / Meta почти закрыты для категории. Каналы: SEO, контент, партнёрки, email. Не ставим пиксели соцсетей — и приватность, и без пользы.
- **18+ по юрисдикции.** В ряде стран/штатов (UK Online Safety Act, US-штаты) требуется реальная верификация возраста, а не клик. Cookie-gate — базовый уровень; предусматриваем `age_verification_provider` как расширение middleware.
- **Хостинг/CDN/почта.** Часть провайдеров (некоторые тарифы CDN, email-рассылки) отказывают adult — проверить ToS до релиза.
