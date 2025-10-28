'use client';

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface EditWalletButtonProps {
  docId: string;
  wallet: string;
  onWalletUpdate: (newWallet: string) => void;
}

export default function EditWalletButton({ 
  docId, 
  wallet, 
  onWalletUpdate 
}: EditWalletButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWallet, setNewWallet] = useState(wallet);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateMemeWallet = async () => {
    if (!newWallet.trim()) {
      console.error("Wallet address cannot be empty");
      return;
    }

    try {
      setIsUpdating(true);
      const memeDocRef = doc(db, "memescollection", docId);

      await updateDoc(memeDocRef, {
        wallet: newWallet,
      });


      onWalletUpdate(newWallet);


      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating wallet:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setNewWallet(wallet); 
    setIsModalOpen(false);
  };

  return (
    <div>
      <button
        className="text-white text-sm px-1 py-[2px] bg-blue-500 rounded-sm hover:bg-blue-600 transition-colors"
        onClick={() => setIsModalOpen(true)}
      >
        Edit Addy
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-[#1b1d28] rounded-lg p-6 w-80">
            <h3 className="text-white text-lg font-semibold mb-2">
              Edit Wallet Address
            </h3>
            <textarea
              placeholder="Enter new wallet address"
              value={newWallet}
              onChange={(e) => setNewWallet(e.target.value)}
              className="w-full p-2 border rounded my-2 bg-white text-black resize-none"
              rows={2}
              disabled={isUpdating}
            />
            <div className="flex justify-end space-x-4 mt-4">
              <button
                className="px-3 py-2 bg-gray-300 rounded text-black hover:bg-gray-400 transition-colors disabled:opacity-50"
                onClick={handleCancel}
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={updateMemeWallet}
                disabled={isUpdating}
              >
                {isUpdating ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}