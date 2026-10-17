# DataForge — v1 Completion Plan

Status: **proposed**, awaiting review
Baseline: `ff411ca` — "Fix: updating atribute key names" (2026-03-06)
Scope: full audit of `application/src`, CI, and repository hygiene

---

## 1. Why this document exists

DataForge works but is unfinished. It is not portfolio-ready, and the
main reason is not missing features — it is that the project's central
claim ("define a category as data") is **not actually true of the code**,
and the repository has no mechanism that could have caught it.

This plan turns the project into something worth putting on a portfolio
without turning it into a framework.

### Current state, measured

| Metric | Value |
| --- | --- |
| App source (`src/`, excl. styles) | 2,703 LOC across 10 files |
| Largest file | `EcommerceSidebar.tsx` — 1,232 lines |
| `tsc --noEmit` errors | **11** |
| `npm run lint` result | passes vacuously — see below |
| Test files | **0** |
| `.ts`/`.tsx` files covered by ESLint | **0 of 11** |
| Dead files | 5 (~270 LOC) |
| `aria-*` attributes in sidebar | **0** |

The two findings that gate everything else:

1. **`build` never type-checks.** `package.json` defines
   `"build": "vite build"`. Vite uses esbuild to strip types, so all 11
   TypeScript errors ship silently.
2. **`lint` never checks application code.** `eslint.config.js` scopes rules
   with `files: ['**/*.{js,jsx}']`. The repo's only `.js` file *is*
   `eslint.config.js` — all 11 source files are `.ts`/`.tsx`. Verified:
   `npx eslint src/App.tsx` →
   `warning File ignored because no matching configuration was supplied`.
   The lint script currently checks the lint config, and nothing else.

So the app has been developing with neither a compiler nor a linter as a
gate. Every issue in §3 accumulated silently, which is normal for a project
that sat untouched for seven months — but it means phase 0 is not optional
cleanup, it is the thing that makes phases 1–6 verifiable.

---

## 2. Delivery model

One branch: **`feat/finish-v1`**, branched from `main`.

Seven commits, each independently reviewable and revertable. No commit
leaves the app in a non-building state, so `main` stays deployable to GitHub
Pages throughout.

```
main ──────────────────────────────────────────────────►  (untouched, still deployable)
  └── feat/finish-v1
        1. chore/tooling        gates, dead code, existing tsc errors
        2. refactor/core        seeded PRNG + data-driven category spec
        3. feat/datasets        customers, orders, order lines, reviews
                               + CSV / SQL exporters
        4. feat/persistence     localStorage + preset import/export
        5. feat/distribution    weighted picks, decimal prices, image counts
        6. refactor/ui          sidebar component split + a11y
        7. docs/portfolio       README, examples, branding, architecture.md
```

Phases 2 and 3 are pure-logic and testable with no UI changes, so they can
be reviewed and merged on their own merits before the UI churn in phase 6.

---

## 3. Audit findings

Ordered roughly by "how much damage this causes a reviewer/user".

### 3.1 Correctness bugs

