# JobTrack: Job Application Tracker

**🌐 Live demo: https://mirudhulamaruthanayagam27.github.io/job-tracker/** · Source: https://github.com/MirudhulaMaruthanayagam27/job-tracker

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

## Run it on any laptop

You only need **Node.js** (which includes npm). There's no database, server or API key to set up.

1. Install **Node.js 20.19 or newer** (the LTS version from https://nodejs.org). Check it with `node -v`.
2. Download the code. Either:
   - **With Git:**
     ```powershell
     git clone https://github.com/MirudhulaMaruthanayagam27/job-tracker.git
     cd job-tracker
     ```
   - **Without Git:** on the repository page, click **Code → Download ZIP**, unzip it, and open a terminal in that folder.
3. Install the packages. This is needed once after every download, because `node_modules` is not stored in GitHub. It takes about 2 minutes.
   ```powershell
   npm install
   ```
4. Start the app:
   ```powershell
   npm start
   ```
   Then open **http://localhost:4213**.

Other commands:
- `npm test` runs the 8 unit tests.
- `npm run build` makes a production build.
- `npm run build:pages` makes a build for GitHub Pages.

`.npmrc` sets `legacy-peer-deps=true`, which works around an npm 10 install bug, so `npm install` works the same on every machine.

## Publish on GitHub Pages (live demo)

The code is in the repository on the branch **`feat/job-tracker`**. To publish it:

1. In the repository, go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
2. Open the **Actions** tab → **Deploy to GitHub Pages** → **Run workflow**, choose the branch **`feat/job-tracker`**, and click **Run workflow**. It tests, builds and publishes the app in about 2 minutes.
3. Live demo: **https://mirudhulamaruthanayagam27.github.io/job-tracker/**

After you merge into `main`, every push to `main` republishes the site automatically (see `.github/workflows/deploy.yml`).
