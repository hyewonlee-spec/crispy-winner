# Muscle Queens Phase 10.3 — Menstruation Tracking Choice

## What this adds

On first use, the app asks:

Do you want to track menstruation?

Options:
- Yes
- No

## Behaviour

### Yes

The app proceeds with the full version:
- Today page cycle-aware training card
- Cycle tab
- Cycle Notion/API features

### No

The app proceeds without cycle tracking:
- Cycle-aware training card is hidden from Today
- Cycle tab is hidden from the bottom menu
- Cycle API is not automatically loaded

## Saved setting

The choice is saved locally on the device/browser using localStorage:

muscle_queens_track_cycle

## Changing the choice later

A small setting panel was added to the Check page:

Menstruation tracking setting

Options:
- Track menstruation
- Hide cycle tracking

## Notion changes

No Notion database changes are required.
