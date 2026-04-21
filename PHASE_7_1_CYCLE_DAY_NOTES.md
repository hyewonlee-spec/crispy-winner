# Phase 7.1 — Cycle Day Rename Patch

This patch updates the app/backend to match your Notion database rename.

## Changed

The app now uses:

Cycle Day

instead of:

Period Day

## Updated Cycle Logs property list

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

## Why

- Period Length = days bleeding lasted
- Cycle Length = days from one period start to the next period start
- Cycle Day = today's day within the whole cycle

Deploy this patch if your Notion database now uses `Cycle Day`.
