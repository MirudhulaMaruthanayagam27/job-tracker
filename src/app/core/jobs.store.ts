import { computed, effect, Injectable, signal } from '@angular/core';
import { demoApplications } from './demo-data';
import { countByStatus, interviewRate, today, upcomingInterviews } from './job-utils';
import type { JobApplication, JobDraft, Status } from './models';

const KEY = 'job-tracker.v1';

interface Saved {
  apps: JobApplication[];
  demo: boolean;
}

const newId = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));

function stamp(draft: JobDraft): JobApplication {
  const now = new Date().toISOString();
  return { ...draft, id: newId(), createdAt: now, updatedAt: now };
}

function load(): Saved {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Saved;
      if (Array.isArray(saved.apps)) return saved;
    }
  } catch {
    /* blocked or corrupt storage: start with demo data */
  }
  return { apps: demoApplications().map(stamp), demo: true };
}

/** All applications, kept in a signal and saved to this browser's localStorage on every change. */
@Injectable({ providedIn: 'root' })
export class JobsStore {
  private readonly state = signal<Saved>(load());

  readonly apps = computed(() => this.state().apps);
  readonly isDemo = computed(() => this.state().demo);
  readonly counts = computed(() => countByStatus(this.apps()));
  readonly total = computed(() => this.apps().length);
  readonly active = computed(() => this.counts().Applied + this.counts().Interview);
  readonly interviewRate = computed(() => interviewRate(this.apps()));
  readonly upcoming = computed(() => upcomingInterviews(this.apps()));
  readonly recent = computed(() => [...this.apps()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5));

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(KEY, JSON.stringify(this.state()));
      } catch {
        /* private mode: changes last for this tab */
      }
    });
  }

  get(id: string): JobApplication | undefined {
    return this.apps().find((a) => a.id === id);
  }

  add(draft: JobDraft): JobApplication {
    const app = stamp(draft);
    this.state.update((s) => ({ ...s, apps: [app, ...s.apps] }));
    return app;
  }

  update(id: string, draft: JobDraft): void {
    this.patch(id, draft);
  }

  setStatus(id: string, status: Status): void {
    const app = this.get(id);
    if (!app) return;
    // Leaving the wishlist means it was just sent: the applied date becomes today.
    this.patch(id, { status, appliedOn: app.status === 'Wishlist' && status !== 'Wishlist' ? today() : app.appliedOn });
  }

  remove(id: string): void {
    this.state.update((s) => ({ ...s, apps: s.apps.filter((a) => a.id !== id) }));
  }

  /** Removes the sample data and starts with an empty list. */
  clearAll(): void {
    this.state.set({ apps: [], demo: false });
  }

  loadDemo(): void {
    this.state.set({ apps: demoApplications().map(stamp), demo: true });
  }

  private patch(id: string, changes: Partial<JobDraft>): void {
    const updatedAt = new Date().toISOString();
    this.state.update((s) => ({ ...s, apps: s.apps.map((a) => (a.id === id ? { ...a, ...changes, updatedAt } : a)) }));
  }
}
