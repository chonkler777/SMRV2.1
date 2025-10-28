'use client';

import { useState } from "react";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface DeleteButtonProps {
  docId: string;
  onMemeDeleted?: (docId: string) => void;
}

export default function DeleteButton({ docId, onMemeDeleted  }: DeleteButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const deleteMeme = async () => {
    try {
      setIsDeleting(true);
      const memeDocRef = doc(db, "memescollection", docId);
      await deleteDoc(memeDocRef);
  
      closeModal();
      if (onMemeDeleted) {
        onMemeDeleted(docId);
      }

    } catch (error) {
      console.error("Error deleting meme:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <button
        className="text-white text-sm px-2 py-[2px] bg-red-500 rounded-sm hover:bg-red-600 transition-colors"
        onClick={openModal}
      >
        Delete
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-[#1b1d28] rounded-lg p-6 w-80">
            <h2 className="text-lg text-gray-300 font-semibold mb-4">
              Confirm Delete
            </h2>
            <p className="mb-6 text-gray-200">
              Are you sure you want to delete this meme? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded text-black hover:bg-gray-400 transition-colors disabled:opacity-50"
                onClick={closeModal}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={deleteMeme}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




