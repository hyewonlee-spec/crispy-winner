# Phase 8.3 — Cycle UI/Data Cleanup

## UI changes

- Dates shown in the Cycle dashboard use Australian short format: DD/MM/YY.
- Removed small helper text after the training recommendation tag.
- Removed small helper text from Period dates.
- Removed small helper text from Daily symptom check-in.
- Renamed Daily check-in date to Date.
- Removed Refresh Cycle button.
- Removed Recent cycle logs section.
- Added a Cycle-aware training card to the Today tab.

## New symptom properties

Add these to the Cycle Logs database as Number properties:

| Property | Type |
|---|---|
| Headache/Migraine | Number |
| Salt Cravings | Number |
| Sugar Cravings | Number |
| Cramps | Number |
| Indigestion | Number |
| Bloating | Number |

## Existing symptom properties still used

| Property | Type |
|---|---|
| Hot Flushes / Night Sweats | Number |
| Sleep Disruption | Number |
| Mood / Irritability | Number |
| Fatigue | Number |

## Important rename

The app now writes to:

Cramps

instead of:

Cramps / Pelvic Pain

If your Notion database still has `Cramps / Pelvic Pain`, rename it to `Cramps`.

## Symptom button data behaviour

The app saves symptom buttons as numeric values:

- No = 0
- Yes = 6

This keeps recommendations working while making the UI faster.
