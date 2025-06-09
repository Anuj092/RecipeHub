import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Recipe } from '../types';

export function useRecipe(id: string) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('recipes')
          .select(`
            *,
            author:profiles(id, full_name, email),
            ingredients(*),
            recipe_steps(*),
            collaborators:recipe_collaborators(
              *,
              user:profiles!recipe_collaborators_user_id_fkey(id, full_name, email)
            )
          `)
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;

        // Transform the data to match our frontend types
        if (data) {
          // Sort ingredients by order_index
          if (data.ingredients) {
            data.ingredients.sort((a: any, b: any) => a.order_index - b.order_index);
          }

          // Transform recipe_steps to instructions and sort by step_number
          if (data.recipe_steps) {
            data.instructions = data.recipe_steps.sort((a: any, b: any) => a.step_number - b.step_number);
            delete data.recipe_steps;
          } else {
            data.instructions = [];
          }
        }

        setRecipe(data);
      } catch (err: any) {
        console.error('Error fetching recipe:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRecipe();
    }
  }, [id]);

  return { recipe, loading, error };
}