"use client";

import React, { useRef, useState, useEffect, RefObject } from "react";
import Head from "next/head";
import UploadPost from "./UploadPost";
import { useAuth } from "@/AuthContext/AuthProvider";
import LayoutSelector from "./LayoutSelectors";
import CanvasStage from "./CanvasStageWrapper";
// import Konva from "konva";
import type Konva from "konva";
import { AppUser } from "@/Types";
import AddImage from "@/public/assets/icons/AddImage";
import PostUploadIcon from "@/public/assets/icons/PostUploadIcon";

// Define TypeScript interfaces
interface ImageData {
  element: HTMLImageElement;
  originalWidth: number;
  originalHeight: number;
  displayWidth: number;
  displayHeight: number;
  aspectRatio: number;
}

interface Position {
  x: number;
  y: number;
}

interface CustomText {
  id: number;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  ref: RefObject<Konva.Text | null>;
}

interface CanvasSize {
  width: number;
  height: number;
}

interface AdaptiveTextPositions {
  top: Position;
  bottom: Position;
}

type TextMode = "default" | "editor" | "spacing" | "demotivational";
type SpacingOption = "top" | "bottom" | "both";
type MediaType = "image" | "gif" | "video";

const PostEditor: React.FC = () => {
  // State variables with proper TypeScript types
  const [image, setImage] = useState<ImageData | null>(null);
  const [topText, setTopText] = useState<string>("");
  const [bottomText, setBottomText] = useState<string>("");
  const [topFontSize, setTopFontSize] = useState<number>(40);
  const [bottomFontSize, setBottomFontSize] = useState<number>(40);
  const [topTextColor, setTopTextColor] = useState<string>("#FFFFFF");
  const [bottomTextColor, setBottomTextColor] = useState<string>("#FFFFFF");
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({
    width: 0,
    height: 0,
  });
  const [topTextPosition, setTopTextPosition] = useState<Position>({
    x: 100,
    y: 50,
  });
  const [bottomTextPosition, setBottomTextPosition] = useState<Position>({
    x: 100,
    y: 400,
  });
  const [selectedTextId, setSelectedTextId] = useState<string | number | null>(
    null
  );
  const { currentUser }: { currentUser: AppUser | null } = useAuth();
  const [isModalupload, setisModalupload] = useState<boolean>(false);
  const [mediaType, setMediaType] = useState<MediaType>("image");
  const [mediaURL, setMediaURL] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [textMode, setTextMode] = useState<TextMode>("default");
  const [spacingOption, setSpacingOption] = useState<SpacingOption>("both");
  const [customTexts, setCustomTexts] = useState<CustomText[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [combinedCanvasText, setCombinedCanvasText] = useState<string>("");

  const BASE_DISPLAY_WIDTH = 400;

  // Refs for canvas components
  const transformerRef = useRef<Konva.Transformer | null>(null);
  const topTextRef = useRef<Konva.Text | null>(null);
  const bottomTextRef = useRef<Konva.Text | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);

  // Responsive dimensions
  let demoImageWidth = 200;
  let demoImageHeight = 200;

  if (typeof window !== "undefined" && window.innerWidth >= 768) {
    demoImageWidth = 300;
    demoImageHeight = 300;
  }

  const fallbackWidth =
    typeof window !== "undefined" && window.innerWidth < 768
      ? window.innerWidth * 0.9
      : 400;

  const handleStageRef = (stage: Konva.Stage): void => {
    stageRef.current = stage;
  };

  const fallbackHeight = 300;
  const defaultFallbackHeight = 0;

  // Utility functions for demotivational layout
  const getDemotivationalFitWidth = (img: HTMLImageElement): number => {
    const aspectRatio = img.width / img.height;
    if (aspectRatio > 1) {
      return demoImageWidth;
    } else {
      return demoImageHeight * aspectRatio;
    }
  };

  const getDemotivationalFitHeight = (img: HTMLImageElement): number => {
    const aspectRatio = img.width / img.height;
    if (aspectRatio > 1) {
      return demoImageWidth / aspectRatio;
    } else {
      return demoImageHeight;
    }
  };

  const getCombinedCanvasText = (): string => {
    const texts: string[] = [];

    // Add top text if it exists - replace line breaks with spaces
    if (topText.trim()) {
      const cleanedTopText = topText.replace(/\n+/g, " ").trim();
      if (cleanedTopText) {
        texts.push(cleanedTopText);
      }
    }

    // Add bottom text if it exists - replace line breaks with spaces
    if (bottomText.trim()) {
      const cleanedBottomText = bottomText.replace(/\n+/g, " ").trim();
      if (cleanedBottomText) {
        texts.push(cleanedBottomText);
      }
    }

    // Add custom texts if they exist - replace line breaks with spaces
    customTexts.forEach((customText) => {
      if (customText.text.trim()) {
        const cleanedCustomText = customText.text.replace(/\n+/g, " ").trim();
        if (cleanedCustomText) {
          texts.push(cleanedCustomText);
        }
      }
    });

    const combinedText = texts.join(" ");

    // Convert to sentence case: first letter uppercase, rest lowercase
    if (combinedText.length > 0) {
      return (
        combinedText.charAt(0).toUpperCase() +
        combinedText.slice(1).toLowerCase()
      );
    }

    return combinedText;
  };

  useEffect(() => {
    const newCombinedText = getCombinedCanvasText();
    setCombinedCanvasText(newCombinedText);
  }, [topText, bottomText, customTexts]);

  // Button positioning for file upload
  const getButtonPosition = (): { top: string; right: string } => {
    if (!image) return { top: "8px", right: "8px" };

    let top = "8px";
    let right = "8px";

    if (textMode === "spacing") {
      if (spacingOption === "top" || spacingOption === "both") {
        top = "58px";
      }
    } else if (textMode === "demotivational") {
      top = "58px";
    }

    if (textMode === "demotivational") {
      const imageWidth = getDemotivationalFitWidth(image.element);
      const displayWidth = 400; // Use your BASE_DISPLAY_WIDTH
      const rightOffset = (displayWidth - imageWidth) / 2;
      right = `${Math.max(rightOffset + 8, 8)}px`;
    }

    return { top, right };
  };

  // Text fitting utility
  const shrinkOrGrowTextToFit = (
    textRef: RefObject<Konva.Text | null>,
    setFontSize: (fontSize: number) => void,
    baseWidth: number,
    maxFontSize: number,
    customWidth: number | null = null
  ): void => {
    if (!textRef.current) return;

    const padding = 20;
    const availableWidth = (customWidth || baseWidth) - padding;

    let currentFontSize = textRef.current.fontSize();
    let textWidth = textRef.current.getTextWidth();

    if (textWidth > availableWidth) {
      while (textWidth > availableWidth && currentFontSize > 10) {
        currentFontSize -= 1;
        textRef.current.fontSize(currentFontSize);
        textWidth = textRef.current.getTextWidth();
      }
    } else {
      while (
        textWidth < availableWidth * 0.8 &&
        currentFontSize < maxFontSize
      ) {
        currentFontSize += 1;
        textRef.current.fontSize(currentFontSize);
        textWidth = textRef.current.getTextWidth();
      }
    }

    setFontSize(currentFontSize);
  };

  const handleTopTextChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ): void => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart; // Save cursor position

    setTopText(textMode === "demotivational" ? value : value.toUpperCase());

    setTimeout(() => {
      // Restore cursor position after state update
      e.target.setSelectionRange(cursorPosition, cursorPosition);

      if (value.trim() === "") {
        setTopFontSize(textMode === "demotivational" ? 20 : 40);
      } else {
        shrinkOrGrowTextToFit(
          topTextRef,
          setTopFontSize,
          BASE_DISPLAY_WIDTH,
          textMode === "demotivational" ? 20 : 40,
          textMode === "demotivational" ? demoImageWidth : null
        );
      }

      // Auto-resize textarea while preserving cursor position
      e.target.style.height = "auto";
      e.target.style.height = `${Math.min(e.target.scrollHeight, 96)}px`;
    }, 0);
  };

  const handleBottomTextChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ): void => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart; // Save cursor position

    setBottomText(textMode === "demotivational" ? value : value.toUpperCase());

    setTimeout(() => {
      // Restore cursor position after state update
      e.target.setSelectionRange(cursorPosition, cursorPosition);

      if (value.trim() === "") {
        setBottomFontSize(textMode === "demotivational" ? 13 : 40);
      } else {
        shrinkOrGrowTextToFit(
          bottomTextRef,
          setBottomFontSize,
          BASE_DISPLAY_WIDTH,
          textMode === "demotivational" ? 13 : 40,
          textMode === "demotivational" ? demoImageWidth : null
        );
      }

      // Auto-resize textarea while preserving cursor position
      e.target.style.height = "auto";
      e.target.style.height = `${Math.min(e.target.scrollHeight, 96)}px`;
    }, 0);
  };

  // Layout handlers
  const handleTextModeChange = (mode: TextMode): void => {
    setTextMode(mode);
  };

  const handleSpacingOptionChange = (option: SpacingOption): void => {
    setSpacingOption(option);
  };

  // Effects
  useEffect(() => {
    if (!image && (textMode === "spacing" || textMode === "demotivational")) {
      setCanvasSize({ width: fallbackWidth, height: fallbackHeight });
    }

    const handlePaste = (event: ClipboardEvent): void => {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            const eventObj = { target: { files: [file] } } as any;
            handleImageUpload(eventObj);
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [textMode, image]);

  // Modal and file handlers
  const toggleModel = (): void => {
    setSelectedTextId(null);
    setisModalupload(!isModalupload);
  };

  const getAdaptiveTextPositions = (
    aspectRatio: number
  ): AdaptiveTextPositions => {
    const actualDisplayHeight = BASE_DISPLAY_WIDTH * aspectRatio;

    // Calculate how "wide" vs "tall" the image is
    const isVeryWide = aspectRatio < 0.5; // Very wide images (like 2916x1135)
    const isWide = aspectRatio < 0.7; // Wide images
    const isSquareish = aspectRatio >= 0.7 && aspectRatio <= 1.3; // Square-ish images
    const isTall = aspectRatio > 1.3; // Tall/portrait images

    let topPercent: number, bottomPercent: number;

    if (isVeryWide) {
      // Very wide images: need more margin to avoid text overlap
      topPercent = 0.08; // 8% from top
      bottomPercent = 0.75; // 75% from top (more space from bottom)
    } else if (isWide) {
      // Wide images: moderate adjustment
      topPercent = 0.06; // 6% from top
      bottomPercent = 0.82; // 82% from top
    } else if (isSquareish) {
      // Square images: classic meme positioning
      topPercent = 0.05; // 5% from top
      bottomPercent = 0.9; // 90% from top (close to bottom)
    } else {
      // Tall images: can use more space
      topPercent = 0.04; // 4% from top
      bottomPercent = 0.92; // 92% from top (even closer to bottom)
    }

    return {
      top: {
        x: BASE_DISPLAY_WIDTH / 2,
        y: actualDisplayHeight * topPercent,
      },
      bottom: {
        x: BASE_DISPLAY_WIDTH / 2,
        y: actualDisplayHeight * bottomPercent,
      },
    };
  };

  // Image upload handler with adaptive positioning
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);

    const fileType = file.type;
    const fileURL = URL.createObjectURL(file);

    if (fileType.startsWith("video/") || fileType === "image/gif") {
      setMediaType(fileType.startsWith("video/") ? "video" : "gif");
      setMediaURL(fileURL);
      setImage(null);
      setTopText("");
      setBottomText("");
    } else {
      setMediaType("image");
      setMediaURL(null);
      const reader = new FileReader();
      reader.onload = () => {
        const img = new window.Image();
        img.src = reader.result as string;
        img.onload = () => {
          const maxDisplayWidth =
            window.innerWidth < 768 ? window.innerWidth * 0.8 : 400;
          const aspectRatio = img.height / img.width;
          const displayHeight = maxDisplayWidth * aspectRatio;

          setImage({
            element: img,
            originalWidth: img.width,
            originalHeight: img.height,
            displayWidth: maxDisplayWidth,
            displayHeight: displayHeight,
            aspectRatio: aspectRatio,
          });

          setCanvasSize({ width: img.width, height: img.height });

          // Use adaptive positioning
          const positions = getAdaptiveTextPositions(aspectRatio);
          setTopTextPosition(positions.top);
          setBottomTextPosition(positions.bottom);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  // Auto-centering effects with adaptive positioning
  useEffect(() => {
    if (topTextRef.current && image) {
      requestAnimationFrame(() => {
        const topTextWidth = topTextRef.current?.getWidth() || 0;
        const positions = getAdaptiveTextPositions(image.aspectRatio);

        setTopTextPosition({
          x: Math.max((BASE_DISPLAY_WIDTH - topTextWidth) / 2, 0),
          y: positions.top.y, // Use adaptive Y position
        });
      });
    }
  }, [topText, topFontSize, image]);

  useEffect(() => {
    if (bottomTextRef.current && image) {
      requestAnimationFrame(() => {
        const bottomTextWidth = bottomTextRef.current?.getWidth() || 0;
        const positions = getAdaptiveTextPositions(image.aspectRatio);

        setBottomTextPosition({
          x: Math.max((BASE_DISPLAY_WIDTH - bottomTextWidth) / 2, 0),
          y: positions.bottom.y, // Use adaptive Y position
        });
      });
    }
  }, [bottomText, bottomFontSize, image]);

  const handleUndo = (): void => {
    setTopText("");
    setBottomText("");
    setTopTextPosition({ x: 100, y: 50 });
    setBottomTextPosition({ x: 100, y: 400 });
    setSelectedTextId(null);
  };

  const handleCustomTextChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    index: number
  ): void => {
    const cursorPosition = e.target.selectionStart;
    const newTexts = [...customTexts];
    const newText = e.target.value;
    newTexts[index].text = newText;

    setCustomTexts(newTexts);

    setTimeout(() => {
      e.target.setSelectionRange(cursorPosition, cursorPosition);

      if (newTexts[index].ref?.current) {
        shrinkOrGrowTextToFit(
          newTexts[index].ref,
          (newFontSize: number) => {
            const updatedTexts = [...newTexts];
            updatedTexts[index].fontSize = newFontSize;
            setCustomTexts(updatedTexts);
          },
          BASE_DISPLAY_WIDTH,
          40
        );
      }

      e.target.style.height = "auto";
      e.target.style.height = `${Math.min(e.target.scrollHeight, 96)}px`;
    }, 0);
  };

  const handleCustomTextColorChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ): void => {
    const newTexts = [...customTexts];
    newTexts[index].color = e.target.value;
    setCustomTexts(newTexts);
  };

  const addCustomText = (): void => {
    setCustomTexts((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: "",
        x: 50,
        y: 50,
        fontSize: 40,
        color: "#FFFFFF",
        ref: React.createRef<Konva.Text>(),
      },
    ]);
  };

  const removeCustomText = (id: number): void => {
    const updatedTexts = customTexts.filter((t) => t.id !== id);
    setCustomTexts(updatedTexts);
  };

  return (
    <div
      className={`flex flex-col ${
        image ? "px-12" : "md:px-26"
      } py-24 pt-32 lg:pt-16 lg:pb-12 items-center bg-[#121C26]  rounded-[16px] min-h-screen lg:min-h-[90%] lg:overflow-y-auto transition-colors duration-500`}
    >
      {/* Add Text Button - Desktop */}
      {textMode !== "default" && (
        <div
          className={`w-full px-4 transition-all duration-300 ${
            textMode === "spacing" ? "-ml-28" : "-ml-7"
          }`}
        >
          <div className="max-w-[500px] mx-auto md:max-w-[530px]">
            <div className="md:flex justify-start mb-4 hidden">
              <button
                onClick={addCustomText}
                className="bg-transparent flex items-center gap-1 border border-[#364097] px-2 py-1 text-[#ffffff] text-opacity-80 text-sm rounded-[4px] transition"
              >
                <AddImage />
                Add Text
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Layout Selector */}
      {mediaType === "image" && image && (
        <div
          className={`flex flex-col items-center space-y-4 w-full px-6 ${
            textMode === "spacing"
          }`}
        >
          <LayoutSelector
            textMode={textMode}
            spacingOption={spacingOption}
            onTextModeChange={handleTextModeChange}
            onSpacingOptionChange={handleSpacingOptionChange}
            isMobile={true}
            image={image}
          />
        </div>
      )}

      <div
        className={`${
          textMode === "default"
            ? "flex flex-row md:space-x-6 lg:space-x-6 mx-[2%] md:mx-[2%] justify-center"
            : "flex flex-row md:flex-row md:space-x-6 lg:space-x-6 mx-[2%] md:mx-[2%] justify-center"
        }`}
      >
        <div
          className={`flex flex-col items-center justify-center ${
            textMode === "default" ? "lg:gap-9" : "gap-1"
          }`}
        >
          {/* Text Input Controls */}
          <div className="">
            {mediaType === "image" && textMode !== "default" && (
              <div className="flex flex-col justify-center items-center space-y-3 bg-[#0C1219] lg:mr-[8px] rounded-[6px] px-4 lg:px-0 py-4">
                <div className="w-full lg:w-[90%] flex flex-row items-center space-x-4">
                  <textarea
                    placeholder={
                      textMode === "demotivational" ? "Title" : "Top Text"
                    }
                    value={topText}
                    onChange={(e) => {
                      handleTopTextChange(e);
                      e.target.style.height = "auto";
                      e.target.style.height = `${Math.min(
                        e.target.scrollHeight,
                        96
                      )}px`;
                    }}
                    className="p-1.5 border rounded-[3px] bg-white text-black w-full lg:w-[350px] max-w-xl focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-500"
                    rows={1}
                    style={{ maxHeight: "96px", lineHeight: "1.5" }}
                  />
                  <input
                    type="color"
                    value={topTextColor}
                    onChange={(e) => setTopTextColor(e.target.value)}
                    className="w-11 h-11 rounded-md border-none bg-transparent cursor-pointer shadow-sm focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-500"
                  />
                </div>

                <div className="w-full lg:w-[90%] flex flex-row items-center space-x-4">
                  <textarea
                    placeholder={
                      textMode === "demotivational"
                        ? "Description"
                        : "Bottom Text"
                    }
                    value={bottomText}
                    onChange={(e) => {
                      handleBottomTextChange(e);
                      e.target.style.height = "auto";
                      e.target.style.height = `${Math.min(
                        e.target.scrollHeight,
                        96
                      )}px`;
                    }}
                    className="w-full p-1.5 border bg-white text-black rounded-[3px] resize-none overflow-y-auto lg:w-[350px] max-w-xl focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-500"
                    rows={1}
                    style={{ maxHeight: "96px", lineHeight: "1.5" }}
                  />
                  <input
                    type="color"
                    value={bottomTextColor}
                    onChange={(e) => setBottomTextColor(e.target.value)}
                    className="w-11 h-11 rounded-md border-none bg-transparent cursor-pointer shadow-sm focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Custom Text Inputs */}
          {customTexts.map((item, index) => (
            <div key={item.id} className="relative">
              <button
                onClick={() => removeCustomText(item.id)}
                className="absolute -left-7 top-2 text-red-500 hover:text-red-700 text-lg font-bold"
                title="Remove this text"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <rect width="24" height="24" fill="none" />
                  <path
                    fill="#f43d3d"
                    d="M6.25 3A3.25 3.25 0 0 0 3 6.25v11.5A3.25 3.25 0 0 0 6.25 21h11.5A3.25 3.25 0 0 0 21 17.75V6.25A3.25 3.25 0 0 0 17.75 3zm1.97 5.22a.75.75 0 0 1 1.06 0L12 10.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L13.06 12l2.72 2.72a.75.75 0 1 1-1.06 1.06L12 13.06l-2.72 2.72a.75.75 0 0 1-1.06-1.06L10.94 12L8.22 9.28a.75.75 0 0 1 0-1.06"
                  />
                </svg>
              </button>

              <div className="flex flex-row items-center space-x-4 mt-">
                <textarea
                  placeholder={`Text #${index + 3}`}
                  value={item.text}
                  onChange={(e) => handleCustomTextChange(e, index)}
                  className="p-1 border rounded-sm w-full bg-white text-black lg:w-[350px] focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-500"
                  rows={1}
                  style={{ maxHeight: "96px", lineHeight: "1.5" }}
                />
                <input
                  type="color"
                  value={item.color}
                  onChange={(e) => handleCustomTextColorChange(e, index)}
                  className="w-10 h-10 rounded-md border-none bg-transparent cursor-pointer shadow-sm focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-500"
                />
              </div>
            </div>
          ))}

          {/* Preview Section */}
          <div className={`px-[4%] md:mx-[0%] rounded-md`}>
            <div
              className={`hidden md:flex ${
                textMode === "default" ? "-mt-[24px]" : ""
              }`}
            >
              {image && (
                <p className="text-[#FFFFFF] text-[14px] font-bold">Preview</p>
              )}
            </div>

            {/* Mobile Header with Add Text Button */}
            <div className="flex flex-row justify-between items-center md:hidden">
              <div>
                {image && (
                  <p className="text-[#FFFFFF] text-[14px] font-bold">
                    Preview
                  </p>
                )}
              </div>
              <div className="flex md:hidden">
                {textMode !== "default" && (
                  <div className="w-full px-">
                    <div className="">
                      <div className="justify-start">
                        <button
                          onClick={addCustomText}
                          className="bg-transparent flex items-center gap-1 border border-[#364097] px-2 py-1 text-[#ffffff] text-opacity-80 text-sm rounded-[4px] transition"
                        >
                          <AddImage /> Add Text
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* File Upload Dropzone */}
            <div
              className={`w-full max-w-[100%] md:max-w-[500px] 2xl:max-w-[800px] mx-auto ${
                textMode === "default" ? "mb-7" : "mb-1"
              }`}
            >
              {!image &&
                !mediaURL &&
                (textMode === "default" || textMode === "editor") && (
                  <div
                    className={`border-2 border-dashed rounded-lg p-16 lg:p-24 text-center cursor-pointer transition mb-6 ${
                      isDragging
                        ? "border-green-400 bg-green-100 bg-opacity-10"
                        : "border-gray-400 bg-darkbg"
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files[0];
                      if (file) {
                        const event = { target: { files: [file] } } as any;
                        handleImageUpload(event);
                      }
                    }}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <PostUploadIcon />

                      <p className="text-gray-300 font-medium">
                        Choose a file or drag it here
                      </p>
                    </div>
                  </div>
                )}

              <input
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.mp4,.webm,.ogg,.mov,.MP4,"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Canvas Container */}
            <div
              className={`w-full rounded-[6px] ${
                textMode === "demotivational" && "bg-black"
              } relative`}
              style={{ overflow: "hidden" }}
            >
              {/* File Upload Button */}
              {(image || mediaURL) && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute z-10 bg-white hover:bg-gray-100 text-black rounded-full p-2 shadow-md transition"
                  style={getButtonPosition()}
                  title="Change media"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              )}

              {/* GIF/Video Preview */}
              {(mediaType === "gif" || mediaType === "video") && mediaURL && (
                <div className="w-full max-w-[500px] mx-auto mb-4">
                  {mediaType === "gif" ? (
                    <img
                      src={mediaURL}
                      alt="GIF preview"
                      className="rounded-md w-full"
                    />
                  ) : (
                    <video
                      src={mediaURL}
                      controls
                      autoPlay
                      loop
                      muted
                      className="rounded-md w-full"
                    />
                  )}
                </div>
              )}

              <div
                className="w-full rounded-[6px] relative md:min-w-[400px] md:max-w-[400px]"
                style={{
                  overflow: "hidden",
                }}
              >
                {(mediaType === "image" ||
                  textMode === "spacing" ||
                  textMode === "demotivational") && (
                  <CanvasStage
                    image={image}
                    mediaType={mediaType}
                    canvasSize={canvasSize}
                    fallbackWidth={fallbackWidth}
                    defaultFallbackHeight={defaultFallbackHeight}
                    fallbackHeight={fallbackHeight}
                    topText={topText}
                    bottomText={bottomText}
                    topFontSize={topFontSize}
                    bottomFontSize={bottomFontSize}
                    topTextColor={topTextColor}
                    bottomTextColor={bottomTextColor}
                    customTexts={customTexts}
                    setCustomTexts={setCustomTexts}
                    // Position props
                    topTextPosition={topTextPosition}
                    setTopTextPosition={setTopTextPosition}
                    bottomTextPosition={bottomTextPosition}
                    setBottomTextPosition={setBottomTextPosition}
                    // Mode and layout props
                    textMode={textMode}
                    spacingOption={spacingOption}
                    // Selection props
                    selectedTextId={selectedTextId}
                    setSelectedTextId={setSelectedTextId}
                    // Refs
                    topTextRef={topTextRef}
                    bottomTextRef={bottomTextRef}
                    transformerRef={transformerRef}
                    // Utility functions
                    shrinkOrGrowTextToFit={shrinkOrGrowTextToFit}
                    getDemotivationalFitWidth={getDemotivationalFitWidth}
                    getDemotivationalFitHeight={getDemotivationalFitHeight}
                    // Responsive dimensions
                    demoImageWidth={demoImageWidth}
                    demoImageHeight={demoImageHeight}
                    onStageRef={handleStageRef}
                  />
                )}
              </div>
            </div>

            {/* Editor Upload Component */}
            <div className="w-full max-w-[400px] mx-auto pt-10">
              <UploadPost
                username={currentUser?.username || "anonymous"}
                userId={currentUser?.uid || "guest"}
                toggleModel={() => {}}
                getCanvasData={() => {
                  setSelectedTextId(null);

                  if (
                    stageRef.current &&
                    (stageRef.current as any).createExportCanvas
                  ) {
                    const exportCanvas = (
                      stageRef.current as any
                    ).createExportCanvas();
                    return exportCanvas;
                  }

                  if (stageRef.current) {
                    return stageRef.current.toCanvas({
                      pixelRatio: 1,
                      x: 0,
                      y: 0,
                      width: stageRef.current.width(),
                      height: stageRef.current.height(),
                    });
                  }

                  return null;
                }}
                imageUpload={uploadedFile}
                mediaType={mediaType}
                walletAddress={currentUser?.walletAddress || ""}
                canvasText={combinedCanvasText}
                image={image}
              />
            </div>
          </div>
        </div>

        {mediaType === "image" && image && (
          <div className={textMode !== "default" ? "-mt-[75px]" : "-mt-[17px]"}>
            <LayoutSelector
              textMode={textMode}
              spacingOption={spacingOption}
              onTextModeChange={handleTextModeChange}
              onSpacingOptionChange={handleSpacingOptionChange}
              isMobile={false}
              image={image}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PostEditor;
