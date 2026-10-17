import { addDays, today } from './job-utils';
import type { JobDraft } from './models';

/** Sample applications shown on first visit, so the live demo is not empty. Dates are relative to today. */
export function demoApplications(): JobDraft[] {
  const t = today();
  const base = { salary: '', link: '', contact: '', notes: '', interviewOn: null };
  return [
    { ...base, company: 'Nimbus Labs', role: 'Angular Developer', location: 'Coimbatore', workMode: 'Hybrid', jobType: 'Full-time', status: 'Interview', appliedOn: addDays(t, -9), interviewOn: addDays(t, 2), salary: '4–5 LPA', notes: 'Technical round: Angular signals, RxJS, reactive forms.' },
    { ...base, company: 'Brightpath Software', role: 'Front-End Developer', location: 'Chennai', workMode: 'On-site', jobType: 'Full-time', status: 'Applied', appliedOn: addDays(t, -3), notes: 'Applied through LinkedIn.' },
    { ...base, company: 'Kovai Digital', role: 'UI Developer', location: 'Coimbatore', workMode: 'On-site', jobType: 'Full-time', status: 'Offer', appliedOn: addDays(t, -24), interviewOn: addDays(t, -12), salary: '4.2 LPA', notes: 'Offer letter received. Reply by Friday.' },
    { ...base, company: 'CloudKart', role: 'Angular Developer', location: 'Bengaluru', workMode: 'Remote', jobType: 'Full-time', status: 'Interview', appliedOn: addDays(t, -6), interviewOn: addDays(t, 5), notes: 'HR call done. Next: machine coding round.' },
    { ...base, company: 'Pixel Forge', role: 'Front-End Intern', location: 'Remote', workMode: 'Remote', jobType: 'Internship', status: 'Rejected', appliedOn: addDays(t, -30), notes: 'Position filled. Ask for feedback.' },
    { ...base, company: 'Sunrise Fintech', role: 'Junior Web Developer', location: 'Chennai', workMode: 'Hybrid', jobType: 'Full-time', status: 'Applied', appliedOn: addDays(t, -1) },
    { ...base, company: 'Greenleaf Analytics', role: 'Angular Developer', location: 'Bengaluru', workMode: 'Hybrid', jobType: 'Full-time', status: 'Wishlist', appliedOn: t, notes: 'Update resume with portfolio link before applying.' },
    { ...base, company: 'TechNest Solutions', role: 'Software Developer (Angular)', location: 'Coimbatore', workMode: 'On-site', jobType: 'Full-time', status: 'Applied', appliedOn: addDays(t, -12) },
  ];
}
