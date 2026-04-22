# Muscle Queens Phase 10.2 — Dashboard + Cycle Fixes

## Today page

- Added Start today’s workout button under readiness.
- Record the day now opens the workout chooser after saving.
- Status no longer shows the numeric score.
- Status now explains:
  - Green = train as planned
  - Amber = modify today
  - Red = recovery/rehab/gentle movement
- Symptoms checklist is hidden behind a toggle.

## Cycle-aware training

- Fixed the projected period calculation.
- If the expected date has already passed, the app rolls forward to the next projected cycle instead of showing negative days.

Example:
- Period start: 05/03/2026
- Average cycle: 28 days
- Today: 22/04/2026
- Next due becomes around 30/04/2026 instead of showing a negative number.

## Cycle page

- Add previous period dates renamed to Add previous cycle.
- Add previous cycle button is smaller.
- Previous start/end date fields sit side-by-side.
- Save previous period renamed to Save cycle.
- Period Dates now shows Next period is due in + remaining days.

## Workout chooser

- Added a general “Let’s begin your workout” modal for Today actions.