| # | Location | Issue |
| --- | --- | --- |
| 1 | `EcommerceSidebar.tsx` (no `useEffect` in file) | **Stale edit state across category switch.** Open the price editor on Smartphones → switch category to Laptops → Save writes `$299–$1599` onto Laptops. Same for the category name/SKU editor, which writes via `selectedCategory.id`. Because the category `<select>` stays interactive *while editing*, this is reachable. |
| 2 | `EcommerceSidebar.tsx` `editingAttr` keyed by `attr.key` | Attribute keys are **not unique across categories** — `storage` exists in smartphones + laptops, `color` in smartphones + clothing. Editing `color` under Smartphones then switching to Clothing opens Clothing's `color` pre-filled with Smartphones' values. |
| 3 | 7 sites: `parseInt(e.target.value) \|\| fallback` | **Decimals are impossible.** Input is `type=number` bound to `number` state, so `parseInt("99.99") === 99` drops the decimals on the next render. Clearing a field snaps to the fallback instead of showing empty. At one site, `setEditAttrMax(parseInt(v) \|\| 100)` means **typing `0` yields `100`** — `0` is falsy. |
| 4 | `useStore.ts:270` + `EcommerceSidebar.tsx:1128` | **Numeric attribute options cannot be deleted.** `removeAttributeOption(id, key, String(opt))` filters `o !== option`, so numeric `1` never equals `'1'`. The ✕ silently does nothing. |
| 5 | `productGenerator.ts:44` | `options?: string[] \| number[]` fed to `getRandomItem(def.options \|\| [])` typed `(t: T[]) => T` infers `string[]`. Real `tsc` error; also the root cause of the inferred-widening errors at `useStore.ts:243,263`. |
| 6 | `productGenerator.ts:37` | Shuffle via `[...arr].sort(() => 0.5 - Math.random())` — biased and engine-dependent. |
| 7 | `productGenerator.ts:166` | `existingProducts` param is accepted and never read — uniqueness is not actually enforced. |
| 8 | `EcommerceSidebar.tsx:246–262` | `saveAttrEdit` calls `updateAttribute` then `renameAttributeKey` — two `set()` calls, so React commits an intermediate frame and the store rebuilds the `categories` array twice. |

### 3.2 Duplicate React keys

| Location | Key | Consequence |
| --- | --- | --- |
| `:1047` | `key={attr.key}` | `addAttribute` and `renameAttributeKey` never check collisions. Duplicate keys → broken reconciliation, and since `editingAttr === attr.key` matches both, **both cards render in edit mode simultaneously**. |
| `:783` | `key={model}` | `addBrandModel` doesn't dedupe. |
| `:1123`, `:1206` | `key={String(opt)}` | `addAttributeOption` doesn't dedupe; mixing `number[]` and `string[]` also collides since `String(1) === '1'`. |

### 3.3 The architecture doesn't match the README

`README.md` claims a "schema-based" generator. In practice:

- `productGenerator.ts:81` — `if (category.id === 'laptops')`
- `productGenerator.ts:87` — `if (category.id === 'audio')`
- `productGenerator.ts:93` — `if (category.id === 'accessories')`
- `productGenerator.ts:118–161` — five hardcoded dimension profiles, also keyed on `category.id`

Adding a category requires **editing the generator**. Books and Clothing
have no dimension branch, so they fall through to a default that gives them
`weight_kg` 0.1–2 and `length_cm` 10–50 — a paperback that weighs up to 2 kg.
This is the single highest-leverage thing to fix, because it is the
difference between a demo and a defensible design.

### 3.4 Performance

- `EcommerceSidebar.tsx:68` — `useStore()` with **no selector**. Subscribes to
  the entire store, so `setProducts` from the live-preview effect in
  `App.tsx:67` re-renders all 907 lines of JSX. `App.tsx:8` does the same.
- **Zero** `useMemo`/`useCallback`/`useRef` in the sidebar. 63 inline arrow
  handlers and 30 `useState` hooks recreated every render.
- `Array.includes` re-evaluated 3× per brand (`:605,615,620`) and 3× per
  model (`:789,794,830`).
- Live preview debounces only 150 ms and regenerates on every keystroke in
  a brand-rename field, because the `useEffect` deps include whole objects.

### 3.5 Accessibility

`EcommerceSidebar.tsx`: **49 buttons, 0 `aria-*`, 0 `role=`, 0 `htmlFor`,
0 `id=`, 0 `tabIndex`, 0 `title=`.** 9 labels, 17 inputs.

- `:828–837` — the model name is a `<span onClick>`. Not focusable, no role,
  no keyboard handler. It is the **only** way to rename a model, so the
  feature is entirely keyboard- and screen-reader-inaccessible.
