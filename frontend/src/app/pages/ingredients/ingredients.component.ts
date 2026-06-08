import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { Ingredient, IngredientRequest } from '../../models/ingredient.model';
import { IngredientService } from '../../services/ingredient.service';
import { DataTableComponent, TableAction, TableColumn } from '../../shared/data-table/data-table.component';
import {
  IngredientDialogComponent,
  IngredientDialogData,
} from './ingredient-dialog/ingredient-dialog.component';

@Component({
  selector: 'app-ingredients',
  imports: [MatButtonModule, MatIconModule, MatCardModule, DataTableComponent],
  templateUrl: './ingredients.component.html',
  styleUrl: './ingredients.component.scss',
})
export class IngredientsComponent implements OnInit {
  private readonly service = inject(IngredientService);
  private readonly dialog = inject(MatDialog);

  protected readonly ingredients = signal<Ingredient[]>([]);
  protected readonly error = signal<string | null>(null);

  protected readonly columns: TableColumn<Ingredient>[] = [
    { key: 'name', header: 'Name', cell: (row) => row.name },
    { key: 'available', header: 'Available', numeric: true, cell: (row) => row.availableAmount },
  ];

  protected readonly actions: TableAction<Ingredient>[] = [
    { icon: 'edit', label: 'Edit', color: 'primary', handler: (row) => this.openDialog(row) },
    { icon: 'delete', label: 'Delete', color: 'warn', handler: (row) => this.remove(row) },
  ];

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.service.getAll().subscribe({
      next: (items) =>
        this.ingredients.set([...items].sort((a, b) => a.name.localeCompare(b.name))),
      error: () => this.error.set('Could not load ingredients. Is the API running?'),
    });
  }

  protected openDialog(ingredient?: Ingredient): void {
    const dialogRef = this.dialog.open<
      IngredientDialogComponent,
      IngredientDialogData,
      IngredientRequest
    >(IngredientDialogComponent, { data: { ingredient }, width: '420px', maxWidth: '90vw' });

    dialogRef.afterClosed().subscribe((request) => {
      if (!request) {
        return;
      }

      const operation = ingredient
        ? this.service.update(ingredient.id, request)
        : this.service.create(request);

      operation.subscribe({
        next: () => this.load(),
        error: () => this.error.set('Could not save the ingredient.'),
      });
    });
  }

  protected remove(ingredient: Ingredient): void {
    if (!confirm(`Delete "${ingredient.name}"?`)) {
      return;
    }

    this.service.delete(ingredient.id).subscribe({
      next: () => this.load(),
      error: () => this.error.set('Could not delete the ingredient.'),
    });
  }
}
