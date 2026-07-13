# Launch Kit Zellige as a real store product

## What you'll get

- Kit Zellige listed publicly in the store, under a new "Craft Kits" section.
- Customers buy a **ready collection** (named colorway). Customization is hidden for now; you can flip it on from the dashboard when you're ready.
- 1 collection at launch — you'll name and configure it in the dashboard right after this ships.
- Full admin controls: toggle any piece or color on/off, and full create/edit/delete for collections (name, price, stock, image, per-piece colors, published on/off).

## Public store behavior

- New store section "Craft Kits" appears in `/store`.
- One card: **Kit Zellige — DIY Moroccan tile kit**. Tapping it opens the Kit Zellige page (moved from `/preview/kit-zellige` to `/store/kit-zellige`, old URL kept as a redirect).
- On the page:
  - Title, price (from the selected collection), and mobile-friendly layout stay as they are.
  - **Ready Collections** tab shows the published collections. Selecting one previews it on the motif and sets the price.
  - **Customize** tab is hidden by default; a "Custom colorways coming soon" note appears in its place. You can flip it on any time.
  - CTA "Order this kit" opens the order form pre-filled with the collection name, and the cart line reads e.g. `Kit Zellige — Ocean`.

## Dashboard controls (in Pro dashboard → Kit Zellige)

- **Pieces** — toggle each motif region on/off (already exists, kept).
- **Colors** — toggle each palette swatch on/off (already exists, kept).
- **Collections** — new CRUD panel:
  - Name, short description, price (MAD), stock, cover image.
  - Per-piece color picker (choose one available color per piece).
  - Published toggle, sort order.
  - Live thumbnail preview of the motif with those colors.
- **Customize tab** — new toggle "Show Customize tab to visitors" (default off).

## Technical details

**Database (migration)**
- New table `public.zellige_kit_collections` (name, slug unique, description, price numeric, stock int, image_url, `colors jsonb` mapping piece key → color hex, is_published bool, sort_order int, timestamps). RLS: public reads published rows, admins manage all. Grants for anon/authenticated/service_role.
- New allowed key `kit_zellige_customize_enabled` in the public `site_settings` read policy (value `'true'`/`'false'`, default `'false'`).
- Seed: 1 store section `kits` ("Craft Kits"), 1 product row `kit-zellige` pointing to the kit page, 1 draft collection "Signature" (you'll rename/configure).

**Frontend**
- `src/pages/KitZelligePreview.tsx` renamed logically to the store kit page. Route `/store/kit-zellige` added; `/preview/kit-zellige` redirects.
- New hook `useZelligeCollections` (list/create/update/delete/reorder).
- `KitZelligePreview.tsx`:
  - Loads collections from DB (replaces hardcoded presets).
  - Reads `kit_zellige_customize_enabled` and conditionally hides the Customize tab.
  - Order CTA passes the selected collection name into the cart line.
- `Store.tsx` renders the new `kits` section; the Kit Zellige card links to `/store/kit-zellige` instead of opening the product modal.
- Admin: `src/components/admin/KitZelligeSection.tsx` gains a Collections manager and the Customize toggle.

**Out of scope for this pass**
- Full custom-colorway checkout (staying hidden; will come later as you said).
- Variant selection UI in the cart page itself — the collection name is captured on the kit page and included in the cart line.

Reply "go" and I'll ship it.
