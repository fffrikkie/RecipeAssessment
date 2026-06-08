export interface RecipeSelection {
  recipeId: string;
  recipeName: string;
  timesMade: number;
  peopleFed: number;
}

export interface IngredientUsage {
  ingredientName: string;
  availableAmount: number;
  usedAmount: number;
  remainingAmount: number;
}

export interface OptimizationResult {
  totalPeopleFed: number;
  selections: RecipeSelection[];
  ingredientUsages: IngredientUsage[];
}
