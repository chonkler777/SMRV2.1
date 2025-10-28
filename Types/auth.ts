import { AppUser } from "./user";

export type AuthContextType = {
    currentUser: AppUser | null;
    setCurrentUser: (u: AppUser | null) => void;
    authLoading: boolean;
    isAuthenticated: boolean;
    logout: () => Promise<void>;
  };