'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo } from "react";
import { toast } from "react-toastify";
import { CachedWallet, WalletContextType } from "@/Types";

interface WalletProviderProps {
  children: ReactNode;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

let isAppKitInitialized = false;
let appKitHooks: any = null; 


const LS_WALLET_KEY = 'cachedWallet';

const readCachedWallet = (): CachedWallet | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LS_WALLET_KEY);
    return raw ? (JSON.parse(raw) as CachedWallet) : null;
  } catch {
    return null;
  }
};

const writeCachedWallet = (wallet: CachedWallet | null) => {
  if (typeof window === 'undefined') return;
  try {
    if (wallet) {
      localStorage.setItem(LS_WALLET_KEY, JSON.stringify(wallet));
    } else {
      localStorage.removeItem(LS_WALLET_KEY);
    }
  } catch (e) {
    console.warn('Failed to write wallet cache', e);
  }
};

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeWallet = async () => {
      if (!isAppKitInitialized && typeof window !== 'undefined') {
        try {
          const [
            { createAppKit, useAppKit, useAppKitAccount, useDisconnect },
            { solana, solanaTestnet, solanaDevnet },
            config
          ] = await Promise.all([
            import('@reown/appkit/react'),
            import('@reown/appkit/networks'),
            import('@/config')
          ]);


          appKitHooks = { useAppKit, useAppKitAccount, useDisconnect };

          createAppKit({
            projectId: config.projectId!,
            metadata: config.metadata,
            themeMode: "dark",
            networks: [solana, solanaTestnet, solanaDevnet],
            adapters: [config.solanaWeb3JsAdapter],
            features: {
              emailShowWallets: false,
              socials: false,
              email: false,
            },
            themeVariables: {
              "--w3m-accent": "#1b1d28",
            },
          });
          
          isAppKitInitialized = true;
        } catch (error) {
          console.error('Failed to initialize AppKit:', error);
        }
      }
      
      setIsReady(true);
    };

    initializeWallet();
  }, []);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return <WalletProviderContent>{children}</WalletProviderContent>;
};

const WalletProviderContent = ({ children }: WalletProviderProps) => {
  if (!appKitHooks) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }


  const { open } = appKitHooks.useAppKit();
  const { isConnected: appKitConnected, address: appKitAddress } = appKitHooks.useAppKitAccount();
  const { disconnect } = appKitHooks.useDisconnect();
  
  const [connectionBroken, setConnectionBroken] = useState(false);
  const cachedOnMount = useMemo(() => readCachedWallet(), []);
  const [walletHydrated, setWalletHydrated] = useState(false);
  
  const [finalState, setFinalState] = useState<{isConnected: boolean; address: string | undefined}>(() => {
    if (cachedOnMount) {
      return {
        isConnected: cachedOnMount.isConnected,
        address: cachedOnMount.address
      };
    }
    return {
      isConnected: false,
      address: undefined
    };
  });

  useEffect(() => {

    const session = localStorage.getItem('walletconnect');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (!parsed || parsed.expired || parsed.invalid) {
          localStorage.removeItem('walletconnect');
        }
      } catch (err) {
        localStorage.removeItem('walletconnect');
      }
    }

    const handleUnhandledRejection = async (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes('WebSocket')) {
        console.error('WebSocket error detected. Performing full wallet reset...');
        
        try {
          await disconnect();
          localStorage.removeItem('walletconnect');
          sessionStorage.removeItem('walletconnect');
          localStorage.removeItem('walletconnect_v2_sessions');
          localStorage.removeItem('walletconnect_v2_clients');
          writeCachedWallet(null);
        } catch (err) {
          console.warn('Reset error:', err);
        }
        
        setConnectionBroken(true);
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    if (connectionBroken) {
      toast.error("Wallet disconnected. Please reconnect.", {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      });
    }

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [disconnect, connectionBroken]);


  useEffect(() => {
    const timer = setTimeout(() => {
      setWalletHydrated(true);
    }, cachedOnMount ? 1000 : 100);

    return () => clearTimeout(timer);
  }, [cachedOnMount]);


  useEffect(() => {
    if (!walletHydrated) return;

    
    const newState = {
      isConnected: appKitConnected,
      address: appKitAddress
    };
    
    setFinalState(newState);
    
    if (appKitConnected && appKitAddress) {
      writeCachedWallet({
        address: appKitAddress,
        isConnected: true
      });
    } else {
      writeCachedWallet(null);
    }
  }, [appKitConnected, appKitAddress, walletHydrated]);

  const customDisconnect = async () => {
    writeCachedWallet(null);
    setFinalState({ isConnected: false, address: undefined });
    
    try {
      await disconnect();
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  };

  const contextValue: WalletContextType = {
    open,
    isConnected: finalState.isConnected,
    address: finalState.address,
    disconnect: customDisconnect,
    walletHydrated,
    walletLoading: !walletHydrated && !!cachedOnMount
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};




