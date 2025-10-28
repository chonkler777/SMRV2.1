"use client";


import React, { useState, useCallback, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithCustomToken } from "firebase/auth";
import { query, where, getDocs, collection } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import { useAuth } from "@/AuthContext/AuthProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useWallet } from "@/AuthContext/WalletProvider";

interface User {
  username: string;
  walletAddress: string;
  uid: string;
}

interface FormProps {
  buttonLabel?: string;
  isOpen: boolean;
  onClose: () => void;
}

interface UsernameValidation {
  valid: boolean;
  error: string | null;
}

interface AuthenticateParams {
  username: string;
  walletAddress?: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  token?: string;
}

const AUTH_STATES = {
  IDLE: "idle",
  CONNECTING_WALLET: "connecting_wallet",
  CHECKING_USER: "checking_user",
  NEEDS_USERNAME: "needs_username",
  AUTHENTICATING: "authenticating",
  ERROR: "error",
} as const;

const baseUrl = process.env.NEXT_PUBLIC_AUTH_BACKEND_ENDPOINT;

type AuthStateType = (typeof AUTH_STATES)[keyof typeof AUTH_STATES];
type LoginMode = "wallet" | "guest" | null;

const checkUserExists = async (address: string): Promise<User | null> => {
  if (!address) return null;

  const q = query(
    collection(db, "users"),
    where("walletAddress", "==", address)
  );
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const userData = snapshot.docs[0].data() as User;
    return userData;
  }

  return null;
};

const linkWalletToUser = async (
  uid: string,
  walletAddress: string
): Promise<ApiResponse> => {
  const response = await axios.post<ApiResponse>(
    `${baseUrl}/api/auth/wallet/link`,
    { uid, walletAddress },
    { timeout: 30000 }
  );

  if (!response.data.success) {
    throw new Error(response.data.message || "Wallet linking failed");
  }

  return response.data;
};

const checkUsernameAvailability = async (
  username: string
): Promise<boolean | null> => {
  if (!username || username.length < 3) return null;

  const q = query(collection(db, "users"), where("username", "==", username));
  const snapshot = await getDocs(q);
  const isAvailable = snapshot.empty;
  return isAvailable;
};

const authenticateUser = async ({
  username,
  walletAddress = "",
}: AuthenticateParams): Promise<string> => {
  const response = await axios.post<ApiResponse>(
    `${baseUrl}/api/auth/authenticate`,
    { username, walletAddress },
    { timeout: 30000 }
  );

  if (!response.data.success || !response.data.token) {
    throw new Error(response.data.message || "Authentication failed");
  }

  return response.data.token;
};

const validateUsername = (username: string): UsernameValidation => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

  if (!username) {
    return { valid: false, error: "Username is required" };
  }

  if (!usernameRegex.test(username)) {
    return {
      valid: false,
      error: "3–20 chars. Only letters, numbers, and underscores.",
    };
  }

  return { valid: true, error: null };
};

