# ROLE

You are a senior art director and front-end engineer working inside an existing, well-built
codebase: **VELOUR** — a boutique adult-products store (Laravel 12 · Inertia 2 · React 19 ·
TypeScript · Tailwind 4 CSS-first · three.js · Vite 6).

Your task: rebuild the landing page `/` so that a first-time visitor stops for a second before
they scroll. Dark, expensive, restrained, unmistakably crafted by a person. All visible copy in
**English**.

You are extending a design system that already exists and is good. Do not restyle it. Raise it.

# TONE — NON-NEGOTIABLE

Quiet luxury. Air, few words, one gesture at a time. Desire is expressed through **material,
temperature, weight and light** — never through anatomy, innuendo, or a wink.

- No exclamation marks. No "spice up your night", no "pleasure redefined", no puns.
- If a line could run in an Aesop or Céline campaign, keep it. If it could run on a mainstream
  sex-shop banner, delete it.
- The product is never described by what it does to a body. It is described by what it is made of
  and how it behaves: cool, warm, heavy, matte, seamless, silent.
- Adult, never explicit. This must be safe to open on a laptop in a café.

Reference feel: the opening titles of a well-shot film; a perfume counter at night; matte black
paper with a single gold foil line. **Not** neon, not gradients-as-decoration, not glassmorphism.

# REPO MAP — TRUST THIS, DON'T REDISCOVER

**Landing page** — `resources/js/pages/home.tsx` (100 lines). Currently: hero, 3 featured
products, category list, 3 brand pillars. All copy is Russian.

**Props delivered to it** by `app/Http/Controllers/HomeController.php`:

```ts
featured: { data: ProductCard[] }   // ProductCardResource::collection, LIMIT 3, is_featured desc
categories: Array<{ slug, name, tagline }>  // Category::visible(), ordered by position, 3 rows
```

`ProductCard` (see `resources/js/types/catalog.d.ts`):
`{ id, slug, name, tagline, priceFromCents, currency, inStock, isBodySafe, cover: MediaProps|null }`.
If you need more data on the landing, extend `HomeController` **and** the TS types together —
props are the only data channel (no fetch calls from components).

**Design tokens** — `resources/css/app.css`, `@theme` block. Use these names, never raw hex in TSX
(the only exception is the shader palette in `resources/js/lib/velour.ts`, which must stay in sync):

| Token | Value | Use |
|---|---|---|
| `void` | `#100A0C` | page background |
| `surface` / `graphite` | `#1A1216` / `#231A1F` | frames, fills |
| `wine` | `#4E1224` | the only saturated field (mobile curtain, accents) |
| `rose` | `#C24D59` | warmth in light, never as text |
| `gold` / `gold-2` | `#C6A15B` / `#E6CB88` | one hairline, one thread, one button fill |
| `ivory` | `#ECE3D6` | primary text |
| `mute` | `#9E8E88` | secondary text |

Type: `font-display` = Cormorant Garamond (light, italic available), `font-sans` = Jost 300/400/500.
Scale: `text-cine-xl` = `clamp(4.5rem, 14vw, 13.75rem)`, `text-cine-lg` = `clamp(3rem, 8vw, 7.5rem)`.
Easing: `--ease-cine` = `cubic-bezier(0.16, 1, 0.3, 1)` — use it for everything slow.
Radius is `0.125rem` — corners are effectively sharp. Keep them sharp.
Layout rhythm: horizontal padding is always `px-[6vw]`; vertical section rhythm is `pt-32` / `py-32`.

**Existing CSS utilities you must reuse rather than reinvent** (`app.css`, `@layer components`):
`.film-grain`, `.vignette`, `.hairline`, `.sheen`, `.cursor-glow` (reads `--mx`/`--my`), `.breathe`,
`.thread`, `.btn-gold`, `.stagger` (children rise by `--i`), `.scale-dot`, `.curtain`,
`.discreet-veil`, and the `animate-rise` / `animate-veil` keyframes.

