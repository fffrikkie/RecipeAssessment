namespace RecipeOptimizer.Core.Domain;

/// <summary>
/// An ingredient in the pantry together with the amount currently in stock.
/// </summary>
public sealed class Ingredient : IEntity
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    /// <summary>How many units of this ingredient are currently available.</summary>
    public int AvailableAmount { get; set; }
}
