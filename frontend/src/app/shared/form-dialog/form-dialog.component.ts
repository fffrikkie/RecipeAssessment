import { Component, Input } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

/**
 * Reusable Material dialog chrome: a title, a scrollable content area for projected
 * form fields, and standard Cancel / Submit actions.
 *
 * The owning dialog supplies the `<form [formGroup]>` around this component and projects
 * its fields inside, so reactive-forms directives resolve their container correctly and
 * the trailing submit button (rendered here, inside the projected form in the DOM) triggers
 * the form's `ngSubmit`.
 */
@Component({
  selector: 'app-form-dialog',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './form-dialog.component.html',
  styleUrl: './form-dialog.component.scss',
})
export class FormDialogComponent {
  @Input({ required: true }) title = '';
  @Input() submitLabel = 'Save';
}
