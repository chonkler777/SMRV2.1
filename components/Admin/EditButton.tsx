'use client';

import { useState, useRef } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { db } from "@/lib/firebase";
// import "react-toastify/dist/ReactToastify.css";

interface EditButtonProps {
  docId: string;
  tag: string;
  onTagUpdate: (newTag: string) => void;
}

export default function EditButton({ docId, tag, onTagUpdate }: EditButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTag, setTag] = useState(tag);
  const [isUpdating, setIsUpdating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const notify = (message: string, options: { type: "success" | "error" } = { type: "success" }) =>
    toast(message, { ...options, pauseOnHover: true, draggable: true });

  const updateMemeTag = async () => {
    if (!newTag.trim()) {
      notify("Tag cannot be empty", { type: "error" });
      return;
    }

    try {
      setIsUpdating(true);
      const memeDocRef = doc(db, "memescollection", docId);

      // Update Firestore
      await updateDoc(memeDocRef, {
        tag: newTag,
      });

      notify("Meme tag updated successfully!", { type: "success" });

      // Update parent component state
      onTagUpdate(newTag);

      // Close the modal
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating tag:", error);
      notify("Error updating tag", { type: "error" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setTag(tag); // Reset to original tag
    setIsModalOpen(false);
  };

  return (
    <div>
      <button
        className="text-white text-sm px-1 py-[2px] bg-green-500 rounded-sm hover:bg-green-600 transition-colors"
        onClick={() => setIsModalOpen(true)}
      >
        Edit
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-[#1b1d28] rounded-lg p-6 w-80">
            <h2 className="text-lg text-white font-semibold mb-2">
              Edit Meme Tag
            </h2>
            <textarea
              ref={textareaRef}
              placeholder="Edit meme tag"
              value={newTag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full p-2 border rounded my-2 resize-none overflow-y-auto text-gray-300"
              rows={5}
              disabled={isUpdating}
            />
            <div className="flex justify-end space-x-4 mt-4">
              <button
                className="px-2 py-2 bg-gray-300 rounded text-black hover:bg-gray-400 transition-colors disabled:opacity-50"
                onClick={handleCancel}
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={updateMemeTag}
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