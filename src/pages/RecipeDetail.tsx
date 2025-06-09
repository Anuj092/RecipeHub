import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, Users, Tag, User, Share2, Edit, Image as ImageIcon } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { IngredientScaler } from '../components/recipe/IngredientScaler';
import { Timer } from '../components/recipe/Timer';
import { useRecipe } from '../hooks/useRecipe';
import { useAuth } from '../contexts/AuthContext';

export function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const { recipe, loading, error } = useRecipe(id!);
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-8 w-2/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              {error || 'Recipe not found'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalTime = recipe.instructions?.reduce((sum, instruction) => 
    sum + (instruction.timer_minutes || 0), 0
  ) || 0;

  const canEdit = user && (user.id === recipe.created_by || 
    recipe.collaborators?.some(c => c.user_id === user.id && c.role === 'editor'));

  // Get author display name - prefer full_name over email
  const authorName = recipe.author?.full_name || recipe.author?.name || recipe.author?.email || 'Unknown';

  // Get step image or fallback
  const getStepImage = (stepIndex: number, imageUrl?: string) => {
    if (imageUrl) return imageUrl;
    
    const stepImageIds = [
      '4198018', // cooking prep
      '4198017', // mixing
      '4198016', // cooking in pan
      '4198015', // plating
      '4198014', // garnishing
      '4198013', // serving
      '4198012', // final dish
      '4198011', // cooking process
      '4198010', // ingredients prep
      '4198009', // cooking technique
    ];
    
    const imageId = stepImageIds[stepIndex % stepImageIds.length];
    return `https://images.pexels.com/photos/${imageId}/pexels-photo-${imageId}.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recipe Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{recipe.title}</h1>
              <p className="text-gray-600 text-lg mb-4">{recipe.description}</p>
              
              <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{recipe.servings} servings</span>
                </div>
                {totalTime > 0 && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{totalTime} minutes</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>by {authorName}</span>
                </div>
              </div>

              {recipe.tags && recipe.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {recipe.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center space-x-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm"
                    >
                      <Tag className="w-3 h-3" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 ml-4">
              <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
              {canEdit && (
                <button className="flex items-center space-x-1 text-orange-500 hover:text-orange-600 px-3 py-2 rounded-lg hover:bg-orange-50 transition-all">
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ingredients */}
          <div>
            <IngredientScaler 
              ingredients={recipe.ingredients || []} 
              originalServings={recipe.servings} 
            />
          </div>

          {/* Instructions */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h3>
              
              <div className="space-y-6">
                {recipe.instructions && recipe.instructions.map((instruction, index) => (
                  <div key={instruction.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <span className="font-medium text-gray-900">
                        Step {instruction.step_number}
                      </span>
                      {instruction.timer_minutes && (
                        <button
                          onClick={() => setActiveStep(
                            activeStep === instruction.step_number ? null : instruction.step_number
                          )}
                          className="flex items-center space-x-1 text-orange-500 hover:text-orange-600 text-sm font-medium"
                        >
                          <Clock className="w-4 h-4" />
                          <span>{instruction.timer_minutes}min</span>
                        </button>
                      )}
                    </div>
                    
                    {/* Step Image */}
                    {(instruction.image_url || true) && (
                      <div className="mb-4">
                        <div className="relative aspect-video w-full max-w-sm rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={getStepImage(index, instruction.image_url)}
                            alt={`Step ${instruction.step_number}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = getStepImage(index);
                            }}
                          />
                          {!instruction.image_url && (
                            <div className="absolute top-2 right-2">
                              <div className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                                <ImageIcon className="w-3 h-3" />
                                <span>Default</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <p className="text-gray-700 leading-relaxed mb-3">
                      {instruction.instruction}
                    </p>

                    {instruction.timer_minutes && activeStep === instruction.step_number && (
                      <Timer
                        minutes={instruction.timer_minutes}
                        stepNumber={instruction.step_number}
                        onComplete={() => {
                          // Show completion notification
                          if ('Notification' in window) {
                            Notification.requestPermission().then(permission => {
                              if (permission === 'granted') {
                                new Notification(`Step ${instruction.step_number} Complete!`, {
                                  body: `Timer for "${recipe.title}" has finished.`,
                                  icon: '/vite.svg'
                                });
                              }
                            });
                          }
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Collaborators */}
        {recipe.collaborators && recipe.collaborators.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Collaborators</h3>
            <div className="flex flex-wrap gap-3">
              {recipe.collaborators.map((collaborator) => {
                // Get collaborator display name - prefer full_name over email
                const collaboratorName = collaborator.user?.full_name || collaborator.user?.name || collaborator.user?.email || 'Unknown';
                
                return (
                  <div
                    key={collaborator.id}
                    className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg"
                  >
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {collaboratorName}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                      {collaborator.role}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}