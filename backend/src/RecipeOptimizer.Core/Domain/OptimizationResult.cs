namespace RecipeOptimizer.Core.Domain;

/// <summary>How many times a particular recipe should be made in the optimal plan.</summary>
public sealed record RecipeSelection(Guid RecipeId, string RecipeName, int TimesMade, int PeopleFed);

/// <summary>How much of an ingredient the optimal plan consumes, and what is left over.</summary>
public sealed record IngredientUsage(string IngredientName, int AvailableAmount, int UsedAmount, int RemainingAmount);

/// <summary>
/// The result of the optimisation: the combination of recipes that feeds the most
/// people given the available ingredients.
/// </summary>
public sealed record OptimizationResult(
    int TotalPeopleFed,
    IReadOnlyList<RecipeSelection> Selections,
    IReadOnlyList<IngredientUsage> IngredientUsages);
