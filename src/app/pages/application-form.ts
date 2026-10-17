import { afterNextRender, Component, effect, inject, Injector, input, signal, untracked } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { today } from '../core/job-utils';
import { JobsStore } from '../core/jobs.store';
import { JOB_TYPES, STATUSES, WORK_MODES, type JobDraft } from '../core/models';
import { Toast } from '../core/toast';

/** Cross-field rules: an Interview needs a date, and an interview cannot come before the application. */
function interviewRules(group: AbstractControl): ValidationErrors | null {
  const { status, interviewOn, appliedOn } = group.getRawValue() as { status: string; interviewOn: string; appliedOn: string };
  if (status === 'Interview' && !interviewOn) return { interviewDateRequired: true };
  if (interviewOn && appliedOn && interviewOn < appliedOn) return { interviewBeforeApplied: true };
  return null;
}

@Component({
  selector: 'app-application-form',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <a routerLink="/applications" class="back">← Back to applications</a>
    <h1>{{ id() ? 'Edit application' : 'New application' }}</h1>

    <form class="card form" [formGroup]="form" (ngSubmit)="save()" novalidate>
      <fieldset class="status-group">
        <legend>Status</legend>
        <div class="statuses">
          @for (s of statuses; track s) {
            <label class="status-opt" [attr.data-status]="s">
              <input type="radio" formControlName="status" [value]="s" />
              <span>{{ s }}</span>
            </label>
          }
        </div>
      </fieldset>

      <div class="grid">
        <div class="field">
          <label for="company">Company <span class="req">*</span></label>
          <input id="company" type="text" formControlName="company" autocomplete="organization" maxlength="80" [attr.aria-invalid]="show('company')" />
          @if (show('company')) {
            <p class="error">Enter the company name (at least 2 characters).</p>
          }
        </div>
        <div class="field">
          <label for="role">Role <span class="req">*</span></label>
          <input id="role" type="text" formControlName="role" maxlength="80" placeholder="e.g. Angular Developer" [attr.aria-invalid]="show('role')" />
          @if (show('role')) {
            <p class="error">Enter the job title.</p>
          }
        </div>
        <div class="field">
          <label for="location">Location</label>
          <input id="location" type="text" formControlName="location" maxlength="60" placeholder="e.g. Coimbatore" />
        </div>
        <div class="field two">
          <div>
            <label for="workMode">Work mode</label>
            <select id="workMode" formControlName="workMode">
              @for (m of workModes; track m) {
                <option [value]="m">{{ m }}</option>
              }
            </select>
          </div>
          <div>
            <label for="jobType">Job type</label>
            <select id="jobType" formControlName="jobType">
              @for (t of jobTypes; track t) {
                <option [value]="t">{{ t }}</option>
              }
            </select>
          </div>
        </div>
        <div class="field">
          <label for="appliedOn">{{ form.controls.status.value === 'Wishlist' ? 'Saved on' : 'Applied on' }} <span class="req">*</span></label>
          <input id="appliedOn" type="date" formControlName="appliedOn" [max]="maxDate" [attr.aria-invalid]="show('appliedOn')" />
          @if (show('appliedOn')) {
            <p class="error">Choose a date (not in the future).</p>
          }
        </div>
        <div class="field">
          <label for="interviewOn">Interview date @if (form.controls.status.value === 'Interview') {<span class="req">*</span>}</label>
          <input id="interviewOn" type="date" formControlName="interviewOn" [attr.aria-invalid]="groupError() ? true : null" />
          @if (groupError() === 'interviewDateRequired') {
            <p class="error">Add the interview date for the Interview status.</p>
          } @else if (groupError() === 'interviewBeforeApplied') {
            <p class="error">The interview cannot be before the applied date.</p>
          }
        </div>
        <div class="field">
          <label for="salary">Salary / CTC</label>
          <input id="salary" type="text" formControlName="salary" maxlength="40" placeholder="e.g. 4–5 LPA" />
        </div>
        <div class="field">
          <label for="contact">Contact person</label>
          <input id="contact" type="text" formControlName="contact" maxlength="80" placeholder="Recruiter name or email" />
        </div>
        <div class="field wide">
          <label for="link">Job posting link</label>
          <input id="link" type="url" formControlName="link" maxlength="400" placeholder="https://" [attr.aria-invalid]="show('link')" />
          @if (show('link')) {
            <p class="error">Enter a full link starting with http:// or https://</p>
          }
        </div>
        <div class="field wide">
          <label for="notes">Notes</label>
          <textarea id="notes" formControlName="notes" maxlength="1000" placeholder="Interview rounds, questions asked, follow-ups…"></textarea>
        </div>
      </div>

      <div class="actions">
        @if (id()) {
          <button type="button" class="btn btn-danger" (click)="remove()">Delete</button>
        }
        <span class="spacer"></span>
        <a routerLink="/applications" class="btn btn-ghost">Cancel</a>
        <button class="btn" type="submit">{{ id() ? 'Save changes' : 'Add application' }}</button>
      </div>
    </form>
  `,
  styles: `
    .back { display: inline-block; font-weight: 600; text-decoration: none; margin-bottom: 8px; font-size: 14px; }
    h1 { font-size: clamp(24px, 5vw, 30px); font-weight: 800; margin-bottom: 16px; }
    .form { padding: 20px; }
    @media (min-width: 720px) { .form { padding: 28px; } }
    fieldset { border: 0; padding: 0; margin: 0 0 20px; }
    legend, label { font-weight: 700; font-size: 13.5px; color: var(--ink); }
    legend { margin-bottom: 8px; }
    .statuses { display: flex; flex-wrap: wrap; gap: 8px; }
    .status-opt { cursor: pointer; }
    .status-opt input { position: absolute; opacity: 0; pointer-events: none; }
    .status-opt span { display: inline-flex; padding: 8px 14px; border-radius: 999px; border: 1.5px solid var(--line); font-weight: 700; color: var(--muted); background: #fff; transition: all .15s; }
    .status-opt input:checked + span { background: var(--s-bg); color: var(--s-fg); border-color: var(--s-solid); }
    .status-opt input:focus-visible + span { outline: 3px solid color-mix(in srgb, var(--brand) 55%, transparent); outline-offset: 2px; }
    .grid { display: grid; gap: 16px; }
    @media (min-width: 720px) { .grid { grid-template-columns: 1fr 1fr; } .wide { grid-column: 1 / -1; } }
    .field label { display: block; margin-bottom: 6px; }
    .two { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .req { color: var(--danger); }
    .error { color: var(--danger); font-size: 13px; font-weight: 600; margin: 6px 0 0; }
    [aria-invalid='true'] { border-color: var(--danger); }
    .actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 24px; padding-top: 18px; border-top: 1px solid var(--line); }
    .spacer { flex: 1; }
  `,
})
export class ApplicationForm {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly store = inject(JobsStore);
  private readonly router = inject(Router);
  private readonly toast = inject(Toast);
  private readonly injector = inject(Injector);

  /** Route param of /applications/:id/edit (empty on /applications/new). */
  readonly id = input<string>();
  readonly statuses = STATUSES;
  readonly workModes = WORK_MODES;
  readonly jobTypes = JOB_TYPES;
  readonly maxDate = today();
  readonly submitted = signal(false);

  readonly form = this.fb.group(
    {
      company: ['', [Validators.required, Validators.minLength(2)]],
      role: ['', Validators.required],
      location: [''],
      workMode: this.fb.control<JobDraft['workMode']>('On-site'),
      jobType: this.fb.control<JobDraft['jobType']>('Full-time'),
      status: this.fb.control<JobDraft['status']>('Applied'),
      appliedOn: [today(), [Validators.required, (c: AbstractControl) => (c.value && c.value > today() ? { future: true } : null)]],
      interviewOn: [''],
      salary: [''],
      link: ['', Validators.pattern(/^https?:\/\/\S+\.\S+/i)],
      contact: [''],
      notes: [''],
    },
    { validators: interviewRules },
  );

  constructor() {
    // Fill the form when editing; unknown ids go back to the list.
    effect(() => {
      const id = this.id();
      untracked(() => {
        if (!id) return;
        const app = this.store.get(id);
        if (!app) {
          this.toast.show('That application no longer exists');
          void this.router.navigateByUrl('/applications');
          return;
        }
        this.form.reset({ ...app, interviewOn: app.interviewOn ?? '' });
      });
    });
  }

  /** Show a field's error after the user has left it or tried to submit. */
  show(name: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || this.submitted());
  }

  groupError(): 'interviewDateRequired' | 'interviewBeforeApplied' | null {
    const e = this.form.errors;
    if (!e || !(this.form.controls.interviewOn.touched || this.form.controls.status.dirty || this.submitted())) return null;
    return e['interviewDateRequired'] ? 'interviewDateRequired' : e['interviewBeforeApplied'] ? 'interviewBeforeApplied' : null;
  }

  save(): void {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      // After the error markers render, put the cursor in the first field to fix.
      afterNextRender(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), { injector: this.injector });
      return;
    }
    const v = this.form.getRawValue();
    const draft: JobDraft = {
      ...v,
      company: v.company.trim(),
      role: v.role.trim(),
      location: v.location.trim(),
      interviewOn: v.interviewOn || null,
      link: v.link.trim(),
    };
    const id = this.id();
    if (id) this.store.update(id, draft);
    else this.store.add(draft);
    this.toast.show(id ? 'Changes saved' : `${draft.company} added`);
    void this.router.navigateByUrl('/applications');
  }

  remove(): void {
    const id = this.id();
    if (!id || !confirm('Delete this application?')) return;
    this.store.remove(id);
    this.toast.show('Application deleted');
    void this.router.navigateByUrl('/applications');
  }
}
