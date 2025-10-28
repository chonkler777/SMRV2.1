"use client";

import React, { useState} from "react";
import MemeCopyButton from "@/public/assets/icons/MemeCopyButton";
import CopyDone from "@/public/assets/icons/CopyDone";

interface MobileClipboardButtonProps {
  imageUrl: string;
}

const ServerSideCopyButton: React.FC<MobileClipboardButtonProps> = ({
  imageUrl,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    
    try {
      await copyImageWithPermissions(imageUrl);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const copyImageWithPermissions = async (imageUrl: string): Promise<void> => {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isFirefox = navigator.userAgent.toLowerCase().includes("firefox");


    if (!navigator.clipboard || !navigator.clipboard.write) {
      throw new Error("Clipboard API not supported");
    }

    if (isFirefox) {
      throw new Error("Firefox does not support image clipboard operations");
    }

    try {
      if (isSafari) {
        await copyImageSafari(imageUrl);
      } else {
        await copyImageChrome(imageUrl);
      }
    } catch (error) {
      console.error("Clipboard operation failed:", error);
      throw error;
    }
  };

  const copyImageSafari = async (imageUrl: string): Promise<void> => {
    await navigator.clipboard.write([
      new ClipboardItem({
        "image/png": new Promise(async (resolve, reject) => {
          try {
            const response = await fetch("/api/proxy-image", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ imageUrl }),
            });

            if (!response.ok) {
              throw new Error(`Server proxy failed: ${response.status}`);
            }

            const blob = await response.blob();
            resolve(new Blob([blob], { type: "image/png" }));
          } catch (err) {
            reject(err);
          }
        }),
      }),
    ]);
  };

  const copyImageChrome = async (imageUrl: string): Promise<void> => {
    if (navigator.permissions) {
      try {
        const permission = await navigator.permissions.query({
          name: "clipboard-write" as PermissionName,
        });


        if (permission.state === "denied") {
          throw new Error("Clipboard permission denied");
        }
      } catch (permError) {
      }
    }

    const response = await fetch("/api/proxy-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl }),
    });

    if (!response.ok) {
      throw new Error(`Server proxy failed: ${response.status}`);
    }

    const blob = await response.blob();

    let finalBlob = blob;
    if (blob.type !== "image/png") {
      finalBlob = await convertToPNG(blob);
    }

    const clipboardItem = new ClipboardItem({
      "image/png": finalBlob,
    });

    await navigator.clipboard.write([clipboardItem]);
  };

  const convertToPNG = (blob: Blob): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Canvas context not available"));
            return;
          }

          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;

          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);

          canvas.toBlob(
            (pngBlob) => {
              URL.revokeObjectURL(img.src);
              if (pngBlob) {
                resolve(pngBlob);
              } else {
                reject(new Error("PNG conversion failed"));
              }
            },
            "image/png",
            1.0
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error("Image load failed"));
      };

      img.crossOrigin = "anonymous";
      img.src = URL.createObjectURL(blob);
    });
  };

  const getIcon = () => {
    return isCopied ? <CopyDone/> : <MemeCopyButton/>;
  };

  return (
    <button
        onClick={handleCopy}
        type="button"
        className="cursor-pointer bg-[#E5E7EBBF] hover:bg-[#E5E7EB] transition duration-200 p-[2px] rounded-full shadow-[0_3px_7px_rgba(12,18,25,0.7)"
        aria-label={isCopied ? "Image copied!" : "Copy image to clipboard"}
      >
        {getIcon()}
    </button>
    
  );
};

export default ServerSideCopyButton;





