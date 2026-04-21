# Phase 8.1 — Cycle Tab UI Polish

## Changes

- Period Started Today button is centred and narrower.
- Period Ended Today button is centred and narrower.
- Manual start/end date fields are centred and narrower.
- "Use selected start/end date" buttons are renamed to "Confirm" and made smaller.
- Added spacing above the background-calculation note.
- Daily check-in date field is centred and narrower.
- Symptom inputs changed from 0–10 sliders to Yes/No-style buttons:
  - Cramps / pelvic pain
  - Hot flushes / night sweats
  - Sleep disruption
  - Mood / irritability
  - Fatigue

## Data behaviour

The Notion database still stores the symptom properties as Number fields.

- No = 0
- Yes = 6

This preserves the current training recommendation logic without requiring a Notion database change.
