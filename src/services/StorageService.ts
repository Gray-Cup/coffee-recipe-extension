import type { StorageState, UserPreferences } from "../types/index.ts";

const STORAGE_KEY = "coffeeRecipeState";

const DEFAULT_STATE: StorageState = {
  lastShownDate: "",
  lastRecipeId: "",
  favorites: [],
  userPreferences: {
    preferredCategories: [],
    caffeineFilter: "all",
  },
};

export class StorageService {
  async getState(): Promise<StorageState> {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    const stored = result[STORAGE_KEY] as Partial<StorageState> | undefined;
    if (!stored) return { ...DEFAULT_STATE, userPreferences: { ...DEFAULT_STATE.userPreferences } };
    return {
      lastShownDate: stored.lastShownDate ?? DEFAULT_STATE.lastShownDate,
      lastRecipeId: stored.lastRecipeId ?? DEFAULT_STATE.lastRecipeId,
      favorites: stored.favorites ?? [...DEFAULT_STATE.favorites],
      userPreferences: {
        ...DEFAULT_STATE.userPreferences,
        ...stored.userPreferences,
      },
    };
  }

  async setState(state: StorageState): Promise<void> {
    await chrome.storage.local.set({ [STORAGE_KEY]: state });
  }

  async updateState(partial: Partial<StorageState>): Promise<StorageState> {
    const current = await this.getState();
    const updated: StorageState = {
      ...current,
      ...partial,
      userPreferences: partial.userPreferences
        ? { ...current.userPreferences, ...partial.userPreferences }
        : current.userPreferences,
    };
    await this.setState(updated);
    return updated;
  }

  async toggleFavorite(recipeId: string): Promise<boolean> {
    const state = await this.getState();
    const index = state.favorites.indexOf(recipeId);
    if (index >= 0) {
      state.favorites.splice(index, 1);
      await this.setState(state);
      return false;
    } else {
      state.favorites.push(recipeId);
      await this.setState(state);
      return true;
    }
  }

  async isFavorite(recipeId: string): Promise<boolean> {
    const state = await this.getState();
    return state.favorites.includes(recipeId);
  }

  async updatePreferences(prefs: Partial<UserPreferences>): Promise<void> {
    const state = await this.getState();
    state.userPreferences = { ...state.userPreferences, ...prefs };
    await this.setState(state);
  }
}
