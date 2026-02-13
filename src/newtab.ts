import { RecipeService } from "./services/RecipeService.ts";
import { StorageService } from "./services/StorageService.ts";
import { Randomizer } from "./services/Randomizer.ts";
import { UIRenderer } from "./ui/UIRenderer.ts";

async function main(): Promise<void> {
  const recipeService = new RecipeService();
  const storageService = new StorageService();
  const randomizer = new Randomizer(recipeService);

  const state = await storageService.getState();

  // Pick a new random recipe on every new tab, avoiding the last shown one
  const currentRecipe = randomizer.surpriseMe(
    state.lastRecipeId,
    state.userPreferences,
  );
  await storageService.updateState({
    lastRecipeId: currentRecipe.id,
  });

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
