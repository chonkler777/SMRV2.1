export type CachedWallet = {
    address: string;
    isConnected: boolean;
};
  
export type WalletContextType = {
    open: () => void;
    isConnected: boolean;
    address: string | undefined;
    disconnect: () => Promise<void>;
    walletHydrated: boolean;
    walletLoading: boolean;
};