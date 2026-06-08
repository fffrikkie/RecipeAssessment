namespace RecipeOptimizer.Core.Domain;

/// <summary>An entity identified by a <see cref="Guid"/>.</summary>
public interface IEntity
{
    Guid Id { get; set; }
}
