import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { JobsStore } from './core/jobs.store';
import { Toast } from './core/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="top">
      <div class="container bar">
        <a routerLink="/" class="logo" aria-label="JobTrack home">
          <span class="mark"><svg class="icon" viewBox="0 0 24 24"><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 7h18v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg></span>
          JobTrack
        </a>
        <nav aria-label="Main">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Dashboard</a>
          <a routerLink="/applications" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Applications <span class="count">{{ store.total() }}</span></a>
        </nav>
        <a routerLink="/applications/new" class="btn btn-sm add">
          <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg><span class="add-label">Add</span>
        </a>
      </div>
    </header>

    @if (store.isDemo()) {
      <div class="demo container">
        <span>👋 You are looking at <strong>sample data</strong>. Try editing it, then start your own list.</span>
        <button class="btn btn-sm btn-ghost" (click)="startFresh()">Start with an empty list</button>
      </div>
    }

    <main class="container page"><router-outlet /></main>

    <footer class="container foot muted">JobTrack · Built with Angular 21 and signals · Data stays in your browser</footer>

    @if (toast.message(); as m) {
      <div class="toast" role="status">{{ m }}</div>
    }
  `,
  styles: `
    .top { position: sticky; top: 0; z-index: 10; background: rgba(255, 255, 255, .85); backdrop-filter: blur(10px); border-bottom: 1px solid var(--line); }
    .bar { display: flex; align-items: center; gap: 12px; height: 64px; }
    .logo { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 18px; color: var(--ink); text-decoration: none; margin-right: auto; }
    .mark { width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center; color: #fff; background: linear-gradient(135deg, var(--brand), var(--brand-2)); }
    nav { display: flex; gap: 4px; }
    nav a { padding: 8px 12px; border-radius: 10px; color: var(--muted); font-weight: 600; text-decoration: none; display: flex; align-items: center; gap: 6px; }
    nav a:hover { color: var(--ink); background: var(--bg); }
    nav a.active { color: var(--brand); background: var(--brand-soft); }
    .count { font-size: 12px; background: var(--card); border: 1px solid var(--line); border-radius: 999px; padding: 0 7px; color: var(--muted); }
    .demo { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-top: 16px; padding: 12px 16px; background: linear-gradient(90deg, var(--brand-soft), #f5f3ff); border: 1px solid #e0e7ff; border-radius: 14px; font-size: 14px; }
    .page { padding-top: 24px; padding-bottom: 40px; }
    .foot { font-size: 13px; padding-bottom: 28px; text-align: center; }
    .toast { position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%); background: var(--ink); color: #fff; padding: 10px 18px; border-radius: 12px; font-weight: 600; box-shadow: 0 12px 30px -10px rgba(0, 0, 0, .4); z-index: 50; max-width: calc(100vw - 32px); }
    @media (max-width: 560px) {
      .add-label { display: none; }
      .add { width: 42px; padding: 0; }
      nav a { padding: 8px 9px; }
      .logo { font-size: 0; gap: 0; }
    }
  `,
})
export class App {
  readonly store = inject(JobsStore);
  readonly toast = inject(Toast);

  startFresh(): void {
    if (!confirm('Remove the sample applications and start with an empty list?')) return;
    this.store.clearAll();
    this.toast.show('Sample data removed. Add your first application!');
  }
}
