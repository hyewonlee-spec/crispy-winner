# Muscle Royalty — Cycle Flow Patch: Shark-week

## Changes

Cycle phase rename:

- Menstrual phase is now Shark-week
- Follicular phase remains the same
- Ovulation window remains the same
- Luteal phase remains the same

## Flow logic

Shark-week stays active while a period has a start date but no end date.

That means:

1. User taps Period started and confirms the date.
2. The app shows Shark-week.
3. Shark-week remains active until the user records Period ended.
4. After a period end date exists, the app returns to normal phase estimation.

## Notion change needed

In Cycle Logs > Cycle Phase select options:

Replace:
- Menstrual

with:
- Shark-week

Keep:
- Follicular
- Ovulation window
- Luteal
