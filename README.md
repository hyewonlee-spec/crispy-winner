# Rehab Strength Tracker PWA

This is a standalone React + Vite version of the Rehab Strength Tracker.

## Deploy on Vercel

1. Unzip this folder.
2. Upload the **contents of the folder** to a GitHub repository.
   - Important: `index.html` and `package.json` must be at the top/root of the repository.
3. In Vercel, import the GitHub repo.
4. Use these settings:
   - Framework preset: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
5. Deploy.
6. Open the main Vercel deployment URL, not a subfolder URL.

## Deploy on Netlify

1. Unzip this folder.
2. Upload the contents to GitHub, or drag-and-drop the built `dist` folder.
3. If deploying from GitHub, use:
   - Build command: `npm run build`
   - Publish directory: `dist`

## Install on phone

### iPhone
Open the app link in Safari → Share → Add to Home Screen.

### Android
Open the app link in Chrome → three-dot menu → Add to Home screen or Install.

## Notes

- Data is saved locally in the browser using localStorage.
- Clearing browser data can delete logs.
- This version does not use a cloud database.
