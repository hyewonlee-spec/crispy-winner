# Phase 8 — Cycle Events + Daily Symptom Check-ins

This patch changes the Cycle tab workflow.

## What changed

### Period events

The Cycle tab now has a Period dates card with:

- Period Started Today button
- Period Ended Today button
- Calendar field to set Period Start Date manually
- Calendar field to set Period End Date manually
- Buttons to use selected dates

This supports both:
- tapping on the actual day, and
- backdating if you forgot.

### Hidden background calculations

The following are no longer shown as main input fields:

- Period length entered
- Average period length
- Ovulation timing label

They are still calculated in the background and used for the dashboard/recommendations.

### Daily symptoms

Bleeding flow and symptoms are treated as daily check-ins:

- Daily check-in date
- Bleeding Flow
- Cramps / Pelvic Pain
- Hot Flushes / Night Sweats
- Sleep Disruption
- Mood / Irritability
- Fatigue
- Notes

## Notion database

No new database is required. Keep using Cycle Logs.

Recommended properties:

| Property | Type |
|---|---|
| Cycle Log | Title |
| Date | Date |
| Period Start Date | Date |
| Period End Date | Date |
| Period Length | Number |
| Cycle Length | Number |
| Cycle Day | Number |
| Cycle Phase | Select |
| Bleeding Flow | Select |
| Cramps / Pelvic Pain | Number |
| Hot Flushes / Night Sweats | Number |
| Sleep Disruption | Number |
| Mood / Irritability | Number |
| Fatigue | Number |
| Notes | Text |
| Training Recommendation | Select |

## Important behaviour

A daily check-in row can include:
- only symptoms,
- a period start event,
- a period end event,
- or both event + symptoms.

This keeps tracking flexible.