- `:612–623`, `:786–797` — fake checkboxes: `<button>` + `Check` icon, no
  `role="checkbox"`, no `aria-checked`, no accessible name.
- ~25 icon-only buttons with no accessible name.
- 9 `<label>`s with no `htmlFor` and no `id` on their inputs.
- 4 disclosure buttons with no `aria-expanded` / `aria-controls`.
- Only 4 of 17 inputs have Enter/Escape handling, inconsistently.
- `text-slate-600` on `bg-slate-950` placeholders are well below WCAG AA.

### 3.6 Dead code

| File | LOC | Why it's dead |
| --- | --- | --- |
| `src/components/Sidebar.tsx` | 89 | Imported by nobody. |
| `src/core/engine.ts` | 32 | Legacy blueprint path. |
| `src/core/providers.ts` | 12 | Only consumed by the dead `Sidebar.tsx`. |
| `src/App.css` | 42 | Vite template CSS, never imported. |
| `package-lock.json` (root) | 5 | Empty stub, `packages: {}`. |

Plus in-file: 4 unused lucide imports (`Box`, `MoreVertical`,
`ChevronLeft`, `DollarSign`), unused `getRandomItems`, dead
`expandedSections.pricing` flag (never read, never toggled).

### 3.7 Repository / docs

- `README.md` is 13 lines. It **promises CSV export, which does not exist**
  (only JSON, `productGenerator.ts:218–233`). Its tech-stack list is partly
  wrong. It calls the project a "seed data generator" — there is no
  `faker.seed()` anywhere.
- `application/README.md` is the untouched Vite template.
- `docs/architecture.md` documents a `modules/` folder that does not exist,
  says `vite.config.js` (it is `.ts`), and describes `components/` as "UI
  primitives" when it holds a 1,232-line feature component.
- **`/examples` is gitignored** (`.gitignore:36`). Four sample outputs exist
  locally, untracked — so the README has nothing to show a visitor.
- `index.html` — `<title>application</title>`, `vite.svg` favicon, no meta
  description, no OG tags.
- `vite.config.ts` — `base: '/DataForge/'` hardcoded; repo name baked in.
- CI is deploy-only: no lint, no typecheck, no test gate.

### 3.8 Data-quality issues

- `generateProducts` assigns brands `i % selectedBrands.length` — a perfectly
  even distribution across every run, which reads as obviously synthetic.
- `price` is always an integer; real retail data is `19.99`.
- `images` is always exactly one image, drawn from a pool of 3–4.
- `stock_quantity` is hardcoded to `faker.number.int({ min: 0, max: 100 })`
  with no category-level control.

### 3.9 Missing capabilities

- No CSV, TSV, or SQL export (README claims CSV).
- No customers / orders / order lines / reviews — no relational data, so it
  cannot seed a real storefront schema.
- No seed control, so output is not reproducible.
- No persistence: a page refresh loses the entire configuration.
- No preset import/export.
- No test runner.

---

## 4. Phases

### Phase 0 — `chore/tooling`

**Goal: make it possible for CI to fail, before changing anything else.**

1. **ESLint** — `eslint.config.js` → `files: ['**/*.{ts,tsx}']`; add
   `typescript-eslint` and `eslint-plugin-jsx-a11y`; keep `react-hooks` and
   `react-refresh`; disable `no-undef` for TS files (TS handles it).
2. **Scripts** — `build: "tsc -b && vite build"`; add `typecheck`, `test`,
   `test:watch`.
3. **Vitest** — add `vitest`, add `vitest.config.ts` with
   `environment: 'node'`. Core is pure functions, so no `jsdom` or
   `@testing-library/*` is needed. Keep the dependency surface minimal.
4. **CI** — `.github/workflows/deploy.yml`: `npm ci` instead of
   `npm install`; add `lint` → `typecheck` → `test` gates before `build`.
