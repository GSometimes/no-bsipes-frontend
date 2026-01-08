import { useState } from 'react';
import type { Recipe } from '../types/recipe';
import { MAX_RECENT_RECIPES } from '../utils/constants';
import { ConfirmModal } from './Modal';

interface RecentRecipesProps {
  recipes: Recipe[];
  selectedId: string | null;
  onSelect: (recipe: Recipe) => void;
  onClear: () => void;
}

export function RecentRecipes({
  recipes,
  selectedId,
  onSelect,
  onClear,
}: RecentRecipesProps) {
  const [showClearModal, setShowClearModal] = useState(false);

  if (recipes.length === 0) {
    return (
      <div className='text-center py-8 text-stone-400 text-sm'>
        <svg
          className='w-10 h-10 mx-auto mb-3 opacity-50'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={1.5}
            d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
          />
        </svg>
        <p>No recipes yet</p>
        <p className='mt-1 text-xs'>Scraped recipes will appear here</p>
      </div>
    );
  }

  return (
    <>
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <h3 className='text-sm font-medium text-stone-600'>
            Recent ({recipes.length}/{MAX_RECENT_RECIPES})
          </h3>
          <button
            onClick={() => setShowClearModal(true)}
            className='text-xs text-stone-400 hover:text-red-500 transition-colors'
          >
            Clear all
          </button>
        </div>

        <ul className='space-y-2'>
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <button
                onClick={() => onSelect(recipe)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedId === recipe.id
                    ? 'border-amber-300 bg-amber-50'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className='flex gap-3'>
                  {recipe.image && (
                    <div className='w-12 h-12 rounded-md overflow-hidden shrink-0 bg-stone-100'>
                      <img
                        src={recipe.image}
                        alt=''
                        className='w-full h-full object-cover'
                        onError={(e) => {
                          const parent = e.currentTarget.parentElement;
                          if (parent) parent.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className='min-w-0 flex-1'>
                    <p className='text-xs text-amber-600 font-medium'>
                      {recipe.siteName}
                    </p>
                    <p className='text-sm text-stone-800 font-medium truncate'>
                      {recipe.title}
                    </p>
                    <p className='text-xs text-stone-400 mt-0.5'>
                      {new Date(recipe.scrapedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <ConfirmModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={onClear}
        title='Clear all recipes?'
        message='This will remove all saved recipes from your browser. This action cannot be undone.'
        confirmText='Clear all'
        cancelText='Keep recipes'
        variant='danger'
      />
    </>
  );
}
