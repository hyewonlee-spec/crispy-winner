# Template API Fix

Fixes Save workout Notion property mismatch.

The app previously wrote old property names:
- Template
- Type
- Focus
- Template Link
- Exercise Link
- Notes

It now writes the property names from the Notion template setup:
- Template Name
- Template Type
- Notes
- Workout Template
- Exercise
- Exercise Notes

Also updates GET/list mapping and sorting:
- Sorts Workout Templates by Sort Order.
- Reads template exercises via Workout Template relation.
