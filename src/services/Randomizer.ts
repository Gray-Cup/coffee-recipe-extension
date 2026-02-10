import type { Recipe, UserPreferences } from "../types/index.ts";
import type { RecipeService } from "./RecipeService.ts";

export class Randomizer {
  constructor(private recipeService: RecipeService) {}

  // Hash a date string into a 32-bit integer seed
  private dateToSeed(dateStr: string): number {
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      const char = dateStr.charCodeAt(i);
      hash = ((hash << 5) - hash + char) | 0;
    }
    return Math.abs(hash);
  }

  // Mulberry32 seeded PRNG — returns a function that produces [0, 1) floats
  private seededRandom(seed: number): () => number {
    let s = seed;
    return () => {
      s |= 0;
      s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Pick a deterministic recipe from a pool based on the date seed
  private selectFromPool(
    pool: Recipe[],
    dateStr: string,
    lastRecipeId: string,
  ): Recipe {
    let filtered = pool.filter((r) => r.id !== lastRecipeId);
    if (filtered.length === 0) filtered = pool;

    const seed = this.dateToSeed(dateStr);
    const rng = this.seededRandom(seed);
    const index = Math.floor(rng() * filtered.length);
    return filtered[index]!;
  }

  // Get today's recipe — deterministic for the same date
  getDailyRecipe(
    todayDate: string,
    lastRecipeId: string,
    preferences: UserPreferences,
  ): Recipe {
    const candidates = this.recipeService.getFiltered(preferences);
    if (candidates.length === 0) {
      return this.selectFromPool(
        this.recipeService.getAll(),
        todayDate,
        lastRecipeId,
      );
    }
    return this.selectFromPool(candidates, todayDate, lastRecipeId);
  }

  // Truly random pick (non-deterministic), avoids current recipe
  surpriseMe(currentRecipeId: string, preferences: UserPreferences): Recipe {
    let candidates = this.recipeService.getFiltered(preferences);
    if (candidates.length === 0) candidates = this.recipeService.getAll();
    const filtered = candidates.filter((r) => r.id !== currentRecipeId);
    if (filtered.length === 0) return candidates[0]!;
    const index = Math.floor(Math.random() * filtered.length);
    return filtered[index]!;
  }
}
