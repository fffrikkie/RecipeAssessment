namespace RecipeOptimizer.Core.Domain;

/// <summary>
/// A single ingredient requirement of a recipe, referenced by name so a recipe
/// can mention ingredients that may or may not currently exist in the pantry.
/// </summary>
public sealed class RecipeIngredient
{
    public string IngredientName { get; set; } = string.Empty;

    /// <summary>Units of the ingredient consumed each time the recipe is made.</summary>
    public int Quantity { get; set; }
}

/// <summary>
/// A recipe: a named dish that consumes a set of ingredients and feeds a number of people.
/// </summary>
public sealed class Recipe : IEntity
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    /// <summary>How many people a single serving of this recipe feeds.</summary>
    public int Feeds { get; set; }

    public IList<RecipeIngredient> Ingredients { get; set; } = new List<RecipeIngredient>();
}
