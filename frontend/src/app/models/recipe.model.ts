export interface RecipeIngredient {
  ingredientName: string;
  quantity: number;
}

export interface Recipe {
  id: string;
  name: string;
  feeds: number;
  ingredients: RecipeIngredient[];
}

/** Payload sent when creating or updating a recipe. */
export interface RecipeRequest {
  name: string;
  feeds: number;
  ingredients: RecipeIngredient[];
}
