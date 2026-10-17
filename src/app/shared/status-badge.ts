import { Component, input } from '@angular/core';
import type { Status } from '../core/models';

@Component({
  selector: 'app-status-badge',
  template: `<span class="badge" [attr.data-status]="status()">{{ status() }}</span>`,
  styles: `
    .badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: 12.5px; font-weight: 700; white-space: nowrap; background: var(--s-bg); color: var(--s-fg); }
    .badge::before { content: ''; width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
  `,
})
export class StatusBadge {
  readonly status = input.required<Status>();
}
