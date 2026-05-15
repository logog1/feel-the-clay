## Goal

`/sofitel` is the **guest-facing booking page**. It should show the real workshops from the PDF and the guest-relevant promises only. Drop everything that talks to the hotel as a partner (the merger, journey, advantage, ecosystem, partnership terms, "send a brief" CTA).

## 1. Replace placeholder experiences with the PDF catalogue

Update `sofitel_experiences` so the live booking grid lists exactly what was promised in the presentation.

**On-property workshops (category `in-hotel`)**
| Title | Subtitle | Duration | Price | Capacity |
|---|---|---|---|---|
| Pottery Handbuilding | Earth and form by hand | 150 min | 300 MAD | 8 |
| Canvas Painting | Moroccan motifs in acrylic | 120 min | 280 MAD | 10 |
| Zellij Mosaic Tile | Geometry of living heritage | 150 min | 350 MAD | 8 |
| Ceramic Painting | Glaze a bespoke piece | 120 min | 280 MAD | 10 |
| Moroccan Rug Weaving | The crown jewel on the loom | 150 min | 350 MAD | 8 |

**Off-property immersions (category `outdoor` / `cultural`)**
| Title | Subtitle | Duration | Price | Capacity |
|---|---|---|---|---|
| Pottery at a Local Cooperative | Half-day in Tetouan's artisan quarter | 240 min | on request (stored as 0) | 6 |
| Cooking with a Local Family | A genuine Tetouan home kitchen | 180 min | on request | 8 |
| Garden and Plant Experience | Paint a pot, plant a seedling | 150 min | 250 MAD | 10 |

Existing rows replaced via migration (delete current 8 rows, insert 8 new with sensible upcoming `scheduled_at` slots so the live grid still populates).

## 2. Cut hotel-partner sections from `Sofitel.tsx`

In `CollectionSections.tsx`, keep only what's useful to a guest deciding what to book. Remove from the rendered list:
- `MergerSection` (partnership pitch)
- `JourneySection` (inside vs outside framing for the hotel)
- `BespokeSection` (custom activations for the hotel's F&B)
- `AdvantageSection` (operational benefits to Sofitel)
- `EcosystemSection` (QR + dashboard pitch)
- `StandardsSection` (partnership terms / invoicing)
- `CollectionCta` ("Send a brief" / WhatsApp Othmane card)

Keep, lightly reworded for guests:
- **On-property menu** — the 4 workshop cards as a teaser of what's offered on the resort
- **Rug weaving** — the crown-jewel feature block
- **Off-property immersions** — the 3 cultural excursions

Add one new compact **"Good to know"** strip with the guest-relevant promises only:
- Sessions in French, English or Arabic
- Min 4 guests indoors, 2 guests outdoors
- Book at least 24h ahead
- Free cancellation up to 24h before; 30% fee under 24h
- All materials provided

Order on the page becomes: Hero → On-property menu → Rug feature → Off-property immersions → Good to know → Live booking grid (existing) → footer.

## Technical notes

- DB change is a single migration: `DELETE FROM sofitel_experiences;` then `INSERT` 8 rows with `scheduled_at` set to upcoming dates so the existing booking grid still has data.
- `CollectionSections.tsx` keeps the same exports; only the `CollectionSections` composition changes plus a new `GoodToKnow` block. `CollectionCta` export stays but `Sofitel.tsx` stops rendering it.
- No changes to admin, hotel staff console, QR generator, or availability calendar.
