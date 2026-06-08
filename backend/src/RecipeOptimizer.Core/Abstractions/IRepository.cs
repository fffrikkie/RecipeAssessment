using RecipeOptimizer.Core.Domain;

namespace RecipeOptimizer.Core.Abstractions;

/// <summary>
/// Generic CRUD abstraction. Keeps the API and solver decoupled from the storage
/// mechanism so the in-memory store can later be swapped for a database without
/// touching callers (Dependency Inversion).
/// </summary>
public interface IRepository<T>
{
    IReadOnlyCollection<T> GetAll();
    T? GetById(Guid id);
    T Add(T entity);
    bool Update(T entity);
    bool Delete(Guid id);
}

public interface IIngredientRepository : IRepository<Ingredient>;

public interface IRecipeRepository : IRepository<Recipe>;
