## Scope

Polish only — no brand identity changes. All work uses existing design tokens in `src/index.css`. Rubik font, terracotta/orange palette, light-orange background stay locked.

## 1. Shared foundations (touch once, benefits everywhere)

- **Section rhythm tokens**: add `--section-y` (mobile 3rem, desktop 5rem) and `--container-x` utilities so every section breathes the same. Replace ad-hoc `py-12/py-16/py-20` in landing sections.
- **Focus-visible ring**: unify `:focus-visible` on buttons, links, inputs using `--ring` token for accessibility.
- **Card surface**: one `.surface-card` utility (bg, border, radius, shadow, hover lift) reused across Store cards, Offers cards, dashboard panels.
- **Empty / loading / error primitives**: small components in `src/components/ui/` — `EmptyState`, `LoadingState`, `ErrorState` — used in Store, Cart, dashboards.

## 2. Public landing (Index.tsx and its sections)

- Normalize vertical rhythm between Hero → Offers → Gallery → SocialImpact → Contact (consistent `--section-y`, consistent max-width container).
- HeroSection: tighten mobile padding, ensure CTA hit-area ≥44px, add subtle hover state on primary CTA matching brand.
- OffersSection cards: equal-height grid, hover lift + ring, image aspect-ratio lock to avoid CLS, skeleton while loading.
- GallerySection: improve touch scroll affordance on mobile (edge gradient mask), pause-on-hover already exists — add focus pause for a11y.
- ContactSection: 4-col desktop already there; tighten mobile to 2-col where it currently stacks, equalize icon sizing.

## 3. Store page

- Filter chips: active state uses solid terracotta, inactive ghost; sticky on scroll for mobile.
- Product grid: enforce square aspect, consistent gap, hover scale on image only (not card jump), price + title baseline aligned.
- Product modal: better spacing rhythm, sticky CTA on mobile, qty stepper aligned, close button reachable.
- Empty state (no products in category) and loading skeleton grid.

## 4. Booking form + Cart checkout

- Booking form: group fields into clear sections with labels, consistent field height (h-11), inline validation messages with icon + color, disabled submit state with explanation, success screen with confirmation summary.
- Cart: clearer line items (image + title + price + qty stepper + remove), sticky order summary on desktop, mobile bottom bar with total + CTA, loading state during checkout submit, error toast with retry.

## 5. Internal dashboards (Admin / Pro / Partner)

Polish only — no logic change:
- Consistent page header pattern (title, subtitle, primary action right).
- Table density: row height `h-12`, zebra optional, sticky header, horizontal scroll wrapper on mobile.
- Status badges: reuse existing `BookingStatusBadge`; align across all booking tables.
- Empty states + skeleton loaders in lists.
- Dialog/Sheet spacing consistency (p-6, gap-4).

## Technical details

- New file: `src/components/ui/empty-state.tsx`, `loading-state.tsx`, `error-state.tsx`.
- New utilities in `src/index.css`: `.section-y`, `.container-x`, `.surface-card`, focus-visible base.
- Edits limited to: landing section components, `Store.tsx`, `Cart.tsx`, `BookingFormSection.tsx`, dashboard layout/table wrappers. No changes to data fetching, RLS, edge functions, or business logic.
- TypeScript check after each surface area.

## Out of scope

- No new brand colors, no font changes, no copy rewrites, no route changes, no schema changes, no new features.

## Order of execution

1. Foundations (tokens + primitives)
2. Landing
3. Store
4. Booking + Cart
5. Dashboards
6. Final typecheck + visual spot-check via preview
