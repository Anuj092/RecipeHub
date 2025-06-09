import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChefHat, Plus, LogOut, User, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Get user display name - prefer full_name over email
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'User';

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <ChefHat className="w-8 h-8 text-orange-500" />
            <span className="text-2xl font-bold text-gray-900">RecipeHub</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-orange-600 font-medium transition-all"
            >
              Home
            </Link>
            <Link
              to="/explore"
              className="flex items-center space-x-1 text-gray-700 hover:text-orange-600 font-medium transition-all"
            >
              <Search className="w-4 h-4" />
              <span>Explore</span>
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link
              to="/create"
              className="inline-flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:block">Create Recipe</span>
            </Link>

            <div className="relative group">
              <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-all">
                <User className="w-5 h-5" />
                <span className="hidden sm:block">{userName}</span>
              </button>
              
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-2">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}