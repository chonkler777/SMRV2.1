
import {algoliasearch} from 'algoliasearch';

// These are your PUBLIC search-only keys - safe to expose in browser
export const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
export const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!;
export const MEMES_INDEX = process.env.NEXT_PUBLIC_ALGOLIA_MEMES_INDEX || 'SMR memes';

// Client-side search client
export const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);