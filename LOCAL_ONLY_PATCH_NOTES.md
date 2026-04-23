# Muscle Royalty Legacy Local-Only

Base:
- Legacy Successful Build

Change type:
- Data layer only

What changed:
- `/api/*` calls are intercepted in the browser and fulfilled from local browser storage.
- The app no longer depends on Notion or serverless routes for core use.

What did not change:
- UI
- UX
- Page structure
- Existing flows and labels

Stored locally:
- exercise library
- workout sessions
- templates
- cycle logs

Important:
- Data is stored in this browser only.
- Clearing site data/local storage will remove saved data.
