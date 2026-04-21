# Phase 2 Setup — Vercel Backend + Notion Sync

This build expects the four Notion databases from Phase 1:

1. Exercise Library
2. Workout Sessions
3. Workout Exercises
4. Exercise Sets

## Required Vercel Environment Variables

Add these in Vercel → Project → Settings → Environment Variables:

```text
NOTION_TOKEN
NOTION_EXERCISE_LIBRARY_DB_ID
NOTION_WORKOUT_SESSIONS_DB_ID
NOTION_WORKOUT_EXERCISES_DB_ID
NOTION_EXERCISE_SETS_DB_ID
```

After adding or changing environment variables, redeploy.

## Important Relation Property Names

The backend expects these relation columns:

### Workout Exercises database

```text
Workout Session Link → Relation to Workout Sessions
Exercise Link → Relation to Exercise Library
```

### Exercise Sets database

```text
Workout Exercise Link → Relation to Workout Exercises
```

If you used different names, either rename them in Notion or update `api/workouts.js`.

## API routes included

```text
GET  /api/health
GET  /api/exercises
POST /api/exercises
POST /api/workouts
```

## Testing order

1. Deploy to Vercel.
2. Open:

```text
https://your-app.vercel.app/api/health
```

You want:

```json
{ "ok": true }
```

3. Open the app.
4. Tap **Sync library**.
5. Confirm the exercise list loads.
6. Tap **Save readiness only**.
7. Check Notion → Workout Sessions.
8. Build a small workout with one exercise and one set.
9. Save workout.
10. Check:
   - Workout Sessions
   - Workout Exercises
   - Exercise Sets

## Known Phase 2 limitations

- This is a functional v2 backend + basic UI, not the final polished app.
- It assumes Phase 1 property names match exactly.
- It creates Notion rows; it does not yet update existing sessions.
- It does not yet provide full history charts.
- Relation fields are created automatically only after the relation properties exist in Notion.
