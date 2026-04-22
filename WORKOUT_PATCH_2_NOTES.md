# Workout Patch 2

Workout page only.

- Removed top + Add exercise from workout title/header box.
- Removed exercise collapse/toggle function and button.
- Exercise cards stay open during workout.
- End workout confirmation says only: Are you sure?
- No: closes popup, no change.
- Yes: uploads workout to Notion and returns to Today page.
- Custom workout title is editable.
- Recommended workout title is display-only.
- Added Save workout before End Today’s workout.
- Save workout uses saveTemplate to save as a Notion workout template.

Requires env vars for Save workout:
- NOTION_WORKOUT_TEMPLATES_DB_ID
- NOTION_TEMPLATE_EXERCISES_DB_ID
