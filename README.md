# JobTrack: Job Application Tracker

Track every job application from **Wishlist → Applied → Interview → Offer** (or Rejected) in one place. Built with **Angular 21**: standalone components, signals, typed reactive forms and lazy-loaded routes. It needs no backend. Data is saved in the browser, so the live demo works anywhere.

## Features

- **Dashboard:** totals, active applications, interviews, offers and the **interview rate**. A colored **pipeline bar** shows each status; click a status to see those applications.
- **Upcoming interviews** (soonest first, e.g. "In 2 days") and **recent activity**.
- **Applications list:** search company, role, location or notes; filter by status chips with counts; sort by newest, oldest, recently updated or A–Z.
- **Change status inline** from each card. Moving an item off the Wishlist sets the applied date to today.
- **Add and edit form** with validation:
  - Company and role are required.
  - The applied date can't be in the future.
  - The job link must be a valid URL.
  - Cross-field rules: the **Interview** status needs an interview date, and the interview can't be before the applied date.
  - After a failed submit, the cursor jumps to the first field to fix.
- **Export CSV**, which opens correctly in Excel.
- **Sample data on first visit**, so the demo isn't empty. **Start with an empty list** removes it.
- Works on mobile, uses hash routing (works on GitHub Pages without server rules), shows keyboard focus rings, and respects reduced motion.

## Tech details

| | |
|---|---|
| **Framework** | **Angular 21** (`@angular/core` 21.2.25, Angular CLI 21.2.27): standalone components, zoneless change detection, signals |
| **Language** | TypeScript 5.9 (strict mode) |
| **Styling** | Plain CSS with CSS variables (colors at the top of `src/styles.css`), Google Font Plus Jakarta Sans. No UI library |
| **Routing** | Angular Router with hash URLs (`#/applications`), so refreshing any page works on GitHub Pages |
| **Tests** | Vitest 4 through the Angular unit-test builder |
| **Build / hosting** | `ng build --base-href ./`, then GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`) |
| **Needs** | Node.js 20.19+ and npm 10 (only to develop or build; visitors need nothing) |
| **Backend / database** | **None.** No server, no account, no API key |

### How the data is stored

- Every application is saved in the browser's **localStorage**, under the key **`job-tracker.v1`**, as JSON: `{ "apps": [ … ], "demo": true|false }`.
- `JobsStore` (`src/app/core/jobs.store.ts`) keeps the list in an Angular **signal**. An `effect()` writes it to localStorage after every change, and it is read back when the app starts.
- Each application holds: company, role, location, work mode, job type, status, applied date, interview date, salary, contact, job link, notes, and created/updated times.
- The data never leaves the device. Each browser and device has its own list, and clearing the browser's site data removes it. **Export CSV** keeps a copy you can open in Excel.
- On the first visit (no saved key yet) the app loads sample applications so the demo is not empty. **Start with an empty list** removes them.

## Angular concepts used

| Concept | Where |
|---|---|
| Signals, `computed`, `effect`, `linkedSignal` | `core/jobs.store.ts` (state + localStorage sync), `pages/applications.ts` (filters) |
| Typed reactive forms, custom and cross-field validators | `pages/application-form.ts` |
| Standalone components, `input()`, new control flow (`@if`, `@for`) | all components |
| Lazy-loaded routes, route params and query params as component inputs | `app.routes.ts`, `withComponentInputBinding()` |
| Custom pipe | `shared/time-ago.pipe.ts` ("3 days ago", "In 2 days") |
| Unit tests (Vitest) | `core/job-utils.spec.ts`: filters, sorting, interview rate, CSV, dates, pipe |

## Run it

```powershell
cd D:\Angular-Fullstack-Portfolio\JobTracker
npm install        # first time only (or after downloading from GitHub)
npm start          # http://localhost:4213
```

Other commands: `npm test` (8 unit tests) · `npm run build` · `npm run build:pages` (build for GitHub Pages).

`.npmrc` sets `legacy-peer-deps=true`, which works around an npm 10 install bug.

## Publish on GitHub Pages (live demo)

1. Create a **public** repository named **`job-tracker`** on GitHub. Don't add a README.
2. Push this folder:
   ```powershell
   cd D:\Angular-Fullstack-Portfolio\JobTracker
   git init
   git add .
   git commit -m "Job Application Tracker"
   git branch -M main
   git remote add origin https://github.com/MirudhulaMaruthanayagam27/job-tracker.git
   git push -u origin main
   ```
3. In the repository, go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
4. Open the **Actions** tab. The "Deploy to GitHub Pages" workflow tests, builds and publishes the app, which takes about 2 minutes. Re-run it once if the first run happened before step 3.
5. Live demo: **https://mirudhulamaruthanayagam27.github.io/job-tracker/**

Every later `git push` updates the live site automatically.
