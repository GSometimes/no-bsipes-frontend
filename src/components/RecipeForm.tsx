import { useState, type FormEvent } from 'react';
import { SUPPORTED_SITES } from '../utils/constants';
import type { ScrapeResponse, Recipe } from '../types/recipe';

interface RecipeFormProps {
  onRecipeScraped: (recipe: Recipe) => void;
  existingUrls: Set<string>;
}

export function RecipeForm({ onRecipeScraped, existingUrls }: RecipeFormProps) {
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const selectedSiteConfig = SUPPORTED_SITES.find((s) => s.id === selectedSite);

  const validateUrl = (urlToValidate: string, domain: string): boolean => {
    try {
      const parsed = new URL(urlToValidate);
      return parsed.hostname.includes(domain);
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedSite) {
      setError('Please select a website');
      return;
    }

    if (!url.trim()) {
      setError('Please enter a recipe URL');
      return;
    }

    if (!selectedSiteConfig) {
      setError('Invalid site selection');
      return;
    }

    if (!validateUrl(url, selectedSiteConfig.domain)) {
      setError(`URL must be from ${selectedSiteConfig.domain}`);
      return;
    }

    // Check for duplicates using URL directly
    if (existingUrls.has(url)) {
      setError('This recipe has already been scraped');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, site: selectedSite }),
      });

      const data: ScrapeResponse = await response.json();

      if (!data.success || !data.recipe) {
        setError(data.error || 'Failed to scrape recipe');
        return;
      }

      onRecipeScraped(data.recipe);
      setUrl('');
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Scrape error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-5'>
      <div>
        <label
          htmlFor='site'
          className='block text-sm font-medium text-stone-600 mb-2'
        >
          Select Website
        </label>
        <select
          id='site'
          value={selectedSite}
          onChange={(e) => {
            setSelectedSite(e.target.value);
            setError(null);
          }}
          disabled={isLoading}
          className='w-full px-4 py-3 bg-white border border-stone-200 rounded-lg text-stone-800 
                     focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all'
        >
          <option value=''>Choose a recipe site...</option>
          {SUPPORTED_SITES.map((site) => (
            <option key={site.id} value={site.id}>
              {site.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor='url'
          className='block text-sm font-medium text-stone-600 mb-2'
        >
          Recipe URL
        </label>
        <input
          id='url'
          type='url'
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError(null);
          }}
          placeholder={selectedSiteConfig?.example || 'https://...'}
          disabled={isLoading || !selectedSite}
          className='w-full px-4 py-3 bg-white border border-stone-200 rounded-lg text-stone-800 
                     placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 
                     focus:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
        />
        {selectedSiteConfig && (
          <p className='mt-1.5 text-xs text-stone-400'>
            Example: {selectedSiteConfig.example}
          </p>
        )}
      </div>

      {error && (
        <div className='px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm'>
          {error}
        </div>
      )}

      <button
        type='submit'
        disabled={isLoading || !selectedSite || !url.trim()}
        className='w-full py-3 px-6 bg-amber-600 hover:bg-amber-700 text-white font-medium 
                   rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                   focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2'
      >
        {isLoading ? (
          <span className='inline-flex items-center gap-2'>
            <svg className='animate-spin h-4 w-4' viewBox='0 0 24 24'>
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
                fill='none'
              />
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
              />
            </svg>
            Scraping...
          </span>
        ) : (
          'Extract Recipe'
        )}
      </button>
    </form>
  );
}
