import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Ingredient } from '../../models/ingredient.model';
import { IngredientService } from '../../services/ingredient.service';

@Component({
  selector: 'app-ingredients',
  imports: [ReactiveFormsModule],
  templateUrl: './ingredients.component.html',
  styleUrl: './ingredients.component.scss',
})
export class IngredientsComponent implements OnInit {
  private readonly service = inject(IngredientService);
  private readonly fb = inject(FormBuilder);

  protected readonly ingredients = signal<Ingredient[]>([]);
  protected readonly editingId = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    availableAmount: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.service.getAll().subscribe({
      next: (items) => this.ingredients.set([...items].sort((a, b) => a.name.localeCompare(b.name))),
      error: () => this.error.set('Could not load ingredients. Is the API running?'),
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set(null);
    const request = this.form.getRawValue();
    const editingId = this.editingId();

    const operation = editingId
      ? this.service.update(editingId, request)
      : this.service.create(request);

    operation.subscribe({
      next: () => {
        this.resetForm();
        this.load();
      },
      error: () => this.error.set('Could not save the ingredient.'),
    });
  }

  protected edit(ingredient: Ingredient): void {
    this.editingId.set(ingredient.id);
    this.form.setValue({ name: ingredient.name, availableAmount: ingredient.availableAmount });
  }

  protected remove(ingredient: Ingredient): void {
    if (!confirm(`Delete "${ingredient.name}"?`)) {
      return;
    }

    this.service.delete(ingredient.id).subscribe({
      next: () => {
        if (this.editingId() === ingredient.id) {
          this.resetForm();
        }
        this.load();
      },
      error: () => this.error.set('Could not delete the ingredient.'),
    });
  }

  protected resetForm(): void {
    this.editingId.set(null);
    this.form.reset({ name: '', availableAmount: 0 });
  }
}
