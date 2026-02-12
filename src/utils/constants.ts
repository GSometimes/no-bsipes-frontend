import type { SupportedSite } from '../types/recipe';

export const SUPPORTED_SITES: SupportedSite[] = [
  {
    id: 'allrecipes',
    name: 'AllRecipes',
    domain: 'allrecipes.com',
    example: 'https://www.allrecipes.com/recipe/12345/dish-name',
  },
  {
    id: 'foodnetwork',
    name: 'Food Network',
    domain: 'foodnetwork.com',
    example: 'https://www.foodnetwork.com/recipes/chef/dish-name',
  },
  {
    id: 'tasteofhome',
    name: 'Taste of Home',
    domain: 'tasteofhome.com',
    example: 'https://www.tasteofhome.com/recipes/dish-name',
  },
  {
    id: 'epicurious',
    name: 'Epicurious',
    domain: 'epicurious.com',
    example: 'https://www.epicurious.com/recipes/food/views/dish-name',
  },
  {
    id: 'delish',
    name: 'Delish',
    domain: 'delish.com',
    example: 'https://www.delish.com/cooking/recipe-ideas/dish-name',
  },
  {
    id: 'kingarthurbaking',
    name: 'King Arthur Baking',
    domain: 'kingarthurbaking.com',
    example: 'https://www.kingarthurbaking.com/recipes/dish-name',
  },
  {
    id: 'tastyco',
    name: 'Tasty Co',
    domain: 'tasty.co',
    example: 'https://tasty.co/recipe/dish-name',
  },
  {
    id: 'cookpad',
    name: 'Cookpad',
    domain: 'cookpad.com',
    example: 'https://cookpad.com/eng/recipes/12345678/dish-name',
  },
];

export const MAX_RECENT_RECIPES = 5;
export const STORAGE_KEY = 'recipe-scraper-recent';
