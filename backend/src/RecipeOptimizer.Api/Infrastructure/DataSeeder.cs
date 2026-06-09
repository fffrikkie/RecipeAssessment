using RecipeOptimizer.Core.Abstractions;
using RecipeOptimizer.Core.Domain;

namespace RecipeOptimizer.Api.Infrastructure;

/// <summary>
/// Seeds the in-memory store with the example data from the assessment brief plus a
/// few extra recipes so the optimiser has meaningful choices to make.
/// </summary>
public static class DataSeeder
{
    public static void Seed(IIngredientRepository ingredients, IRecipeRepository recipes)
    {
        if (ingredients.GetAll().Count > 0 || recipes.GetAll().Count > 0)
        {
            return; // already seeded
        }

        // Available ingredients from the brief: 2x Cucumber, 2x Olives, 3x Lettuce,
        // 6x Tomato, 8x Cheese, 10x Dough.
        foreach (var (name, amount) in new (string, int)[]
                 {
                     ("Cucumber", 2),
                     ("Olives", 2),
                     ("Lettuce", 3),
                     ("Meat", 3),
                     ("Tomato", 6),
                     ("Cheese", 8),
                     ("Dough", 10),
                 })
        {
            ingredients.Add(new Ingredient { Name = name, AvailableAmount = amount });
        }

        recipes.Add(new Recipe
        {
            Name = "Burger",
            Feeds = 1,
            Ingredients =
            [
                new RecipeIngredient { IngredientName = "Meat", Quantity = 1 },
                new RecipeIngredient { IngredientName = "Lettuce", Quantity = 1 },
                new RecipeIngredient { IngredientName = "Tomato", Quantity = 1 },
                new RecipeIngredient { IngredientName = "Cheese", Quantity = 1 },
                new RecipeIngredient { IngredientName = "Dough", Quantity = 1 },
            ],
        });

        recipes.Add(new Recipe
        {
            Name = "Pie",
            Feeds = 1,
            Ingredients =
            [
                new RecipeIngredient { IngredientName = "Dough", Quantity = 2 },
                new RecipeIngredient { IngredientName = "Meat", Quantity = 2 },
            ],
        });

        recipes.Add(new Recipe
        {
            Name = "Sandwich",
            Feeds = 1,
            Ingredients =
            [
                new RecipeIngredient { IngredientName = "Dough", Quantity = 1 },
                new RecipeIngredient { IngredientName = "Cucumber", Quantity = 1 },
            ],
        });

        recipes.Add(new Recipe
        {
            Name = "Pasta",
            Feeds = 2,
            Ingredients =
            [
                new RecipeIngredient { IngredientName = "Dough", Quantity = 2 },
                new RecipeIngredient { IngredientName = "Tomato", Quantity = 1 },
                new RecipeIngredient { IngredientName = "Cheese", Quantity = 2 },
                new RecipeIngredient { IngredientName = "Meat", Quantity = 1 },
            ],
        });

        recipes.Add(new Recipe
        {
            Name = "Salad",
            Feeds = 3,
            Ingredients =
            [
                new RecipeIngredient { IngredientName = "Lettuce", Quantity = 2 },
                new RecipeIngredient { IngredientName = "Tomato", Quantity = 2 },
                new RecipeIngredient { IngredientName = "Cucumber", Quantity = 1 },
                new RecipeIngredient { IngredientName = "Cheese", Quantity = 2 },
                new RecipeIngredient { IngredientName = "Olives", Quantity = 1 },
            ],
        });

        recipes.Add(new Recipe
        {
            Name = "Pizza",
            Feeds = 4,
            Ingredients =
            [
                new RecipeIngredient { IngredientName = "Dough", Quantity = 3 },
                new RecipeIngredient { IngredientName = "Tomato", Quantity = 2 },
                new RecipeIngredient { IngredientName = "Cheese", Quantity = 3 },
                new RecipeIngredient { IngredientName = "Olives", Quantity = 1 },
            ],
        });
    }
}
