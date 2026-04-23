# Cycle Page Polish — Install Safe

This package fixes Vercel `npm install` failures by:

- Using Vite 4.5.3 instead of latest/Vite 5+
- Pinning dependency versions
- Removing the Node `engines` restriction
- Including `package-lock.json`

Local checks passed:

- npm install
- npm run build

Cycle page polish changes are retained.
