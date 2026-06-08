import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
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
import { NotificationService } from '../../shared/notification.service';
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
export class OptimizerComponent implements OnInit, OnDestroy {
  private readonly service = inject(OptimizationService);
  private readonly notifications = inject(NotificationService);
  private readonly destroy$ = new Subject<void>();

  protected readonly result = signal<OptimizationResult | null>(null);
  protected readonly loading = signal(false);

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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected optimize(notifyOnSuccess = false): void {
    this.loading.set(true);

    this.service
      .optimize()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.result.set(result);
          this.loading.set(false);
          if (notifyOnSuccess) {
            this.notifications.success(`Optimal plan calculated: feeds ${result.totalPeopleFed}.`);
          }
        },
        error: () => {
          this.notifications.error('Could not run the optimizer. Is the API running?');
          this.loading.set(false);
        },
      });
  }
}
