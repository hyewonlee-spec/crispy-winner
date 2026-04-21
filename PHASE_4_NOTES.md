# Phase 4 Upgrade Notes

This build adds:

1. Previous set / last logged weight display
2. Progress dashboard charts
3. Save/load/delete local workout drafts
4. Optional Notion-saved workout templates
5. Dropdown-based custom exercise form
6. Exercise history page
7. Lavender responsive UI

## New API routes

- `GET /api/exercise-history?exerciseId=...`
- `GET /api/templates`
- `POST /api/templates`

## Optional Notion workout templates

To use Notion-saved workout templates, create two extra databases.

### Workout Templates

Property types:

| Property | Type |
|---|---|
| Template | Title |
| Type | Select |
| Focus | Text |
| Active | Checkbox |

Vercel variable:

`NOTION_WORKOUT_TEMPLATES_DB_ID`

### Template Exercises

Property types:

| Property | Type |
|---|---|
| Template Exercise | Title |
| Template Link | Relation → Workout Templates |
| Exercise Link | Relation → Exercise Library |
| Order | Number |
| Target Sets | Number |
| Target Reps | Text |
| Notes | Text |

Vercel variable:

`NOTION_TEMPLATE_EXERCISES_DB_ID`

Share both databases with your Notion integration, then redeploy Vercel.

If you do not create these, the rest of the app still works. The app will simply show that templates are not configured.

## Existing required databases

No change required to the four existing databases:

- Exercise Library
- Workout Sessions
- Workout Exercises
- Exercise Sets
