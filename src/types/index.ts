export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  servings: number;
  tags: string[];
  is_public: boolean;
  visibility: 'public' | 'private' | 'unlisted';
  image_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  author?: User;
  ingredients: Ingredient[];
  instructions: Instruction[];
  collaborators?: RecipeCollaborator[];
}

export interface Ingredient {
  id: string;
  recipe_id: string;
  name: string;
  quantity: number;
  unit: string;
  order_index: number;
}

export interface Instruction {
  id: string;
  recipe_id: string;
  step_number: number;
  instruction: string;
  timer_minutes?: number;
  image_url?: string;
  order_index: number;
}

export interface RecipeCollaborator {
  id: string;
  recipe_id: string;
  user_id: string;
  invited_by: string;
  role: 'editor' | 'viewer';
  created_at: string;
  user?: User;
}

export interface TimerState {
  isRunning: boolean;
  remainingTime: number;
  totalTime: number;
  stepNumber: number;
}