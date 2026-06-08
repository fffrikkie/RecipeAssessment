using RecipeOptimizer.Api.Infrastructure;
using RecipeOptimizer.Core.Abstractions;
using RecipeOptimizer.Core.Infrastructure;
using RecipeOptimizer.Core.Services;

var builder = WebApplication.CreateBuilder(args);

const string FrontendCorsPolicy = "frontend";

builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Allow the Angular dev server to call the API during development.
builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy => policy
        .WithOrigins("http://localhost:4200")
        .AllowAnyHeader()
        .AllowAnyMethod());
});

// Storage: in-memory, behind repository abstractions. Singletons so data persists
// for the lifetime of the process. Swap these registrations for a database-backed
// implementation and nothing else needs to change.
builder.Services.AddSingleton<IIngredientRepository, InMemoryIngredientRepository>();
builder.Services.AddSingleton<IRecipeRepository, InMemoryRecipeRepository>();

// The optimisation engine is stateless.
builder.Services.AddSingleton<IOptimizationSolver, OptimizationSolver>();

var app = builder.Build();

// Seed the example data from the brief on startup.
DataSeeder.Seed(
    app.Services.GetRequiredService<IIngredientRepository>(),
    app.Services.GetRequiredService<IRecipeRepository>());

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors(FrontendCorsPolicy);
app.MapControllers();

app.Run();

// Exposed so the API can be referenced from the test project (WebApplicationFactory).
public partial class Program;
