using Microsoft.AspNetCore.Mvc;
using RecipeOptimizer.Api.Dtos;
using RecipeOptimizer.Api.Mapping;
using RecipeOptimizer.Core.Abstractions;

namespace RecipeOptimizer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public sealed class IngredientsController(IIngredientRepository repository) : ControllerBase
{
    [HttpGet]
    public ActionResult<IEnumerable<IngredientResponse>> GetAll() =>
        Ok(repository.GetAll().Select(i => i.ToResponse()));

    [HttpGet("{id:guid}")]
    public ActionResult<IngredientResponse> GetById(Guid id)
    {
        var ingredient = repository.GetById(id);
        return ingredient is null ? NotFound() : Ok(ingredient.ToResponse());
    }

    [HttpPost]
    public ActionResult<IngredientResponse> Create(IngredientRequest request)
    {
        var created = repository.Add(request.ToDomain());
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created.ToResponse());
    }

    [HttpPut("{id:guid}")]
    public ActionResult<IngredientResponse> Update(Guid id, IngredientRequest request)
    {
        var ingredient = request.ToDomain();
        ingredient.Id = id;

        return repository.Update(ingredient)
            ? Ok(ingredient.ToResponse())
            : NotFound();
    }

    [HttpDelete("{id:guid}")]
    public IActionResult Delete(Guid id) =>
        repository.Delete(id) ? NoContent() : NotFound();
}
