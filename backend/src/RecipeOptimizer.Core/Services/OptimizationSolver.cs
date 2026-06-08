using RecipeOptimizer.Core.Abstractions;
using RecipeOptimizer.Core.Domain;

namespace RecipeOptimizer.Core.Services;

/// <summary>
/// Solves the "feed as many people as possible" problem.
///
/// This is a multi-dimensional bounded knapsack / integer program: each recipe may be
/// made any whole number of times, every batch consumes its ingredients, and the goal is
/// to maximise the total number of people fed without exceeding the stock of any ingredient.
///
/// The solver performs an exact depth-first branch-and-bound search. Recipes are visited in
/// descending "feeds" order so strong solutions are found early, and an optimistic upper
/// bound (each remaining recipe made as often as its own ingredients allow, ignoring
/// contention) prunes branches that cannot beat the best plan found so far. For the small
/// inputs this problem implies, the search returns a provably optimal plan quickly.
/// </summary>
public sealed class OptimizationSolver : IOptimizationSolver
{
    public OptimizationResult Solve(
        IReadOnlyCollection<Recipe> recipes,
        IReadOnlyCollection<Ingredient> ingredients)
    {
        ArgumentNullException.ThrowIfNull(recipes);
        ArgumentNullException.ThrowIfNull(ingredients);

        // 1. Index ingredients by name (case-insensitive), aggregating duplicates.
        var nameToIndex = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
        var stock = new List<int>();
        var displayNames = new List<string>();

        foreach (var ingredient in ingredients)
        {
            var name = (ingredient.Name ?? string.Empty).Trim();
            if (name.Length == 0)
            {
                continue;
            }

            var index = GetOrAddIndex(name, nameToIndex, stock, displayNames);
            stock[index] += Math.Max(0, ingredient.AvailableAmount);
        }

        // Indices [0, catalogCount) are real pantry ingredients; any added later come from
        // recipes that reference ingredients not in the pantry (stock stays 0 => unmakeable).
        var catalogCount = stock.Count;

        // 2. Build a compact requirement vector for each recipe.
        var recipeList = recipes.ToList();
        var requirements = new (int Index, int Quantity)[recipeList.Count][];
        var makeable = new bool[recipeList.Count];

        for (var r = 0; r < recipeList.Count; r++)
        {
            requirements[r] = BuildRequirements(recipeList[r], nameToIndex, stock, displayNames, out var isMakeable);
            makeable[r] = isMakeable;
        }

        var stockArray = stock.ToArray();
        var n = recipeList.Count;

        // Visit recipes that feed the most first to find good solutions early (better pruning).
        var order = Enumerable.Range(0, n)
            .OrderByDescending(r => recipeList[r].Feeds)
            .ToArray();

        var currentCounts = new int[n];
        var bestCounts = new int[n];
        var bestPeople = 0;

        void Search(int position, int peopleSoFar)
        {
            if (position == n)
            {
                if (peopleSoFar > bestPeople)
                {
                    bestPeople = peopleSoFar;
                    Array.Copy(currentCounts, bestCounts, n);
                }

                return;
            }

            // Optimistic bound: if even the most generous estimate of the remaining recipes
            // cannot beat the best plan so far, abandon this branch.
            var bound = peopleSoFar;
            for (var q = position; q < n; q++)
            {
                var candidate = order[q];
                if (makeable[candidate])
                {
                    bound += MaxBatches(requirements[candidate], stockArray) * recipeList[candidate].Feeds;
                }
            }

            if (bound <= bestPeople)
            {
                return;
            }

            var recipeIndex = order[position];

            if (!makeable[recipeIndex])
            {
                currentCounts[recipeIndex] = 0;
                Search(position + 1, peopleSoFar);
                return;
            }

            var maxBatches = MaxBatches(requirements[recipeIndex], stockArray);

            // Try making this recipe the most times first, down to not making it at all.
            for (var count = maxBatches; count >= 0; count--)
            {
                ApplyBatches(requirements[recipeIndex], stockArray, count);
                currentCounts[recipeIndex] = count;

                Search(position + 1, peopleSoFar + (count * recipeList[recipeIndex].Feeds));

                ApplyBatches(requirements[recipeIndex], stockArray, -count);
            }

            currentCounts[recipeIndex] = 0;
        }

        Search(0, 0);

        // 3. Project the winning counts onto a result. After the balanced search,
        //    stockArray has been restored to the original totals.
        var usedAmount = new int[stockArray.Length];
        var selections = new List<RecipeSelection>();

        for (var r = 0; r < n; r++)
        {
            var count = bestCounts[r];
            if (count <= 0)
            {
                continue;
            }

            foreach (var (index, quantity) in requirements[r])
            {
                usedAmount[index] += quantity * count;
            }

            selections.Add(new RecipeSelection(
                recipeList[r].Id,
                recipeList[r].Name,
                count,
                count * recipeList[r].Feeds));
        }

        var orderedSelections = selections
            .OrderByDescending(s => s.PeopleFed)
            .ThenBy(s => s.RecipeName, StringComparer.OrdinalIgnoreCase)
            .ToList();

        var usages = new List<IngredientUsage>(catalogCount);
        for (var i = 0; i < catalogCount; i++)
        {
            usages.Add(new IngredientUsage(
                displayNames[i],
                stockArray[i],
                usedAmount[i],
                stockArray[i] - usedAmount[i]));
        }

        usages = usages
            .OrderBy(u => u.IngredientName, StringComparer.OrdinalIgnoreCase)
            .ToList();

        return new OptimizationResult(bestPeople, orderedSelections, usages);
    }

