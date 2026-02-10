import { RecipeService } from "./services/RecipeService.ts";
import { StorageService } from "./services/StorageService.ts";
import { Randomizer } from "./services/Randomizer.ts";
import { UIRenderer } from "./ui/UIRenderer.ts";

async function main(): Promise<void> {
  const recipeService = new RecipeService();
  const storageService = new StorageService();
  const randomizer = new Randomizer(recipeService);

  const state = await storageService.getState();
  const today = new Date().toISOString().slice(0, 10);

  let currentRecipe;

  // Same day: show the same recipe as before
  if (state.lastShownDate === today && state.lastRecipeId) {
    currentRecipe = recipeService.getById(state.lastRecipeId);
  }

  // New day or first run: pick a new daily recipe
  if (!currentRecipe) {
    currentRecipe = randomizer.getDailyRecipe(
      today,
      state.lastRecipeId,
      state.userPreferences,
    );
    await storageService.updateState({
      lastShownDate: today,
      lastRecipeId: currentRecipe.id,
    });
  }

  const renderer = new UIRenderer({
    recipeService,
    storageService,
    randomizer,
    initialRecipe: currentRecipe,
    initialState: state,
  });

  renderer.mount(document.getElementById("app")!);
}

main().catch(console.error);
