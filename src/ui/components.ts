import type { RecipeCategory } from "../types/index.ts";

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Record<string, string>,
  children?: (Node | string)[],
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      element.setAttribute(key, value);
    }
  }
  if (children) {
    for (const child of children) {
      if (typeof child === "string") {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    }
  }
  return element;
}

export function clear(container: HTMLElement): void {
  container.innerHTML = "";
}

export function formatBrewTime(minutes: number): string {
  if (minutes >= 1440) {
    const days = Math.round(minutes / 1440);
    return `${days}d`;
  }
  if (minutes >= 60) {
    const hours = Math.round(minutes / 60);
    return `${hours}h`;
  }
  return `${minutes}min`;
}

const CATEGORY_NAMES: Record<RecipeCategory, string> = {
  "cold-brew": "Cold Brew",
  "pour-over": "Pour Over",
  espresso: "Espresso",
  "espresso-tonic": "Espresso Tonic",
  latte: "Latte",
  "iced-coffee": "Iced Coffee",
};

export function categoryDisplayName(category: RecipeCategory): string {
  return CATEGORY_NAMES[category];
}

export const ALL_CATEGORIES: RecipeCategory[] = [
  "cold-brew",
  "pour-over",
  "espresso",
  "espresso-tonic",
  "latte",
  "iced-coffee",
];
