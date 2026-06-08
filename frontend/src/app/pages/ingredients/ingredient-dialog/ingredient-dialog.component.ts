import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Ingredient, IngredientRequest } from '../../../models/ingredient.model';
import { FormDialogComponent } from '../../../shared/form-dialog/form-dialog.component';

export interface IngredientDialogData {
  ingredient?: Ingredient;
}

@Component({
  selector: 'app-ingredient-dialog',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, FormDialogComponent],
  templateUrl: './ingredient-dialog.component.html',
  styleUrl: './ingredient-dialog.component.scss',
})
export class IngredientDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef =
    inject<MatDialogRef<IngredientDialogComponent, IngredientRequest>>(MatDialogRef);
  private readonly data = inject<IngredientDialogData>(MAT_DIALOG_DATA);

  protected readonly isEditing = !!this.data?.ingredient;

  protected readonly form = this.fb.nonNullable.group({
    name: [this.data?.ingredient?.name ?? '', [Validators.required, Validators.maxLength(100)]],
    availableAmount: [
      this.data?.ingredient?.availableAmount ?? 0,
      [Validators.required, Validators.min(0)],
    ],
  });

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.dialogRef.close(this.form.getRawValue());
  }
}
