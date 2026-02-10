export type RecipeCategory =
  | "cold-brew"
  | "pour-over"
  | "espresso"
  | "espresso-tonic"
  | "latte"
  | "iced-coffee";

export interface RecipeIngredient {
  name: string;
  amount: string;
  optional?: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  category: RecipeCategory;
  tags: string[];
  caffeinated: boolean;
  brewTimeMinutes: number;
  ingredients: RecipeIngredient[];
  steps: string[];
  image: string;
  description: string;
}

export interface UserPreferences {
  preferredCategories: RecipeCategory[];
  caffeineFilter: "all" | "caffeinated" | "decaf";
}

export interface StorageState {
  lastShownDate: string;
  lastRecipeId: string;
  favorites: string[];
  userPreferences: UserPreferences;
}

export type ViewMode = "recipe" | "favorites" | "preferences";
