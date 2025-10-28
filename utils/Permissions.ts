export const USERS_CAN_DELETE = ["basedchonk", "anonwhale",];
export const USERS_CAN_EDIT_TAGS = ["elloello", "anon_whale7777", "Dream"];
export const USERS_CAN_EDIT_WALLET_FIELD = ["basedchonk", "anonwhale"];


export const WALLETS_CAN_DELETE = [];
export const WALLETS_CAN_EDIT_TAGS = ["BXvtJBTfgB7qfpH6anSTStpxJt4A4JnLCutKM9yPoN1X"];
export const WALLETS_CAN_EDIT_WALLET_FIELD = [];


export const ADMIN_WALLETS = [
  "4Pn4cbem8kscEm46GboTAnV2AVr2oA1ZT2cUq8HPHND9",
  "HwiccWtzUzR9irq8CoVjc1pSBELGB91RgQVDA4hEvzBy",
  "5NMGcAJ1He6YkShxyVNW8qk2joQDofDN1sTDBKgeiuDf",
  "Eo4tay29PpJz16qyisgZv7um2o8CxZJZ3982SDfghgR9",
  "3LhegDFMroF5bqPBmZw7PswPaeLK65eD6WxejSXDeeGd"
];

interface HasAccessParams {
  username?: string | null;
  walletAddress?: string | null;
  allowedUsernames?: string[];
  allowedWallets?: string[];
  adminWallets?: string[];
}

/**
 * Check if a user has access based on username or wallet address
 * @param params - Object containing username, walletAddress, and allowed lists
 * @returns boolean indicating if user has access
 */
export const hasAccess = ({
  username,
  walletAddress,
  allowedUsernames = [],
  allowedWallets = [],
  adminWallets = [],
}: HasAccessParams): boolean => {
  const user = username?.toLowerCase() || '';
  const wallet = walletAddress?.toLowerCase() || '';

  return (
    allowedUsernames.map((x) => x.toLowerCase()).includes(user) ||
    allowedWallets.map((x) => x.toLowerCase()).includes(wallet) ||
    adminWallets.map((x) => x.toLowerCase()).includes(wallet)
  );
};


export const canDelete = (username?: string | null, walletAddress?: string | null): boolean => {
  return hasAccess({
    username,
    walletAddress,
    allowedUsernames: USERS_CAN_DELETE,
    allowedWallets: WALLETS_CAN_DELETE,
    adminWallets: ADMIN_WALLETS,
  });
};


export const canEditTags = (username?: string | null, walletAddress?: string | null): boolean => {
  return hasAccess({
    username,
    walletAddress,
    allowedUsernames: USERS_CAN_EDIT_TAGS,
    allowedWallets: WALLETS_CAN_EDIT_TAGS,
    adminWallets: ADMIN_WALLETS,
  });
};


export const canEditWalletField = (username?: string | null, walletAddress?: string | null): boolean => {
  return hasAccess({
    username,
    walletAddress,
    allowedUsernames: USERS_CAN_EDIT_WALLET_FIELD,
    allowedWallets: WALLETS_CAN_EDIT_WALLET_FIELD,
    adminWallets: ADMIN_WALLETS,
  });
};


export const isAdmin = (walletAddress?: string | null): boolean => {
  const wallet = walletAddress?.toLowerCase() || '';
  return ADMIN_WALLETS.map((x) => x.toLowerCase()).includes(wallet);
};