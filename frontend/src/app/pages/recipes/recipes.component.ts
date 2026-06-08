import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { Recipe, RecipeRequest } from '../../models/recipe.model';
import { RecipeService } from '../../services/recipe.service';
import { IngredientService } from '../../services/ingredient.service';
import { DataTableComponent, TableAction, TableColumn } from '../../shared/data-table/data-table.component';
import { RecipeDialogComponent, RecipeDialogData } from './recipe-dialog/recipe-dialog.component';

@Component({
  selector: 'app-recipes',
  imports: [MatButtonModule, MatIconModule, MatCardModule, DataTableComponent],
  templateUrl: './recipes.component.html',
  styleUrl: './recipes.component.scss',
})
export class RecipesComponent implements OnInit, OnDestroy {
  private readonly recipeService = inject(RecipeService);
  private readonly ingredientService = inject(IngredientService);
  private readonly dialog = inject(MatDialog);
  private readonly destroy$ = new Subject<void>();

  protected readonly recipes = signal<Recipe[]>([]);
  protected readonly ingredientNames = signal<string[]>([]);
  protected readonly error = signal<string | null>(null);

  protected readonly columns: TableColumn<Recipe>[] = [
    { key: 'name', header: 'Name', cell: (row) => row.name },
    { key: 'ingredients', header: 'Ingredients', cell: (row) => this.describeIngredients(row) },
    { key: 'feeds', header: 'Feeds', numeric: true, cell: (row) => row.feeds },
  ];

  protected readonly actions: TableAction<Recipe>[] = [
    { icon: 'edit', label: 'Edit', color: 'primary', handler: (row) => this.openDialog(row) },
    { icon: 'delete', label: 'Delete', color: 'warn', handler: (row) => this.remove(row) },
  ];

  ngOnInit(): void {
    this.loadRecipes();
    this.loadIngredientNames();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadRecipes(): void {
    this.recipeService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items) => this.recipes.set([...items].sort((a, b) => a.name.localeCompare(b.name))),
        error: () => this.error.set('Could not load recipes. Is the API running?'),
      });
  }

  private loadIngredientNames(): void {
    this.ingredientService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items) =>
          this.ingredientNames.set(items.map((i) => i.name).sort((a, b) => a.localeCompare(b))),
        error: () => {
          /* the autocomplete suggestions are a convenience only; ignore failures */
        },
      });
  }

  protected openDialog(recipe?: Recipe): void {
    const dialogRef = this.dialog.open<RecipeDialogComponent, RecipeDialogData, RecipeRequest>(
      RecipeDialogComponent,
      { data: { recipe, ingredientNames: this.ingredientNames() }, width: '600px', maxWidth: '92vw' },
    );

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((request) => {
        if (!request) {
          return;
        }

        const operation = recipe
          ? this.recipeService.update(recipe.id, request)
          : this.recipeService.create(request);

        operation.pipe(takeUntil(this.destroy$)).subscribe({
          next: () => this.loadRecipes(),
          error: () => this.error.set('Could not save the recipe.'),
        });
      });
  }

  protected remove(recipe: Recipe): void {
    if (!confirm(`Delete "${recipe.name}"?`)) {
      return;
    }

    this.recipeService
      .delete(recipe.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadRecipes(),
        error: () => this.error.set('Could not delete the recipe.'),
      });
  }

  private describeIngredients(recipe: Recipe): string {
    return recipe.ingredients.map((i) => `${i.quantity}x ${i.ingredientName}`).join(', ');
  }
}