    private static int GetOrAddIndex(
        string name,
        Dictionary<string, int> nameToIndex,
        List<int> stock,
        List<string> displayNames)
    {
        if (nameToIndex.TryGetValue(name, out var index))
        {
            return index;
        }

        index = stock.Count;
        nameToIndex[name] = index;
        stock.Add(0);
        displayNames.Add(name);
        return index;
    }

    private static (int Index, int Quantity)[] BuildRequirements(
        Recipe recipe,
        Dictionary<string, int> nameToIndex,
        List<int> stock,
        List<string> displayNames,
        out bool isMakeable)
    {
        // A recipe must feed someone and consume at least one valid ingredient line.
        if (recipe.Feeds <= 0 || recipe.Ingredients is not { Count: > 0 })
        {
            isMakeable = false;
            return [];
        }

        var merged = new Dictionary<int, int>();
        foreach (var line in recipe.Ingredients)
        {
            var name = (line.IngredientName ?? string.Empty).Trim();
            if (name.Length == 0 || line.Quantity <= 0)
            {
                isMakeable = false;
                return [];
            }

            var index = GetOrAddIndex(name, nameToIndex, stock, displayNames);
            merged[index] = merged.GetValueOrDefault(index) + line.Quantity;
        }

        isMakeable = true;
        return merged.Select(kvp => (kvp.Key, kvp.Value)).ToArray();
    }

    /// <summary>How many times the recipe can be made given current stock (limited by its scarcest ingredient).</summary>
    private static int MaxBatches((int Index, int Quantity)[] requirements, int[] stock)
    {
        var max = int.MaxValue;
        foreach (var (index, quantity) in requirements)
        {
            var possible = stock[index] / quantity;
            if (possible < max)
            {
                max = possible;
            }
        }

        return max == int.MaxValue ? 0 : max;
    }

    /// <summary>Consume (positive count) or restore (negative count) the ingredients for a recipe.</summary>
    private static void ApplyBatches((int Index, int Quantity)[] requirements, int[] stock, int count)
    {
        foreach (var (index, quantity) in requirements)
        {
            stock[index] -= quantity * count;
        }
    }
}
