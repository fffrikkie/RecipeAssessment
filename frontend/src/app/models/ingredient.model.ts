export interface Ingredient {
  id: string;
  name: string;
  availableAmount: number;
}

/** Payload sent when creating or updating an ingredient. */
export interface IngredientRequest {
  name: string;
  availableAmount: number;
}
