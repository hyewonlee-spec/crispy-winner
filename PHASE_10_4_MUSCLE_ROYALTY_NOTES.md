# Muscle Royalty Phase 10.4

## App rename

The app is now Muscle Royalty.

## Today page

- Removed Start today’s workout button from readiness card.
- Removed the symptoms checklist card.
- Removed the standalone Let’s begin your workout box from the Today page.
- Record the day is now Record and start workout.
- If the user records the day and then chooses Not yet in the workout popup, the button changes to Start workout and does not create another Notion readiness entry.

## Cycle page

- Removed Period Dates box.
- Added Your cycle box at the top, using the same dashboard style as Today.
- Period started now confirms the date.
- Removed Add previous cycle function.
- Added Previous cycles list under Your cycle.
- Previous cycles can be deleted. This archives the corresponding Notion page, so the app ignores it.

## Cycle check-in

- Save today’s check-in resets selected flow/symptoms/notes to default.

## Notion/API

- Bleeding Flow should be Multi-select.
- Cycle entries can be archived through DELETE /api/cycle?id=<page_id>.
