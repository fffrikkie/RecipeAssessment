import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'optimizer' },
  {
    path: 'optimizer',
    title: 'Optimizer',
    loadComponent: () =>
      import('./pages/optimizer/optimizer.component').then((m) => m.OptimizerComponent),
  },
  {
    path: 'recipes',
    title: 'Recipes',
    loadComponent: () =>
      import('./pages/recipes/recipes.component').then((m) => m.RecipesComponent),
  },
  {
    path: 'ingredients',
    title: 'Ingredients',
    loadComponent: () =>
      import('./pages/ingredients/ingredients.component').then((m) => m.IngredientsComponent),
  },
  { path: '**', redirectTo: 'optimizer' },
];
