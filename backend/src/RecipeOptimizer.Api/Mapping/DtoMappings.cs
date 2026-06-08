using RecipeOptimizer.Api.Dtos;
using RecipeOptimizer.Core.Domain;

namespace RecipeOptimizer.Api.Mapping;

/// <summary>Translations between API DTOs and domain models, kept in one place.</summary>
public static class DtoMappings
{
    public static Ingredient ToDomain(this IngredientRequest request) => new()
    {
        Name = request.Name.Trim(),
        AvailableAmount = request.AvailableAmount,
    };

    public static IngredientResponse ToResponse(this Ingredient ingredient) =>
        new(ingredient.Id, ingredient.Name, ingredient.AvailableAmount);

    public static Recipe ToDomain(this RecipeRequest request) => new()
    {
        Name = request.Name.Trim(),
        Feeds = request.Feeds,
        Ingredients = request.Ingredients
            .Select(i => new RecipeIngredient
            {
                IngredientName = i.IngredientName.Trim(),
                Quantity = i.Quantity,
            })
            .ToList(),
    };

    public static RecipeResponse ToResponse(this Recipe recipe) => new(
        recipe.Id,
        recipe.Name,
        recipe.Feeds,
        recipe.Ingredients
            .Select(i => new RecipeIngredientResponse(i.IngredientName, i.Quantity))
            .ToList());
}