5. **Fix the 11 existing `tsc` errors** so the new gate starts green:
   - 4 unused lucide imports in `EcommerceSidebar.tsx:21,23,24,25`
   - `SlidersHorizontal` unused in `Sidebar.tsx:4` (file deleted anyway)
   - unused `getRandomItems` (`productGenerator.ts:36`)
   - unused `existingProducts` (`productGenerator.ts:166`)
   - `getRandomItem(def.options)` type error (`productGenerator.ts:44`) —
     resolved properly in phase 1, stubbed here
   - `getElementById('root')` nullability (`main.tsx:6`)
   - inferred `(string | number)[]` widening at `useStore.ts:243,263`
6. **Delete dead code** — `components/Sidebar.tsx`, `core/engine.ts`,
   `core/providers.ts`, `src/App.css`, root `package-lock.json`,
   `application/README.md`.
7. **`vite.config.ts`** — make `base` env-overridable
   (`process.env.BASE_PATH ?? '/DataForge/'`) so the repo name is not baked in.

**Exit criteria:** `npm run lint`, `npm run typecheck`, `npm test`,
`npm run build` all pass from a clean clone. CI fails on a deliberately
broken line.

---

### Phase 1 — `refactor/core`

**Goal: make the README's claim true. No UI change — reviewable on its own.**

#### `src/core/rng.ts` (new)

A single seeded PRNG wrapping `faker.seed()`:

```ts
interface Rng {
  seed(n: number): void;
  int(min: number, max: number): number;
  float(min: number, max: number, fractionDigits?: number): number;
  bool(probability?: number): boolean;
  pick<T>(items: readonly T[]): T;
  weighted<T>(entries: readonly (readonly [T, number])[]): T;
  shuffle<T>(items: readonly T[]): T[];
}
```

Every `Math.random()` in the generator routes through this. Fixes the biased
shuffle (→ Fisher-Yates) and makes output reproducible. Also stops
`faker` leaking into the generator's import graph, so the deterministic
boundary is explicit.

#### Declarative category spec

Replace the `category.id === '...'` branches with data:

- **`nameTemplate`** — e.g. `'{brand} {model} {screenSize}'`, with
  attribute interpolation. Audio becomes `'{brand} {model} {variant}'`,
  Accessories `'{brand} {model} {deviceType}'`.
- **`dimensions: DimensionProfile`** — min/max/fractionDigits per field, plus
  `nullable: ('length_cm' | ...)[]` to express the "sometimes absent cable
  length" behaviour that audio/accessories currently hardcode.
- **`usesVariantInName: boolean`** — smartphones currently declares
  `variants: ['Mini','Pro','Ultra','X']` that are never used for its name.
- Books and Clothing get **real** dimension profiles.

Result: adding a category is a pure-data change.

#### `src/core/normalize.ts` (new)

Hoist out of the sidebar component, where each is currently duplicated:

- `slugify()` — currently duplicated at `EcommerceSidebar.tsx:160` and
  `productGenerator.ts:27–30` (the two already disagree: the sidebar omits
  the id suffix)
- `normalizeAttributeKey()` — duplicated *within* the sidebar (`:261`, `:278`)
- `normalizeSkuPrefix()` — applied twice, on save *and* per keystroke (`:159`, `:395`)
- `isValidPriceRange()` — duplicated at `:187`, `:204`; currently used to
  silently drop invalid input with no error message

#### Type fixes

`options?: string[] | number[]` → `string[]`, with numeric parsing moved to
the UI boundary. Kills bugs §3.1#4 and §3.1#5.

#### Tests

- same seed + same config → byte-identical output
- different seed → different output
- price precedence: `modelPrices[model]` > `brand.priceRange` > `category.priceRange`
- 10,000 products → zero duplicate `id`, `sku`, or `slug`
- category-level: every preset category generates without throwing, and
  dimensions land inside the declared profile
- attributes: option list handling, boolean/number/select/text per type

**Exit criteria:** no `category.id ===` literal remains anywhere in
`src/core/`. Tests cover every branch of the generator.

