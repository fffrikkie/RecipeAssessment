import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Thin wrapper around {@link MatSnackBar} for showing success / error toast messages.
 * Centralises toast configuration so every call site is consistent.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string): void {
    this.show(message, 'toast--success');
  }

  error(message: string): void {
    this.show(message, 'toast--error');
  }

  private show(message: string, panelClass: string): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass,
    });
  }
}
