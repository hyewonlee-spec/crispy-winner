# Muscle Royalty Phase 10.9 — Remove Injury Dependencies

This patch removes injury-related fields from the app UI, workout payloads, and `/api/workouts.js`.

## Removed from UI/state/payloads

- Back Pain
- Nerve Symptoms
- Ankle Pain
- Ankle Stability
- Shoulder
- Dog Walk
- Exercise symptom check fields

## Readiness formula

Readiness is now general, not injury-based:

`readiness = sleep + energy + (10 - stress)`

Score range: 0–30.

- Green: 22–30
- Amber: 14–21
- Red: 0–13

## Removed from `/api/workouts.js`

- Back Pain
- Nerve Symptoms
- Ankle Pain
- Ankle Stability
- Shoulder
- Dog Walk
- Back During Exercise
- Nerve During Exercise
- Ankle During Exercise
- Shoulder During Exercise

## Updated `/api/history.js`

Progress/history no longer returns injury averages.

## After redeploy and testing

You can delete old Notion columns from:

### Workout Sessions

- Back Pain
- Nerve Symptoms
- Ankle Pain
- Ankle Stability
- Shoulder
- Dog Walk

### Workout Exercises

- Back During Exercise
- Nerve During Exercise
- Ankle During Exercise
- Shoulder During Exercise
