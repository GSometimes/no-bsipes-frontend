import { useState, useMemo } from 'react';
import { RecipeForm } from './components/RecipeForm';
import { RecipeCard } from './components/RecipeCard';
import { RecentRecipes } from './components/RecentRecipes';
import { useLocalStorage } from './hooks/useLocalStorage';
import { STORAGE_KEY, MAX_RECENT_RECIPES } from './utils/constants';
import type { Recipe } from './types/recipe';

function App() {
  const [recentRecipes, setRecentRecipes] = useLocalStorage<Recipe[]>(
    STORAGE_KEY,
    []
  );
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Use sourceUrl for duplicate checking instead of hashed IDs
  const existingUrls = useMemo(
    () => new Set(recentRecipes.map((r) => r.sourceUrl)),
    [recentRecipes]
  );

  const handleRecipeScraped = (recipe: Recipe) => {
    setRecentRecipes((prev) => {
      // Add to front, remove duplicates, limit to max
      const filtered = prev.filter((r) => r.id !== recipe.id);
      return [recipe, ...filtered].slice(0, MAX_RECENT_RECIPES);
    });
    setSelectedRecipe(recipe);
  };

  const handleClearRecipes = () => {
    setRecentRecipes([]);
    setSelectedRecipe(null);
  };

  return (
    <div className='min-h-screen bg-stone-50 space-y-6 pt-4'>
      {/* Main Content */}
      <main className='max-w-6xl mx-auto'>
        <div className='grid lg:grid-cols-[320px_1fr] gap-8'>
          {/* Sidebar */}
          <aside className='space-y-6'>
            {/* Form Card */}
            <div className='bg-white rounded-xl border border-stone-200 p-5'>
              <h2 className='font-medium text-stone-800 mb-4'>
                Scrape a Recipe
              </h2>
              <RecipeForm
                onRecipeScraped={handleRecipeScraped}
                existingUrls={existingUrls}
              />
            </div>

            {/* Recent Recipes */}
            <div className='bg-white rounded-xl border border-stone-200 p-5'>
              <RecentRecipes
                recipes={recentRecipes}
                selectedId={selectedRecipe?.id ?? null}
                onSelect={setSelectedRecipe}
                onClear={handleClearRecipes}
              />
            </div>
          </aside>

          {/* Recipe Display */}
          <section>
            {selectedRecipe ? (
              <RecipeCard recipe={selectedRecipe} />
            ) : (
              <div className='bg-white rounded-xl border border-stone-200 p-12 text-center'>
                <div className='max-w-sm mx-auto'>
                  <svg
                    className='w-16 h-16 mx-auto mb-4 text-stone-300'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={1}
                      d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                    />
                  </svg>
                  <h3 className='font-serif text-xl text-stone-700 mb-2'>
                    No Recipe Selected
                  </h3>
                  <p className='text-stone-500 text-sm'>
                    Paste a recipe URL from one of the supported sites to
                    extract just the ingredients and instructions.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;