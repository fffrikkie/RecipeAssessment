import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { Ingredient, IngredientRequest } from '../../models/ingredient.model';
import { IngredientService } from '../../services/ingredient.service';
import { NotificationService } from '../../shared/notification.service';
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
export class IngredientsComponent implements OnInit, OnDestroy {
  private readonly service = inject(IngredientService);
  private readonly dialog = inject(MatDialog);
  private readonly notifications = inject(NotificationService);
  private readonly destroy$ = new Subject<void>();

  protected readonly ingredients = signal<Ingredient[]>([]);

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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private load(): void {
    this.service
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items) =>
          this.ingredients.set([...items].sort((a, b) => a.name.localeCompare(b.name))),
        error: () => this.notifications.error('Could not load ingredients. Is the API running?'),
      });
  }

  protected openDialog(ingredient?: Ingredient): void {
    const dialogRef = this.dialog.open<
      IngredientDialogComponent,
      IngredientDialogData,
      IngredientRequest
    >(IngredientDialogComponent, { data: { ingredient }, width: '420px', maxWidth: '90vw' });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((request) => {
        if (!request) {
          return;
        }

        const operation = ingredient
          ? this.service.update(ingredient.id, request)
          : this.service.create(request);

        operation.pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            this.notifications.success(ingredient ? 'Ingredient updated.' : 'Ingredient added.');
            this.load();
          },
          error: () => this.notifications.error('Could not save the ingredient.'),
        });
      });
  }

  protected remove(ingredient: Ingredient): void {
    if (!confirm(`Delete "${ingredient.name}"?`)) {
      return;
    }

    this.service
      .delete(ingredient.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notifications.success('Ingredient deleted.');
          this.load();
        },
        error: () => this.notifications.error('Could not delete the ingredient.'),
      });
  }
}
