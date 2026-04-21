# Phase 7 — Dedicated Cycle Tab

This patch moves cycle-aware training out of Check and into its own bottom tab: **Cycle**.

## What changed

- Cycle-aware training is now a separate page/tab.
- Top of Cycle page shows:
  - Current estimated menstruation phase
  - Current day of cycle
  - Remaining days until projected next period start
  - Projected period start date
  - Estimated ovulation date
- Cycle input now uses:
  - Period Start Date
  - Period End Date
- Average cycle length is no longer editable.
- Average cycle length is calculated from saved period start dates / stored cycle lengths.
- Period length is calculated from Period Start Date and Period End Date.
- Ovulation is estimated as 14 days before projected next period start.

## Updated Cycle Logs database properties

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

## Cycle Phase options

- Menstrual
- Follicular
- Ovulation window
- Luteal

## Bleeding Flow options

- None
- Spotting
- Light
- Medium
- Heavy

## Training Recommendation options

- Normal training
- Technique / moderate strength
- Moderate intensity + recovery
- Reduce load 10–20%
- Recovery / rehab focus

## Notes on calculation

- Projected next period start = latest Period Start Date + calculated average cycle length.
- Estimated ovulation = projected next period start - 14 days.
- Menstrual phase uses Period Length average when available, otherwise a 5-day fallback.
- Symptom severity still overrides phase for training recommendations.
