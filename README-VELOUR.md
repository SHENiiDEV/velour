# VELOUR — Этап 1

Файлы в этой папке — **overlay** поверх официального стартер-кита `laravel/react-starter-kit`.
Composer/Packagist недоступен из среды Claude, поэтому сборку базы выполняешь ты:

```bash
cd ~/sex-shop
chmod +x bootstrap.sh && ./bootstrap.sh
composer run dev
```

Скрипт ставит стартер во временную папку, копирует его сюда **не перезаписывая** файлы VELOUR
(`rsync --ignore-existing`), ставит `three`, удаляет `welcome.tsx`, гоняет Pest-тесты age-gate.

## Что здесь лежит

| Файл | Зачем |
|---|---|
| `docs/ARCHITECTURE.md` | Роадмап, схема БД, структура фронта, подводные камни |
| `app/Http/Middleware/EnsureAgeVerified.php` | Age-gate: зашифрованная cookie, исключения для /age и legal |
| `app/Http/Controllers/AgeGateController.php` | Показ / подтверждение / отказ |
| `app/Http/Controllers/DiscreetModeController.php` | Cookie скрытного режима |
| `app/Http/Middleware/HandleInertiaRequests.php` | Shared props: `privacy.{discreet, ageVerified, exitUrl}` |
| `config/velour.php` | exit_url, statement_descriptor, discreet packaging |
| `bootstrap/app.php` | Регистрация middleware (Inertia → AgeGate) |
| `routes/web.php` | `/`, `/age`, `/discreet`, `/privacy`, `/terms` |
| `resources/views/app.blade.php` | Шрифты Cormorant Garamond + Jost, dark, RTA-метка |
| `resources/css/app.css` | Токены в `@theme`, зерно, виньетка, вуаль скрытного режима |
| `resources/js/lib/velour.ts` | Палитра для шейдера, `usePrivacy`, `quickExit` |
| `resources/js/types/velour.d.ts` | Типы shared props |
| `resources/js/layouts/velour-layout.tsx` | Header / Footer / нейтральный title в скрытном режиме |
| `resources/js/components/velour/CinematicHero.tsx` | three.js шейдер «текучий шёлк» + letterbox + зерно + kinetic-заголовок |
| `resources/js/components/velour/{Header,Footer,Wordmark,DiscreetToggle,QuickExit}.tsx` | Оболочка |
| `resources/js/pages/{home,age-gate,legal/*}.tsx` | Страницы этапа 1 |
| `tests/Feature/AgeGateTest.php` | 6 Pest-тестов на age-gate и скрытный режим |

## Если стартер-кит отличается

- Нет `tailwindcss-animate` → удали строку `@plugin 'tailwindcss-animate';` в `app.css`.
- Стартер использует свой `HandleInertiaRequests` с `sidebarOpen`/`quote` — наш файл его заменяет; если нужны auth-страницы стартера, они продолжат работать (`auth`, `name` мы отдаём).
- `routes/auth.php` и `routes/settings.php` подключаются автоматически, если существуют.
