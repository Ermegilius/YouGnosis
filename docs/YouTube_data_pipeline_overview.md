# YouTube Data Pipeline Overview

## 1. High-Level Flow

1. User signs in through frontend (`frontend/src/components/GoogleOAuth2Button.tsx`) which kicks off the custom OAuth2 route exposed by the backend.
2. After Google grants scopes, backend stores the returned Reporting job metadata (`job_id`) in `youtube_jobs`.
3. Scheduled or manual sync fetches new reports per job, stores ledger entries in `youtube_report_files`, and parses CSV rows into `youtube_daily_metrics`.
4. Materialized view `youtube_metric_aggregates` keeps rolling sums (7/30-day) for dashboards and widgets rendered in `frontend/src/pages/DashboardPage.tsx`.

## 2. Frontend Touchpoints

- **Auth context** (`frontend/src/context/AuthProvider.tsx`, `hooks/useAuth.ts`) keeps Supabase session and Google token metadata synchronized with the backend middleware.
- **Job management UI** (`frontend/src/pages/JobManagementPage.tsx`) calls REST helpers in `frontend/src/api/services/youtube.ts` to list report types, create jobs, and show their statuses.
- **Reports UI** (`frontend/src/pages/ReportTypes.tsx`) surfaces available Reporting API categories using the `/youtube/report-types` endpoint and highlights which jobs already exist for the signed-in user.
- **Dashboard widgets** (`frontend/src/components/AnalyticsDashboard.tsx`, `CompetitorComparison.tsx`, `SEORecommendations.tsx`) query aggregated metrics; for now they mock data but are wired to switch to `/analytics/daily-metrics` once ingestion is live.
- **Protected routing** (`frontend/src/components/ProtectedRoute.tsx`, `ProtectedLayout.tsx`) ensures only authenticated users can hit data-heavy pages; failed token validation redirects back to `pages/LandingPage.tsx`.

## 3. Report Ingestion

- `backend/src/modules/youtube/youtube.service.ts` lists reports (`/jobs/{jobId}/reports`) and downloads CSV files using the saved Google access token.
- **Rate limiting:** Each report download request waits 0.5 seconds to respect YouTube's 60 downloads/minute quota. This is logged for traceability.
- Each raw file creates a `youtube_report_files` row containing time window, checksum, download URL, and processing status.
- Deduplication is enforced by `(user_id, job_id, report_id)` unique index before parsing data.

## 4. Normalized Storage

- Parsed CSV rows become fact records in `youtube_daily_metrics`, linked to both `youtube_jobs.job_id` and the originating `youtube_report_files.id`.
- Metrics columns cover canonical KPIs (views, watch time, revenue, subscriber deltas) plus a `metric_payload` JSONB for report-specific fields (demographics, geography, traffic source).
- Composite unique index `(user_id, job_id, report_date, channel_id, coalesce(video_id, ''))` prevents double inserts when the same day is reprocessed.

## 5. Aggregation & Querying

- Materialized view `youtube_metric_aggregates` is refreshed via cron (manual today) to speed up dashboard queries for rolling periods.
- Backend exposes both raw (`/analytics/daily-metrics`) and aggregated (`/analytics/aggregates`) endpoints; frontend services in `frontend/src/api/services/youtube.ts` select the right one per widget.

## 6. Security & Access

- All rows carry `user_id` so Supabase RLS mirrors `youtube_jobs` policies: users see only their data.
- `SupabaseService.getClient()` is used for request-scoped queries; `getAdminClient()` is limited to background jobs that must bypass RLS.
- Frontend never receives admin credentials; it talks only to backend APIs secured by Supabase session tokens.

## 7. Failure Handling

- `youtube_report_files.status` tracks `pending → parsed → error`. Failed ingestions log `error_message` and keep checksum for troubleshooting.
- Reprocessing re-downloads the report, updates the ledger row, and upserts metrics (conflict target is the composite unique key) so dashboards remain idempotent.
