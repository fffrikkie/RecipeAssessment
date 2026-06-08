using RecipeOptimizer.Core.Domain;

namespace RecipeOptimizer.Core.Abstractions;

/// <summary>
/// Computes the combination of recipes that feeds the most people given a fixed
/// stock of ingredients.
/// </summary>
public interface IOptimizationSolver
{
    OptimizationResult Solve(
        IReadOnlyCollection<Recipe> recipes,
        IReadOnlyCollection<Ingredient> ingredients);
}
