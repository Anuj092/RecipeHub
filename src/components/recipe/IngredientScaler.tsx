import React, { useState } from 'react';
import { Users, Calculator } from 'lucide-react';
import { Ingredient } from '../../types';

interface IngredientScalerProps {
  ingredients: Ingredient[];
  originalServings: number;
}

export function IngredientScaler({ ingredients, originalServings }: IngredientScalerProps) {
  const [targetServings, setTargetServings] = useState(originalServings);

  const scalingFactor = targetServings / originalServings;

  const formatQuantity = (quantity: number) => {
    const scaled = quantity * scalingFactor;
    // Round to 2 decimal places and remove unnecessary zeros
    return Math.round(scaled * 100) / 100;
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Calculator className="w-5 h-5 text-orange-500" />
          <span>Ingredients</span>
        </h3>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Servings:</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTargetServings(Math.max(1, targetServings - 1))}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
            >
              -
            </button>
            <span className="font-semibold text-lg w-8 text-center">{targetServings}</span>
            <button
              onClick={() => setTargetServings(targetServings + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {targetServings !== originalServings && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-700">
            <strong>Scaling:</strong> Original recipe serves {originalServings}, 
            adjusted for {targetServings} servings (×{scalingFactor.toFixed(2)})
          </p>
        </div>
      )}

      <div className="space-y-3">
        {ingredients.map((ingredient) => (
          <div key={ingredient.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
            <span className="text-gray-900">{ingredient.name}</span>
            <div className="text-right">
              <span className={`font-medium ${targetServings !== originalServings ? 'text-orange-600' : 'text-gray-700'}`}>
                {formatQuantity(ingredient.quantity)} {ingredient.unit}
              </span>
              {targetServings !== originalServings && (
                <div className="text-xs text-gray-500">
                  (was {ingredient.quantity} {ingredient.unit})
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}