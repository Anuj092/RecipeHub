import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, TrendingUp } from 'lucide-react';
import { useRecipes } from '../hooks/useRecipes';
import { RecipeCard } from '../components/recipe/RecipeCard';
import { Header } from '../components/layout/Header';

export function Home() {
  const { recipes, loading, error } = useRecipes();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                <div className="aspect-video bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-red-600 mb-4">Error loading recipes: {error}</div>
            <button
              onClick={() => window.location.reload()}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-500 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Cook Together, Create Together
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Collaborative recipe building with smart scaling and built-in timers
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/create"
                className="inline-flex items-center space-x-2 bg-white text-orange-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>Create Recipe</span>
              </Link>
              <Link
                to="/explore"
                className="inline-flex items-center space-x-2 border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-orange-600 transition-all"
              >
                <Search className="w-5 h-5" />
                <span>Explore Recipes</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Recent Recipes</h2>
            <p className="text-gray-600">Discover and collaborate on amazing recipes</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <TrendingUp className="w-4 h-4" />
            <span>{recipes.length} recipes available</span>
          </div>
        </div>

        {recipes.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">👨‍🍳</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No recipes yet</h3>
            <p className="text-gray-600 mb-6">Be the first to create a recipe and start collaborating!</p>
            <Link
              to="/create"
              className="inline-flex items-center space-x-2 bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Create First Recipe</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.slice(0, 6).map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}

        {recipes.length > 6 && (
          <div className="text-center mt-8">
            <Link
              to="/explore"
              className="inline-flex items-center space-x-2 bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-all"
            >
              <Search className="w-5 h-5" />
              <span>View All Recipes</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}