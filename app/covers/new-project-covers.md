# Warta and Kuis Akademik webpage covers

Captured on 2026-10-02 from the actual applications running locally. These
assets show real webpage UI, replacing the previous illustrative artwork.
Capture PNGs were resized and encoded as WebP only; no UI was painted,
AI-generated, or composited into the screenshots.

## Warta

- Files: `warta.webp` (1600 × 1000), `warta-sm.webp` (700 × 438).
- Source: the actual public frontend on `main`, commit `b321735`.
- Page: `/`, using the application's light theme.
- Capture environment: a read-only local preview with fictional article
  fixtures. The app's own category-letter fallback visuals were used for
  article images; no private newsroom content or external images were added.

## Kuis Akademik

- Files: `kuis-akademik.webp` (1440 × 900),
  `kuis-akademik-sm.webp` (700 × 438).
- Source: the existing Go API and React/TypeScript frontend.
- Page: `/#/dashboard`, showing the application's actual admin dashboard.
- Capture environment: an isolated temporary SQLite database and local email
  outbox containing a synthetic admin and the `SMA Cendekia — Demo`
  organization. The fixture populated 4 classes, 27 published questions,
  6 quizzes, and 7 assignments; these numbers are demo data, not real users
  or production activity.
- The current Go source was compiled offline into a temporary binary so its
  authentication contract matched the current frontend. External SMTP,
  webhook delivery, and learning email were disabled. The existing project
  database and Docker volumes were not changed.

Temporary source previews were stopped after capture. The local checkouts and
synthetic fixture database were preserved for recoverability.
