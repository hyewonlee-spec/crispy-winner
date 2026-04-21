# Phase 3 UX Polish

This build keeps your working Notion backend and improves the front-end UX.

## Added

- Save button loading states
- Toast feedback banners for active buttons
- Clear success/failure messages
- Better recommended/custom workout builder flow
- Cleaner set-entry UI
- Add set / duplicate last set / delete set
- Exercise symptom check hidden inside details
- Library search + category/status filters
- Progress dashboard tab
- `/api/history` endpoint for recent Workout Sessions

## New API route

```text
GET /api/history
```

This reads recent Workout Sessions from Notion and powers the Progress dashboard.

## Deploy

Upload/replace the existing repo files with this build, including the new `api/history.js` file.

Then redeploy Vercel.

## Test

1. `/api/health`
2. `/api/exercises`
3. `/api/history`
4. App → Sync library
5. App → Save readiness only
6. App → Save one workout
7. App → Progress → Refresh progress