---

### Phase 2 — `feat/datasets`

**Goal: a real e-commerce seed tool, not a product generator.**

#### Relational datasets

```
src/core/generate/
  product.ts
  customer.ts
  order.ts
  review.ts        (see decision D3)
```

Generation order guarantees referential integrity: products → customers →
orders (referencing `customer.id`) → order lines (referencing both
`order.id` and a real `product.id`) → reviews (referencing both
`customer.id` and `product.id`).

```ts
interface Customer { id; name; email; phone; city; country; created_at }
interface Order    { id; customer_id; status; placed_at; total; currency }
interface OrderLine{ id; order_id; product_id; quantity; unit_price; line_total }
interface Review   { id; product_id; customer_id; rating; title; body; created_at }
```

UI: a "related data" group next to the quantity control — customers (N),
orders (N), reviews (N), and a per-customer order range. The output panel
becomes one tab per dataset.

**Referential integrity is the whole value proposition of this phase, and it
is directly assertable** — that assertion is the test.

#### Exporters

- **`src/core/exporters/csv.ts`** — RFC 4180: quote fields containing
  `,` `"` `\r` `\n`; escape internal quotes by doubling. Union-of-keys
  column set so sparse rows don't shift columns. `attributes` flattened to
  `attr_<key>` (decision D2). `null` → empty, `boolean` → `true`/`false`,
  numbers unquoted.
- **`src/core/exporters/sql.ts`** — `INSERT INTO <table> (...) VALUES (...);`
  per dataset, with a dialect toggle (postgres / mysql) for identifier and
  string quoting. Emits a `-- DataForge` header comment with the seed and
  config summary, so seeded DBs are reproducible.

#### Tests

- every `customer_id` in orders resolves to a generated customer
- every `product_id` in order_lines and reviews resolves to a generated product
- CSV output round-trips through a minimal RFC 4180 parser (parse → same rows)
- SQL string values containing `'` are escaped
- `line_total === quantity * unit_price`; `order.total === Σ line_total`

---

### Phase 3 — `feat/persistence`

- **`zustand/middleware` `persist`**, `name: 'dataforge-config'`, explicit
  `version` + `migrate` function.
- **`partialize` excludes generated `products`.** They are cheap to
  regenerate and would bloat localStorage without value.
- **Preset export/import** as a single `*.dataforge.json` file containing the
  whole config: category, brands, models, per-brand weights and price
  overrides, seed, and counts (decision D4). Download + file-picker import,
  plus copy-to-clipboard.
- Bundled presets for the existing six categories so a new visitor has
  something to click immediately.

---

### Phase 4 — `feat/distribution`

- **`weighted()` brand selection** replacing `i % selectedBrands.length`
  (§3.8). Optional per-brand `weight`, default `1`. Default preset weights
  chosen so the distribution reads as organic rather than uniform.
- **Decimal prices** — `priceRange` gains `decimalPlaces?: 0 | 1 | 2`,
  default `0`, so existing categories are unchanged until opted in.
- **Image counts** — pick 1..N from the category pool, deduped, instead of
  always exactly one.
- **Stock range** per category, replacing the hardcoded `0–100`.

---

### Phase 5 — `refactor/ui`

**Goal: 1,232 lines → ~8 components, and the bugs in §3.1/§3.2/§3.5 closed.**

#### New `src/components/ui/` primitives

`Button`, `IconButton`, `Input`, `NumberInput`, `Field`, `Select`,
`Checkbox`, `CollapsibleSection`, `Badge`.

Purpose is not DRY-for-its-own-sake — it collapses **eight near-identical
Save/Cancel pairs** (`:428/435`, `:500/507`, `:638/644`, `:812/818`,
`:853/859`, `:941/951`, `:1021/1029`, `:1157/1164`) that each restate the
same Tailwind strings, and it gives every control one place to attach the
labels and ARIA the app currently lacks everywhere.

#### New `src/components/sidebar/` split