**Existing components** — `resources/js/components/velour/`: `CinematicHero` (three.js liquid-silk
shader + letterbox + grain + kinetic headline), `ProductCard`, `Veil` (blurs media in discreet
mode), `SensoryScale` (five dots + a word, never a progress bar), `Header`, `Footer`, `Wordmark`,
`DiscreetToggle`, `QuickExit`, `Toast`, `Filters`, `Field`, `QtyStepper`, `CartSummary`.
Layout: `resources/js/layouts/velour-layout.tsx`.

**Privacy machinery that the landing must respect** (it is the product's differentiator, not a
setting): age gate via `EnsureAgeVerified` + encrypted `velour_age` cookie; discreet mode via
`velour_discreet` cookie shared as `privacy.discreet` (blurs frames, retitles the tab to `V.`,
drops shader intensity to 0.45); quick exit (double-Esc → `history.replaceState` + redirect).

**Catalog reality** — 3 categories (`objects`, `silk`, `rituals`) and 6 products, seeded by
`database/seeders/CatalogSeeder.php` with `updateOrCreate` keyed on slug. Current names are Russian;
translate them in place, keeping the slugs:

| slug | now | → | material |
|---|---|---|---|
| `oniks` | Оникс | Onyx | borosilicate glass, holds cool |
| `velvet` | Вельвет | Velvet | matte medical silicone, warms fast |
| `latun` | Латунь | Brass | polished weight |
| `lenta` | Лента | Ribbon | silk-satin, six metres |
| `cas` | Час | Hour | candle that becomes oil |
| `voda` | Вода | Water | water-based, glycerin-free |


**There is no photography anywhere in the repo.** Product media rows point at external
`placehold.co` URLs with the product name burned into the image (`CatalogSeeder.php:170-179`), and
`public/storage` does not exist. The landing must look finished *without* photographs.

# FOUR VERIFIED PROBLEMS TO FIX ALONG THE WAY

1. **The landing ships 130 kB gzip of JavaScript before it can paint.** `three` is statically
   imported by `CinematicHero.tsx`, so it lands in the `home` chunk: `public/build/assets/home-*.js`
   is 512 kB raw / **130 kB gzip**, on top of a 107 kB gzip app shell. The most beautiful page in
   the world is worthless if the first second is blank. Fix: `await import('three')` inside the
   effect, paint a CSS fallback field immediately, cross-fade the canvas in when it is ready.
