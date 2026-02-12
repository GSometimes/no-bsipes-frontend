import express, { type Request, type Response } from 'express';
import * as cheerio from 'cheerio';

const app = express();
app.use(express.json());

// Types
interface ScrapeRequestBody {
  url: string;
  site: string;
}

interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
  instructions: string[];
  image?: string;
  author?: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  sourceUrl: string;
  siteName: string;
  scrapedAt: string;
}

// Supported sites configuration
const SITE_CONFIG: Record<string, { name: string; domain: string }> = {
  allrecipes: { name: 'AllRecipes', domain: 'allrecipes.com' },
  foodnetwork: { name: 'Food Network', domain: 'foodnetwork.com' },
  simplyrecipes: { name: 'Simply Recipes', domain: 'simplyrecipes.com' },
  tasteofhome: { name: 'Taste of Home', domain: 'tasteofhome.com' },
  epicurious: { name: 'Epicurious', domain: 'epicurious.com' },
  delish: { name: 'Delish', domain: 'delish.com' },
  kingarthurbaking: {
    name: 'King Arthur Baking',
    domain: 'kingarthurbaking.com',
  },
  tastyco: {
    name: 'Tasty Co',
    domain: 'tasty.co',
  },
  cookpad: {
    name: 'Cookpad',
    domain: 'cookpad.com',
  },
};

// Generate stable ID from URL using SHA-256 hash
async function generateId(url: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(url);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16);
}

// Type guard to check if value is a non-null object
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

// Check if @type includes "Recipe" (handles both string and array formats)
function isRecipeType(type: unknown): boolean {
  if (type === 'Recipe') return true;
  if (Array.isArray(type) && type.includes('Recipe')) return true;
  return false;
}

// Extract image URL from various JSON-LD formats
function extractImage(image: unknown): string | undefined {
  if (typeof image === 'string') return image;

  if (Array.isArray(image) && image.length > 0) {
    const first = image[0];
    if (typeof first === 'string') return first;
    if (isObject(first) && typeof first.url === 'string') return first.url;
  }

  if (isObject(image) && typeof image.url === 'string') return image.url;

  return undefined;
}

// Extract author name from various JSON-LD formats
// Handles: string, single object with name, array of objects with name
function extractAuthor(author: unknown): string | undefined {
  // Plain string: "author": "Jane Doe"
  if (typeof author === 'string') return author;

  // Single object: "author": { "@type": "Person", "name": "Jane Doe" }
  if (isObject(author) && typeof author.name === 'string') {
    return author.name;
  }

  // Array of objects: "author": [{ "name": "Jane" }, { "name": "John" }]
  if (Array.isArray(author)) {
    const names = author
      .map((a) => {
        if (typeof a === 'string') return a;
        if (isObject(a) && typeof a.name === 'string') return a.name;
        return null;
      })
      .filter((name): name is string => name !== null && name.length > 0);

    return names.length > 0 ? names.join(', ') : undefined;
  }

  return undefined;
}