Approximate target:

| Component | Responsibility |
| --- | --- |
| `Sidebar.tsx` | shell + section orchestration |
| `CategorySection.tsx` | category picker, name/SKU/ID-format editor |
| `CategoryPriceEditor.tsx` | category price range |
| `BrandSection.tsx` | brand list, bulk actions, add brand |
| `BrandRow.tsx` | one brand: checkbox, rename, expand, delete |
| `BrandPriceEditor.tsx` | three-state brand price override |
| `ModelRow.tsx` | one model: checkbox, rename, exact price, delete |
| `AttributeSection.tsx` | attribute list, add attribute |
| `AttributeCard.tsx` | one attribute: view mode / edit form |

#### The structural fixes

- **One `editingKey: string | null` replaces ~15 editing booleans**, where the
  key embeds the category id (`categoryId:brandId:model`). This is the actual
  fix for §3.1#1 and §3.1#2: a stale editor cannot survive a category switch
  when its identity includes the category it belongs to.
- **`NumberInput` holds a `string` internally**, commits `Number.parseFloat`
  on blur/Enter. Removes all 7 `parseInt(x) || fallback` sites and fixes the
  `0 → 100` bug (§3.1#3).
- **Dedupe guards in the store**, not just the UI: `addBrandModel`,
  `addAttributeOption`, `addAttribute`, and rename targets. Fixes §3.2 and the
  dual-edit-mode bug.
- **Real `<input type="checkbox">`** for brand and model selection.
- **`<span onClick>` → `<button>`** at `:828`, restoring keyboard access to
  model renaming.
- **`htmlFor`/`id` on all 9 labels**, `aria-label` on all icon-only buttons,
  `aria-expanded`/`aria-controls` on the 4 disclosures.
- **Granular Zustand selectors per component**, so editing one brand doesn't
  re-render the whole tree.
- **Responsive sidebar.** Currently `w-1/2 min-w-[600px]` with no breakpoint,
  while `App.tsx` is fully `lg:`-responsive — on mobile it takes half the
  viewport and never collapses.

---

### Phase 6 — `docs/portfolio`

Highest leverage per line written, and currently the weakest area.

1. **Rewrite `README.md`.** Must cover: what it is, **live demo link**
   (GitHub Pages is already configured), screenshot, feature list, quickstart
   for both npm and Docker, how the data model and schema templates work,
   and the output formats. Every current claim must be true — in particular
   the CSV promise gets satisfied or removed.
2. **Un-ignore `/examples`** and commit the four sample outputs (they exist
   locally, just untracked). Trim to ~10–20 rows each so the repo stays light.
3. **`index.html`** — real `<title>`, meta description, OG tags, replace
   `vite.svg` with an inline SVG mark.
4. **Rewrite `docs/architecture.md`** — actual folder tree, the
   `core` / `store` / `components/ui` layering, and a data-flow diagram.
5. **Decide `application/README.md`** — delete, or reduce to a pointer to the
   root README.

---

## 5. Decisions

All five resolved on 2026-10-17.

| # | Decision | Resolution |
| --- | --- | --- |
| **D1** | Breaking output shape | **Accept.** Decimal prices, multi-image products, and relational datasets change the JSON schema. The four example files get regenerated. Categories stay integer-priced by default (`decimalPlaces: 0`), so this is opt-in. |
| **D2** | CSV `attributes` | **Flatten** to `attr_<key>` columns. Wider CSV, but far more useful for Sheets and Postgres `COPY`. Decision is isolated to `csv.ts` and reversible. |
| **D3** | Relational scope | **Include `reviews`** (product_id + customer_id + rating), on top of customers / orders / order lines. ~60 extra lines; makes the demo dataset feel real. *Note: this was the one soft recommendation of the five — reviews are a self-contained generator module and trivially droppable if you disagree.* |
| **D4** | Preset format | **Single whole-config `*.dataforge.json`** — simplest thing that works, and one file is easier to share than a category/run-settings split. |
| **D5** | `description` field | **Add** `faker.commerce.productDescription()` to products. Permanent schema change; makes placeholder data far more usable. |

---

## 6. Target file layout

```
DataForge/
├── .github/workflows/deploy.yml   lint → typecheck → test → build → deploy
├── docs/
│   ├── architecture.md            rewritten in phase 6
│   └── plan.md                    this file
├── examples/                      un-ignored in phase 6
├── application/
│   ├── eslint.config.js           scoped to ts/tsx in phase 0
│   ├── vitest.config.ts           new, phase 0
│   └── src/
│       ├── core/                  pure, zero React, fully tested
│       │   ├── rng.ts             NEW  seeded PRNG
│       │   ├── normalize.ts       NEW  slugify / key / prefix / validation
│       │   ├── categories.ts      declarative presets
│       │   ├── generate/
│       │   │   ├── product.ts     rewritten from productGenerator.ts
│       │   │   ├── customer.ts    NEW
│       │   │   ├── order.ts       NEW
│       │   │   └── review.ts      NEW
│       │   └── exporters/
│       │       ├── json.ts
│       │       ├── csv.ts         NEW
│       │       └── sql.ts         NEW
│       ├── types/
│       ├── store/
│       │   ├── useStore.ts        + persist, + dedupe guards
│       │   └── selectors.ts       NEW  granular subscriptions
│       └── components/
│           ├── ui/                NEW  9 primitives
│           ├── sidebar/           NEW  ~9 components
│           ├── OutputPanel.tsx    + dataset tabs + export menu
│           └── PresetBar.tsx      NEW  seed + presets
└── README.md                      rewritten in phase 6
```

---

## 7. Risks

| Risk | Mitigation |
| --- | --- |
| Phase 6 (UI) is the least testable — no component tests | Land phases 1–3 first and review on their own merits. Add one `jsdom` smoke test for `App` if phase 6 turns out to regress anything silently. |
| Category presets become unwieldy once `nameTemplate` + `DimensionProfile` + attributes + weights are all inline | Split each preset into its own module under `core/categories/` from the start, rather than one growing array. |
| `faker.seed()` mutates module-global state, so parallel tests could interfere | Create the RNG instance explicitly and pass it down; never call `faker.seed()` at module scope. Configure `sequence.concurrent: false` in `vitest.config.ts`. |
| Decimal prices could break a downstream consumer expecting integers | Opt-in per category (`decimalPlaces: 0` default) — existing presets are unchanged. |
| Phase 5 touches ~900 lines of JSX with no test net | Commit it separately, and review it as pure refactoring with the bugs in §3.1–§3.3 as the checklist. |
| Scope creep toward a framework | Explicit non-goals below. |

### Non-goals

Deliberately **out of scope** to keep this a simple, finishable project:

- A visual node/canvas schema editor (the declarative preset *is* the schema)
- A backend, database, or user accounts — this stays a static client-side app
- i18n / locale switching
- Importing real data to anonymise or transform it
- A plugin API for custom generators
- Anything beyond `products`, `customers`, `orders`, `order_lines`, `reviews`

---

## 8. Done means

- [ ] `npm ci && npm run lint && npm run typecheck && npm test && npm run build` passes from a clean clone
- [ ] CI gates on all four; a deliberately broken line fails the pipeline
- [ ] `grep -rn "category.id ===" src/core/` returns nothing
- [ ] Every referential FK in generated data resolves — asserted by tests
- [ ] CSV, JSON, and SQL export all round-trip, tested
- [ ] Same seed + same config → byte-identical output, tested
- [ ] Refresh the page; configuration survives
- [ ] Keyboard-only: every control reachable and operable; no `<span onClick>`
- [ ] Every README claim is verifiable in the running app
- [ ] Live demo link and screenshot in the README
- [ ] `examples/` committed and visible on GitHub