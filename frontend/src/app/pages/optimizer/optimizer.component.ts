import { Component, OnInit, inject, signal } from '@angular/core';
import { OptimizationResult } from '../../models/optimization.model';
import { OptimizationService } from '../../services/optimization.service';

@Component({
  selector: 'app-optimizer',
  imports: [],
  templateUrl: './optimizer.component.html',
  styleUrl: './optimizer.component.scss',
})
export class OptimizerComponent implements OnInit {
  private readonly service = inject(OptimizationService);

  protected readonly result = signal<OptimizationResult | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

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