2. **External placeholder images with text labels are the ugliest thing on the page.** Replace them
   with locally generated material fields (CSS/SVG gradients derived from each product's material),
   so nothing loads from a third party and nothing says "placehold.co". Update the seeder's media
   block; note it is guarded by `if ($product->media()->count() === 0)`, so delete existing media
   rows or switch it to `updateOrCreate` when you re-seed.
3. **There is no global focus ring, and `text-mute/70` fails WCAG AA.** Add
   `:focus-visible { outline: 1px solid var(--color-gold); outline-offset: 3px }` in `@layer base`.
   `mute` on `void` is 6.5:1 at full opacity but ~3.9:1 at 70% — never take readable copy below
   full-opacity `mute`.
4. **Test-factory garbage is on the landing page right now.** `database/database.sqlite` holds a
   leftover category `Dolor` (slug `dolor-K7rR`) with `position = 0`, so it sorts **first** and is
   currently the opening door in Act III, plus a live product `Voluptatum` (slug `voluptatum-u3Bk9`)
   with no media row. Delete both from the dev database, and make the factories used by
   `tests/Feature/*` write to a separate database or clean up after themselves so this cannot recur.


# DESIGN LAW — INHERITED, KEEP

From `docs/FRONTEND.md`, the rules this codebase has held to. Do not break them:

- Two registers only: the hero is cinema, everything else is quiet luxury — air, one or two lines,
  one frame.
- Tokens only from `@theme`. No hex in TSX.
- Forbidden: tracked-out ALL-CAPS eyebrows, arrows inside buttons, `01/02/03` section numbering,
  grey drop-shadow cards, stock-photo energy.
- Not one explicit image or word.
- `prefers-reduced-motion` must switch the whole page to stillness in one place, as it does today.

# THE ONE AMENDMENT YOU ARE ALLOWED

`docs/FRONTEND.md` currently states that every animation is a response to an action and **none** is
triggered by scroll. To get the intended "film begins" effect you may introduce **exactly one**
scroll-linked mechanic: the black letterbox bars in the hero retract as the viewer scrolls out of
it, and the hero headline drifts up at half speed behind them. One mechanic, one place.

Implement it with CSS `animation-timeline: view()` / `scroll()` where supported, falling back to a
single passive `scroll` listener writing one CSS custom property. No scroll-jacking, no pinned
sections, no reveal-on-scroll for text — content must be present and readable with JS disabled.

Then **edit `docs/FRONTEND.md`** to record the amendment and why. Do not leave the documented law
silently contradicted by the code.

# PAGE ARCHITECTURE

Nine acts. Each act does exactly one thing and then gets out of the way. Vertical rhythm stays
`py-32`; hairlines (`.hairline`) separate acts where a border would be too loud.

### Act 0 — `/age` is the real first impression

`resources/js/pages/age-gate.tsx` is what a visitor actually sees first, and today it is a plain
centred form with no shader. Give it the same hand: the WebGL field at low intensity (or the CSS
fallback field), the wordmark, one question, two answers, nothing else. Translate it to English.
It must feel like the door of the building, not a compliance checkbox.

### Act I — Cold open (rework `CinematicHero`)

Keep the liquid-silk shader; make it earn the bytes.

- Lazy-load `three` (problem 1). Before it resolves, render a CSS field: a wide radial of `wine`
  into `void` with a `rose` bloom off-centre, plus `.film-grain` and `.vignette`. On ready,
  cross-fade the canvas over ~700ms with `animate-veil`. The fallback must look deliberate — a
  visitor without WebGL should never see a flat rectangle.
- Add a `uBloom` uniform, eased toward 1 while the primary CTA is hovered or focused: the silk
  warms up as the hand approaches the door. Ease it in the render loop, never per-event.
- Keep the pointer parallax, the `IntersectionObserver` pause, the `document.hidden` pause, the
  pixel-ratio cap at 1.5, and the `try/catch` around renderer construction. Dispose geometry too,
  not just material and renderer.
- Headline: per-glyph entrance, not per-line. Each glyph rises out of an `overflow-hidden` mask
  with a ~14ms stagger, one word at a time so it reads as breath rather than a typewriter. Wrap
  the full text in a visually-hidden `<span>` (or set `aria-label` on the `h1`) so assistive tech
  and search engines get one clean string, and mark the split glyphs `aria-hidden`.
- The scroll cue stays a single hairline thread. Let it fade out once the viewer has scrolled.
- Letterbox bars: the one scroll-linked mechanic (see amendment above).

Copy:

```
eyebrow: VELOUR — Collection One
h1:      Quieter.  /  Closer.
lede:    Objects of desire in honest materials. Light, silk and silence —
         you will imagine the rest.
cta:     Enter the collection        → /catalog   (.btn-gold)
link:    How we ship                 → #discretion  (.thread, quiet)
```

### Act II — The statement

One line, `text-cine-lg`, `font-display`, with a single italic gold word. Nothing else on screen.

```
Desire is a material.        ("is" → <em className="text-gold-2">)
```

### Act III — Three doors (categories)

Keep the current full-width list of enormous serif names — it is the best thing on the page today.
Add depth on hover: the hovered row's name slides right (it already does), a `wine → void` field
bleeds in behind it from the left, the two sibling rows drop to ~35% opacity, and the word `enter`
fades in on the right. Rows must be keyboard-reachable and show the same state on `:focus-visible`.

Data is real (`categories` prop). Names come from the database, so translate the seeder (below).

```
Objects   Form, weight, temperature
Silk      The first thing to touch skin
Rituals   Oils, candles, time
hover:    enter
```

### Act IV — Now (featured)

Three products, already in props. Heading `Now`, quiet link `The whole collection` → `/catalog`.

Since there are no photographs, give `Veil` a real fallback instead of a flat gradient: a procedural
**material field** chosen from the product's material — matte silicone reads as a soft warm haze,
borosilicate glass as a cool specular sweep, steel as a hard directional band, silk as a fine
diagonal weave, oils as slow concentric warmth. Pure CSS/SVG, no images, no new dependency. Keep the
`4/5` aspect ratio, `.sheen` on hover, `.breathe` on the frame, `.thread` under the name, and the
`from €…` price line. Cards enter once, via `.stagger` with `--i`, never on scroll.

### Act V — Materials

Three tiles, no photographs, one line each. Each tile carries the same material field as Act IV, so
the language of the page stays consistent.

```
Medical-grade silicone   Warms in a minute. Holds body heat until you put it down.
Borosilicate glass       Remembers cool water longer than skin does.
Polished steel           Weight you feel in the palm.
```

### Act VI — Discretion  (`id="discretion"` — the conversion act)

This is the section that sells this category, and the codebase already implements all of it. Make it
tangible rather than a list of promises: three statements, each demonstrating itself.

```
Nothing on the box.        Plain outer packaging. No logo, no product name, no hint of us
                           on the label.
Nothing on the statement.  Your bank shows a neutral descriptor, never ours.
Nothing left behind.       Discreet mode blurs every frame and renames the tab. Quick exit
                           clears this page from your history in one keystroke.
```

Make it demonstrate itself:

- Render the real statement string from `config('velour.statement_descriptor')` (`VLR RETAIL`) as a
  three-line mock bank entry — date, `VLR RETAIL`, amount — set in `font-sans`, in a `surface` frame.
  Pass it through `HomeController` as a prop; do not hardcode it in TSX.
- Put a live **Try discreet mode** control in this act (reuse `DiscreetToggle`), so the frames in
  Act IV visibly veil while the visitor watches. This is the single most persuasive interaction on
  the page: the feature proves itself in two seconds.
- One quiet line about shipping using the real config values: flat €5.90, free from €90.

### Act VII — The language of sensation

An editorial explainer that doubles as a feature demo. Reuse `SensoryScale` (read its props first).

```
We describe sensation, not specifications.
Firmness, texture, weight, temperature — four words and five dots, so you know how something
will feel before it arrives.
```

### Act VIII — Journal

Three notes from `resources/js/pages/journal.tsx`, same list rhythm, marked `soon`. Editorial
presence is what separates a boutique from a warehouse.

```
Temperature as a language        Why glass and steel speak to skin differently than silicone.
Slowly                          On time as the main ingredient.
What body-safe actually means    Which materials are safe, which are not, and why price is
                                 not a proxy.
```

### Act IX — The invitation

Full-bleed close on the same field as the hero (reuse the *same* WebGL context if it is still
mounted — never create a second `WebGLRenderer`; if the hero canvas is gone, use the CSS field).

```
h2:   Come in. Take your time.
cta:  Enter the collection      → /catalog
line: 18+ · Discreet shipping · Body-safe materials only
```

### Shell

`Header` and `Footer` are shared, visible on the landing, and currently Russian. Translate them:
nav `Collection / Journal / Care`, `Cart`, `Discreet mode`, `Quick exit`, mobile menu labels and all
Russian `aria-label`s. Footer: `Privacy / Terms / Materials & care`, the discreet-shipping line, and
`Adults only, 18+`. Keep `Wordmark`'s discreet-mode behaviour (`VELOUR` → `V.`).

# ENGLISH — SCOPE OF THE SWEEP

Required, because all of it is visible on or one click from the landing:

- `resources/js/pages/home.tsx`, `age-gate.tsx`, `journal.tsx`
- `resources/js/components/velour/{Header,Footer,Wordmark,DiscreetToggle,QuickExit,Toast,Veil,ProductCard}.tsx`
- `database/seeders/CatalogSeeder.php` — category and product names, taglines, stories, care text,
  materials, variant names, per the mapping table above. Slugs are the `updateOrCreate` key, so
  changing a name without changing its slug is safe and idempotent.
- `resources/views/app.blade.php` — keep `lang="{{ app()->getLocale() }}"`; `APP_LOCALE` is already
  `en`. Keep the `rating` / RTA meta tags exactly as they are.

Out of scope for this pass (list them in your summary as follow-up): `catalog/`, `product/`, `cart/`,
`checkout/`, `care.tsx`, `legal/*`, and the unstyled starter-kit auth pages.

There is no i18n layer in this project and you should not add one. Copy lives inline, as it does now.

# TECHNICAL REQUIREMENTS

**Dependencies.** Add none. No GSAP, no Framer Motion, no Lenis, no `@react-three/*`. Everything
here is reachable with CSS keyframes, `IntersectionObserver`, one `requestAnimationFrame` loop, and
the `three` already installed. If you believe a dependency is unavoidable, stop and say why instead
of installing it.

**Performance.**
- `three` must be dynamically imported; the `home` chunk without it should be well under 40 kB gzip.
- Largest text paints from HTML/CSS, not after WebGL. No layout shift when the canvas appears
  (reserve the box, cross-fade opacity only).
- One `WebGLRenderer` per page, paused when offscreen or when `document.hidden`, disposed on unmount.
- Below-the-fold heavy acts get `content-visibility: auto` with a matching `contain-intrinsic-size`.
- No `scroll` handler that writes layout properties; the one permitted listener sets a single custom
  property and is `{ passive: true }`.

**Motion.**
- Entrance choreography is `.stagger` + `--i`, once, on mount.
- All durations 400–1400ms on `--ease-cine`. Nothing bounces. Nothing spins.
- Extend the existing `@media (prefers-reduced-motion: reduce)` block to cover every new utility, in
  that one place. With reduced motion the page must be a still, complete, beautiful poster.

**Accessibility.**
- Exactly one `<h1>`. Every act is a `<section>` with `aria-labelledby` pointing at its heading.
- Add the global `:focus-visible` gold ring (problem 3). Every interactive element must show it.
- Decorative layers (`canvas`, grain, vignette, letterbox, material fields) are `aria-hidden`.
- Split-glyph headlines expose one clean accessible string.
- Keep readable copy at full-opacity `ivory` or `mute`; `ivory/80` is fine, `mute/70` is not.
- Hover-only affordances (`enter`, `The whole collection`) must also appear on `:focus-visible`.
- Touch targets ≥ 44px. The mobile curtain traps focus and closes on Escape.

**Discreet mode.** Every new act must respect `privacy.discreet`: material fields and any frame go
under `Veil`/`.discreet-veil`, the shader drops to 0.45 intensity, and nothing new may leak a product
name into the tab title. Test the whole page with the cookie on and off.

**Head / metadata.** Give the landing a real English `<title>` and meta description through Inertia's
`<Head>`, remembering that discreet mode replaces the title with `V.` in `velour-layout.tsx`. Keep
the `rating=adult` and RTA meta in `app.blade.php`. Add no analytics, no social pixels, no third-party
scripts — `docs/ARCHITECTURE.md` makes that an architectural rule, not a preference.

**Code quality.** TypeScript strict, no `any`, no `@ts-ignore`. Match the file conventions already in
`components/velour/`: default export, a short doc comment stating the component's intent, props typed
in an `interface` above it. Comments explain a constraint, never narrate the code. New CSS goes in
`app.css` under `@layer components` next to its relatives — not inline `<style>` and not arbitrary
one-off values scattered through TSX.

# NEW COMPONENTS

Create these in `resources/js/components/velour/` (adjust names if the code reads better, but keep
one responsibility per file):

| File | Responsibility |
|---|---|
| `MaterialField.tsx` | Procedural CSS/SVG field for a material (`silicone \| glass \| steel \| silk \| oil`). Used as the image fallback in `Veil` and as the Act V tile. Pure, no state. |
| `Statement.tsx` | One-line `text-cine-lg` statement act with an optional gold italic word. |
| `DoorList.tsx` | The Act III category rows with the focus/dim behaviour. Takes the `categories` prop. |
| `DiscretionPanel.tsx` | Act VI: three promises, the mock bank line, the live discreet-mode demo. |
| `KineticHeadline.tsx` | Per-glyph masked entrance with a clean accessible label. Used by the hero and Act IX. |

`home.tsx` should end up as a readable assembly of acts, not a 600-line file. `CinematicHero.tsx` gets
the lazy-`three`, `uBloom`, glyph-headline and letterbox changes.

# ACCEPTANCE CRITERIA

Do not report done until all of these hold:

1. `npm run build` succeeds. `npx tsc --noEmit` reports **no new** errors — the repo already has 5
   pre-existing ones in `pages/auth/{login,register,reset-password}.tsx` and `pages/checkout/index.tsx`;
   leave them alone and do not add any.
2. `npm run lint` and `npm run format:check` are clean.
3. `php artisan test` passes, including `tests/Feature/AgeGateTest.php` (6 tests covering the age gate
   and discreet mode). If you touched the seeder, `php artisan db:seed --class=CatalogSeeder` runs
   clean against `database/database.sqlite`.
4. The `home` chunk in `public/build/assets/` no longer contains `three`; report its new gzip size
   next to the current 130 kB.
5. No visible Russian text on `/`, `/age`, `/journal`, in the header, or in the footer — including
   `aria-label`s and `alt` text.

6. No `placehold.co` request remains on the landing; nothing on `/` loads from a third-party origin
   except the two Google Fonts stylesheets already in `app.blade.php`.
7. With `prefers-reduced-motion: reduce` the page is completely still and nothing is invisible,
   clipped, or mid-transition.
8. With discreet mode on, every frame is veiled, the tab reads `V.`, and no act leaks product imagery.
9. Keyboard-only: tab through the whole page. Every link, toggle and row shows a gold focus ring and
   every hover-only label becomes visible.
10. 360px wide and 1920px wide both look composed. No horizontal scroll at any width.
11. `docs/FRONTEND.md` is updated: the scroll amendment, the new components, and the removal of the
    `placehold.co` note from "not done".
12. `/` shows exactly three doors and three featured products — no `Dolor`, no `Voluptatum`, nothing
    with a random slug suffix.


# VERIFY — run these, paste real output

```bash
npx tsc --noEmit                     # expect the same 5 pre-existing errors, no more
npm run lint && npm run format:check
npm run build
php artisan test
ls -l public/build/assets/home-*.js && gzip -c public/build/assets/home-*.js | wc -c
```

Then start the app (`composer run dev`) and check `/age`, `/`, `/?` with discreet mode on, with
reduced motion on, at 360px, and with JavaScript disabled. Report what you actually saw. If something
does not work, say so with the output — do not describe intent as if it were a result.

# DO NOT TOUCH

- `app/Http/Middleware/EnsureAgeVerified.php`, the `velour_age` cookie, or the age-gate tests.
- The discreet-mode and quick-exit mechanics, the `rating`/RTA meta tags, or `config/velour.php`.
- The palette, the two typefaces, the radius, the `px-[6vw]` rhythm.
- Anything under `resources/js/components/ui/` (shadcn primitives) or the starter-kit auth pages.
- `.env`, migrations, and the production database. Re-seeding the local sqlite file is fine;
  `migrate:fresh` is not necessary and should not be run.

# HOW TO WORK

Read `docs/FRONTEND.md`, `docs/ARCHITECTURE.md`, `resources/css/app.css`, `home.tsx` and
`CinematicHero.tsx` before writing anything. Then work act by act, building after each one, so a
regression is always one act wide. Show me the diff for `home.tsx`, `CinematicHero.tsx` and the new
`app.css` block, and end with a short list of what you changed, what you measured, and what you
deliberately left for a second pass.

One last thing. The bar is not "a nice landing page for a sex shop". The bar is that a visitor cannot
tell from the first screen what category this store is in — only that whoever built it has taste, and
that nothing here will embarrass them. Restraint is the effect.