// Parse ISO 8601 duration (e.g. "PT2H35M") into readable string (e.g. "2 hr 35 min")
// Falls back to returning the original string if it's not ISO format
function parseDuration(value: string): string {
  const match = value.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i);

  if (!match) {
    // Not ISO 8601 — return as-is (handles freeform like "30 minutes")
    return value;
  }

  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const seconds = match[3] ? parseInt(match[3], 10) : 0;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} hr`);
  if (minutes > 0) parts.push(`${minutes} min`);
  if (seconds > 0) parts.push(`${seconds} sec`);

  return parts.length > 0 ? parts.join(' ') : value;
}

// Safely extract a time field and parse it
function extractTime(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.trim().length === 0) return undefined;
  return parseDuration(value.trim());
}

// Parse instructions from various formats
function parseInstructions(instructions: unknown): string[] {
  if (!Array.isArray(instructions)) return [];

  return instructions
    .map((instruction) => {
      if (typeof instruction === 'string') return instruction.trim();
      if (isObject(instruction) && typeof instruction.text === 'string') {
        return instruction.text.trim();
      }
      return null;
    })
    .filter((text): text is string => text !== null && text.length > 0);
}

// Extract recipe data from JSON-LD structured data
function extractFromJsonLd(html: string): Record<string, unknown> | null {
  const $ = cheerio.load(html);
  const scripts = $('script[type="application/ld+json"]');

  for (let i = 0; i < scripts.length; i++) {
    try {
      const content = $(scripts[i]).html();
      if (!content) continue;

      const data: unknown = JSON.parse(content);

      // Handle array of JSON-LD objects
      const items = Array.isArray(data) ? data : [data];

      for (const item of items) {
        if (!isObject(item)) continue;

        // Direct Recipe object
        if (isRecipeType(item['@type'])) {
          return item;
        }

        // Check @graph array (common in WordPress sites)
        if (Array.isArray(item['@graph'])) {
          for (const graphItem of item['@graph']) {
            if (isObject(graphItem) && isRecipeType(graphItem['@type'])) {
              return graphItem;
            }
          }
        }
      }
    } catch (err) {
      console.log('error while scraping', err);
    }
  }

  return null;
}

// Main scrape endpoint
app.post(
  '/api/scrape',
  async (req: Request<unknown, unknown, ScrapeRequestBody>, res: Response) => {
    try {
      const { url, site } = req.body;

      // Validate inputs
      if (!url || typeof url !== 'string') {
        res.status(400).json({ success: false, error: 'URL is required' });
        return;
      }

      if (!site || !SITE_CONFIG[site]) {
        res
          .status(400)
          .json({ success: false, error: 'Invalid site selection' });
        return;
      }

      // Validate URL format
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(url);
      } catch {
        res.status(400).json({ success: false, error: 'Invalid URL format' });
        return;
      }

      // Validate URL matches expected domain
      const siteConfig = SITE_CONFIG[site];
      if (!parsedUrl.hostname.includes(siteConfig.domain)) {
        res.status(400).json({
          success: false,
          error: `URL must be from ${siteConfig.domain}`,
        });
        return;
      }

      // Fetch the page
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
      });

      if (!response.ok) {
        res.status(400).json({
          success: false,
          error: `Failed to fetch page (${response.status})`,
        });
        return;
      }

      const html = await response.text();
      const recipeData = extractFromJsonLd(html);

      if (!recipeData) {
        res.status(400).json({
          success: false,
          error: 'Could not find recipe data on this page',
        });
        return;
      }

      // Extract fields with type narrowing
      const title =
        typeof recipeData.name === 'string'
          ? recipeData.name
          : typeof recipeData.headline === 'string'
          ? recipeData.headline
          : null;

      if (!title) {
        res.status(400).json({
          success: false,
          error: 'Recipe found but missing title',
        });
        return;
      }

      const ingredients = Array.isArray(recipeData.recipeIngredient)
        ? recipeData.recipeIngredient.filter(
            (i): i is string => typeof i === 'string'
          )
        : [];

      const instructions = parseInstructions(recipeData.recipeInstructions);

      // Validate we got actual content
      if (ingredients.length === 0 && instructions.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Recipe found but missing ingredients and instructions',
        });
        return;
      }

      const recipe: Recipe = {
        id: await generateId(url),
        title,
        ingredients,
        instructions,
        image: extractImage(recipeData.image),
        author: extractAuthor(recipeData.author),
        prepTime: extractTime(recipeData.prepTime),
        cookTime: extractTime(recipeData.cookTime),
        totalTime: extractTime(recipeData.totalTime),
        sourceUrl: url,
        siteName: siteConfig.name,
        scrapedAt: new Date().toISOString(),
      };

      console.log('Scraped recipe:', JSON.stringify(recipe, null, 2));

      res.json({ success: true, recipe });
    } catch (error) {
      console.error('Scrape error:', error);
      res.status(500).json({
        success: false,
        error: 'An error occurred while scraping the recipe',
      });
    }
  }
);

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// For local development
const PORT = process.env.PORT ?? 3001;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
  });
}

// Export for Vercel
export default app;
