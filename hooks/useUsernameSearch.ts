import { useEffect } from 'react';
import type { SearchBy } from '@/Types';

const isValidSearchBy = (value: string): value is SearchBy => {
  return value === 'all' || value === 'tag' || value === 'username' || value === 'wallet';
};

export const useUsernameSearch = (
  setSearchQuery: (query: string) => void,
  setSearchBy: (searchBy: SearchBy) => void
) => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('query');
    const searchByParam = params.get('searchBy');
    
    if (query && searchByParam && isValidSearchBy(searchByParam)) {
      setSearchQuery(query);
      setSearchBy(searchByParam);
    }
  }, [setSearchQuery, setSearchBy]);
};