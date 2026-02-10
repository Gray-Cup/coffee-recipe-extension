import type { Recipe } from "../types/index.ts";
import { el, clear, formatBrewTime, categoryDisplayName } from "./components.ts";

export class RecipeCard {
  onToggleFavorite: (() => void) | null = null;

  render(container: HTMLElement, recipe: Recipe, isFavorite: boolean): void {
    clear(container);

    const card = el("article", { class: "recipe-card" });

    // Image
    const imageWrap = el("div", { class: "recipe-card__image" });
    const img = el("img", { src: recipe.image, alt: categoryDisplayName(recipe.category) });
    imageWrap.appendChild(img);
    card.appendChild(imageWrap);

    // Content
    const content = el("div", { class: "recipe-card__content" });

    // Header row: name + category badge + brew time + favorite button
    const header = el("div", { class: "recipe-card__header" });
    header.appendChild(el("h2", { class: "recipe-card__name" }, [recipe.name]));

    const meta = el("div", { class: "recipe-card__meta" });
    meta.appendChild(el("span", { class: "recipe-card__category" }, [categoryDisplayName(recipe.category)]));
    meta.appendChild(el("span", { class: "recipe-card__brew-time" }, [formatBrewTime(recipe.brewTimeMinutes)]));

    if (!recipe.caffeinated) {
      meta.appendChild(el("span", { class: "recipe-card__decaf-badge" }, ["Decaf"]));
    }

    header.appendChild(meta);

    const favBtn = el("button", {
      class: `recipe-card__favorite ${isFavorite ? "recipe-card__favorite--active" : ""}`,
      "aria-label": isFavorite ? "Remove from favorites" : "Save to favorites",
      title: isFavorite ? "Remove from favorites" : "Save to favorites",
    });
    favBtn.innerHTML = isFavorite
      ? '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
    favBtn.addEventListener("click", () => this.onToggleFavorite?.());
    header.appendChild(favBtn);

    content.appendChild(header);

    // Description
    content.appendChild(el("p", { class: "recipe-card__description" }, [recipe.description]));

    // Ingredients
    const ingredientsSection = el("div", { class: "recipe-card__section" });
    ingredientsSection.appendChild(el("h3", {}, ["Ingredients"]));
    const ingredientsList = el("ul", { class: "recipe-card__ingredients" });
    for (const ing of recipe.ingredients) {
      const text = `${ing.amount} ${ing.name}${ing.optional ? " (optional)" : ""}`;
      ingredientsList.appendChild(el("li", {}, [text]));
    }
    ingredientsSection.appendChild(ingredientsList);
    content.appendChild(ingredientsSection);

    // Steps
    const stepsSection = el("div", { class: "recipe-card__section" });
    stepsSection.appendChild(el("h3", {}, ["Method"]));
    const stepsList = el("ol", { class: "recipe-card__steps" });
    for (const step of recipe.steps) {
      stepsList.appendChild(el("li", {}, [step]));
    }
    stepsSection.appendChild(stepsList);
    content.appendChild(stepsSection);

    // Tags
    if (recipe.tags.length > 0) {
      const tagsWrap = el("div", { class: "recipe-card__tags" });
      for (const tag of recipe.tags) {
        tagsWrap.appendChild(el("span", { class: "tag" }, [tag]));
      }
      content.appendChild(tagsWrap);
    }

    card.appendChild(content);
    container.appendChild(card);
  }
}
