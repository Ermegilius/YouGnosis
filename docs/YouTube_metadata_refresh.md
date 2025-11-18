# Metadata Refresh in YouGnosis

## Overview

Metadata refresh is a process in YouGnosis that ensures the YouTube reporting jobs' metadata remains up-to-date. This is essential for maintaining accurate reporting data and compliance with YouTube API Services Developer Policies. The metadata includes details about reporting jobs, such as their name, report type, creation time, and the last time the metadata was refreshed.

---

## Key Features

### Manual Metadata Refresh

- Allows users to manually refresh the metadata for a specific YouTube reporting job.
- Triggered via the endpoint: `POST /youtube/jobs/:jobId/refresh-metadata`.

### Scheduled Metadata Refresh

- Automatically refreshes metadata for all reporting jobs that haven't been updated in the last 30 days.
- Runs daily at midnight using a cron job.

### Database Updates

- Updates the `youtube_jobs` table in the Supabase database with the latest metadata fetched from the YouTube Reporting API.

---

## Metadata Details

The metadata for a YouTube reporting job includes:

- **Job Name**: The human-readable name of the reporting job.
- **Report Type ID**: The type of report the job generates (e.g., `channel_basic_a2`).
- **Creation Time**: The timestamp when the job was created.
- **Last Refreshed**: The timestamp when the metadata was last updated.

---

## How It Works

### Manual Refresh

1. The user sends a request to refresh metadata for a specific job.
2. The backend fetches the latest metadata from the YouTube Reporting API using the user's Google OAuth token.
3. The metadata is updated in the database.

### Scheduled Refresh

1. A cron job runs daily to identify jobs that haven't been refreshed in the last 30 days.
2. For each job, the backend fetches the latest metadata and updates the database.

### Error Handling

- If the Google OAuth token is invalid or expired, the job is skipped, and a warning is logged.
- Any API errors are logged, and appropriate exceptions are thrown.

---

## Endpoints

### Manual Metadata Refresh

- **Endpoint**: `POST /youtube/jobs/:jobId/refresh-metadata`
- **Description**: Refreshes metadata for a specific job.
- **Required**: Valid Google OAuth token.

### Scheduled Metadata Refresh

- **Cron Job**: Runs daily at midnight.
- **Description**: Refreshes metadata for all jobs older than 30 days.

---

## Code References

### Manual Refresh

- `YouTubeController.refreshMetadata`
- `YouTubeService.refreshJobMetadata`

### Scheduled Refresh

- `YouTubeService.refreshAllJobMetadata`

### Database Updates

- Supabase `youtube_jobs` table.

---

## Benefits

- Ensures accurate and up-to-date reporting data.
- Maintains compliance with YouTube API policies.
- Reduces the risk of stale or outdated data in the analytics dashboard.
