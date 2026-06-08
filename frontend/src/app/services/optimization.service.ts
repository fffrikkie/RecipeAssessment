import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { OptimizationResult } from '../models/optimization.model';

@Injectable({ providedIn: 'root' })
export class OptimizationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/optimization`;

  optimize(): Observable<OptimizationResult> {
    return this.http.get<OptimizationResult>(this.baseUrl);
  }
}
