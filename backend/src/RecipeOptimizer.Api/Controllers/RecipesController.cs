using Microsoft.AspNetCore.Mvc;
using RecipeOptimizer.Api.Dtos;
using RecipeOptimizer.Api.Mapping;
using RecipeOptimizer.Core.Abstractions;

namespace RecipeOptimizer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public sealed class RecipesController(IRecipeRepository repository) : ControllerBase
{
    [HttpGet]
    public ActionResult<IEnumerable<RecipeResponse>> GetAll() =>
        Ok(repository.GetAll().Select(r => r.ToResponse()));

    [HttpGet("{id:guid}")]
    public ActionResult<RecipeResponse> GetById(Guid id)
    {
        var recipe = repository.GetById(id);
        return recipe is null ? NotFound() : Ok(recipe.ToResponse());
    }

    [HttpPost]
    public ActionResult<RecipeResponse> Create(RecipeRequest request)
    {
        var created = repository.Add(request.ToDomain());
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created.ToResponse());
    }

    [HttpPut("{id:guid}")]
    public ActionResult<RecipeResponse> Update(Guid id, RecipeRequest request)
    {
        var recipe = request.ToDomain();
        recipe.Id = id;

        return repository.Update(recipe)
            ? Ok(recipe.ToResponse())
            : NotFound();
    }

    [HttpDelete("{id:guid}")]
    public IActionResult Delete(Guid id) =>
        repository.Delete(id) ? NoContent() : NotFound();
}
