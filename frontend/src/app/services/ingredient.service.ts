import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Ingredient, IngredientRequest } from '../models/ingredient.model';

@Injectable({ providedIn: 'root' })
export class IngredientService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/ingredients`;

  getAll(): Observable<Ingredient[]> {
    return this.http.get<Ingredient[]>(this.baseUrl);
  }

  create(request: IngredientRequest): Observable<Ingredient> {
    return this.http.post<Ingredient>(this.baseUrl, request);
  }

  update(id: string, request: IngredientRequest): Observable<Ingredient> {
    return this.http.put<Ingredient>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
