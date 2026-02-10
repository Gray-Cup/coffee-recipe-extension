import type { Recipe, RecipeCategory, UserPreferences } from "../types/index.ts";
import recipesData from "../data/recipes.json";

export class RecipeService {
  private recipes: Recipe[];

  constructor(data?: Recipe[]) {
    this.recipes = data ?? (recipesData as Recipe[]);
  }

  getAll(): Recipe[] {
    return this.recipes;
  }

  getById(id: string): Recipe | undefined {
    return this.recipes.find((r) => r.id === id);
  }

  getFiltered(prefs: UserPreferences): Recipe[] {
    return this.recipes.filter((r) => {
      if (
        prefs.preferredCategories.length > 0 &&
        !prefs.preferredCategories.includes(r.category)
      ) {
        return false;
      }
      if (prefs.caffeineFilter === "caffeinated" && !r.caffeinated) return false;
      if (prefs.caffeineFilter === "decaf" && r.caffeinated) return false;
      return true;
    });
  }

  getSimilar(recipe: Recipe, count: number): Recipe[] {
    const others = this.recipes.filter((r) => r.id !== recipe.id);
    const scored = others.map((r) => ({
      recipe: r,
      score:
        (r.category === recipe.category ? 10 : 0) +
        r.tags.filter((t) => recipe.tags.includes(t)).length,
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, count).map((s) => s.recipe);
  }

  getCategories(): RecipeCategory[] {
    return [...new Set(this.recipes.map((r) => r.category))];
  }

  getByCategory(category: RecipeCategory): Recipe[] {
    return this.recipes.filter((r) => r.category === category);
  }
}
