## Goal

Turn the one-off Sofitel integration into a reusable "Hotels & Riads" system: each partner property (riad, hotel, boutique stay) gets its own landing page, in-room QR, concierge dashboard, and admin management — all created from a new section in the Pro Dashboard.

## What you'll get

**In the Pro Dashboard → new "Hotels & Riads" section:**
- Grid of partner properties (Sofitel will be the first one, migrated in place)
- "+ New property" button to create a partner with: name, slug, type (hotel/riad/boutique), city, primary color, logo, contact email/phone, intro copy
- Per-property card with quick links: public page, concierge view, QR page, admin console, plus toggle active/inactive
- Per-property editor: branding, experiences offered, in-hotel/in-studio split, pricing, capacity, included perks (the advantages from the B2B "for hotels & riads" block: custom landing, QR check-in, group calendar, revenue share, etc.)

**Public-facing routes (dynamic):**
- `/partners/:slug` — public landing page (templated from Sofitel.tsx layout)
- `/partners/:slug/hotel` — concierge dashboard for hotel staff
- `/partners/:slug/qr` — in-room QR / quick-book screen
- `/partners/:slug/admin` — full per-partner admin console
- Legacy `/sofitel*` routes continue working (redirect to slug `sofitel`)

## Technical plan

**Database (migration):**
- `hotel_partners` (id, slug unique, name, type, city, brand_color, logo_url, intro_*, contact_email, contact_phone, perks jsonb, is_active, sort_order)
- Add nullable `partner_id uuid` to `sofitel_experiences`, `sofitel_bookings`, `sofitel_group_requests`; backfill to a seeded "sofitel" partner row; add indexes
- RLS: public SELECT on active partners; admin ALL; hotel_staff role unchanged
- GRANTs to anon/authenticated/service_role

**Frontend:**
- New `src/components/admin/HotelsRiadsSection.tsx` (list + create dialog + per-partner editor sheet) wired into ProSidebar between `sofitel` and `workflow`. Keep the existing `sofitel` quick-link section as-is for now.
- New hook `use-hotel-partners.tsx`
- New generic pages under `src/pages/partners/`: `PartnerLanding.tsx`, `PartnerHotel.tsx`, `PartnerQR.tsx`, `PartnerAdmin.tsx` — refactored from the Sofitel pages to read partner data by `:slug` and theme via brand color CSS vars
- Routes added in `src/App.tsx`; old `/sofitel*` routes kept as thin wrappers that render the same components with slug `sofitel`
- B2B section CTA updated to deep-link to a generic "request your property page" form (no change in wording)

**Scope guardrails:**
- I won't rewrite Sofitel's bespoke UI — I'll generalize the data layer and reuse the same layout templated by partner.
- Sitemap/SEO entries for new partner pages added only when a partner is created (Pro dashboard action).

## Out of scope (ask if you want them)

- Per-partner Stripe/payment routing
- Per-partner email templates (will use existing ones with partner name interpolated)
- Staff invitation flow per partner (uses existing hotel_staff role)

If this matches, I'll start with the migration, then build the dashboard section, then the dynamic public pages.