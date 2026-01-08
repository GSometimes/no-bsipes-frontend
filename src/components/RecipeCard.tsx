import type { Recipe } from '../types/recipe';

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <article className="bg-white rounded-xl border border-stone-200 overflow-hidden">
      {recipe.image && (
        <div className="aspect-video w-full overflow-hidden bg-stone-100">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="p-6 space-y-6">
        <header>
          <p className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1">
            {recipe.siteName}
          </p>
          <h2 className="font-serif text-2xl text-stone-800 leading-tight">
            {recipe.title}
          </h2>
          <a
            href={recipe.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-amber-600 transition-colors mt-2"
          >
            View original
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </header>

        <section>
          <h3 className="font-medium text-stone-700 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Ingredients
          </h3>
          <ul className="space-y-1.5">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="text-stone-600 text-sm pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-amber-500">
                {ingredient}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="font-medium text-stone-700 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Instructions
          </h3>
          <ol className="space-y-3">
            {recipe.instructions.map((instruction, index) => (
              <li key={index} className="text-stone-600 text-sm flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-medium flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="pt-0.5">{instruction}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </article>
  );
}
