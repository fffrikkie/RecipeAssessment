# Recipe Optimizer

Given a set of **recipes** (each with ingredient requirements and how many people it feeds)
and a **pantry** of available ingredients, this application determines the combination of
dishes that feeds **as many people as possible**.

It is split into two parts:

| Part | Tech | Responsibility |
| --- | --- | --- |
| `backend/` | ASP.NET Core 10 Web API (C#) | Stores recipes & ingredients and runs the optimisation calculation |
| `frontend/` | Angular 19 + Angular Material | UI to add / edit / delete recipes and ingredients, and view the optimal plan |

---

## Prerequisites

- **.NET SDK 10** (`dotnet --version`)
- **Node.js 18.19+ / 20.11+** and **npm** (`node --version`)
- Public **nuget.org** access for the backend restore. A solution-local
  [`backend/nuget.config`](backend/nuget.config) enables it explicitly, so the restore works
  even on machines where the feed is disabled by default.

---

## Running the application

The frontend talks to the backend, so start the API first.

### 1. Backend API

```bash
cd backend
dotnet run --project src/RecipeOptimizer.Api --launch-profile http
```

The API listens on **http://localhost:5206**.

- Swagger / OpenAPI document (Development): http://localhost:5206/openapi/v1.json
- On startup it **seeds the example data** from the brief (the ingredient list and a few
  recipes including the Burger) so there is something to optimise immediately.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install      # first time only
npm start        # ng serve
```

Open **http://localhost:4200**. The dev server origin is whitelisted in the API's CORS policy.

> The API base URL is configured in [`frontend/src/environments/environment.ts`](frontend/src/environments/environment.ts).

---

## Using it

- **Optimizer** – runs the calculation and shows total people fed, which recipes to make
  (and how many times), and how much of each ingredient is used / left over.
- **Recipes** – add, edit, delete recipes. *Add* and *Edit* open a **Material dialog** with a
  name, a "feeds" count and a dynamic list of ingredient lines (`quantity` × `ingredient name`,
  with autocomplete suggestions from the pantry).
- **Ingredients** – add, edit, delete pantry ingredients and their available amounts. *Add* and
  *Edit* open a **Material dialog**.

Changing recipes or ingredients and returning to the **Optimizer** (or pressing
*Recalculate*) reflects the new optimal plan immediately.

---

## How the optimisation works

The problem is a **multi-dimensional bounded knapsack / integer program**: each recipe may be
made any whole number of times, every batch consumes its ingredients, and we maximise the
total people fed without exceeding the stock of any ingredient.

[`OptimizationSolver`](backend/src/RecipeOptimizer.Core/Services/OptimizationSolver.cs) solves
it exactly with a **depth-first branch-and-bound search**:

1. Ingredients are indexed by name (case-insensitive). A recipe that needs an ingredient not
   in the pantry simply cannot be made (e.g. the Burger needs *Meat*, which isn't in stock).
2. Recipes are visited in descending **feeds** order so strong solutions are found early.
3. At each step an **optimistic upper bound** (each remaining recipe made as often as its own
   ingredients allow, ignoring contention) prunes branches that cannot beat the best plan found.

For the small inputs this problem implies, it returns a provably optimal plan effectively
instantly.

**Worked example (the seeded data):** with `2× Cucumber, 2× Olives, 3× Lettuce, 6× Tomato,
8× Cheese, 10× Dough`, the optimal plan feeds **10 people** — 2× Pizza, 4× Cheese Toastie,
2× Greek Salad — fully using the cheese, dough and tomato.

---

## Project structure

```
RecipeOptimizer.slnx                     .NET solution
backend/
  nuget.config                           ensures nuget.org is available
  src/
    RecipeOptimizer.Core/                domain + business logic (no web dependencies)
      Domain/                            Ingredient, Recipe, OptimizationResult, …
      Abstractions/                      IRepository<T>, IOptimizationSolver
      Services/OptimizationSolver.cs     the optimisation algorithm
      Infrastructure/                    in-memory repositories
    RecipeOptimizer.Api/                 ASP.NET Core Web API
      Controllers/                       Ingredients, Recipes, Optimization
      Dtos/                              request/response contracts + validation
      Mapping/                           DTO <-> domain
      Infrastructure/DataSeeder.cs       seeds the example data
      Program.cs                         DI, CORS, OpenAPI, startup
frontend/
  src/app/
    models/                              TypeScript interfaces
    services/                            typed HttpClient wrappers
    shared/data-table/                   reusable, config-driven Material table component
    pages/                               optimizer, recipes, ingredients (standalone components)
      */*-dialog/                        MatDialog add/edit forms for recipes & ingredients
    app.routes.ts / app.config.ts        lazy routes + providers
```

## Design notes (SOLID & current standards)

- **Separation of concerns** – all domain logic and the solver live in `RecipeOptimizer.Core`
  with no dependency on ASP.NET; the API is a thin transport layer over it.
- **Dependency inversion** – the API and solver depend on `IRepository<T>` /
  `IOptimizationSolver` abstractions, not concrete types. Storage is registered in one place
  in `Program.cs`; swapping the in-memory store for a database (e.g. EF Core) requires no
  changes to controllers or the solver.
- **Single responsibility** – DTO ↔ domain mapping, seeding, storage, and the algorithm are
  each isolated in their own type.
- **API** – attribute-routed controllers, DTO validation via data annotations (returns
  RFC-9110 `ProblemDetails` on `400`), correct status codes (`201`/`204`/`404`), and OpenAPI.
- **Frontend** – Angular 19 standalone components, `inject()`, **signals** for state, typed
  **reactive forms** (with a `FormArray` for recipe ingredient lines), lazy-loaded routes, and
  the new `@if` / `@for` control-flow syntax.
- **Angular Material** – the UI is built with Material components (toolbar, cards, buttons,
  inputs, autocomplete, table). Add/Edit for both recipes and ingredients open in a `MatDialog`
  popup. A single generic, reusable `DataTableComponent` (driven by a column definition + row
  actions) renders every table in the app, so no `mat-table` boilerplate is duplicated.

> **Storage is in-memory** — data resets when the API process restarts (by design for this
> assessment; the repository abstraction keeps it swappable). Authentication/authorization is
> intentionally not implemented, per the brief.
