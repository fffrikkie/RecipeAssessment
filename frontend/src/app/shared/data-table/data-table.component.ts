import { Component, Input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

/** Describes a single column of the reusable table. */
export interface TableColumn<T> {
  /** Unique column id. */
  key: string;
  /** Header label. */
  header: string;
  /** Produces the cell value for a given row. */
  cell: (row: T) => string | number;
  /** Right-align the column (useful for numbers). */
  numeric?: boolean;
}

/** Describes an icon action button rendered in the trailing actions column. */
export interface TableAction<T> {
  icon: string;
  label: string;
  color?: 'primary' | 'accent' | 'warn';
  handler: (row: T) => void;
}

const ACTIONS_COLUMN = '__actions__';

/**
 * Generic, reusable Material table. Driven entirely by a column definition and an
 * optional list of row actions, so any page can render a table without duplicating
 * `mat-table` boilerplate.
 */
@Component({
  selector: 'app-data-table',
  imports: [MatTableModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
})
export class DataTableComponent<T> {
  @Input({ required: true }) columns: TableColumn<T>[] = [];
  @Input({ required: true }) data: T[] = [];
  @Input() actions: TableAction<T>[] = [];
  @Input() emptyMessage = 'No data to display.';

  protected readonly actionsColumn = ACTIONS_COLUMN;

  protected get displayedColumns(): string[] {
    const keys = this.columns.map((column) => column.key);
    return this.actions.length > 0 ? [...keys, ACTIONS_COLUMN] : keys;
  }
}
