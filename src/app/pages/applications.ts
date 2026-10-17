import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { DatePipe, LowerCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { filterApps, today, toCsv } from '../core/job-utils';
import { JobsStore } from '../core/jobs.store';
import { STATUSES, type JobApplication, type SortKey, type Status } from '../core/models';
import { Toast } from '../core/toast';
import { TimeAgoPipe } from '../shared/time-ago.pipe';

@Component({
  selector: 'app-applications',
  imports: [FormsModule, RouterLink, DatePipe, LowerCasePipe, TimeAgoPipe],
  template: `
    <section class="head">
      <div>
        <h1>Applications</h1>
        <p class="muted">{{ visible().length }} of {{ store.total() }} shown</p>
      </div>
      <div class="head-actions">
        <button class="btn btn-ghost btn-sm" (click)="exportCsv()" [disabled]="!visible().length">
          <svg viewBox="0 0 24 24"><path d="M12 3v12m0 0-4-4m4 4 4-4M4 21h16" /></svg>Export CSV
        </button>
        <a routerLink="/applications/new" class="btn btn-sm"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>Add</a>
      </div>
    </section>

    <div class="toolbar">
      <label class="search">
        <svg class="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        <span class="sr-only">Search</span>
        <input type="search" [ngModel]="query()" (ngModelChange)="query.set($event)" placeholder="Search company, role, location or notes" />
      </label>
      <label class="sort">
        <span class="sr-only">Sort</span>
        <select [ngModel]="sort()" (ngModelChange)="sort.set($event)">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="updated">Recently updated</option>
          <option value="company">Company A–Z</option>
        </select>
      </label>
    </div>

    <div class="chips" role="group" aria-label="Filter by status">
      <button class="chip" [class.on]="filter() === 'All'" [attr.aria-pressed]="filter() === 'All'" (click)="filter.set('All')">All <b>{{ store.total() }}</b></button>
      @for (s of statuses; track s) {
        <button class="chip" [attr.data-status]="s" [class.on]="filter() === s" [attr.aria-pressed]="filter() === s" (click)="filter.set(s)">{{ s }} <b>{{ store.counts()[s] }}</b></button>
      }
    </div>

    <div class="grid">
      @for (a of visible(); track a.id) {
        <article class="card job" [attr.data-status]="a.status">
          <div class="job-top">
            <span class="avatar">{{ a.company.charAt(0) }}</span>
            <div class="title">
              <h2>{{ a.company }}</h2>
              <p>{{ a.role }}</p>
            </div>
            <label class="status-select">
              <span class="sr-only">Status of {{ a.company }}</span>
              <select [ngModel]="a.status" (ngModelChange)="changeStatus(a, $event)">
                @for (s of statuses; track s) {
                  <option [value]="s">{{ s }}</option>
                }
              </select>
            </label>
          </div>

          <ul class="meta">
            @if (a.location) {
              <li><svg class="icon" viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></svg>{{ a.location }}</li>
            }
            <li>{{ a.workMode }}</li>
            <li>{{ a.jobType }}</li>
            @if (a.salary) {
              <li>{{ a.salary }}</li>
            }
          </ul>

          @if (a.status === 'Interview' && a.interviewOn) {
            <p class="interview"><svg class="icon" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></svg>Interview {{ a.interviewOn | date: 'EEE, d MMM' }} · {{ a.interviewOn | timeAgo }}</p>
          }
          @if (a.notes) {
            <p class="notes">{{ a.notes }}</p>
          }

          <div class="job-foot">
            <span class="muted">{{ a.status === 'Wishlist' ? 'Saved' : 'Applied' }} {{ a.appliedOn | timeAgo | lowercase }}</span>
            <span class="actions">
              @if (a.link) {
                <a class="btn btn-ghost btn-sm" [href]="a.link" target="_blank" rel="noopener" aria-label="Open job posting">
                  <svg viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg>
                </a>
              }
              <a class="btn btn-ghost btn-sm" [routerLink]="['/applications', a.id, 'edit']">Edit</a>
              <button class="btn btn-danger btn-sm" (click)="remove(a)" [attr.aria-label]="'Delete ' + a.company">
                <svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>
              </button>
            </span>
          </div>
        </article>
      } @empty {
        <div class="card none">
          @if (store.total()) {
            <h2>No applications match</h2>
            <p class="muted">Try another search or status.</p>
            <button class="btn btn-ghost" (click)="clearFilters()">Clear filters</button>
          } @else {
            <h2>No applications yet</h2>
            <p class="muted">Add the jobs you apply to and track each one to an offer.</p>
            <a routerLink="/applications/new" class="btn">Add your first application</a>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .head { display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
    h1 { font-size: clamp(26px, 5vw, 32px); font-weight: 800; }
    .head p { margin: 2px 0 0; }
    .head-actions { display: flex; gap: 8px; }
    .btn[disabled] { opacity: .5; cursor: not-allowed; }
    .toolbar { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 12px; }
    .search { position: relative; flex: 1; min-width: 220px; }
    .search .icon { position: absolute; left: 12px; top: 13px; color: var(--muted); }
    .search input { padding-left: 40px; }
    .sort { width: 190px; }
    @media (max-width: 560px) { .sort { width: 100%; } }
    .chips { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px; margin-bottom: 14px; scrollbar-width: thin; }
    .chip { flex: none; display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--line); background: var(--card); padding: 7px 13px; border-radius: 999px; font-weight: 600; font-size: 14px; cursor: pointer; color: var(--text); }
    .chip b { font-size: 12px; background: var(--bg); border-radius: 999px; padding: 0 7px; color: var(--muted); }
    .chip.on { background: var(--ink); color: #fff; border-color: var(--ink); }
    .chip[data-status].on { background: var(--s-solid); border-color: var(--s-solid); }
    .chip.on b { background: rgba(255, 255, 255, .25); color: #fff; }

    .grid { display: grid; gap: 14px; }
    @media (min-width: 720px) { .grid { grid-template-columns: repeat(2, 1fr); } }
    @media (min-width: 1060px) { .grid { grid-template-columns: repeat(3, 1fr); } }
    .job { padding: 16px; display: flex; flex-direction: column; gap: 12px; border-top: 4px solid var(--s-solid); transition: transform .15s, box-shadow .15s; }
    .job:hover { transform: translateY(-2px); box-shadow: 0 14px 30px -16px rgba(15, 23, 42, .3); }
    .job-top { display: flex; gap: 12px; align-items: flex-start; }
    .avatar { width: 44px; height: 44px; flex: none; border-radius: 12px; display: grid; place-items: center; font-weight: 800; font-size: 18px; color: var(--s-fg); background: var(--s-bg); }
    .title { flex: 1; min-width: 0; }
    .title h2 { font-size: 16.5px; }
    .title p { margin: 2px 0 0; color: var(--muted); font-size: 14px; }
    .status-select select { min-height: 34px; padding: 4px 28px 4px 10px; width: auto; border-radius: 999px; font-size: 13px; font-weight: 700; background-color: var(--s-bg); color: var(--s-fg); border-color: transparent; cursor: pointer; }
    .meta { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 6px; }
    .meta li { display: inline-flex; align-items: center; gap: 4px; font-size: 13px; color: var(--muted); background: var(--bg); padding: 3px 9px; border-radius: 8px; }
    .meta .icon { width: 14px; height: 14px; }
    .interview { margin: 0; display: flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 700; color: #b45309; background: #fffbeb; border-radius: 10px; padding: 8px 10px; }
    .notes { margin: 0; font-size: 14px; color: var(--text); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .job-foot { margin-top: auto; display: flex; justify-content: space-between; align-items: center; gap: 8px; padding-top: 10px; border-top: 1px dashed var(--line); font-size: 13.5px; }
    .actions { display: flex; gap: 6px; }
    .actions .btn { padding: 6px 10px; }
    .none { grid-column: 1 / -1; text-align: center; padding: 40px 20px; }
    .none h2 { font-size: 20px; margin-bottom: 4px; }
    .none .btn { margin-top: 12px; }
  `,
})
export class Applications {
  readonly store = inject(JobsStore);
  private readonly toast = inject(Toast);
  readonly statuses = STATUSES;

  /** ?status=Interview from the dashboard legend. */
  readonly status = input<string>();
  readonly filter = linkedSignal<Status | 'All'>(() => {
    const s = this.status();
    return (STATUSES as readonly string[]).includes(s ?? '') ? (s as Status) : 'All';
  });
  readonly query = signal('');
  readonly sort = signal<SortKey>('newest');
  readonly visible = computed(() => filterApps(this.store.apps(), this.query(), this.filter(), this.sort()));

  changeStatus(a: JobApplication, status: Status): void {
    this.store.setStatus(a.id, status);
    this.toast.show(`${a.company} moved to ${status}${status === 'Offer' ? ' 🎉' : ''}`);
  }

  remove(a: JobApplication): void {
    if (!confirm(`Delete the application to ${a.company} (${a.role})?`)) return;
    this.store.remove(a.id);
    this.toast.show(`${a.company} deleted`);
  }

  clearFilters(): void {
    this.query.set('');
    this.filter.set('All');
  }

  exportCsv(): void {
    // BOM so Excel reads the file as UTF-8 (₹, names with accents).
    const blob = new Blob(['﻿' + toCsv(this.visible())], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `job-applications-${today()}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    this.toast.show('CSV downloaded');
  }
}
