
export type UserDisplayProps = {
  username: string;
  walletAddress: string;
  onLogout: () => void;
  onUsernameClick: () => void;
};

export type GuestUserDisplayProps = {
  username: string;
  onConnectWallet: () => void;
  onLogout: () => void;
};