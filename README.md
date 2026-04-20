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


## Updating the deployed Vercel app

Vercel does not read changes from ChatGPT canvas. It only deploys files that are committed to the connected GitHub repo.

To update:
1. Replace the files in your GitHub repo with the files in this folder.
2. Commit the changes to the branch Vercel watches, usually `main`.
3. Vercel will create a new deployment automatically.
4. If it does not, go to Vercel → Project → Deployments → three-dot menu → Redeploy.

## Google Sheet sync

1. In your Google Sheet, create these headers:
   Timestamp, Date, Type, Selected Day, Workout Title, Readiness, Sleep, Energy, Stress, Back Pain, Nerve Symptoms, Ankle Pain, Ankle Stability, Shoulder, Dog Walk, Completed Exercises, Notes
2. Go to Extensions → Apps Script.
3. Paste the contents of `google-apps-script-doPost.js`.
4. Deploy as Web App.
5. Set Execute as: Me.
6. Set Who has access: Anyone.
7. Paste the Web App URL into the tracker app.
