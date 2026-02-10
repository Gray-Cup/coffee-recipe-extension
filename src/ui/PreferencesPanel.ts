import type { RecipeCategory, UserPreferences } from "../types/index.ts";
import type { StorageService } from "../services/StorageService.ts";
import { el, clear, categoryDisplayName, ALL_CATEGORIES } from "./components.ts";

export class PreferencesPanel {
  onSave: (() => void) | null = null;

  constructor(private storageService: StorageService) {}

  async render(container: HTMLElement): Promise<void> {
    clear(container);

    const state = await this.storageService.getState();
    const prefs = state.userPreferences;

    const panel = el("div", { class: "panel" });
    panel.appendChild(el("h2", { class: "panel__title" }, ["Preferences"]));

    // Category checkboxes
    const catSection = el("fieldset", { class: "prefs-section" });
    catSection.appendChild(el("legend", {}, ["Coffee categories"]));
    const catHint = el("p", { class: "prefs-hint" }, ["Leave all unchecked to see every category."]);
    catSection.appendChild(catHint);

    const selectedCategories = new Set<RecipeCategory>(prefs.preferredCategories);

    for (const cat of ALL_CATEGORIES) {
      const label = el("label", { class: "prefs-checkbox" });
      const input = el("input", {
        type: "checkbox",
        value: cat,
        ...(selectedCategories.has(cat) ? { checked: "" } : {}),
      });
      if (selectedCategories.has(cat)) {
        input.checked = true;
      }
      input.addEventListener("change", () => {
        if (input.checked) {
          selectedCategories.add(cat);
        } else {
          selectedCategories.delete(cat);
        }
      });
      label.appendChild(input);
      label.appendChild(document.createTextNode(` ${categoryDisplayName(cat)}`));
      catSection.appendChild(label);
    }
    panel.appendChild(catSection);

    // Caffeine filter radios
    const cafSection = el("fieldset", { class: "prefs-section" });
    cafSection.appendChild(el("legend", {}, ["Caffeine"]));

    let selectedCaffeine = prefs.caffeineFilter;
    const cafOptions: { value: UserPreferences["caffeineFilter"]; label: string }[] = [
      { value: "all", label: "All" },
      { value: "caffeinated", label: "Caffeinated only" },
      { value: "decaf", label: "Decaf only" },
    ];

    for (const opt of cafOptions) {
      const label = el("label", { class: "prefs-radio" });
      const input = el("input", {
        type: "radio",
        name: "caffeine-filter",
        value: opt.value,
        ...(prefs.caffeineFilter === opt.value ? { checked: "" } : {}),
      });
      if (prefs.caffeineFilter === opt.value) {
        input.checked = true;
      }
      input.addEventListener("change", () => {
        selectedCaffeine = opt.value;
      });
      label.appendChild(input);
      label.appendChild(document.createTextNode(` ${opt.label}`));
      cafSection.appendChild(label);
    }
    panel.appendChild(cafSection);

    // Save button
    const saveBtn = el("button", { class: "prefs-save" }, ["Save Preferences"]);
    saveBtn.addEventListener("click", async () => {
      await this.storageService.updatePreferences({
        preferredCategories: [...selectedCategories],
        caffeineFilter: selectedCaffeine,
      });
      this.onSave?.();
    });
    panel.appendChild(saveBtn);

    container.appendChild(panel);
  }
}
