using System.ComponentModel.DataAnnotations;

namespace RecipeOptimizer.Api.Dtos;

/// <summary>A single ingredient line within a recipe request.</summary>
public sealed class RecipeIngredientRequest
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string IngredientName { get; set; } = string.Empty;

    [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1.")]
    public int Quantity { get; set; }
}

/// <summary>Payload for creating or updating a recipe.</summary>
public sealed class RecipeRequest
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;

    [Range(1, int.MaxValue, ErrorMessage = "A recipe must feed at least 1 person.")]
    public int Feeds { get; set; }

    [Required]
    [MinLength(1, ErrorMessage = "A recipe needs at least one ingredient.")]
    public List<RecipeIngredientRequest> Ingredients { get; set; } = [];
}

public sealed record RecipeIngredientResponse(string IngredientName, int Quantity);

/// <summary>Recipe as returned by the API.</summary>
public sealed record RecipeResponse(Guid Id, string Name, int Feeds, IReadOnlyList<RecipeIngredientResponse> Ingredients);
