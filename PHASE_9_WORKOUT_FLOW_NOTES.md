# Phase 9 — Workout Flow Redesign

## Today tab

- Workout Builder is renamed to Workout.
- Buttons are Recommended and DIY.
- Choosing a recommended workout opens a confirmation pop-up.

## Starting workout

When Yes is selected:
- The app creates a new Workout Session entry in Notion.
- The app switches to Workout tab.
- The app enters active workout mode.
- The palette changes to hot pink + black.

## Workout tab

- Custom workout name is editable.
- RPE is removed from set entry and set saving.
- Duplicate last is renamed to Copy the last set.
- Active workouts show End Today’s workout.

## Ending workout

When End Today’s workout is tapped:
- Confirmation pop-up appears.
- No = pop-up disappears.
- Yes = exercises/sets are recorded to the active Notion session.
- Confirmation: Today’s workout has been recorded, WELL DONE!
- Palette returns to default.

## Backend

/api/workouts now supports:
- action: "start" to create the session at workout start.
- existingSessionId to save exercises/sets into that session at workout end.


## Active workout persistence

The active workout session ID is stored locally so a browser refresh should not immediately lose the active workout state.
