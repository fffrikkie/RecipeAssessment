using System.Collections.Concurrent;
using RecipeOptimizer.Core.Abstractions;
using RecipeOptimizer.Core.Domain;

namespace RecipeOptimizer.Core.Infrastructure;

/// <summary>
/// Thread-safe in-memory store. Registered as a singleton so data persists for the
/// lifetime of the process. Implements <see cref="IRepository{T}"/> so it can be
/// substituted with a database-backed implementation without affecting callers.
/// </summary>
public abstract class InMemoryRepository<T> : IRepository<T>
    where T : class, IEntity
{
    private readonly ConcurrentDictionary<Guid, T> _store = new();

    public IReadOnlyCollection<T> GetAll() => _store.Values.ToList();

    public T? GetById(Guid id) => _store.TryGetValue(id, out var entity) ? entity : null;

    public T Add(T entity)
    {
        ArgumentNullException.ThrowIfNull(entity);
        if (entity.Id == Guid.Empty)
        {
            entity.Id = Guid.NewGuid();
        }

        _store[entity.Id] = entity;
        return entity;
    }

    public bool Update(T entity)
    {
        ArgumentNullException.ThrowIfNull(entity);
        // Only update entities that already exist; do not silently insert.
        if (!_store.ContainsKey(entity.Id))
        {
            return false;
        }

        _store[entity.Id] = entity;
        return true;
    }

    public bool Delete(Guid id) => _store.TryRemove(id, out _);
}

public sealed class InMemoryIngredientRepository : InMemoryRepository<Ingredient>, IIngredientRepository;

public sealed class InMemoryRecipeRepository : InMemoryRepository<Recipe>, IRecipeRepository;
