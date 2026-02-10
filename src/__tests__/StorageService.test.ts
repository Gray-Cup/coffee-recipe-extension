import { test, expect, beforeEach } from "bun:test";
import { StorageService } from "../services/StorageService.ts";

// Mock chrome.storage.local with an in-memory store
function mockChromeStorage() {
  const store: Record<string, unknown> = {};
  (globalThis as any).chrome = {
    storage: {
      local: {
        async get(keys: string | string[] | null) {
          if (keys === null) return { ...store };
          if (typeof keys === "string") {
            return keys in store ? { [keys]: store[keys] } : {};
          }
          const result: Record<string, unknown> = {};
          for (const k of keys) {
            if (k in store) result[k] = store[k];
          }
          return result;
        },
        async set(items: Record<string, unknown>) {
          Object.assign(store, items);
        },
        async remove(keys: string | string[]) {
          const arr = typeof keys === "string" ? [keys] : keys;
          for (const k of arr) delete store[k];
        },
      },
    },
  };
  return store;
}

let service: StorageService;

beforeEach(() => {
  mockChromeStorage();
  service = new StorageService();
});

test("getState returns defaults on first run", async () => {
  const state = await service.getState();
  expect(state.lastShownDate).toBe("");
  expect(state.lastRecipeId).toBe("");
  expect(state.favorites).toEqual([]);
  expect(state.userPreferences.preferredCategories).toEqual([]);
  expect(state.userPreferences.caffeineFilter).toBe("all");
});

test("setState and getState round-trip", async () => {
  await service.setState({
    lastShownDate: "2026-02-10",
    lastRecipeId: "classic-cold-brew",
    favorites: ["vanilla-latte"],
    userPreferences: {
      preferredCategories: ["latte"],
      caffeineFilter: "caffeinated",
    },
  });

  const state = await service.getState();
  expect(state.lastShownDate).toBe("2026-02-10");
  expect(state.lastRecipeId).toBe("classic-cold-brew");
  expect(state.favorites).toEqual(["vanilla-latte"]);
  expect(state.userPreferences.preferredCategories).toEqual(["latte"]);
  expect(state.userPreferences.caffeineFilter).toBe("caffeinated");
});

test("updateState merges partial updates", async () => {
  await service.setState({
    lastShownDate: "2026-02-09",
    lastRecipeId: "classic-espresso",
    favorites: ["classic-latte"],
    userPreferences: {
      preferredCategories: ["espresso"],
      caffeineFilter: "all",
    },
  });

  const updated = await service.updateState({ lastShownDate: "2026-02-10" });
  expect(updated.lastShownDate).toBe("2026-02-10");
  expect(updated.lastRecipeId).toBe("classic-espresso");
  expect(updated.favorites).toEqual(["classic-latte"]);
});

test("toggleFavorite adds and removes", async () => {
  const added = await service.toggleFavorite("classic-cold-brew");
  expect(added).toBe(true);

  let state = await service.getState();
  expect(state.favorites).toContain("classic-cold-brew");

  const removed = await service.toggleFavorite("classic-cold-brew");
  expect(removed).toBe(false);

  state = await service.getState();
  expect(state.favorites).not.toContain("classic-cold-brew");
});

test("isFavorite returns correct boolean", async () => {
  expect(await service.isFavorite("classic-cold-brew")).toBe(false);
  await service.toggleFavorite("classic-cold-brew");
  expect(await service.isFavorite("classic-cold-brew")).toBe(true);
});

test("updatePreferences merges with existing", async () => {
  await service.updatePreferences({ caffeineFilter: "decaf" });
  let state = await service.getState();
  expect(state.userPreferences.caffeineFilter).toBe("decaf");
  expect(state.userPreferences.preferredCategories).toEqual([]);

  await service.updatePreferences({ preferredCategories: ["latte", "espresso"] });
  state = await service.getState();
  expect(state.userPreferences.caffeineFilter).toBe("decaf");
  expect(state.userPreferences.preferredCategories).toEqual(["latte", "espresso"]);
});
