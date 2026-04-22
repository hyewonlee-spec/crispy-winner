# Install Fix

This fixes Vercel `npm install` failures caused by using `latest` dependency versions.

Changed package.json from latest versions to stable pinned versions:

- vite: 5.4.11
- @vitejs/plugin-react: 4.3.4
- react: 18.2.0
- react-dom: 18.2.0
- lucide-react: 0.468.0

Also added:
- engines.node >=18.17.0
