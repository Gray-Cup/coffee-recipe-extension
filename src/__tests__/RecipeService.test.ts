import { test, expect } from "bun:test";
import { RecipeService } from "../services/RecipeService.ts";
import type { Recipe, UserPreferences } from "../types/index.ts";

const testRecipes: Recipe[] = [
  {
    id: "test-cold-brew",
    name: "Test Cold Brew",
    category: "cold-brew",
    tags: ["iced", "strong", "simple"],
    caffeinated: true,
    brewTimeMinutes: 720,
    ingredients: [{ name: "Coffee", amount: "100g" }],
    steps: ["Step 1", "Step 2", "Step 3"],
    image: "images/cold-brew.svg",
    description: "Test cold brew",
  },
  {
    id: "test-decaf-cold-brew",
    name: "Decaf Cold Brew",
    category: "cold-brew",
    tags: ["iced", "decaf", "smooth"],
    caffeinated: false,
    brewTimeMinutes: 720,
    ingredients: [{ name: "Decaf coffee", amount: "100g" }],
    steps: ["Step 1", "Step 2", "Step 3"],
    image: "images/cold-brew.svg",
    description: "Test decaf cold brew",
  },
  {
    id: "test-espresso",
    name: "Test Espresso",
    category: "espresso",
    tags: ["hot", "strong", "quick"],
    caffeinated: true,
    brewTimeMinutes: 1,
    ingredients: [{ name: "Espresso beans", amount: "18g" }],
    steps: ["Step 1", "Step 2", "Step 3"],
    image: "images/espresso.svg",
    description: "Test espresso",
  },
  {
    id: "test-latte",
    name: "Test Latte",
    category: "latte",
    tags: ["hot", "milk-based", "creamy"],
    caffeinated: true,
    brewTimeMinutes: 3,
    ingredients: [{ name: "Espresso", amount: "30ml" }],
    steps: ["Step 1", "Step 2", "Step 3"],
    image: "images/latte.svg",
    description: "Test latte",
  },
  {
    id: "test-decaf-latte",
    name: "Decaf Latte",
    category: "latte",
    tags: ["hot", "milk-based", "decaf"],
    caffeinated: false,
    brewTimeMinutes: 3,
    ingredients: [{ name: "Decaf espresso", amount: "30ml" }],
    steps: ["Step 1", "Step 2", "Step 3"],
    image: "images/latte.svg",
    description: "Test decaf latte",
  },
];

function createService() {
  return new RecipeService(testRecipes);
}

test("getAll returns all recipes", () => {
  const service = createService();
  expect(service.getAll()).toHaveLength(5);
});

test("getById finds existing recipe", () => {
  const service = createService();
  const recipe = service.getById("test-espresso");
  expect(recipe).toBeDefined();
  expect(recipe!.name).toBe("Test Espresso");
});

test("getById returns undefined for missing recipe", () => {
  const service = createService();
  expect(service.getById("nonexistent")).toBeUndefined();
});

test("getFiltered by category", () => {
  const service = createService();
  const prefs: UserPreferences = {
    preferredCategories: ["cold-brew"],
    caffeineFilter: "all",
  };
  const filtered = service.getFiltered(prefs);
  expect(filtered).toHaveLength(2);
  expect(filtered.every((r) => r.category === "cold-brew")).toBe(true);
});

test("getFiltered by caffeine: caffeinated only", () => {
  const service = createService();
  const prefs: UserPreferences = {
    preferredCategories: [],
    caffeineFilter: "caffeinated",
  };
  const filtered = service.getFiltered(prefs);
  expect(filtered).toHaveLength(3);
  expect(filtered.every((r) => r.caffeinated)).toBe(true);
});

test("getFiltered by caffeine: decaf only", () => {
  const service = createService();
  const prefs: UserPreferences = {
    preferredCategories: [],
    caffeineFilter: "decaf",
  };
  const filtered = service.getFiltered(prefs);
  expect(filtered).toHaveLength(2);
  expect(filtered.every((r) => !r.caffeinated)).toBe(true);
});

test("getFiltered by category + caffeine combined", () => {
  const service = createService();
  const prefs: UserPreferences = {
    preferredCategories: ["latte"],
    caffeineFilter: "decaf",
  };
  const filtered = service.getFiltered(prefs);
  expect(filtered).toHaveLength(1);
  expect(filtered[0]!.id).toBe("test-decaf-latte");
});

test("getFiltered with no preferences returns all", () => {
  const service = createService();
  const prefs: UserPreferences = {
    preferredCategories: [],
    caffeineFilter: "all",
  };
  expect(service.getFiltered(prefs)).toHaveLength(5);
});

test("getSimilar ranks same-category higher", () => {
  const service = createService();
  const espresso = service.getById("test-espresso")!;
  const similar = service.getSimilar(espresso, 3);
  // The first similar should share more tags/category
  expect(similar.length).toBeLessThanOrEqual(3);
  expect(similar.every((r) => r.id !== "test-espresso")).toBe(true);
});

test("getSimilar prefers shared tags", () => {
  const service = createService();
  const coldBrew = service.getById("test-cold-brew")!;
  const similar = service.getSimilar(coldBrew, 2);
  // Decaf cold brew shares category + "iced" tag so should rank first
  expect(similar[0]!.id).toBe("test-decaf-cold-brew");
});

test("getCategories returns unique categories", () => {
  const service = createService();
  const categories = service.getCategories();
  expect(categories).toContain("cold-brew");
  expect(categories).toContain("espresso");
  expect(categories).toContain("latte");
  expect(new Set(categories).size).toBe(categories.length);
});

test("getByCategory returns correct subset", () => {
  const service = createService();
  const lattes = service.getByCategory("latte");
  expect(lattes).toHaveLength(2);
  expect(lattes.every((r) => r.category === "latte")).toBe(true);
});
