"use client";
import MemeDetailClient from "@/app/Meme/[docId]/MemeDetailClient";
import { useRouter } from "next/navigation";


interface MemeData {
  id: string;
  docId: string;
  userId: string;
  imageUrl: string;
  username: string;
  tag: string;
  wallet: string;
  timestamp: any;
  upvotes: number;
  downvotes: number;
  views: number;
  memeId: string;
  fileType: string;
  blurDataURL: string;
  thumbnailUrl: string;
}

interface MemeModalClientProps {
  docId: string;
  initialMemeData: MemeData | null;
}

export default function MemeModalClient({
  docId,
  initialMemeData,
}: MemeModalClientProps) {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 "
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="meme-modal-title"
    >

      <div
        className="bg-[#121C26] w-[90%] lg:w-[70%] 2xl:w-[50%] h-[70vh] lg:h-[90vh] mx-auto overflow-y-auto rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <MemeDetailClient docId={docId} initialMemeData={initialMemeData} isModal={true} onClose={handleClose}  />
      </div>
    </div>
  );
}
