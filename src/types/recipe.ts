export interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
  instructions: string[];
  image?: string;
  sourceUrl: string;
  siteName: string;
  scrapedAt: string;
}

export interface ScrapeRequest {
  url: string;
  site: string;
}

export interface ScrapeResponse {
  success: boolean;
  recipe?: Recipe;
  error?: string;
}

export interface SupportedSite {
  id: string;
  name: string;
  domain: string;
  example: string;
}
