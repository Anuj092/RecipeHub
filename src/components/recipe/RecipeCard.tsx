import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Tag, User, Heart, BookOpen, Share2, Eye, Lock } from 'lucide-react';
import { Recipe } from '../../types';

interface RecipeCardProps {
  recipe: Recipe;
  showAuthor?: boolean;
  compact?: boolean;
}

export function RecipeCard({ recipe, showAuthor = true, compact = false }: RecipeCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const totalTime = (recipe.instructions || []).reduce(
    (sum, instruction) => sum + (instruction.timer_minutes || 0),
    0
  );

  const formattedDate = recipe.created_at
    ? new Date(recipe.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Unknown date';

  // Get author display name - prefer full_name over email
  const authorName = recipe.author?.full_name || recipe.author?.name || recipe.author?.email || 'Unknown';

  // Get a random food image from Pexels
  const getRecipeImage = (recipeId: string) => {
    const imageIds = [
      '1640777', // pasta dish
      '1279330', // burger
      '1640772', // salad
      '1640774', // pizza
      '1640775', // soup
      '1640776', // sandwich
      '1640778', // steak
      '1640779', // dessert
      '1640780', // breakfast
      '1640781', // seafood
      '1640782', // vegetables
      '1640783', // bread
      '1640784', // chicken
      '1640785', // rice dish
      '1640786', // noodles
    ];
    
    // Use recipe ID to consistently select the same image for each recipe
    const hash = recipeId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const imageId = imageIds[Math.abs(hash) % imageIds.length];
    return `https://images.pexels.com/photos/${imageId}/pexels-photo-${imageId}.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop`;
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    // Here you would typically make an API call to save the like
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: recipe.description,
        url: window.location.origin + `/recipe/${recipe.id}`
      }).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.origin + `/recipe/${recipe.id}`)
        .then(() => {
          // You could show a toast notification here
          console.log('Recipe link copied to clipboard!');
        })
        .catch(console.error);
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'hard':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getVisibilityIcon = () => {
    switch (recipe.visibility) {
      case 'private':
        return <Lock className="w-3 h-3" />;
      case 'public':
        return <Eye className="w-3 h-3" />;
      default:
        return <Eye className="w-3 h-3" />;
    }
  };

  if (compact) {
    return (
      <Link
        to={`/recipe/${recipe.id}`}
        className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
      >
        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={recipe.image_url || getRecipeImage(recipe.id)}
            alt={recipe.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              if (!imageError) {
                e.currentTarget.src = getRecipeImage(recipe.id);
                setImageError(true);
              }
            }}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{recipe.title}</h3>
          <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>{recipe.servings}</span>
            </div>
            {totalTime > 0 && (
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{totalTime}m</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 overflow-hidden group">
      <Link to={`/recipe/${recipe.id}`} className="block">
        <div className="aspect-video relative overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
          )}
          
          <img
            src={recipe.image_url || getRecipeImage(recipe.id)}
            alt={recipe.title}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              if (!imageError) {
                e.currentTarget.src = getRecipeImage(recipe.id);
                setImageError(true);
              }
            }}
          />
          
          {/* Overlay with quick actions */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div className="flex items-center space-x-2">
                {recipe.difficulty && (
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getDifficultyColor(recipe.difficulty)}`}>
                    {recipe.difficulty}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleLike}
                  className={`p-2 rounded-full backdrop-blur-sm transition-all ${
                    isLiked 
                      ? 'bg-red-500 text-white' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                </button>
                
                <button
                  onClick={handleShare}
                  className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-all"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Visibility indicator */}
          <div className="absolute top-3 right-3">
            <div className={`flex items-center space-x-1 text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm ${
              recipe.visibility === 'private' 
                ? 'bg-purple-100/90 text-purple-700' 
                : 'bg-green-100/90 text-green-700'
            }`}>
              {getVisibilityIcon()}
              <span className="capitalize">{recipe.visibility}</span>
            </div>
          </div>
        </div>
      </Link>

      <div className="p-6">
        <Link to={`/recipe/${recipe.id}`}>
          <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
            {recipe.title}
          </h3>
        </Link>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {recipe.description}
        </p>

        {/* Recipe stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{recipe.servings} servings</span>
            </div>
            {totalTime > 0 && (
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{totalTime} min</span>
              </div>
            )}
            {recipe.instructions && (
              <div className="flex items-center space-x-1">
                <BookOpen className="w-4 h-4" />
                <span>{recipe.instructions.length} steps</span>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        {(recipe.tags?.length || 0) > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {recipe.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center space-x-1 bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                <Tag className="w-3 h-3" />
                <span>{tag}</span>
              </span>
            ))}
            {recipe.tags.length > 3 && (
              <span className="text-xs text-gray-500 px-2 py-1">
                +{recipe.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {showAuthor && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <User className="w-4 h-4" />
              <span>by {authorName}</span>
            </div>
          )}

          <div className="text-xs text-gray-400">{formattedDate}</div>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-all ${
                isLiked 
                  ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{isLiked ? 'Liked' : 'Like'}</span>
            </button>
          </div>

          <Link
            to={`/recipe/${recipe.id}`}
            className="text-orange-500 hover:text-orange-600 text-sm font-medium transition-colors"
          >
            View Recipe →
          </Link>
        </div>
      </div>
    </div>
  );
}