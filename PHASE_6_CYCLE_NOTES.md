# Phase 6 — Cycle-Aware Training

This build adds optional cycle-aware training support.

## New optional Notion database

Create a database called:

Cycle Logs

## Property types

| Property | Type |
|---|---|
| Cycle Log | Title |
| Date | Date |
| Last Period Start | Date |
| Average Cycle Length | Number |
| Period Day | Number |
| Cycle Phase | Select |
| Bleeding Flow | Select |
| Cramps / Pelvic Pain | Number |
| Hot Flushes / Night Sweats | Number |
| Sleep Disruption | Number |
| Mood / Irritability | Number |
| Fatigue | Number |
| Notes | Text |
| Training Recommendation | Select |

## Six key symptoms/experiences tracked

1. Bleeding Flow
2. Cramps / Pelvic Pain
3. Hot Flushes / Night Sweats
4. Sleep Disruption
5. Mood / Irritability
6. Fatigue

## Select options

### Cycle Phase
- Menstrual
- Follicular
- Ovulation window
- Luteal

### Bleeding Flow
- None
- Spotting
- Light
- Medium
- Heavy

### Training Recommendation
- Normal training
- Technique / moderate strength
- Moderate intensity + recovery
- Reduce load 10–20%
- Recovery / rehab focus

## Vercel variable

Add:

NOTION_CYCLE_LOGS_DB_ID

Then redeploy Vercel.

## Notion access

Share the Cycle Logs database with the same Notion integration.

## What the app does

- Calculates estimated phase from current date, last period start, and average cycle length.
- Shows phase on Today and Check.
- Recommends training modification based on symptoms first, phase second.
- Saves cycle checks to Notion.

## Important

This app estimates cycle phase. Perimenopause can make cycles irregular, so the recommendation system weights symptoms/readiness more heavily than calendar phase.


## Phase 6.1 adjustment

This version matches your final Notion choices:

- Cycle Phase has only 4 options:
  - Menstrual
  - Follicular
  - Ovulation window
  - Luteal
- Bleeding Flow has no Unknown option:
  - None
  - Spotting
  - Light
  - Medium
  - Heavy
- Brain Fog is not tracked.
- Fatigue is tracked as its own Number property.

If Last Period Start is empty, the app displays “Not enough data yet” but does not save that as a Cycle Phase option in Notion.