const Form: React.FC<FormProps> = ({
  buttonLabel = "Submit",
  isOpen,
  onClose,
}) => {
  const [username, setUsername] = useState<string>("");
  const [authState, setAuthState] = useState<AuthStateType>(AUTH_STATES.IDLE);
  const [loginMode, setLoginMode] = useState<LoginMode>(null);
  const [error, setError] = useState<string>("");
  const queryClient = useQueryClient();

  const { open, isConnected, address, disconnect } = useWallet();
  const { currentUser, setCurrentUser } = useAuth();


  const {
    data: existingUser,
    isLoading: checkingUser,
    error: userCheckError,
  } = useQuery<User | null, Error>({
    queryKey: ["user-check", address],
    queryFn: () => checkUserExists(address!),
    enabled:
      !!address && isConnected && authState === AUTH_STATES.CHECKING_USER,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const { data: usernameAvailable, isLoading: checkingUsername } = useQuery<
    boolean | null,
    Error
  >({
    queryKey: ["username-check", username],
    queryFn: () => checkUsernameAvailability(username),
    enabled:
      !!username &&
      username.length >= 3 &&
      authState === AUTH_STATES.NEEDS_USERNAME,
    staleTime: 30 * 1000,
    retry: 1,
  });

  const authMutation = useMutation<string, Error, AuthenticateParams>({
    mutationFn: authenticateUser,
    onSuccess: async (token: string) => {
      try {
        await signInWithCustomToken(auth, token);
        const firebaseUser = auth.currentUser;

        if (firebaseUser) {
          const finalUsername = username;
          const finalWalletAddress = loginMode === "wallet" ? address : "";

          if (address && loginMode === "wallet") {
            queryClient.setQueryData(["user-check", address], {
              username: finalUsername,
              walletAddress: finalWalletAddress,
              uid: firebaseUser.uid,
            });
          }

          queryClient.invalidateQueries({
            queryKey: ["username-check"],
          });

          setCurrentUser({
            ...firebaseUser,
            username: finalUsername,
            walletAddress: finalWalletAddress,
          });

          if (currentUser?.username && loginMode === "wallet" && address) {
            if (
              existingUser?.username &&
              existingUser.username !== currentUser.username
            ) {
              toast.success(`Switched to wallet user: ${finalUsername}!`);
            } else {
              toast.success(`Wallet connected to ${finalUsername}!`);
            }
          } else {
            toast.success(`Welcome, ${finalUsername}!`);
          }

          onClose();
        } else {
          throw new Error("Firebase authentication failed");
        }
      } catch (error) {
        console.error("Firebase auth error:", error);
        setError("Authentication failed");
        setAuthState(AUTH_STATES.ERROR);
      }
    },
    onError: (error: Error) => {
      console.error("Auth mutation error:", error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message ||
        error.message ||
        "Login failed";
      setError(errorMessage);
      setAuthState(AUTH_STATES.ERROR);
      toast.error(errorMessage);
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (authState === AUTH_STATES.IDLE && !loginMode) {
        if (currentUser && currentUser.username && !address) {
          setUsername(currentUser.username);

          setAuthState(AUTH_STATES.IDLE);
          setLoginMode(null);
          setError("");
          return;
        }

        setAuthState(AUTH_STATES.IDLE);
        setLoginMode(null);
        setUsername("");
        setError("");
      }
    } else {
      setAuthState(AUTH_STATES.IDLE);
      setLoginMode(null);
      setUsername("");
      setError("");
      return;
    }

    if (authState === AUTH_STATES.CONNECTING_WALLET) {
      if (isConnected && address) {
        setAuthState(AUTH_STATES.CHECKING_USER);
      } else if (!isConnected && address === null) {

        setAuthState(AUTH_STATES.IDLE);
        setLoginMode(null);
        setError("");
      }
      return;
    }

    if (authState === AUTH_STATES.CHECKING_USER) {
      if (userCheckError) {
        console.error("User check error:", userCheckError);
        setError("Failed to check user account");
        setAuthState(AUTH_STATES.ERROR);
        return;
      }

      if (existingUser !== undefined) {
        if (existingUser?.username) {
          setUsername(existingUser.username);
          setAuthState(AUTH_STATES.AUTHENTICATING);

          authMutation.mutate({
            username: existingUser.username,
            walletAddress: address || "",
          });
        } else if (existingUser === null) {
          if (currentUser?.username && loginMode === "wallet") {
            setAuthState(AUTH_STATES.AUTHENTICATING);

            linkWalletToUser(currentUser.uid, address!)
              .then(() => {
                queryClient.invalidateQueries({
                  queryKey: ["user-check", address],
                });

                queryClient.invalidateQueries({
                  queryKey: ["user-check"],
                });

                return authMutation.mutateAsync({
                  username: currentUser.username!,
                  walletAddress: address || "",
                });
              })
              .catch((error) => {
                console.error("❌ Error in wallet linking process:", error);
                setError("Failed to link wallet to account");
                setAuthState(AUTH_STATES.ERROR);
              });
          } else {
            setAuthState(AUTH_STATES.NEEDS_USERNAME);
          }
        }
      }
      return;
    }

    if (userCheckError && authState !== AUTH_STATES.ERROR) {
      console.error("User check error:", userCheckError);
      setError("Failed to check user account");
      setAuthState(AUTH_STATES.ERROR);
    }
  }, [
    isOpen,
    authState,
    loginMode,
    isConnected,
    address,
    existingUser,
    userCheckError,
    authMutation,
    currentUser,
    open,
    queryClient,
  ]);

  const handleConnectWallet = useCallback(async () => {
    setLoginMode("wallet");
    setAuthState(AUTH_STATES.CONNECTING_WALLET);
    setError("");

    try {
      if (!navigator.onLine) {
        throw new Error("No internet connection");
      }

      await open();
    } catch (error: unknown) {
      console.error("Wallet connection error:", error);

      try {
        await disconnect();
      } catch (disconnectError) {
        console.error("Disconnect error:", disconnectError);
      }

      let errorMessage = "Failed to connect wallet";
      if (error instanceof Error) {
        if (error.message?.includes("timeout")) {
          errorMessage = "Connection timeout. Please try again.";
        } else if (error.message?.includes("WebSocket")) {
          errorMessage =
            "Connection failed. Please check your internet connection.";
        }
      }

      setError(errorMessage);
      setAuthState(AUTH_STATES.ERROR);
      toast.error(errorMessage);
    }
  }, [open, disconnect]);

  const handleGuestLogin = useCallback(() => {
    setLoginMode("guest");
    setAuthState(AUTH_STATES.NEEDS_USERNAME);
    setError("");
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const validation = validateUsername(username);
      if (!validation.valid) {
        setError(validation.error!);
        return;
      }

      if (usernameAvailable === false) {
        setError("Username already taken");
        return;
      }

      setAuthState(AUTH_STATES.AUTHENTICATING);
      setError("");

      authMutation.mutate({
        username,
        walletAddress: loginMode === "wallet" ? address || "" : "",
      });
    },
    [username, usernameAvailable, loginMode, address, authMutation]
  );

  const isLoading =
    checkingUser ||
    authMutation.isPending ||
    authState === AUTH_STATES.AUTHENTICATING;
  const showUsernameInput = authState === AUTH_STATES.NEEDS_USERNAME;
  const canSubmit =
    username && !checkingUsername && usernameAvailable !== false && !isLoading;

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 flex items-center justify-center bg-black/60 z-50"
    >
      <ToastContainer />
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#1b1d28] p-6 md:p-8 rounded-md shadow-lg md:max-w-md w-[90%] text-white relative"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-6 text-white cursor-pointer transition text-2xl font-bold"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 16 16"
          >
            <path
              fill="currentColor"
              d="m2.397 2.554l.073-.084a.75.75 0 0 1 .976-.073l.084.073L8 6.939l4.47-4.47a.75.75 0 1 1 1.06 1.061L9.061 8l4.47 4.47a.75.75 0 0 1 .072.976l-.073.084a.75.75 0 0 1-.976.073l-.084-.073L8 9.061l-4.47 4.47a.75.75 0 0 1-1.06-1.061L6.939 8l-4.47-4.47a.75.75 0 0 1-.072-.976l.073-.084z"
            />
          </svg>
        </button>

        <div className="flex flex-col gap-6 pt-6">
          <button
            className="w-full py-2 border border-[#57674A] cursor-pointer text-white rounded-md hover:bg-green-600 hover:text-white transition flex items-center justify-center gap-2"
            onClick={handleConnectWallet}
            disabled={isLoading}
          >
            {isConnected && address && loginMode === "wallet" ? (
              <>
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </>
            ) : (
              <>Connect Wallet</>
            )}
          </button>

          {(authState === AUTH_STATES.IDLE ||
            authState === AUTH_STATES.CONNECTING_WALLET ||
            authState === AUTH_STATES.ERROR) && (
            <button
              className="w-full py-2 border border-[#57674A] cursor-pointer text-white rounded-md hover:bg-blue-600 hover:text-white transition"
              onClick={handleGuestLogin}
              disabled={isLoading}
            >
              Continue as Guest
            </button>
          )}
        </div>

        {showUsernameInput && (
          <form onSubmit={handleSubmit}>
            <div className="mt-3 mb-4">
              <p className="text-sm text-gray-400 pb-1">Required*</p>
              <input
                className="w-full p-2 border bg-white border-gray-300 text-black rounded-md focus:outline-none focus:border-green-500"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter a username"
                autoFocus
                disabled={isLoading}
              />

              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

              {checkingUsername && (
                <p className="text-blue-500 text-sm mt-1">
                  Checking availability...
                </p>
              )}

              {username && !checkingUsername && usernameAvailable === false && (
                <p className="text-red-500 text-sm mt-1">
                  Username already taken
                </p>
              )}

              {username && !checkingUsername && usernameAvailable === true && (
                <p className="text-green-500 text-sm mt-1">
                  Username available!
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full py-2 cursor-pointer rounded-md transition ${
                !canSubmit
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
            >
              {isLoading ? "Submitting..." : buttonLabel}
            </button>
          </form>
        )}

        {authState === AUTH_STATES.CHECKING_USER && (
          <div className="mt-6 text-center">
            <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-400">Checking your account...</p>
          </div>
        )}

        {authState === AUTH_STATES.AUTHENTICATING && (
          <div className="mt-6 text-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-400">Authenticating...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Form;
