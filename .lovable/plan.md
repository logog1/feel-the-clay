## Goal

Turn the current single-QR-per-property setup into a proper hotel/riad partnership toolkit: per-room and per-staff trackable QR codes, a printable kit, a polished guest landing page in all four languages, and a concierge dashboard where hotels can see every booking with full commission detail, payout history, and a scan-to-booking funnel.

## What changes

### 1. Trackable QR variants (DB)

Extend `qr_scan_log` and `bookings` so every QR can be attributed to a room or staff member.

`qr_scan_log` new columns:
- `variant_code` text — short slug like `r-204` or `staff-amine`
- `variant_label` text — human label shown to admin
- `variant_scope` text — `property` | `room` | `staff` | `event`
- `ip_hash` text — short hash for unique-visitor estimates (no raw IP)
- `session_id` text — anonymous cookie/uuid to dedupe scans per device
- `booking_id` uuid nullable — set when the scan converts

`bookings` and `sofitel_bookings` new columns:
- `qr_variant_code` text
- `qr_variant_scope` text

New table `partner_qr_variants`:
- `partner_id`, `code`, `label`, `scope`, `room_number` (nullable), `staff_user_id` (nullable), `is_active`, `created_at`. Unique on `(partner_id, code)`. RLS: admin all; staff of that partner read.

### 2. Edge function `qr-scan`

Public POST endpoint called from the landing page on mount with `{ slug, variant }`. It looks up `partner_id`, writes a `qr_scan_log` row, sets/reads a `qr_session` cookie, and returns `{ partner_id, session_id }`. The landing page stores the session id in `sessionStorage` so the subsequent booking insert can include `qr_variant_code` + `qr_variant_scope`.

### 3. Printable QR kit page `/partners/:slug/qr`

Replace today's single-QR view with a full kit (still public, no auth):
- Admin/staff toggle to switch between three presets: A4 poster, A5 flyer, table-tent.
- "Generate QRs for rooms" input (e.g. `101-120` or comma list) creates variants in `partner_qr_variants` and renders a grid of one card per variant.
- "Staff QR" tab lists staff variants.
- Each card uses the QR Server API with `?v=<variant>` appended to the landing URL, plus the hotel logo, brand color, the offer headline, and an FR/EN toggle for the printed strapline.
- "Download as PDF" button uses `jspdf` + `html2canvas` to export all selected cards. (Both deps already exist; otherwise add `jspdf` and `html2canvas`.)
- "Print" button just calls `window.print()` with a print stylesheet that hides chrome.

### 4. Richer guest landing `/partners/:slug`

Polish the existing `PartnerLanding`:
- Reads `?v=` from URL, calls the `qr-scan` function once, persists `variant` in `sessionStorage`.
- Hero with hotel logo, cover image, brand color accent, and a one-line welcome in the guest's language (auto-detect from `navigator.language`, fallback EN; manual switch for FR/ES/AR).
- Multi-offer carousel pulling published `partner_offer_assignments` joined with `partner_offers` (already in DB), with price, duration, capacity, CTA.
- Sticky bottom CTA: "Book your spot · Room __". Booking form pre-fills `room_number` when scope=`room`, and writes `qr_variant_code` / `qr_variant_scope` / `partner_id` on insert.
- WhatsApp concierge button using `partner.whatsapp` if present.

### 5. Concierge dashboard upgrades `/partners/:slug/concierge`

Keep the existing auth flow (email + password, admin-invited via `partner_staff`). Add:
- **Funnel card** on top: scans / unique sessions / bookings / completed / conversion %, with day-by-day sparkline.
- **Per-variant table**: code, label, scans, bookings, completed, commission earned. Sort by performance.
- **Per-booking commission detail** (replaces the current compact list): date, guest, room, participants, gross, rate %, commission, status (`due` / `paid` / `void`), source variant. CSV export already exists, extend with variant columns.
- **Payouts history section**: reads `partner_payouts` for this partner, lists period, amount, method, reference, paid date, linked booking count. Read-only.

### 6. Admin: QR & staff management

Inside `HotelsRiadsSection` (admin), add tabs on each hotel detail panel:
- **Staff**: list `partner_staff`, "Invite staff" form that creates an auth user via existing admin pattern and inserts into `partner_staff`. Remove button.
- **QR variants**: list `partner_qr_variants` with quick edit, bulk-create rooms, deactivate.
- **Payouts**: list `partner_payouts`, "Record payout" form (period, amount, method, reference, mark linked bookings as paid).

### 7. RLS / GRANTS

For every new table or column, follow the project pattern:
- `partner_qr_variants` and new `qr_scan_log` columns: admin full access, `partner_staff` SELECT for their `partner_id`, `anon` INSERT only via the edge function (service role).
- `partner_payouts` already restricted; ensure staff can SELECT for their partner.

## Technical notes

- QR rendering stays on api.qrserver.com (no new dependency) but the printable kit needs `jspdf` + `html2canvas` for PDF export; add if missing.
- Edge function `qr-scan` uses service role to bypass RLS for inserts; validates body with zod; CORS open.
- Funnel queries: simple `count(*)` per day from `qr_scan_log` and `bookings` filtered by `partner_id`; can compute client-side after a single fetch of the last 30 days.
- Sofitel bookings already share `partner_id`, `gross_amount`, `commission_*`, so the funnel and statement work for both `bookings` and `sofitel_bookings` tables via a union view if needed; v1 uses `sofitel_bookings` (current concierge source) plus the public `bookings` table joined by `partner_id`.

## Out of scope (call out if needed later)

- Sending the invite email itself uses the existing transactional flow; no new template yet.
- Real PDF generation server-side (we stick to client-side `jspdf` for v1).
- Multi-tier commission rules per offer (today the rate lives on `hotel_partners`).
