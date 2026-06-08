import { Component, OnInit, computed, inject, signal } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Ingredient } from '../../models/ingredient.model';
import { Recipe } from '../../models/recipe.model';
import { IngredientService } from '../../services/ingredient.service';
import { RecipeService } from '../../services/recipe.service';

type LineGroup = FormGroup<{
  ingredientName: FormControl<string>;
  quantity: FormControl<number>;
}>;

@Component({
  selector: 'app-recipes',
  imports: [ReactiveFormsModule],
  templateUrl: './recipes.component.html',
  styleUrl: './recipes.component.scss',
})
export class RecipesComponent implements OnInit {
  private readonly recipeService = inject(RecipeService);
  private readonly ingredientService = inject(IngredientService);
  private readonly fb = inject(FormBuilder);

  protected readonly recipes = signal<Recipe[]>([]);
  protected readonly ingredientNames = signal<string[]>([]);
  protected readonly editingId = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly isEditing = computed(() => this.editingId() !== null);

  protected readonly form = this.fb.nonNullable.group({
    name: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(100)]),
    feeds: this.fb.nonNullable.control(1, [Validators.required, Validators.min(1)]),
    ingredients: this.fb.nonNullable.array<LineGroup>([]),
  });

  protected get lines(): FormArray<LineGroup> {
    return this.form.controls.ingredients;
  }

  ngOnInit(): void {
    this.addLine();
    this.loadRecipes();
    this.loadIngredientNames();
  }

  private loadRecipes(): void {
    this.recipeService.getAll().subscribe({
      next: (items) => this.recipes.set([...items].sort((a, b) => a.name.localeCompare(b.name))),
      error: () => this.error.set('Could not load recipes. Is the API running?'),
    });
  }

  private loadIngredientNames(): void {
    this.ingredientService.getAll().subscribe({
      next: (items: Ingredient[]) =>
        this.ingredientNames.set(items.map((i) => i.name).sort((a, b) => a.localeCompare(b))),
      error: () => {
        /* the datalist is a convenience only; ignore failures */
      },
    });
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

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set(null);
    const request = this.form.getRawValue();
    const editingId = this.editingId();

    const operation = editingId
      ? this.recipeService.update(editingId, request)
      : this.recipeService.create(request);

    operation.subscribe({
      next: () => {
        this.resetForm();
        this.loadRecipes();
      },
      error: () => this.error.set('Could not save the recipe.'),
    });
  }

  protected edit(recipe: Recipe): void {
    this.editingId.set(recipe.id);
    this.lines.clear();
    recipe.ingredients.forEach((i) => this.lines.push(this.createLine(i.ingredientName, i.quantity)));
    if (this.lines.length === 0) {
      this.addLine();
    }
    this.form.controls.name.setValue(recipe.name);
    this.form.controls.feeds.setValue(recipe.feeds);
  }

  protected remove(recipe: Recipe): void {
    if (!confirm(`Delete "${recipe.name}"?`)) {
      return;
    }

    this.recipeService.delete(recipe.id).subscribe({
      next: () => {
        if (this.editingId() === recipe.id) {
          this.resetForm();
        }
        this.loadRecipes();
      },
      error: () => this.error.set('Could not delete the recipe.'),
    });
  }

  protected resetForm(): void {
    this.editingId.set(null);
    this.form.controls.name.reset('');
    this.form.controls.feeds.reset(1);
    this.lines.clear();
    this.addLine();
  }

  protected describeIngredients(recipe: Recipe): string {
    return recipe.ingredients.map((i) => `${i.quantity}x ${i.ingredientName}`).join(', ');
  }
}
