import { test, expect } from "bun:test";
import { Randomizer } from "../services/Randomizer.ts";
import { RecipeService } from "../services/RecipeService.ts";
import type { Recipe, UserPreferences } from "../types/index.ts";

const testRecipes: Recipe[] = [
  {
    id: "recipe-a",
    name: "Recipe A",
    category: "cold-brew",
    tags: ["iced"],
    caffeinated: true,
    brewTimeMinutes: 720,
    ingredients: [],
    steps: ["Step 1"],
    image: "images/cold-brew.svg",
    description: "A",
  },
  {
    id: "recipe-b",
    name: "Recipe B",
    category: "espresso",
    tags: ["hot", "strong"],
    caffeinated: true,
    brewTimeMinutes: 1,
    ingredients: [],
    steps: ["Step 1"],
    image: "images/espresso.svg",
    description: "B",
  },
  {
    id: "recipe-c",
    name: "Recipe C",
    category: "latte",
    tags: ["hot", "milk-based"],
    caffeinated: true,
    brewTimeMinutes: 3,
    ingredients: [],
    steps: ["Step 1"],
    image: "images/latte.svg",
    description: "C",
  },
  {
    id: "recipe-d",
    name: "Recipe D",
    category: "latte",
    tags: ["hot", "decaf"],
    caffeinated: false,
    brewTimeMinutes: 3,
    ingredients: [],
    steps: ["Step 1"],
    image: "images/latte.svg",
    description: "D",
  },
];

const defaultPrefs: UserPreferences = {
  preferredCategories: [],
  caffeineFilter: "all",
};

function createRandomizer() {
  return new Randomizer(new RecipeService(testRecipes));
}

test("getDailyRecipe is deterministic for the same date", () => {
  const rand = createRandomizer();
  const r1 = rand.getDailyRecipe("2026-02-10", "", defaultPrefs);
  const r2 = rand.getDailyRecipe("2026-02-10", "", defaultPrefs);
  expect(r1.id).toBe(r2.id);
});

test("getDailyRecipe produces different results for different dates", () => {
  const rand = createRandomizer();
  const results = new Set<string>();
  // Try many dates — with 4 recipes, we should see variation
  for (let i = 1; i <= 30; i++) {
    const date = `2026-02-${String(i).padStart(2, "0")}`;
    const r = rand.getDailyRecipe(date, "", defaultPrefs);
    results.add(r.id);
  }
  // Should produce more than 1 unique recipe across 30 dates
  expect(results.size).toBeGreaterThan(1);
});

test("getDailyRecipe avoids lastRecipeId", () => {
  const rand = createRandomizer();
  // Run for many dates, always passing the same lastRecipeId
  for (let i = 1; i <= 30; i++) {
    const date = `2026-03-${String(i).padStart(2, "0")}`;
    const r = rand.getDailyRecipe(date, "recipe-a", defaultPrefs);
    expect(r.id).not.toBe("recipe-a");
  }
});

test("getDailyRecipe respects category preferences", () => {
  const rand = createRandomizer();
  const prefs: UserPreferences = {
    preferredCategories: ["latte"],
    caffeineFilter: "all",
  };
  for (let i = 1; i <= 20; i++) {
    const date = `2026-04-${String(i).padStart(2, "0")}`;
    const r = rand.getDailyRecipe(date, "", prefs);
    expect(r.category).toBe("latte");
  }
});

test("getDailyRecipe respects caffeine filter", () => {
  const rand = createRandomizer();
  const prefs: UserPreferences = {
    preferredCategories: [],
    caffeineFilter: "decaf",
  };
  for (let i = 1; i <= 10; i++) {
    const date = `2026-05-${String(i).padStart(2, "0")}`;
    const r = rand.getDailyRecipe(date, "", prefs);
    expect(r.caffeinated).toBe(false);
  }
});

test("getDailyRecipe falls back to all recipes when preferences yield empty", () => {
  const rand = createRandomizer();
  const prefs: UserPreferences = {
    preferredCategories: ["pour-over"], // no pour-over in test data
    caffeineFilter: "all",
  };
  const r = rand.getDailyRecipe("2026-06-01", "", prefs);
  expect(r).toBeDefined();
  expect(testRecipes.some((t) => t.id === r.id)).toBe(true);
});

test("getDailyRecipe handles single-recipe pool gracefully", () => {
  const singleService = new RecipeService([testRecipes[0]!]);
  const rand = new Randomizer(singleService);
  // lastRecipeId matches the only recipe — should still return it
  const r = rand.getDailyRecipe("2026-07-01", "recipe-a", defaultPrefs);
  expect(r.id).toBe("recipe-a");
});

test("surpriseMe avoids current recipe", () => {
  const rand = createRandomizer();
  for (let i = 0; i < 20; i++) {
    const r = rand.surpriseMe("recipe-a", defaultPrefs);
    expect(r.id).not.toBe("recipe-a");
  }
});

test("surpriseMe respects preferences", () => {
  const rand = createRandomizer();
  const prefs: UserPreferences = {
    preferredCategories: ["latte"],
    caffeineFilter: "all",
  };
  for (let i = 0; i < 20; i++) {
    const r = rand.surpriseMe("recipe-c", prefs);
    expect(r.category).toBe("latte");
    expect(r.id).not.toBe("recipe-c");
  }
});
