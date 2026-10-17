import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { JobsStore } from '../core/jobs.store';
import { STATUSES } from '../core/models';
import { StatusBadge } from '../shared/status-badge';
import { TimeAgoPipe } from '../shared/time-ago.pipe';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DatePipe, StatusBadge, TimeAgoPipe],
  template: `
    <section class="hero">
      <div>
        <h1>Your job search</h1>
        <p class="muted">{{ today | date: 'EEEE, d MMMM y' }}</p>
      </div>
      <a routerLink="/applications/new" class="btn">
        <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>Add application
      </a>
    </section>

    @if (store.total() === 0) {
      <div class="card empty">
        <div class="empty-icon"><svg class="icon" viewBox="0 0 24 24"><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 7h18v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg></div>
        <h2>No applications yet</h2>
        <p class="muted">Add the jobs you apply to and follow each one from "Applied" to "Offer".</p>
        <div class="empty-actions">
          <a routerLink="/applications/new" class="btn">Add your first application</a>
          <button class="btn btn-ghost" (click)="store.loadDemo()">Load sample data</button>
        </div>
      </div>
    } @else {
      <section class="stats" aria-label="Summary">
        <div class="stat card"><span class="label">Total</span><strong>{{ store.total() }}</strong><span class="hint">applications</span></div>
        <div class="stat card"><span class="label">Active</span><strong>{{ store.active() }}</strong><span class="hint">applied or interviewing</span></div>
        <div class="stat card" data-status="Interview"><span class="label">Interviews</span><strong class="tone">{{ store.counts().Interview }}</strong><span class="hint">in progress</span></div>
        <div class="stat card" data-status="Offer"><span class="label">Offers</span><strong class="tone">{{ store.counts().Offer }}</strong><span class="hint">received</span></div>
        <div class="stat card highlight"><span class="label">Interview rate</span><strong>{{ store.interviewRate() }}%</strong><span class="hint">of sent applications</span></div>
      </section>

      <section class="card block">
        <div class="block-head"><h2>Pipeline</h2><a routerLink="/applications">View all →</a></div>
        <div class="pipeline" role="img" [attr.aria-label]="pipelineLabel()">
          @for (s of segments(); track s.status) {
            @if (s.count) {
              <span class="seg" [attr.data-status]="s.status" [style.flex-grow]="s.count" [title]="s.status + ': ' + s.count"></span>
            }
          }
        </div>
        <ul class="legend">
          @for (s of segments(); track s.status) {
            <li>
              <a [routerLink]="['/applications']" [queryParams]="{ status: s.status }" [attr.data-status]="s.status">
                <span class="dot"></span>{{ s.status }}<strong>{{ s.count }}</strong>
              </a>
            </li>
          }
        </ul>
      </section>

      <div class="cols">
        <section class="card block">
          <div class="block-head"><h2>Upcoming interviews</h2></div>
          @for (a of store.upcoming(); track a.id) {
            <a class="row" [routerLink]="['/applications', a.id, 'edit']">
              <span class="date"><b>{{ a.interviewOn | date: 'd' }}</b>{{ a.interviewOn | date: 'MMM' }}</span>
              <span class="grow"><strong>{{ a.company }}</strong><span class="muted">{{ a.role }}</span></span>
              <span class="when">{{ a.interviewOn | timeAgo }}</span>
            </a>
          } @empty {
            <p class="muted none">No interviews scheduled. Set an interview date on an application to see it here.</p>
          }
        </section>

        <section class="card block">
          <div class="block-head"><h2>Recent activity</h2></div>
          @for (a of store.recent(); track a.id) {
            <a class="row" [routerLink]="['/applications', a.id, 'edit']">
              <span class="avatar">{{ a.company.charAt(0) }}</span>
              <span class="grow"><strong>{{ a.company }}</strong><span class="muted">{{ a.role }}</span></span>
              <app-status-badge [status]="a.status" />
            </a>
          }
        </section>
      </div>
    }
  `,
  styles: `
    .hero { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; }
    h1 { font-size: clamp(26px, 5vw, 34px); font-weight: 800; }
    .hero p { margin: 4px 0 0; }
    .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px; }
    .stat { padding: 16px; display: flex; flex-direction: column; }
    .label { font-size: 12.5px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .05em; }
    .stat strong { font-size: 32px; font-weight: 800; color: var(--ink); line-height: 1.15; margin-top: 6px; }
    .stat strong.tone { color: var(--s-fg); }
    .hint { font-size: 13px; color: var(--muted); }
    .highlight { background: linear-gradient(135deg, var(--brand), var(--brand-2)); border: 0; grid-column: span 2; }
    .highlight .label, .highlight .hint { color: rgba(255, 255, 255, .8); }
    .highlight strong { color: #fff; }
    @media (min-width: 900px) { .stats { grid-template-columns: repeat(5, 1fr); } .highlight { grid-column: auto; } }

    .block { padding: 18px; margin-bottom: 16px; }
    .block-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
    .block-head h2 { font-size: 17px; }
    .block-head a { font-size: 14px; font-weight: 600; text-decoration: none; }
    .pipeline { display: flex; gap: 4px; height: 18px; border-radius: 999px; overflow: hidden; background: var(--bg); }
    .seg { background: var(--s-solid); min-width: 8px; }
    .legend { list-style: none; padding: 0; margin: 14px 0 0; display: flex; flex-wrap: wrap; gap: 8px; }
    .legend a { display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 999px; background: var(--s-bg); color: var(--s-fg); text-decoration: none; font-weight: 600; font-size: 13.5px; }
    .legend a:hover { filter: brightness(.96); }
    .legend strong { color: var(--ink); }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--s-solid); }

    .cols { display: grid; gap: 16px; }
    .cols .block { margin: 0; }
    @media (min-width: 900px) { .cols { grid-template-columns: 1fr 1fr; } }
    .row { display: flex; align-items: center; gap: 12px; padding: 10px; margin: 0 -10px; border-radius: 12px; text-decoration: none; color: inherit; }
    .row:hover { background: var(--bg); }
    .grow { flex: 1; min-width: 0; display: flex; flex-direction: column; }
    .grow strong { color: var(--ink); }
    .grow .muted { font-size: 13.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .date { width: 46px; height: 50px; flex: none; border-radius: 12px; background: #fef3c7; color: #b45309; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .date b { font-size: 19px; line-height: 1; color: #92400e; }
    .when { font-size: 13px; font-weight: 700; color: #b45309; white-space: nowrap; }
    .avatar { width: 40px; height: 40px; flex: none; border-radius: 12px; display: grid; place-items: center; font-weight: 800; color: var(--brand); background: var(--brand-soft); }
    .none { margin: 0; font-size: 14px; }

    .empty { padding: 48px 24px; text-align: center; }
    .empty-icon { width: 64px; height: 64px; margin: 0 auto 14px; border-radius: 18px; display: grid; place-items: center; color: #fff; background: linear-gradient(135deg, var(--brand), var(--brand-2)); }
    .empty-icon .icon { width: 30px; height: 30px; }
    .empty h2 { font-size: 22px; }
    .empty-actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-top: 18px; }
  `,
})
export class Dashboard {
  readonly store = inject(JobsStore);
  readonly today = new Date();

  readonly segments = computed(() => STATUSES.map((status) => ({ status, count: this.store.counts()[status] })));
  readonly pipelineLabel = computed(() => 'Applications by status: ' + this.segments().map((s) => `${s.status} ${s.count}`).join(', '));
}
