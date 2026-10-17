import { STATUSES, type JobApplication, type SortKey, type Status } from './models';

/** Today as YYYY-MM-DD in local time. */
export function today(now = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

/** YYYY-MM-DD shifted by n days. */
export function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  return today(new Date(y, m - 1, d + n));
}

/** Whole days from `iso` to today (negative = in the future). */
export function daysSince(iso: string, now = new Date()): number {
  const [y, m, d] = iso.split('-').map(Number);
  const then = new Date(y, m - 1, d).getTime();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((start - then) / 86_400_000);
}

export function countByStatus(apps: readonly JobApplication[]): Record<Status, number> {
  const counts = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<Status, number>;
  for (const a of apps) counts[a.status]++;
  return counts;
}

/** Share of sent applications that reached an interview or an offer (wishlist items are not sent yet). */
export function interviewRate(apps: readonly JobApplication[]): number {
  const sent = apps.filter((a) => a.status !== 'Wishlist');
  if (!sent.length) return 0;
  const reached = sent.filter((a) => a.status === 'Interview' || a.status === 'Offer' || (a.status === 'Rejected' && a.interviewOn));
  return Math.round((reached.length / sent.length) * 100);
}

export function filterApps(apps: readonly JobApplication[], query: string, status: Status | 'All', sort: SortKey): JobApplication[] {
  const q = query.trim().toLowerCase();
  const list = apps.filter(
    (a) => (status === 'All' || a.status === status) && (!q || [a.company, a.role, a.location, a.notes].some((v) => v.toLowerCase().includes(q))),
  );
  const by: Record<SortKey, (a: JobApplication, b: JobApplication) => number> = {
    newest: (a, b) => b.appliedOn.localeCompare(a.appliedOn) || b.createdAt.localeCompare(a.createdAt),
    oldest: (a, b) => a.appliedOn.localeCompare(b.appliedOn) || a.createdAt.localeCompare(b.createdAt),
    company: (a, b) => a.company.localeCompare(b.company, undefined, { sensitivity: 'base' }),
    updated: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
  };
  return [...list].sort(by[sort]);
}

/** Interviews from today onwards, soonest first. */
export function upcomingInterviews(apps: readonly JobApplication[], now = new Date()): JobApplication[] {
  const t = today(now);
  return apps.filter((a) => a.status === 'Interview' && a.interviewOn && a.interviewOn >= t).sort((a, b) => a.interviewOn!.localeCompare(b.interviewOn!));
}

/** CSV with a header row; values quoted so commas and line breaks are safe in Excel. */
export function toCsv(apps: readonly JobApplication[]): string {
  const cols: (keyof JobApplication)[] = ['company', 'role', 'status', 'location', 'workMode', 'jobType', 'appliedOn', 'interviewOn', 'salary', 'contact', 'link', 'notes'];
  const head = ['Company', 'Role', 'Status', 'Location', 'Work mode', 'Job type', 'Applied on', 'Interview on', 'Salary', 'Contact', 'Link', 'Notes'];
  const cell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [head.map(cell).join(','), ...apps.map((a) => cols.map((c) => cell(a[c])).join(','))].join('\r\n');
}
