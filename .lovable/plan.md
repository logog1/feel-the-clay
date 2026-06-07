## Goal

One central place in the Pro dashboard where you create **Offers** and **Events**, then drag each card onto the **Hotels & Riads** you want them to appear on. The same offer can be assigned to several partners at once and shows up on each partner's `/partners/:slug` landing page.

## How it will work (UX)

A new sidebar entry **Offers & Events** opens a two-pane board:

```text
┌────────────────────────────┬─────────────────────────────────────┐
│  LIBRARY (left)            │  HOTELS & RIADS (right)             │
│  + New offer / event       │                                     │
│                            │  ┌─────────────┐ ┌─────────────┐    │
│  [Sunset Pottery]  active  │  │ Sofitel     │ │ Riad Dar X  │    │
│  [Ramadan Special] draft   │  │ • 2 offers  │ │ • 1 offer   │    │
│  [Live Music Night] event  │  │  ─ Sunset   │ │  ─ Sunset   │    │
│  [Group 4+ Deal]   active  │  │  ─ Ramadan  │ │             │    │
│                            │  └─────────────┘ └─────────────┘    │
└────────────────────────────┴─────────────────────────────────────┘
```

- Drag a card from the left onto any hotel card on the right to assign it.
- Click an assigned chip to unassign (or open a small menu: set start/end date, hide on landing, reorder).
- Multi-select on the left + drop onto a hotel assigns several at once.
- Each hotel card shows the live list of what is currently published on its landing page.

On the partner landing page a new **Offers & Events** section appears (above or below the existing Experiences block, your call) listing every offer assigned to that partner that is active and within its date window.

## What is an "offer" vs an "event"

Same entity with a `kind` field:
- **offer** — ongoing promo, no fixed date (e.g. "Group of 4 gets 10% off", "Ramadan special menu"). Shows an optional valid-from / valid-until window.
- **event** — has a date and time (e.g. "Live oud night, Aug 12, 8pm"). Shows date, time, and capacity.

Both share: title, subtitle, cover image, description, CTA (Book / WhatsApp / Custom link), price (optional), tags.

## Build steps

1. **Database**
   - New table `partner_offers` (id, kind `offer|event`, title, subtitle, description, cover_image, cta_type, cta_value, price, currency, starts_at, ends_at, event_at, capacity, tags, is_active, sort_order, timestamps).
   - New join table `partner_offer_assignments` (id, offer_id, partner_id, is_published, sort_order, assigned_at) with unique (offer_id, partner_id).
   - RLS: admins manage everything; partner staff can read assignments for their own `partner_id`; public read goes through a view `partner_offers_public` that joins offer + assignment and only exposes published + active rows (mirrors how `hotel_partners_public` works today).
   - GRANTs included per project rules.

2. **Admin UI — `src/components/admin/OffersEventsSection.tsx`**
   - Two-pane board using `@dnd-kit/core` (already lightweight, fits stack).
   - Left pane: offer library with create / edit dialog (image upload to `site-images` bucket, same flow as the hotels tab).
   - Right pane: hotels grid pulled from `useHotelPartners`, each card is a droppable zone listing assigned offer chips.
   - Drop = insert row into `partner_offer_assignments`. Remove chip = delete row. Reorder chips inside a hotel = update `sort_order`.
   - Bulk actions: publish/unpublish, duplicate offer, archive.
   - Add new sidebar entry in `ProSidebar.tsx` and route in the pro dashboard router.

3. **Public landing — `src/pages/PartnerLanding.tsx`**
   - Fetch from `partner_offers_public` filtered by current partner slug.
   - Render a new **Offers & Events** section: card grid with cover image, title, badge (offer/event), date or validity window, price, CTA button.
   - Tap CTA = booking dialog (reuse existing) or WhatsApp deep-link with the partner context prefilled.

4. **Optional v1 polish (cheap wins)**
   - Per-assignment override of the CTA (e.g. same offer, different WhatsApp number per riad).
   - Schedule auto-unpublish when `ends_at` passes (handled by the query, no cron needed).
   - "Copy from another hotel" shortcut on a hotel card to clone its assignments.

## Out of scope for this plan

- Real-time scan analytics tied to QR codes (separate plan).
- Inventory of physical QR stickers per room.
- Multi-language offer copy (we keep one language now; can add later via a JSON column).

## Technical notes

- Drag-and-drop library: `@dnd-kit/core` + `@dnd-kit/sortable` (small, accessible, works on touch for mobile admins).
- Image upload reuses the existing `SiteImageUploader` flow.
- Realtime not required v1; a simple refetch on mutation is enough.
- All public reads go through the view so we never expose admin-only fields, consistent with the security memory.
