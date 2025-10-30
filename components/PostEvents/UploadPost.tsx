"use client";

import React, { useEffect, useState, useRef } from "react";
import { storage, db } from "@/lib/firebase";
import { uploadBytesResumable, ref, getDownloadURL } from "firebase/storage";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { v4 } from "uuid";
import { useRouter } from "next/navigation";
import { useAuth } from "@/AuthContext/AuthProvider";
import { AppUser } from "@/Types";
import UploadIcon from "@/public/assets/icons/UploadIcon";
import dynamic from "next/dynamic";

const Form = dynamic(() => import("@/app/global-components/AuthForm"), {
  ssr: false,
});

interface UploadPostProps {
  userId: string;
  username: string;
  toggleModel?: () => void;
  getCanvasData?: () => HTMLCanvasElement | null;
  imageUpload: File | null;
  mediaType: string;
  walletAddress: string;
  canvasText: string;
  image: {
    element: HTMLImageElement;
    originalWidth: number;
    originalHeight: number;
    displayWidth: number;
    displayHeight: number;
    aspectRatio: number;
  } | null;
  onCancelUpload?: (handler: () => void) => void;
}

interface NotifyOptions {
  type: "success" | "error" | "warning" | "info";
}

const UploadPost: React.FC<UploadPostProps> = ({
  userId,
  username,
  toggleModel,
  getCanvasData,
  imageUpload,
  mediaType,
  walletAddress,
  canvasText,
  image,
  onCancelUpload, // ✅ Receive callback
}) => {
  const { currentUser }: { currentUser: AppUser | null } = useAuth();
  const [tag, setTag] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [wallet, setWallet] = useState<string>(walletAddress || "");
  const [isAuthModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [pendingUpload, setPendingUpload] = useState<boolean>(false);
  const [postAnonymously, setPostAnonymously] = useState<boolean>(false);
  const hasAutoUploadedRef = React.useRef<boolean>(false);
  const [isPausedAt99, setIsPausedAt99] = useState<boolean>(false);
  const resumeUploadRef = React.useRef<(() => void) | null>(null);
  const currentTagRef = React.useRef<string>(tag);
  const currentWalletRef = React.useRef<string>(wallet);
  const isGifOrVideoUploadRef = React.useRef<boolean>(false);
  const [showProgressBar, setShowProgressBar] = useState<boolean>(false);
  const userClickedPostRef = React.useRef<boolean>(false);
  const uploadTaskRef = React.useRef<any>(null); // ✅ Store upload task reference
  

  const router = useRouter();
  const notify = async (msg: string, opts?: NotifyOptions) => {
    const { toast } = await import("react-toastify");
    toast(msg, opts);
  };

  useEffect(() => {
    const cancelHandler = () => {
      if (uploading && uploadTaskRef.current) {
        uploadTaskRef.current.cancel();
        setUploading(false);
        setUploadProgress(0);
        setShowProgressBar(false);
        setIsPausedAt99(false);
      }
    };
  
    if (onCancelUpload) {
      onCancelUpload(cancelHandler);
    }
  }, [uploading, onCancelUpload]);



  // Helper function to get general file type
  const getGeneralFileType = (mimeType: string): string => {
    if (mimeType.startsWith("image/gif")) {
      return "gif";
    } else if (mimeType.startsWith("image/")) {
      return "image";
    } else if (mimeType.startsWith("video/")) {
      return "video";
    }
    return "unknown";
  };

  const convertToWebP = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      img.onload = () => {
        if (img.width === 0 || img.height === 0) {
          reject(
            new Error("Image has invalid dimensions (width or height is 0)")
          );
          return;
        }

        const pixelRatio = window.devicePixelRatio || 1;

        canvas.width = img.width * pixelRatio;
        canvas.height = img.height * pixelRatio;
        canvas.style.width = img.width + "px";
        canvas.style.height = img.height + "px";

        ctx.scale(pixelRatio, pixelRatio);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(
                new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
                  type: "image/webp",
                })
              );
            } else {
              reject(new Error("WebP conversion failed"));
            }
          },
          "image/webp",
          1.0
        );
      };
      img.onerror = () => reject(new Error("Image load failed"));
      img.src = URL.createObjectURL(file);
    });
  };

  const generateBlurData = async (imageUrl: string): Promise<string | null> => {
    try {
      const response = await fetch(
        "https://web3-auth-1.onrender.com/api/media/generate-ImgBlur",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl }),
        }
      );

      const data = await response.json();

      if (data.skipped) {
        return null;
      }

      if (data.blurDataURL) {
        return data.blurDataURL;
      }

      console.warn("⚠️ No blur data returned from API");
      return null;
    } catch (error) {
      console.error("❌ Failed to generate blur data:", error);
      return null;
    }
  };

  const generateVideoThumbnail = async (
    videoUrl: string,
    docId: string
  ): Promise<string | null> => {
    try {
      const response = await fetch(
        "https://web3-auth-1.onrender.com/api/media/generate-vidThumbnail",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoUrl, docId }),
        }
      );

      const data = await response.json();

      if (data.thumbnailUrl) {
        return data.thumbnailUrl;
      }

      console.warn("⚠️ No thumbnail URL returned from API");
      return null;
    } catch (error) {
      console.error("❌ Failed to generate video thumbnail:", error);
      return null;
    }
  };

  const doUpload = async (isAnonymous: boolean): Promise<void> => {
    if (uploading) {
      console.log("⚠️ Upload already in progress, skipping...");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      let uploadFile: File | null = imageUpload;
      const isGif = uploadFile?.type === "image/gif";
      const isVideo = uploadFile?.type?.startsWith("video/");

      if (mediaType === "image" && !isGif && !isVideo) {
        const canvasElement = getCanvasData?.();
        if (canvasElement) {
          console.log(
            `🎨 Processing canvas: ${canvasElement.width}x${canvasElement.height}`
          );
          const blob = await new Promise<Blob>((res) =>
            canvasElement.toBlob((blob) => blob && res(blob), "image/webp", 1.0)
          );
          uploadFile = new File([blob], "edited-meme.webp", {
            type: "image/webp",
          });
        } else if (uploadFile && uploadFile.type !== "image/webp") {
          console.log("🔄 Converting image to WebP...");
          uploadFile = await convertToWebP(uploadFile);
        }
      }

      if (!uploadFile) throw new Error("No file to upload.");

      let finalUsername = username || "Unknown";
      if (isAnonymous) {
        const memesSnapshot = await getDocs(collection(db, "memescollection"));
        const count = memesSnapshot.size + 1;
        finalUsername = `Anonymous${count}`;
      }

      const memeId = v4();

      const storageRef = ref(storage, `memes/${memeId}`);
      const uploadTask = uploadBytesResumable(storageRef, uploadFile);
      uploadTaskRef.current = uploadTask; // ✅ Store reference for cancellation

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (isGifOrVideoUploadRef.current) {
              setUploadProgress(Math.min(pct, 99));
            } else {
              setUploadProgress(pct);
            }
          },
          (error) => {
            // ✅ Handle cancellation
            if (error.code === 'storage/canceled') {
              console.log("🚫 Upload cancelled by user");
              reject(new Error('Upload cancelled'));
            } else {
              console.error("❌ Upload error:", error);
              reject(error);
            }
          },
          async () => {
            try {
              const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);

              const fileType = getGeneralFileType(uploadFile!.type);
              const isVideoFile = fileType === "video";

              let blurDataURL: string | null = null;
              let thumbnailUrl: string | null = null;

              if (isVideoFile) {
                console.log("🎬 Generating video thumbnail...");
                thumbnailUrl = await generateVideoThumbnail(imageUrl, memeId);
              } else {
                blurDataURL = await generateBlurData(imageUrl);
              }

              if (
                isGifOrVideoUploadRef.current &&
                !userClickedPostRef.current
              ) {
                setUploadProgress(99);
                setIsPausedAt99(true);
                console.log(
                  "⏸️ Paused at 99% - waiting for user confirmation..."
                );

                await new Promise<void>((continueResolve) => {
                  resumeUploadRef.current = continueResolve;
                });

                console.log("▶️ User confirmed - saving to Firestore...");
                setUploadProgress(100);

                const finalTag = currentTagRef.current.trim() || "No tag";
                const finalWallet = isAnonymous
                  ? "1nc1nerator11111111111111111111111111111111"
                  : walletAddress || currentWalletRef.current || "";

                const memeData = {
                  id: userId,
                  username: finalUsername,
                  imageUrl,
                  memeId,
                  wallet: finalWallet,
                  tag: finalTag,
                  fileType,
                  upvotes: 0,
                  views: 0,
                  timestamp: serverTimestamp(),
                  randomValue: Math.random(),
                  createdAt: new Date().toISOString(),
                  ...(blurDataURL && { blurDataURL }),
                  ...(thumbnailUrl && { thumbnailUrl }),
                };

                const docRef = await addDoc(
                  collection(db, "memescollection"),
                  memeData
                );
              } else if (
                isGifOrVideoUploadRef.current &&
                userClickedPostRef.current
              ) {
                console.log("▶️ User clicked early - saving immediately...");
                setUploadProgress(100);

                const finalTag = currentTagRef.current.trim() || "No tag";
                const finalWallet = isAnonymous
                  ? "1nc1nerator11111111111111111111111111111111"
                  : walletAddress || currentWalletRef.current || "";

                const memeData = {
                  id: userId,
                  username: finalUsername,
                  imageUrl,
                  memeId,
                  wallet: finalWallet,
                  tag: finalTag,
                  fileType,
                  upvotes: 0,
                  views: 0,
                  timestamp: serverTimestamp(),
                  randomValue: Math.random(),
                  createdAt: new Date().toISOString(),
                  ...(blurDataURL && { blurDataURL }),
                  ...(thumbnailUrl && { thumbnailUrl }),
                };

                const docRef = await addDoc(
                  collection(db, "memescollection"),
                  memeData
                );
              } else {
                const memeData = {
                  id: userId,
                  username: finalUsername,
                  imageUrl,
                  memeId,
                  wallet: isAnonymous
                    ? "1nc1nerator11111111111111111111111111111111"
                    : walletAddress || wallet || "",
                  tag: tag.trim() || "No tag",
                  fileType,
                  upvotes: 0,
                  views: 0,
                  timestamp: serverTimestamp(),
                  randomValue: Math.random(),
                  createdAt: new Date().toISOString(),
                  ...(blurDataURL && { blurDataURL }),
                  ...(thumbnailUrl && { thumbnailUrl }),
                };

                const docRef = await addDoc(
                  collection(db, "memescollection"),
                  memeData
                );
              }

              setTag("");
              setUploadProgress(100);

              setTimeout(() => {
                toggleModel?.();
                router.back();
                setTimeout(() => {
                  router.push("/");
                }, 100);
              }, 500);

              resolve();
            } catch (firestoreError) {
              console.error("❌ Firestore error:", firestoreError);
              reject(firestoreError);
            }
          }
        );
      });
    } catch (error) {
      console.error("❌ Upload failed:", error);

      // ✅ Don't show error toast if it was cancelled
      if (error instanceof Error && error.message === 'Upload cancelled') {
        return;
      }

      let errorMessage = "Error uploading meme";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      notify(`Upload failed: ${errorMessage}`, { type: "error" });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      uploadTaskRef.current = null; // ✅ Clear reference
    }
  };

  const uploadMeme = (): void => {
    if (!imageUpload && !getCanvasData) {
      notify("Please select a file or create content to upload", {
        type: "warning",
      });
      return;
    }

    if (!postAnonymously && !currentUser) {
      notify("Please log in to post a meme", { type: "warning" });
      setAuthModalOpen(true);
      setPendingUpload(true);
      return;
    }

    setShowProgressBar(true);
    userClickedPostRef.current = true;

    if (isPausedAt99 && resumeUploadRef.current) {
      console.log("▶️ User confirmed - resuming from 99%...");
      resumeUploadRef.current();
      return;
    }

    if (uploading) {
      console.log("📊 Showing progress for ongoing background upload...");
      return;
    }

    if (imageUpload) {
      const isGif = imageUpload.type === "image/gif";
      const isVideo = imageUpload.type?.startsWith("video/");
      isGifOrVideoUploadRef.current = isGif || isVideo;
    }

    console.log("🚀 Starting upload process...");
    doUpload(postAnonymously);
  };

  useEffect(() => {
    if (currentUser && pendingUpload) {
      setAuthModalOpen(false);
      setPendingUpload(false);
      doUpload(postAnonymously);
    }
  }, [currentUser, pendingUpload, postAnonymously]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    if (imageUpload && !uploading && !hasAutoUploadedRef.current) {
      const isGif = imageUpload.type === "image/gif";
      const isVideo = imageUpload.type?.startsWith("video/");

      if (isGif || isVideo) {
        console.log(
          `📤 ${
            isGif ? "GIF" : "Video"
          } detected, starting silent background upload...`
        );
        isGifOrVideoUploadRef.current = true;
        hasAutoUploadedRef.current = true;
        userClickedPostRef.current = false;
        setShowProgressBar(false);

        if (!postAnonymously && !currentUser) {
          console.log("⚠️ User not logged in, waiting for manual post...");
        } else {
          doUpload(postAnonymously);
        }
      }
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [imageUpload]);

  useEffect(() => {
    if (canvasText && canvasText.trim()) {
      setTag(canvasText);
      currentTagRef.current = canvasText;

      setTimeout(() => {
        const tagTextarea = document.getElementById(
          "tag"
        ) as HTMLTextAreaElement;
        if (tagTextarea) {
          tagTextarea.style.height = "auto";
          tagTextarea.style.height = `${Math.min(
            tagTextarea.scrollHeight,
            96
          )}px`;
        }
      }, 0);
    } else if (canvasText === "") {
      setTag("");
      currentTagRef.current = "";

      setTimeout(() => {
        const tagTextarea = document.getElementById(
          "tag"
        ) as HTMLTextAreaElement;
        if (tagTextarea) {
          tagTextarea.style.height = "auto";
        }
      }, 0);
    }
  }, [canvasText]);

  const handleTagChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setTag(e.target.value);
    currentTagRef.current = e.target.value;
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 96)}px`;
  };

  const handleWalletChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setWallet(e.target.value);
    currentWalletRef.current = e.target.value;
  };

  return (
    <div>
      <div className="mb-4">
        <label htmlFor="tag" className="text-[#fff] text-[14px] block mb-1">
          Tag Meme (helps others find it){" "}
          {canvasText && (
            <span className="text-[#86EFAC] text-xs">
              (Auto-filled from canvas)
            </span>
          )}
        </label>
        <textarea
          id="tag"
          placeholder="Enter meme tag or title..."
          value={tag}
          onChange={handleTagChange}
          className="w-full bg-[#152D2D] p-2 rounded resize-none
              focus:outline-none focus:ring-1 placeholder-[#86EFAC]
              border border-[#86EFAC] text-[#86EFAC]"
          rows={1}
          style={{ maxHeight: "96px" }}
        />
      </div>

      {!walletAddress && (
        <div className="mb-4">
          <label className="text-[#fff] text-[14px] block mb-1">
            Sol Wallet Address (Optional)
          </label>
          <input
            type="text"
            placeholder="Enter wallet address..."
            value={wallet}
            onChange={handleWalletChange}
            className="w-full p-2 bg-[#152D2D] text-[#86EFAC]
                border border-[#86EFAC] rounded placeholder-[#86EFAC] 
                focus:outline-none focus:ring-1"
          />
        </div>
      )}

      {uploading && showProgressBar && (
        <div className="space-y-3 mb-4">
          <div className="relative w-full bg-gray-200 rounded h-6 overflow-hidden">
            <div
              className="bg-green-500 h-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-black">
              {Math.round(uploadProgress)}%
            </span>
          </div>
          <div className="text-center text-sm text-[#86EFAC]">
            {uploadProgress > 95 && "🎉 Almost done!"}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 items-center">
        <button
          onClick={uploadMeme}
          disabled={!imageUpload && !getCanvasData}
          className={`rounded-full px-14 py-2 flex items-center gap-2
              font-medium text-[16px] transition-all duration-200 ${
                !imageUpload && !getCanvasData
                  ? "bg-[#86EFAC] opacity-60 cursor-not-allowed"
                  : "bg-[#86EFAC] text-black hover:bg-[#7dd3a3] transform hover:scale-105"
              }`}
        >
          <UploadIcon />
          {isPausedAt99 ? "Post" : "Post"}
        </button>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="anonymous"
            checked={postAnonymously}
            onChange={() => setPostAnonymously(!postAnonymously)}
            className="accent-[#86EFAC] w-4 h-4"
          />
          <label htmlFor="anonymous" className="text-[#86EFAC] text-sm">
            Post Anonymously
          </label>
        </div>
      </div>

      <Form
        buttonLabel="Submit"
        isOpen={isAuthModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setPendingUpload(false);
        }}
      />
    </div>
  );
};

export default UploadPost;


















// "use client";

// import React, { useEffect, useState } from "react";
// import { storage, db } from "@/lib/firebase";
// import { uploadBytesResumable, ref, getDownloadURL } from "firebase/storage";
// import {
//   collection,
//   addDoc,
//   serverTimestamp,
//   getDocs,
// } from "firebase/firestore";
// import { v4 } from "uuid";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/AuthContext/AuthProvider";
// import { AppUser } from "@/Types";
// import UploadIcon from "@/public/assets/icons/UploadIcon";
// import dynamic from "next/dynamic";

// const Form = dynamic(() => import("@/app/global-components/AuthForm"), {
//   ssr: false,
// });

// interface UploadPostProps {
//   userId: string;
//   username: string;
//   toggleModel?: () => void;
//   getCanvasData?: () => HTMLCanvasElement | null;
//   imageUpload: File | null;
//   mediaType: string;
//   walletAddress: string;
//   canvasText: string;
//   image: {
//     element: HTMLImageElement;
//     originalWidth: number;
//     originalHeight: number;
//     displayWidth: number;
//     displayHeight: number;
//     aspectRatio: number;
//   } | null;
// }

// interface NotifyOptions {
//   type: "success" | "error" | "warning" | "info";
// }

// const UploadPost: React.FC<UploadPostProps> = ({
//   userId,
//   username,
//   toggleModel,
//   getCanvasData,
//   imageUpload,
//   mediaType,
//   walletAddress,
//   canvasText,
// }) => {
//   const { currentUser }: { currentUser: AppUser | null } = useAuth();
//   const [tag, setTag] = useState<string>("");
//   const [uploading, setUploading] = useState<boolean>(false);
//   const [uploadProgress, setUploadProgress] = useState<number>(0);
//   const [wallet, setWallet] = useState<string>(walletAddress || "");
//   const [isAuthModalOpen, setAuthModalOpen] = useState<boolean>(false);
//   const [pendingUpload, setPendingUpload] = useState<boolean>(false);
//   const [postAnonymously, setPostAnonymously] = useState<boolean>(false);

//   const router = useRouter();
//   const notify = async (msg: string, opts?: NotifyOptions) => {
//     const { toast } = await import("react-toastify");
//     toast(msg, opts);
//   };

//   // Helper function to get general file type
//   const getGeneralFileType = (mimeType: string): string => {
//     if (mimeType.startsWith("image/gif")) {
//       return "gif";
//     } else if (mimeType.startsWith("image/")) {
//       return "image";
//     } else if (mimeType.startsWith("video/")) {
//       return "video";
//     }
//     return "unknown";
//   };

//   const convertToWebP = (file: File): Promise<File> => {
//     return new Promise((resolve, reject) => {
//       const img = new window.Image();
//       const canvas = document.createElement("canvas");
//       const ctx = canvas.getContext("2d");

//       if (!ctx) {
//         reject(new Error("Canvas context not available"));
//         return;
//       }

//       img.onload = () => {
//         const pixelRatio = window.devicePixelRatio || 1;

//         canvas.width = img.width * pixelRatio;
//         canvas.height = img.height * pixelRatio;
//         canvas.style.width = img.width + "px";
//         canvas.style.height = img.height + "px";

//         ctx.scale(pixelRatio, pixelRatio);
//         ctx.imageSmoothingEnabled = true;
//         ctx.imageSmoothingQuality = "high";

//         ctx.drawImage(img, 0, 0);

//         canvas.toBlob(
//           (blob) => {
//             if (blob) {
//               resolve(
//                 new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
//                   type: "image/webp",
//                 })
//               );
//             } else {
//               reject(new Error("WebP conversion failed"));
//             }
//           },
//           "image/webp",
//           1.0
//         );
//       };
//       img.onerror = () => reject(new Error("Image load failed"));
//       img.src = URL.createObjectURL(file);
//     });
//   };

//   const generateBlurData = async (imageUrl: string): Promise<string | null> => {
//     try {
//       const response = await fetch(
//         "https://web3-auth-1.onrender.com/api/media/generate-ImgBlur",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ imageUrl }),
//         }
//       );

//       const data = await response.json();

//       if (data.skipped) {
//         return null;
//       }

//       if (data.blurDataURL) {
//         return data.blurDataURL;
//       }

//       console.warn("⚠️ No blur data returned from API");
//       return null;
//     } catch (error) {
//       console.error("❌ Failed to generate blur data:", error);
//       return null;
//     }
//   };

//   const generateVideoThumbnail = async (
//     videoUrl: string,
//     docId: string
//   ): Promise<string | null> => {
//     try {
//       const response = await fetch(
//         "https://web3-auth-1.onrender.com/api/media/generate-vidThumbnail",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ videoUrl, docId }),
//         }
//       );

//       const data = await response.json();

//       if (data.thumbnailUrl) {
//         return data.thumbnailUrl;
//       }

//       console.warn("⚠️ No thumbnail URL returned from API");
//       return null;
//     } catch (error) {
//       console.error("❌ Failed to generate video thumbnail:", error);
//       return null;
//     }
//   };

//   const doUpload = async (isAnonymous: boolean): Promise<void> => {
//     setUploading(true);
//     setUploadProgress(0);

//     try {
//       let uploadFile: File | null = imageUpload;
//       const isGif = uploadFile?.type === "image/gif";
//       const isVideo = uploadFile?.type?.startsWith("video/");

//       if (mediaType === "image" && !isGif && !isVideo) {
//         const canvasElement = getCanvasData?.();
//         if (canvasElement) {
//           console.log(
//             `🎨 Processing canvas: ${canvasElement.width}x${canvasElement.height}`
//           );
//           const blob = await new Promise<Blob>((res) =>
//             canvasElement.toBlob((blob) => blob && res(blob), "image/webp", 1.0)
//           );
//           uploadFile = new File([blob], "edited-meme.webp", {
//             type: "image/webp",
//           });
//         } else if (uploadFile && uploadFile.type !== "image/webp") {
//           console.log("🔄 Converting image to WebP...");
//           uploadFile = await convertToWebP(uploadFile);
//         }
//       }

//       if (!uploadFile) throw new Error("No file to upload.");

//       let finalUsername = username || "Unknown";
//       if (isAnonymous) {
//         const memesSnapshot = await getDocs(collection(db, "memescollection"));
//         const count = memesSnapshot.size + 1;
//         finalUsername = `Anonymous${count}`;
//       }

//       const memeId = v4();

//       const storageRef = ref(storage, `memes/${memeId}`);
//       const uploadTask = uploadBytesResumable(storageRef, uploadFile);

//       await new Promise<void>((resolve, reject) => {
//         uploadTask.on(
//           "state_changed",
//           (snapshot) => {
//             const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
//             setUploadProgress(pct);
//           },
//           (error) => {
//             console.error("❌ Upload error:", error);
//             reject(error);
//           },
//           async () => {
//             try {
//               const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);

//               const fileType = getGeneralFileType(uploadFile!.type);
//               const isVideoFile = fileType === "video";

//               let blurDataURL: string | null = null;
//               let thumbnailUrl: string | null = null;

//               if (isVideoFile) {
//                 console.log("🎬 Generating video thumbnail...");
//                 thumbnailUrl = await generateVideoThumbnail(imageUrl, memeId);
//               } else {
//                 blurDataURL = await generateBlurData(imageUrl);
//               }

//               const memeData = {
//                 id: userId,
//                 username: finalUsername,
//                 imageUrl,
//                 memeId,
//                 wallet: isAnonymous
//                   ? "1nc1nerator11111111111111111111111111111111"
//                   : walletAddress || wallet || "",
//                 tag: tag.trim() || "No tag",
//                 fileType,
//                 upvotes: 0,
//                 views: 0,
//                 timestamp: serverTimestamp(),
//                 randomValue: Math.random(),
//                 createdAt: new Date().toISOString(),
//                 ...(blurDataURL && { blurDataURL }),
//                 ...(thumbnailUrl && { thumbnailUrl }),
//               };

//               const docRef = await addDoc(
//                 collection(db, "memescollection"),
//                 memeData
//               );

//               // Reset form
//               setTag("");
//               setUploadProgress(100);

//               // setTimeout(() => {
//               //   toggleModel?.();
//               //   router.push("/");
//               // });

//               setTimeout(() => {
//                 toggleModel?.();
//                 router.back(); // Close the modal
//                 setTimeout(() => {
//                   router.push("/");
//                 }, 100);
//               }, 500);

//               resolve();
//             } catch (firestoreError) {
//               console.error("❌ Firestore error:", firestoreError);
//               reject(firestoreError);
//             }
//           }
//         );
//       });
//     } catch (error) {
//       console.error("❌ Upload failed:", error);

//       let errorMessage = "Error uploading meme";
//       if (error instanceof Error) {
//         errorMessage = error.message;
//       }

//       notify(`Upload failed: ${errorMessage}`, { type: "error" });
//     } finally {
//       setUploading(false);
//       setUploadProgress(0);
//     }
//   };

//   const uploadMeme = (): void => {
//     if (!imageUpload && !getCanvasData) {
//       notify("Please select a file or create content to upload", {
//         type: "warning",
//       });
//       return;
//     }

//     if (!postAnonymously && !currentUser) {
//       notify("Please log in to post a meme", { type: "warning" });
//       setAuthModalOpen(true);
//       setPendingUpload(true);
//       return;
//     }

//     console.log("🚀 Starting upload process...");
//     doUpload(postAnonymously);
//   };

//   // Handle pending upload after authentication
//   useEffect(() => {
//     if (currentUser && pendingUpload) {
//       setAuthModalOpen(false);
//       setPendingUpload(false);
//       doUpload(postAnonymously);
//     }
//   }, [currentUser, pendingUpload, postAnonymously]);

//   useEffect(() => {
//     if (canvasText && canvasText.trim()) {
//       setTag(canvasText);

//       // Auto-resize textarea
//       setTimeout(() => {
//         const tagTextarea = document.getElementById(
//           "tag"
//         ) as HTMLTextAreaElement;
//         if (tagTextarea) {
//           tagTextarea.style.height = "auto";
//           tagTextarea.style.height = `${Math.min(
//             tagTextarea.scrollHeight,
//             96
//           )}px`;
//         }
//       }, 0);
//     } else if (canvasText === "") {
//       setTag("");

//       setTimeout(() => {
//         const tagTextarea = document.getElementById(
//           "tag"
//         ) as HTMLTextAreaElement;
//         if (tagTextarea) {
//           tagTextarea.style.height = "auto";
//         }
//       }, 0);
//     }
//   }, [canvasText]);

//   const handleTagChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
//     setTag(e.target.value);
//     e.target.style.height = "auto";
//     e.target.style.height = `${Math.min(e.target.scrollHeight, 96)}px`;
//   };

//   const handleWalletChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
//     setWallet(e.target.value);
//   };

//   return (
//     <div>
//       {/* Tag Input */}
//       <div className="mb-4">
//         <label htmlFor="tag" className="text-[#fff] text-[14px] block mb-1">
//           Tag Meme (helps others find it){" "}
//           {canvasText && (
//             <span className="text-[#86EFAC] text-xs">
//               (Auto-filled from canvas)
//             </span>
//           )}
//         </label>
//         <textarea
//           id="tag"
//           placeholder="Enter meme tag or title..."
//           value={tag}
//           onChange={handleTagChange}
//           disabled={uploading}
//           className="w-full bg-[#152D2D] p-2 rounded resize-none
//               focus:outline-none focus:ring-1 placeholder-[#86EFAC]
//               border border-[#86EFAC] text-[#86EFAC] disabled:opacity-50"
//           rows={1}
//           style={{ maxHeight: "96px" }}
//         />
//       </div>

//       {!walletAddress && (
//         <div className="mb-4">
//           <label className="text-[#fff] text-[14px] block mb-1">
//             Sol Wallet Address (Optional)
//           </label>
//           <input
//             type="text"
//             placeholder="Enter wallet address..."
//             value={wallet}
//             onChange={handleWalletChange}
//             disabled={uploading}
//             className="w-full p-2 bg-[#152D2D] text-[#86EFAC]
//                 border border-[#86EFAC] rounded placeholder-[#86EFAC]
//                 focus:outline-none focus:ring-1 disabled:opacity-50"
//           />
//         </div>
//       )}

//       {uploading ? (
//         <div className="space-y-3">
//           <div className="relative w-full bg-gray-200 rounded h-6 overflow-hidden">
//             <div
//               className="bg-green-500 h-full transition-all duration-300 ease-out"
//               style={{ width: `${uploadProgress}%` }}
//             />
//             <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-black">
//               {Math.round(uploadProgress)}%
//             </span>
//           </div>
//           <div className="text-center text-sm text-[#86EFAC]">
//             {uploadProgress > 95 && "🎉 Almost done!"}
//           </div>
//         </div>
//       ) : (
//         <div className="flex flex-col gap-4 items-center">
//           <button
//             onClick={uploadMeme}
//             disabled={(!imageUpload && !getCanvasData) || uploading}
//             className={`rounded-full px-14 py-2 flex items-center gap-2
//                 font-medium text-[16px] transition-all duration-200 ${
//                   (!imageUpload && !getCanvasData) || uploading
//                     ? "bg-[#86EFAC] opacity-60 cursor-not-allowed"
//                     : "bg-[#86EFAC] text-black hover:bg-[#7dd3a3] transform hover:scale-105"
//                 }`}
//           >
//             <UploadIcon />
//             Post
//           </button>

//           <div className="flex items-center space-x-2">
//             <input
//               type="checkbox"
//               id="anonymous"
//               checked={postAnonymously}
//               onChange={() => setPostAnonymously(!postAnonymously)}
//               disabled={uploading}
//               className="accent-[#86EFAC] w-4 h-4 disabled:opacity-50"
//             />
//             <label
//               htmlFor="anonymous"
//               className={`text-[#86EFAC] text-sm ${
//                 uploading ? "opacity-50" : ""
//               }`}
//             >
//               Post Anonymously
//             </label>
//           </div>
//         </div>
//       )}

//       {/* Authentication Modal */}
//       <Form
//         buttonLabel="Submit"
//         isOpen={isAuthModalOpen}
//         onClose={() => {
//           setAuthModalOpen(false);
//           setPendingUpload(false);
//         }}
//       />
//     </div>
//   );
// };

// export default UploadPost;
