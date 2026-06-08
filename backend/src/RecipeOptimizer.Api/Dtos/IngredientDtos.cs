using System.ComponentModel.DataAnnotations;

namespace RecipeOptimizer.Api.Dtos;

/// <summary>Payload for creating or updating an ingredient.</summary>
public sealed class IngredientRequest
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;

    [Range(0, int.MaxValue, ErrorMessage = "Available amount cannot be negative.")]
    public int AvailableAmount { get; set; }
}

/// <summary>Ingredient as returned by the API.</summary>
public sealed record IngredientResponse(Guid Id, string Name, int AvailableAmount);
