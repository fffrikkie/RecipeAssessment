import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
  IngredientUsage,
  OptimizationResult,
  RecipeSelection,
} from '../../models/optimization.model';
import { OptimizationService } from '../../services/optimization.service';
import { DataTableComponent, TableColumn } from '../../shared/data-table/data-table.component';

@Component({
  selector: 'app-optimizer',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    DataTableComponent,
  ],
  templateUrl: './optimizer.component.html',
  styleUrl: './optimizer.component.scss',
})
export class OptimizerComponent implements OnInit {
  private readonly service = inject(OptimizationService);

  protected readonly result = signal<OptimizationResult | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly selectionColumns: TableColumn<RecipeSelection>[] = [
    { key: 'recipe', header: 'Recipe', cell: (row) => row.recipeName },
    { key: 'timesMade', header: 'Times made', numeric: true, cell: (row) => row.timesMade },
    { key: 'peopleFed', header: 'People fed', numeric: true, cell: (row) => row.peopleFed },
  ];

  protected readonly usageColumns: TableColumn<IngredientUsage>[] = [
    { key: 'ingredient', header: 'Ingredient', cell: (row) => row.ingredientName },
    { key: 'available', header: 'Available', numeric: true, cell: (row) => row.availableAmount },
    { key: 'used', header: 'Used', numeric: true, cell: (row) => row.usedAmount },
    { key: 'remaining', header: 'Remaining', numeric: true, cell: (row) => row.remainingAmount },
  ];

  ngOnInit(): void {
    this.optimize();
  }

  protected optimize(): void {
    this.loading.set(true);
    this.error.set(null);

    this.service.optimize().subscribe({
      next: (result) => {
        this.result.set(result);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not run the optimizer. Is the API running?');
        this.loading.set(false);
      },
    });
  }
}
