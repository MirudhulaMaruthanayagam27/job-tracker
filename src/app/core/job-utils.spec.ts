import { TimeAgoPipe } from '../shared/time-ago.pipe';
import { addDays, countByStatus, daysSince, filterApps, interviewRate, toCsv, upcomingInterviews } from './job-utils';
import type { JobApplication } from './models';

const now = new Date(2026, 9, 17); // 17 Oct 2026

let n = 0;
const app = (over: Partial<JobApplication>): JobApplication => ({
  id: String(++n),
  company: 'Acme',
  role: 'Angular Developer',
  location: 'Coimbatore',
  workMode: 'Hybrid',
  jobType: 'Full-time',
  status: 'Applied',
  appliedOn: '2026-10-10',
  interviewOn: null,
  salary: '',
  link: '',
  contact: '',
  notes: '',
  createdAt: `2026-10-10T00:00:0${n % 10}Z`,
  updatedAt: `2026-10-10T00:00:0${n % 10}Z`,
  ...over,
});

describe('job-utils', () => {
  const apps = [
    app({ company: 'Beta', status: 'Applied', appliedOn: '2026-10-12' }),
    app({ company: 'alpha', status: 'Interview', appliedOn: '2026-10-05', interviewOn: '2026-10-20', notes: 'machine coding round' }),
    app({ company: 'Gamma', status: 'Offer', appliedOn: '2026-09-20' }),
    app({ company: 'Delta', status: 'Rejected', appliedOn: '2026-09-25' }),
    app({ company: 'Zeta', status: 'Wishlist', appliedOn: '2026-10-16' }),
  ];

  it('counts applications per status', () => {
    expect(countByStatus(apps)).toEqual({ Wishlist: 1, Applied: 1, Interview: 1, Offer: 1, Rejected: 1 });
  });

  it('computes the interview rate from sent applications only (wishlist excluded)', () => {
    expect(interviewRate(apps)).toBe(50); // Interview + Offer out of 4 sent
    expect(interviewRate([])).toBe(0);
  });

  it('filters by status and searches company, role, location and notes', () => {
    expect(filterApps(apps, '', 'Offer', 'newest').map((a) => a.company)).toEqual(['Gamma']);
    expect(filterApps(apps, 'MACHINE', 'All', 'newest').map((a) => a.company)).toEqual(['alpha']);
  });

  it('sorts newest, oldest and by company (case-insensitive)', () => {
    expect(filterApps(apps, '', 'All', 'newest')[0].company).toBe('Zeta');
    expect(filterApps(apps, '', 'All', 'oldest')[0].company).toBe('Gamma');
    expect(filterApps(apps, '', 'All', 'company').map((a) => a.company)).toEqual(['alpha', 'Beta', 'Delta', 'Gamma', 'Zeta']);
  });

  it('lists only future interviews, soonest first', () => {
    const list = upcomingInterviews([...apps, app({ company: 'Past', status: 'Interview', interviewOn: '2026-10-01' }), app({ company: 'Soon', status: 'Interview', interviewOn: '2026-10-18' })], now);
    expect(list.map((a) => a.company)).toEqual(['Soon', 'alpha']);
  });

  it('writes Excel-safe CSV', () => {
    const csv = toCsv([app({ company: 'Comma, Inc', notes: 'said "hi"\nnext line' })]);
    expect(csv.split('\r\n')[0]).toContain('"Company","Role","Status"');
    expect(csv).toContain('"Comma, Inc"');
    expect(csv).toContain('"said ""hi""\nnext line"');
  });

  it('does date arithmetic in local time', () => {
    expect(addDays('2026-10-30', 3)).toBe('2026-11-02');
    expect(daysSince('2026-10-14', now)).toBe(3);
    expect(daysSince('2026-10-19', now)).toBe(-2);
  });

  it('formats relative days', () => {
    const pipe = new TimeAgoPipe();
    expect(pipe.transform('2026-10-17', now)).toBe('Today');
    expect(pipe.transform('2026-10-16', now)).toBe('Yesterday');
    expect(pipe.transform('2026-10-18', now)).toBe('Tomorrow');
    expect(pipe.transform('2026-10-20', now)).toBe('In 3 days');
    expect(pipe.transform('2026-10-07', now)).toBe('10 days ago');
    expect(pipe.transform('2026-08-01', now)).toBe('2 months ago');
  });
});
