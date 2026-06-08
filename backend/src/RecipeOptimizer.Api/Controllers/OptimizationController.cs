using Microsoft.AspNetCore.Mvc;
using RecipeOptimizer.Core.Abstractions;
using RecipeOptimizer.Core.Domain;

namespace RecipeOptimizer.Api.Controllers;

/// <summary>
/// Computes the optimal combination of recipes that feeds the most people using the
/// ingredients currently in stock.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public sealed class OptimizationController(
    IRecipeRepository recipeRepository,
    IIngredientRepository ingredientRepository,
    IOptimizationSolver solver) : ControllerBase
{
    [HttpGet]
    public ActionResult<OptimizationResult> Optimize()
    {
        var result = solver.Solve(recipeRepository.GetAll(), ingredientRepository.GetAll());
        return Ok(result);
    }
}
