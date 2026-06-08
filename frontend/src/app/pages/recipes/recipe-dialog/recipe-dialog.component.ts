import { Component, inject } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Recipe, RecipeRequest } from '../../../models/recipe.model';
import { FormDialogComponent } from '../../../shared/form-dialog/form-dialog.component';

export interface RecipeDialogData {
  recipe?: Recipe;
  ingredientNames: string[];
}

type LineGroup = FormGroup<{
  ingredientName: FormControl<string>;
  quantity: FormControl<number>;
}>;

@Component({
  selector: 'app-recipe-dialog',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatTooltipModule,
    FormDialogComponent,
  ],
  templateUrl: './recipe-dialog.component.html',
  styleUrl: './recipe-dialog.component.scss',
})
export class RecipeDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef =
    inject<MatDialogRef<RecipeDialogComponent, RecipeRequest>>(MatDialogRef);
  private readonly data = inject<RecipeDialogData>(MAT_DIALOG_DATA);

  protected readonly isEditing = !!this.data?.recipe;

  /**
   * Options for the ingredient dropdowns: the pantry ingredients, plus any ingredient already
   * referenced by the recipe being edited (so existing values — e.g. a recipe that uses an
   * ingredient no longer in stock — remain selectable rather than appearing blank).
   */
  protected readonly ingredientOptions = [
    ...new Set([
      ...(this.data?.ingredientNames ?? []),
      ...(this.data?.recipe?.ingredients.map((line) => line.ingredientName) ?? []),
    ]),
  ].sort((a, b) => a.localeCompare(b));

  protected readonly form = this.fb.nonNullable.group({
    name: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(100)]),
    feeds: this.fb.nonNullable.control(1, [Validators.required, Validators.min(1)]),
    ingredients: this.fb.nonNullable.array<LineGroup>([]),
  });

  constructor() {
    this.data?.recipe?.ingredients.forEach((line) =>
      this.lines.push(this.createLine(line.ingredientName, line.quantity)),
    );

    if (this.data?.recipe) {
      this.form.controls.name.setValue(this.data.recipe.name);
      this.form.controls.feeds.setValue(this.data.recipe.feeds);
    }

    if (this.lines.length === 0) {
      this.addLine();
    }
  }

  protected get lines(): FormArray<LineGroup> {
    return this.form.controls.ingredients;
  }

  private createLine(ingredientName = '', quantity = 1): LineGroup {
    return this.fb.nonNullable.group({
      ingredientName: this.fb.nonNullable.control(ingredientName, [
        Validators.required,
        Validators.maxLength(100),
      ]),
      quantity: this.fb.nonNullable.control(quantity, [Validators.required, Validators.min(1)]),
    });
  }

  protected addLine(): void {
    this.lines.push(this.createLine());
  }

  protected removeLine(index: number): void {
    this.lines.removeAt(index);
    if (this.lines.length === 0) {
      this.addLine();
    }
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.dialogRef.close(this.form.getRawValue());
  }
}
