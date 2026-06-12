
## Audit results — what's broken or missing today

I traced the full QR → landing → booking → concierge dashboard flow. Here's what I found before we touch anything:

### Critical bugs (silent data loss)
1. **`PartnerLanding.tsx` inserts `partner_id` and `source` into `public.bookings`, but those columns don't exist.**
   The bookings table only has: id, name, city, email, phone, workshop, session_info, participants, booking_date, notes, status, created_at.
   → Either the insert fails entirely, or (more likely) Supabase strips unknown fields and the booking lands with **no link to the hotel that generated it**. Hotels can't be credited, commissions can't be computed, you can't even tell which QR worked.

2. **`PartnerConcierge.tsx` only reads `sofitel_bookings` / `sofitel_experiences`** — it never queries the regular `bookings` table. So even if attribution worked, a hotel signing into their concierge dashboard would not see a single workshop booking generated from their own QR.

3. **No commission field anywhere on bookings.** Nothing is calculated, stored, or reported. `hotel_partners.commission_rate` exists but is never used.

4. **No completed / cancelled lifecycle for partner bookings.** Status updates exist only on `sofitel_bookings`. A regular booking from a partner page has no "mark as completed / no-show / cancelled" UI for either the hotel or the admin in a partner-aware view.

### Gaps for a smooth hotel/riad collaboration
- No payout / statement view (hotel: "how much do you owe us this month?").
- No CSV export of bookings or commissions per partner.
- No notification to the hotel when a guest books from their QR (right now only Terraria gets the email).
- No per-booking room number / guest reference (regular `bookings` has no `room_number`).
- No booking source/UTM tracking beyond a single string — can't tell QR vs concierge vs direct link.
- No "block dates" or capacity rules per partner.
- No partner-side analytics (scans, conversion, top experiences).

---

## Plan

### 1. Make partner attribution actually work (DB migration)

Add to `public.bookings`:
- `partner_id uuid REFERENCES public.hotel_partners(id) ON DELETE SET NULL`
- `source text` (e.g. `partner_landing`, `partner_qr`, `concierge`, `website`)
- `room_number text` (for hotel guests)
- `commission_rate numeric` (snapshotted from partner at booking time, so future rate changes don't rewrite history)
- `commission_amount numeric` (computed)
- `commission_status text` default `'pending'` → `pending | due | paid | void`
- `gross_amount numeric` (so commission = gross × rate, transparent)
- `completed_at timestamptz`, `cancelled_at timestamptz`, `cancellation_reason text`
- Index on `partner_id` + `status`.

Trigger: when status flips to `completed`, compute `commission_amount = gross_amount × commission_rate` and set `commission_status = 'due'`. When status flips to `cancelled`, set `commission_status = 'void'` and stamp `cancelled_at`.

### 2. Fix the insert path
- `PartnerLanding.tsx`: include `partner_id`, `source: 'partner_landing'`, `room_number`, snapshot `commission_rate` and `gross_amount` (participants × price) into the new columns.
- Add a small "Room number" field to the booking form on partner pages.

### 3. Hotel concierge dashboard sees everything
Update `PartnerConcierge.tsx`:
- Pull from `bookings WHERE partner_id = …` alongside `sofitel_bookings`.
- Show name, room #, phone, email (full guest info), workshop, date, status badge.
- Add "Mark completed / cancelled / no-show" buttons (RLS-scoped to partner staff for their own partner).
- New **Statement tab**: this month / last month / custom range showing bookings, gross, commission rate, commission due, total payout. CSV export.
- New **QR analytics card** (light): scans today / week / month and conversion rate.

### 4. Admin (Pro dashboard) gets a Partner Performance view
Inside the existing `HotelsRiadsSection`, add per-partner:
- KPIs: bookings, completed, cancelled, gross revenue, commission owed, commission paid.
- Table of pending payouts with "Mark as paid" → writes a `partner_payouts` row (new tiny table: id, partner_id, period_start, period_end, amount, paid_at, notes).
- CSV export per partner per period.

### 5. RLS + GRANTs
- New `partner_payouts` table: admin-only writes; partner staff can SELECT their own partner's payouts via `is_partner_staff`.
- Extend `bookings` SELECT policy so a partner staff can read bookings where `partner_id` matches their partner (admin keeps full access).
- Add `bookings` UPDATE policy for partner staff to change `status`, `completed_at`, `cancelled_at`, `cancellation_reason`, `room_number`, `notes` on their own rows only.

### 6. Notifications
- Extend `send-notification` so a new partner-attributed booking also emails the partner's `contact_email` (template: `partner-booking-notification`) and optionally WhatsApps `partner.whatsapp` if set.
- New email when a booking attributed to them is cancelled.

### 7. Verification (after build)
Using `supabase--insert` I will:
- Create one booking attributed to the first active partner → mark `completed` → verify commission auto-computed and visible in both concierge and Pro dashboard.
- Create a second booking → mark `cancelled` → verify it's voided, hotel sees the cancellation, no commission owed.
- Confirm the partner statement totals match the sum of completed bookings.

---

## Things this plan deliberately does NOT do (call out if you want them)
- Online payments / Stripe payout to hotels — keeping it manual ledger for now.
- Multi-currency — assuming MAD/DH like the rest of the app.
- Per-experience commission overrides — single rate per partner.
- A native partner mobile app — concierge page is already mobile-friendly.

## Open questions before I implement
1. Commission base: **gross booking value** (participants × price) or **net after any partner-side discount**?
2. Who marks a booking as "completed" — the hotel concierge, the Terraria admin, or both?
3. Should cancellations within 24h still owe a (partial) commission, or always be voided?

Tell me your answers and I'll switch to build.
