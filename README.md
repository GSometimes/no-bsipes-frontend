# Recipe Scraper

A full-stack web application that extracts just the ingredients and instructions from popular recipe websites, cutting through the lengthy preambles and ads.

## Features

- **Supported Sites**: AllRecipes, Food Network, Simply Recipes, Taste of Home, Epicurious, Delish
- **Smart Extraction**: Uses JSON-LD structured data (schema.org/Recipe) for reliable parsing
- **Local Storage**: Saves up to 5 recently scraped recipes in your browser
- **Duplicate Prevention**: Won't re-scrape the same recipe URL
- **Clean UI**: Minimal, distraction-free interface

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS v4, Vite
- **Backend**: Express, Cheerio (HTML parsing)
- **Deployment**: Vercel (serverless functions)

## Local Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd recipe-scraper

# Install dependencies
npm install

# Start development servers (frontend + backend)
npm run dev
```

This starts:
- Frontend at `http://localhost:5173`
- Backend API at `http://localhost:3001`

The Vite dev server proxies `/api/*` requests to the backend.

### Available Scripts

```bash
npm run dev          # Start both frontend and backend
npm run dev:frontend # Start only Vite dev server
npm run dev:backend  # Start only Express API server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Deployment to Vercel

### Option 1: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Option 2: GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Vercel auto-detects the configuration from `vercel.json`
5. Click Deploy

The `vercel.json` file configures:
- Frontend built with Vite → served at root
- Express API → served at `/api/*`

## Project Structure

```
recipe-scraper/
├── api/
│   └── index.ts          # Express API (Vercel serverless function)
├── src/
│   ├── components/
│   │   ├── RecipeForm.tsx    # URL input form
│   │   ├── RecipeCard.tsx    # Recipe display
│   │   └── RecentRecipes.tsx # Sidebar with saved recipes
│   ├── hooks/
│   │   └── useLocalStorage.ts
│   ├── types/
│   │   └── recipe.ts
│   ├── utils/
│   │   └── constants.ts      # Supported sites config
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vercel.json
```

## How It Works

1. **User enters a recipe URL** from a supported site
2. **Backend fetches the page** with appropriate headers
3. **Parses JSON-LD** structured data (most recipe sites use schema.org/Recipe markup for SEO)
4. **Falls back to CSS selectors** if JSON-LD not found
5. **Returns normalized recipe** with title, ingredients, instructions, and image
6. **Frontend stores** in localStorage and displays the clean recipe

## Adding New Sites

To support additional recipe sites:

1. Add site config to `src/utils/constants.ts`:
   ```typescript
   {
     id: 'sitename',
     name: 'Site Display Name',
     domain: 'sitename.com',
     example: 'https://www.sitename.com/recipes/example',
   }
   ```

2. Add matching config to `api/index.ts` in `SITE_CONFIG`

3. Most sites using schema.org Recipe markup will work automatically. If not, you may need to add site-specific CSS selectors in the fallback extraction.

## License

MIT
