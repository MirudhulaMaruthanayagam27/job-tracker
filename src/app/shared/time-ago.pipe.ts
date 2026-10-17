import { Pipe, PipeTransform } from '@angular/core';
import { daysSince } from '../core/job-utils';

/** '2026-10-14' → '3 days ago', 'Yesterday', 'Today', 'In 2 days', 'Tomorrow'. */
@Pipe({ name: 'timeAgo' })
export class TimeAgoPipe implements PipeTransform {
  transform(iso: string | null | undefined, now = new Date()): string {
    if (!iso) return '';
    const d = daysSince(iso, now);
    if (d === 0) return 'Today';
    if (d === 1) return 'Yesterday';
    if (d === -1) return 'Tomorrow';
    if (d < 0) return `In ${-d} days`;
    if (d < 30) return `${d} days ago`;
    const months = Math.floor(d / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }
}
