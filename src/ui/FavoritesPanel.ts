import type { RecipeService } from "../services/RecipeService.ts";
import type { StorageService } from "../services/StorageService.ts";
import { el, clear, categoryDisplayName } from "./components.ts";

export class FavoritesPanel {
  onSelectRecipe: ((recipeId: string) => void) | null = null;

  constructor(
    private recipeService: RecipeService,
    private storageService: StorageService,
  ) {}

  async render(container: HTMLElement): Promise<void> {
    clear(container);

    const panel = el("div", { class: "panel" });
    panel.appendChild(el("h2", { class: "panel__title" }, ["Favorites"]));

    const state = await this.storageService.getState();
    const favorites = state.favorites
      .map((id) => this.recipeService.getById(id))
      .filter((r) => r !== undefined);

    if (favorites.length === 0) {
      panel.appendChild(
        el("p", { class: "panel__empty" }, [
          "No favorites yet. Tap the star on a recipe to save it here.",
        ]),
      );
      container.appendChild(panel);
      return;
    }

    const list = el("ul", { class: "favorites-list" });
    for (const recipe of favorites) {
      const item = el("li", { class: "favorites-list__item" });

      const info = el("button", { class: "favorites-list__select" });
      info.appendChild(el("span", { class: "favorites-list__name" }, [recipe.name]));
      info.appendChild(
        el("span", { class: "favorites-list__category" }, [
          categoryDisplayName(recipe.category),
        ]),
      );
      info.addEventListener("click", () => this.onSelectRecipe?.(recipe.id));

      const removeBtn = el("button", {
        class: "favorites-list__remove",
        "aria-label": `Remove ${recipe.name} from favorites`,
        title: "Remove from favorites",
      });
      removeBtn.textContent = "\u00d7";
      removeBtn.addEventListener("click", async () => {
        await this.storageService.toggleFavorite(recipe.id);
        await this.render(container);
      });

      item.appendChild(info);
      item.appendChild(removeBtn);
      list.appendChild(item);
    }

    panel.appendChild(list);
    container.appendChild(panel);
  }
}
