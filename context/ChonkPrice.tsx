'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, ReactNode } from 'react';

interface PriceData {
  solPrice: number;
  chonkPrice: number;
  chonkerPrice: number;
  loading: boolean;
  refreshPrices: () => void;
}

interface PriceProviderProps {
  children: ReactNode;
}

const PriceContext = createContext<PriceData | undefined>(undefined);

export function PriceProvider({ children }: PriceProviderProps) {
  const [solPrice, setSolPrice] = useState<number>(0);
  const [chonkPrice, setChonkPrice] = useState<number>(0);
  const [chonkerPrice, setChonkerPrice] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  

  const lastFetchTimeRef = useRef<number>(0);
  const isFetchingRef = useRef<boolean>(false);


  const fetchPrices = useCallback(async (forceRefresh: boolean = false): Promise<void> => {
    const now = Date.now();
    const CACHE_DURATION = 60_000;


    if (isFetchingRef.current) {
      return;
    }

    if (!forceRefresh && now - lastFetchTimeRef.current < CACHE_DURATION) {
      return;
    }

    isFetchingRef.current = true;
    setLoading(true);

    try {
      const response = await fetch('/api/prices');

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      setSolPrice(data.solPrice || 0);
      setChonkPrice(data.chonkPrice || 0);
      setChonkerPrice(data.chonkerPrice || 0);
      
      lastFetchTimeRef.current = now; 

    } catch (e) {
      console.error("Price fetch failed:", e);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []); 

  useEffect(() => {

    fetchPrices();

    const intervalId = setInterval(() => {
      fetchPrices(true);
    }, 60_000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchPrices(true);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); 

  const contextValue = useMemo<PriceData>(() => ({
    solPrice,
    chonkPrice,
    chonkerPrice,
    loading,
    refreshPrices: () => fetchPrices(true)
  }), [solPrice, chonkPrice, chonkerPrice, loading, fetchPrices]);

  return (
    <PriceContext.Provider value={contextValue}>
      {children}
    </PriceContext.Provider>
  );
}

export const usePrice = (): PriceData => {
  const context = useContext(PriceContext);
  if (!context) {
    throw new Error('usePrice must be used within a PriceProvider');
  }
  return context;
};
















// 'use client';

// import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';

// interface PriceData {
//   solPrice: number;
//   chonkPrice: number;
//   chonkerPrice: number;
//   loading: boolean;
//   refreshPrices: () => void;
// }

// interface PriceProviderProps {
//   children: ReactNode;
// }

// const PriceContext = createContext<PriceData | undefined>(undefined);

// export function PriceProvider({ children }: PriceProviderProps) {
//   const [solPrice, setSolPrice] = useState<number>(0);
//   const [chonkPrice, setChonkPrice] = useState<number>(0);
//   const [chonkerPrice, setChonkerPrice] = useState<number>(0);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [lastFetchTime, setLastFetchTime] = useState<number>(0);
//   const [isFetching, setIsFetching] = useState<boolean>(false); 

//   const fetchPrices = useCallback(async (forceRefresh: boolean = false): Promise<void> => {
//     const now = Date.now();
//     const CACHE_DURATION = 30_000; 


//     if (isFetching) return;

//     if (!forceRefresh && now - lastFetchTime < CACHE_DURATION) {
//       return;
//     }

//     setIsFetching(true);
//     setLoading(true);
//     try {
//       const response = await fetch('/api/prices');

//       if (!response.ok) {
//         throw new Error(`API error: ${response.status}`);
//       }

//       const data = await response.json();
      
//       setSolPrice(data.solPrice || 0);
//       setChonkPrice(data.chonkPrice || 0);
//       setChonkerPrice(data.chonkerPrice || 0);
      
//       setLastFetchTime(now);

//     } catch (e) {
//       console.error("Price fetch failed:", e);
//     } finally {
//       setLoading(false);
//       setIsFetching(false);
//     }
//   }, [lastFetchTime, isFetching]);

//   useEffect(() => {
//     fetchPrices();

//     const intervalId = setInterval(() => fetchPrices(true), 30_000);

//     const handleVisibilityChange = () => {
//       if (document.visibilityState === 'visible') {
//         fetchPrices(true);
//       }
//     };
    
//     document.addEventListener('visibilitychange', handleVisibilityChange);
    
//     return () => {
//       clearInterval(intervalId);
//       document.removeEventListener('visibilitychange', handleVisibilityChange);
//     };
//   }, [fetchPrices]); 


//   const contextValue = useMemo<PriceData>(() => ({
//     solPrice,
//     chonkPrice,
//     chonkerPrice,
//     loading,
//     refreshPrices: () => fetchPrices(true)
//   }), [solPrice, chonkPrice, chonkerPrice, loading, fetchPrices]);

//   return (
//     <PriceContext.Provider value={contextValue}>
//       {children}
//     </PriceContext.Provider>
//   );
// }

// export const usePrice = (): PriceData => {
//   const context = useContext(PriceContext);
//   if (!context) {
//     throw new Error('usePrice must be used within a PriceProvider');
//   }
//   return context;
// };