import type { Recipe, StorageState, ViewMode } from "../types/index.ts";
import type { RecipeService } from "../services/RecipeService.ts";
import type { StorageService } from "../services/StorageService.ts";
import type { Randomizer } from "../services/Randomizer.ts";
import { RecipeCard } from "./RecipeCard.ts";
import { FavoritesPanel } from "./FavoritesPanel.ts";
import { PreferencesPanel } from "./PreferencesPanel.ts";
import { el, clear } from "./components.ts";

export interface UIRendererConfig {
  recipeService: RecipeService;
  storageService: StorageService;
  randomizer: Randomizer;
  initialRecipe: Recipe;
  initialState: StorageState;
}

export class UIRenderer {
  private currentRecipe: Recipe;
  private state: StorageState;
  private currentView: ViewMode = "recipe";
  private container: HTMLElement | null = null;

  private recipeCard: RecipeCard;
  private favoritesPanel: FavoritesPanel;
  private preferencesPanel: PreferencesPanel;

  constructor(private config: UIRendererConfig) {
    this.currentRecipe = config.initialRecipe;
    this.state = config.initialState;
    this.recipeCard = new RecipeCard();
    this.favoritesPanel = new FavoritesPanel(config.recipeService, config.storageService);
    this.preferencesPanel = new PreferencesPanel(config.storageService);
  }

  mount(container: HTMLElement): void {
    this.container = container;
    this.renderHeader();
    this.renderMain();
    this.setupCallbacks();
  }

  private renderHeader(): void {
    const header = this.container!.querySelector("#header") as HTMLElement;
    clear(header);

    header.appendChild(el("h1", { class: "header__title" }, ["Daily Coffee Recipe"]));

    const nav = el("nav", { class: "header__nav" });

    // Favorites button
    const favBtn = el("button", {
      class: "nav-btn",
      "aria-label": "View favorites",
      title: "Favorites",
    });
    favBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
    favBtn.addEventListener("click", () => this.toggleView("favorites"));
    nav.appendChild(favBtn);

    // Preferences button
    const prefsBtn = el("button", {
      class: "nav-btn",
      "aria-label": "Preferences",
      title: "Preferences",
    });
    prefsBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
    prefsBtn.addEventListener("click", () => this.toggleView("preferences"));
    nav.appendChild(prefsBtn);

    // Surprise Me button
    const surpriseBtn = el("button", {
      class: "nav-btn nav-btn--accent",
      "aria-label": "Surprise me with a random recipe",
      title: "Surprise Me",
    });
    surpriseBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><rect x="2" y="2" width="20" height="20" rx="4"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/><circle cx="16" cy="8" r="1.5" fill="currentColor"/><circle cx="8" cy="16" r="1.5" fill="currentColor"/><circle cx="16" cy="16" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>';
    surpriseBtn.addEventListener("click", () => this.handleSurpriseMe());
    nav.appendChild(surpriseBtn);

    header.appendChild(nav);
  }

  private renderMain(): void {
    const main = this.container!.querySelector("#main-content") as HTMLElement;
    const sidebar = this.container!.querySelector("#sidebar") as HTMLElement;

    const isFav = this.state.favorites.includes(this.currentRecipe.id);
    this.recipeCard.render(main, this.currentRecipe, isFav);
    this.recipeCard.onToggleFavorite = () => this.handleToggleFavorite();

    // Render similar recipes
    const similar = this.config.recipeService.getSimilar(this.currentRecipe, 3);
    if (similar.length > 0) {
      const similarSection = el("div", { class: "similar-recipes" });
      similarSection.appendChild(el("h3", { class: "similar-recipes__title" }, ["You might also like"]));
      const grid = el("div", { class: "similar-recipes__grid" });
      for (const recipe of similar) {
        const card = el("button", { class: "similar-card" });
        card.appendChild(el("img", { src: recipe.image, alt: recipe.name, class: "similar-card__image" }));
        card.appendChild(el("span", { class: "similar-card__name" }, [recipe.name]));
        card.addEventListener("click", () => this.showRecipe(recipe));
        grid.appendChild(card);
      }
      similarSection.appendChild(grid);
      main.appendChild(similarSection);
    }

    if (this.currentView === "favorites") {
      sidebar.classList.remove("hidden");
      this.favoritesPanel.render(sidebar);
    } else if (this.currentView === "preferences") {
      sidebar.classList.remove("hidden");
      this.preferencesPanel.render(sidebar);
    } else {
      sidebar.classList.add("hidden");
      clear(sidebar);
    }
  }

  private setupCallbacks(): void {
    this.favoritesPanel.onSelectRecipe = (recipeId) => {
      const recipe = this.config.recipeService.getById(recipeId);
      if (recipe) {
        this.showRecipe(recipe);
        this.currentView = "recipe";
        this.renderMain();
      }
    };

    this.preferencesPanel.onSave = () => {
      this.currentView = "recipe";
      this.refreshState().then(() => this.renderMain());
    };
  }

  private toggleView(view: ViewMode): void {
    this.currentView = this.currentView === view ? "recipe" : view;
    this.renderMain();
  }

  private showRecipe(recipe: Recipe): void {
    this.currentRecipe = recipe;
    this.renderMain();
  }

  private async handleSurpriseMe(): Promise<void> {
    const recipe = this.config.randomizer.surpriseMe(
      this.currentRecipe.id,
      this.state.userPreferences,
    );
    this.currentRecipe = recipe;
    this.currentView = "recipe";
    this.renderMain();
  }

  private async handleToggleFavorite(): Promise<void> {
    const added = await this.config.storageService.toggleFavorite(this.currentRecipe.id);
    if (added) {
      this.state.favorites.push(this.currentRecipe.id);
    } else {
      this.state.favorites = this.state.favorites.filter((id) => id !== this.currentRecipe.id);
    }
    this.renderMain();
  }

  private async refreshState(): Promise<void> {
    this.state = await this.config.storageService.getState();
  }
}
