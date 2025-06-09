import React, { useState } from 'react';
import { Plus, X, Clock, Tag, Image } from 'lucide-react';
import { Recipe, Ingredient, Instruction } from '../../types';

interface RecipeFormProps {
  recipe?: Recipe;
  onSubmit: (data: RecipeFormData) => Promise<void>;
  loading?: boolean;
}

export interface RecipeFormData {
  title: string;
  description: string;
  servings: number;
  tags: string[];
  is_public: boolean;
  image_url?: string;
  ingredients: Omit<Ingredient, 'id' | 'recipe_id'>[];
  instructions: Omit<Instruction, 'id' | 'recipe_id'>[];
}

export function RecipeForm({ recipe, onSubmit, loading = false }: RecipeFormProps) {
  const [formData, setFormData] = useState<RecipeFormData>({
    title: recipe?.title || '',
    description: recipe?.description || '',
    servings: recipe?.servings || 4,
    tags: recipe?.tags || [],
    is_public: recipe?.visibility === 'public',
    image_url: recipe?.image_url || '',
    ingredients: recipe?.ingredients.map(ing => ({
      name: ing.name,
      quantity: ing.quantity,
      unit: ing.unit,
      order_index: ing.order_index
    })) || [{ name: '', quantity: 1, unit: '', order_index: 0 }],
    instructions: recipe?.instructions.map((inst, idx) => ({
      step_number: idx + 1,
      instruction: inst.instruction,
      timer_minutes: inst.timer_minutes,
      image_url: inst.image_url,
      order_index: idx
    })) || [{ step_number: 1, instruction: '', timer_minutes: 0, image_url: '', order_index: 0 }]
  });

  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.title.trim()) {
      setError('Recipe title is required');
      return;
    }

    if (!formData.description.trim()) {
      setError('Recipe description is required');
      return;
    }

    if (formData.servings < 1) {
      setError('Servings must be at least 1');
      return;
    }

    try {
      const updatedInstructions = formData.instructions.map((inst, idx) => ({
        ...inst,
        step_number: idx + 1,
        order_index: idx
      }));
      
      await onSubmit({ ...formData, instructions: updatedInstructions });
    } catch (err: any) {
      setError(err.message || 'Failed to save recipe');
    }
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, {
        name: '',
        quantity: 1,
        unit: '',
        order_index: prev.ingredients.length
      }]
    }));
  };

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index).map((ing, i) => ({ ...ing, order_index: i }))
    }));
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: any) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing
      )
    }));
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, {
        step_number: prev.instructions.length + 1,
        instruction: '',
        timer_minutes: 0,
        image_url: '',
        order_index: prev.instructions.length
      }]
    }));
  };

  const removeInstruction = (index: number) => {
    setFormData(prev => {
      const updated = prev.instructions.filter((_, i) => i !== index)
        .map((inst, i) => ({ ...inst, step_number: i + 1, order_index: i }));
      return { ...prev, instructions: updated };
    });
  };

  const updateInstruction = (index: number, field: keyof Instruction, value: any) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) =>
        i === index ? { ...inst, [field]: value } : inst
      )
    }));
  };

  const addTag = () => {
    const tag = newTag.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const getPreviewImage = () => {
    if (formData.image_url) return formData.image_url;
    const imageIds = ['1640777', '1279330', '1640772', '1640774', '1640775'];
    const id = imageIds[Math.floor(Math.random() * imageIds.length)];
    return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop`;
  };

  const getStepImage = (stepIndex: number, imageUrl?: string) => {
    if (imageUrl) return imageUrl;
    const stepImageIds = ['4198018','4198017','4198016','4198015','4198014','4198013','4198012','4198011','4198010','4198009'];
    const id = stepImageIds[stepIndex % stepImageIds.length];
    return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipe Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter recipe title"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Describe your recipe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Servings
            </label>
            <input
              type="number"
              value={formData.servings}
              onChange={(e) => setFormData(prev => ({ ...prev, servings: parseInt(e.target.value) || 1 }))}
              min="1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visibility
            </label>
            <select
              value={formData.is_public ? 'public' : 'private'}
              onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.value === 'public' }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recipe Image */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recipe Image</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL (optional)
            </label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview
            </label>
            <div className="aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              <img
                src={getPreviewImage()}
                alt="Recipe preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = getPreviewImage();
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Tags</h2>
        
        <div className="space-y-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Add a tag (e.g., vegetarian, quick, dessert)"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center space-x-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm"
                >
                  <Tag className="w-3 h-3" />
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-orange-500 hover:text-orange-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ingredients */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Ingredients</h2>
          <button
            type="button"
            onClick={addIngredient}
            className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Ingredient</span>
          </button>
        </div>

        <div className="space-y-4">
          {formData.ingredients.map((ingredient, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border border-gray-200 rounded-lg">
              <div className="md:col-span-5">
                <input
                  type="text"
                  value={ingredient.name}
                  onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Ingredient name"
                />
              </div>
              <div className="md:col-span-2">
                <input
                  type="number"
                  value={ingredient.quantity}
                  onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                  step="0.1"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Amount"
                />
              </div>
              <div className="md:col-span-3">
                <input
                  type="text"
                  value={ingredient.unit}
                  onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Unit (cups, tbsp, etc.)"
                />
              </div>
              <div className="md:col-span-2 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Instructions</h2>
          <button
            type="button"
            onClick={addInstruction}
            className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Step</span>
          </button>
        </div>

        <div className="space-y-6">
          {formData.instructions.map((instruction, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">Step {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeInstruction(index)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instruction
                    </label>
                    <textarea
                      value={instruction.instruction}
                      onChange={(e) => updateInstruction(index, 'instruction', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Describe this step..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Timer (minutes)
                      </label>
                      <input
                        type="number"
                        value={instruction.timer_minutes || ''}
                        onChange={(e) => updateInstruction(index, 'timer_minutes', parseInt(e.target.value) || 0)}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Image className="w-4 h-4 inline mr-1" />
                        Step Image URL
                      </label>
                      <input
                        type="url"
                        value={instruction.image_url || ''}
                        onChange={(e) => updateInstruction(index, 'image_url', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Optional image URL"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Step Preview
                  </label>
                  <div className="aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                    <img
                      src={getStepImage(index, instruction.image_url)}
                      alt={`Step ${index + 1} preview`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = getStepImage(index);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end space-x-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-orange-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? 'Saving...' : recipe ? 'Update Recipe' : 'Create Recipe'}
        </button>
      </div>
    </form>
  );
}