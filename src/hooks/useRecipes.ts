import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Recipe } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch recipes with author info and tags
      const { data: recipesData, error: recipesError } = await supabase
        .from('recipes')
        .select(`
          *,
          author:profiles(id, full_name, email),
          ingredients(*),
          recipe_steps(*),
          recipe_tags(tag)
        `)
        .or(`visibility.eq.public,created_by.eq.${user?.id}`)
        .order('created_at', { ascending: false });

      if (recipesError) throw recipesError;

      // Transform the data to match our frontend types
      const transformedRecipes = (recipesData || []).map((recipe: any) => {
        // Sort ingredients by order_index
        if (recipe.ingredients) {
          recipe.ingredients.sort((a: any, b: any) => a.order_index - b.order_index);
        }

        // Transform recipe_steps to instructions and sort by step_number
        if (recipe.recipe_steps) {
          recipe.instructions = recipe.recipe_steps.sort((a: any, b: any) => a.step_number - b.step_number);
          delete recipe.recipe_steps;
        } else {
          recipe.instructions = [];
        }

        // Transform recipe_tags to tags array
        if (recipe.recipe_tags) {
          recipe.tags = recipe.recipe_tags.map((tag: any) => tag.tag);
          delete recipe.recipe_tags;
        } else {
          recipe.tags = [];
        }

        return recipe;
      });

      setRecipes(transformedRecipes);
    } catch (err: any) {
      console.error('Error fetching recipes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRecipes();
    }
  }, [user]);

  const createRecipe = async (recipeData: any) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Create recipe
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .insert({
          title: recipeData.title,
          description: recipeData.description,
          servings: recipeData.servings,
          visibility: recipeData.is_public ? 'public' : 'private',
          image_url: recipeData.image_url || null,
          created_by: user.id
        })
        .select()
        .single();

      if (recipeError) throw recipeError;

      // Create ingredients
      if (recipeData.ingredients && recipeData.ingredients.length > 0) {
        const validIngredients = recipeData.ingredients.filter((ing: any) => ing.name.trim());
        
        if (validIngredients.length > 0) {
          const ingredients = validIngredients.map((ing: any, index: number) => ({
            recipe_id: recipe.id,
            name: ing.name.trim(),
            quantity: ing.quantity || 1,
            unit: ing.unit || '',
            order_index: index
          }));

          const { error: ingredientsError } = await supabase
            .from('ingredients')
            .insert(ingredients);

          if (ingredientsError) throw ingredientsError;
        }
      }

      // Create recipe steps (instructions)
      if (recipeData.instructions && recipeData.instructions.length > 0) {
        const validInstructions = recipeData.instructions.filter((inst: any) => inst.instruction.trim());
        
        if (validInstructions.length > 0) {
          const steps = validInstructions.map((instruction: any, index: number) => ({
            recipe_id: recipe.id,
            step_number: index + 1,
            instruction: instruction.instruction.trim(),
            timer_minutes: instruction.timer_minutes || 0,
            image_url: instruction.image_url || null
          }));

          const { error: stepsError } = await supabase
            .from('recipe_steps')
            .insert(steps);

          if (stepsError) throw stepsError;
        }
      }

      // Create tags
      if (recipeData.tags && recipeData.tags.length > 0) {
        const validTags = recipeData.tags.filter((tag: string) => tag.trim());
        
        if (validTags.length > 0) {
          const tags = validTags.map((tag: string) => ({
            recipe_id: recipe.id,
            tag: tag.trim()
          }));

          const { error: tagsError } = await supabase
            .from('recipe_tags')
            .insert(tags);

          if (tagsError) throw tagsError;
        }
      }

      // Refresh recipes
      await fetchRecipes();
      return recipe;
    } catch (err: any) {
      console.error('Error creating recipe:', err);
      throw err;
    }
  };

  return {
    recipes,
    loading,
    error,
    fetchRecipes,
    createRecipe
  };
}