import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { RecipeForm, RecipeFormData } from '../components/recipe/RecipeForm';
import { useRecipes } from '../hooks/useRecipes';

export function CreateRecipe() {
  const navigate = useNavigate();
  const { createRecipe } = useRecipes();
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (data: RecipeFormData) => {
    try {
      setLoading(true);
      console.log('Submitting recipe data:', data);
      
      const recipe = await createRecipe(data);
      console.log('Recipe created successfully:', recipe);
      
      navigate(`/recipe/${recipe.id}`);
    } catch (error: any) {
      console.error('Error creating recipe:', error);
      // Don't show alert, let the form handle the error display
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Recipe</h1>
          <p className="text-gray-600">Share your culinary creation with the community</p>
        </div>

        <RecipeForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}