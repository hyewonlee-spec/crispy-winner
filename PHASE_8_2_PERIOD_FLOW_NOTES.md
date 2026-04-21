# Phase 8.2 — Period Flow UI

## Changes

The Cycle tab Period Dates section now behaves like a state card:

### Before period start is recorded

Shows:
- No active period recorded
- Period Started Today button

When tapped, a calendar confirmation box appears with:
- date picker
- Cancel
- Save

### After period start is saved

Shows:
- Current period day, e.g. Day 1, Day 2, Day 3
- Period start date
- Period Ended button

When Period Ended is tapped, a calendar confirmation box appears with:
- date picker
- Cancel
- Save

### After period end is saved

Shows:
- Start date
- End date
- Period length
- Record next period start button

## Data behaviour

The app still saves to the same Cycle Logs database fields:
- Period Start Date
- Period End Date
- Period Length
- Cycle Day
- Cycle Phase
- Daily symptoms
