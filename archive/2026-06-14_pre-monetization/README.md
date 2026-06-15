# Archive — pre-monetization pages (snapshot 2026-06-14)

Frozen copies of the pages being superseded by the new $15/mo conversion flow.
These are reference snapshots only — they are **not imported or bundled**
(this folder lives outside `src/`). The live files remain in `src/pages/`
until we're confident the new flow is stable.

| Archived file        | What it was                          | Replaced by                                  | Live route today |
|----------------------|--------------------------------------|----------------------------------------------|------------------|
| `MarketingPage.jsx`  | Original marketing/landing page      | `src/pages/ConversionLanding.jsx`            | still at `/home` |
| `HubPage.jsx`        | Legacy logged-in hub                 | `src/pages/Hub.jsx`                           | still at `/hub/classic` |

## Why keep them
- Easy rollback if the new landing/hub underperforms.
- Reference for copy, layout, and analytics events we may want to carry over.

## When safe to delete
Once `ConversionLanding` + new `Hub` have been published and validated in prod
(conversion + retention look healthy), the `/home` and `/hub/classic` routes and
these archived copies can be removed.
