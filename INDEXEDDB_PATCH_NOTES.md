# Muscle Royalty Legacy IndexedDB Local

Base:
- Legacy Successful Build

Change type:
- Data layer only

What changed:
- `/api/*` calls are intercepted in the browser.
- Data is stored in IndexedDB instead of localStorage.

What did not change:
- UI
- UX
- Labels
- Page structure
- Existing flows and screen layout

Stored locally in IndexedDB:
- exercise library
- workout sessions
- templates
- cycle logs

Important:
- Data remains browser-local.
- Clearing browser/site storage can still remove it.
