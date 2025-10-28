'use client';

import { memo } from "react";
import DeleteButton from "./DeleteButton";
import EditButton from "./EditButton";
import EditWalletButton from "./EditWalletButton";

import { 
  USERS_CAN_DELETE,
  USERS_CAN_EDIT_TAGS,
  USERS_CAN_EDIT_WALLET_FIELD,
  WALLETS_CAN_DELETE,
  WALLETS_CAN_EDIT_TAGS,
  WALLETS_CAN_EDIT_WALLET_FIELD,
  ADMIN_WALLETS,
  hasAccess,
} from "@/utils/Permissions";


interface CurrentUser {
  walletAddress?: string | null;

}

interface OwnerControlsProps {
  currentName?: string | null;
  currentUser?: CurrentUser | null;
  docId: string;
  tag: string;
  wallet: string;
  onTagUpdate: (newTag: string) => void;
  onWalletUpdate: (newWallet: string) => void;
  onMemeDeleted?: (docId: string) => void;
}

function OwnerControls({
  currentName,
  currentUser,
  docId,
  tag,
  wallet,
  onTagUpdate,
  onWalletUpdate,
  onMemeDeleted,
}: OwnerControlsProps) {
  const username = currentName;
  const userWallet = currentUser?.walletAddress;

  const canDelete = hasAccess({
    username,
    walletAddress: userWallet,
    allowedUsernames: USERS_CAN_DELETE,
    allowedWallets: WALLETS_CAN_DELETE,
    adminWallets: ADMIN_WALLETS,
  });

  const canEditTag = hasAccess({
    username,
    walletAddress: userWallet,
    allowedUsernames: USERS_CAN_EDIT_TAGS,
    allowedWallets: WALLETS_CAN_EDIT_TAGS,
    adminWallets: ADMIN_WALLETS,
  });

  const canEditWalletField = hasAccess({
    username,
    walletAddress: userWallet,
    allowedUsernames: USERS_CAN_EDIT_WALLET_FIELD,
    allowedWallets: WALLETS_CAN_EDIT_WALLET_FIELD,
    adminWallets: ADMIN_WALLETS,
  });


  if (!canDelete && !canEditTag && !canEditWalletField) return null;

  return (
    <div className="pt-2 items-center flex justify-center">
      <div className="flex gap-4 py-2">
        {canDelete && <DeleteButton docId={docId} onMemeDeleted={onMemeDeleted}  />}
        {canEditTag && (
          <EditButton onTagUpdate={onTagUpdate} docId={docId} tag={tag} />
        )}
        {canEditWalletField && (
          <EditWalletButton
            onWalletUpdate={onWalletUpdate}
            docId={docId}
            wallet={wallet}
          />
        )}
      </div>
    </div>
  );
}


export default memo(OwnerControls);