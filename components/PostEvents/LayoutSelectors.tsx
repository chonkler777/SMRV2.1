'use client'

import React, { useState } from "react";
import {
  EditorIconWithPreview,
  SpacingIconWithPreview,
  DemotivationalIconWithPreview,
  DefaultEditorIcon,
  DefaultSpacingIcon,
  DefaultDemotivationalIcon
} from "./LayoutIcons/LayoutIcons";


// Define types
interface ImageData {
  element: HTMLImageElement;
  originalWidth: number;
  originalHeight: number;
  displayWidth: number;
  displayHeight: number;
  aspectRatio: number;
}

type TextMode = "default" | "editor" | "spacing" | "demotivational";
type SpacingOption = "top" | "bottom" | "both";

interface LayoutSelectorProps {
  textMode: TextMode;
  spacingOption: SpacingOption;
  onTextModeChange: (mode: TextMode) => void;
  onSpacingOptionChange: (option: SpacingOption) => void;
  isMobile?: boolean;
  image?: ImageData | null;
}

interface TooltipProps {
  visible: boolean;
  text: string;
}

const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  textMode,
  spacingOption,
  onTextModeChange,
  onSpacingOptionChange,
  isMobile = false,
  image = null,
}) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const handleMouseOver = (itemName: string): void => {
    setActiveTooltip(itemName);
  };

  const handleMouseLeave = (): void => {
    setActiveTooltip(null);
  };

 

  if (isMobile) {
    return (
      <div
        className={`flex md:hidden flex-row gap-1 w-full justify-between transition-all duration-300 ${
          textMode === "spacing" ? "mt-16" : ""
        }`}
      >
        {/* Editor icon */}
        <span className="flex flex-col justify-center items-center">
          <button
            onClick={() => {
              onTextModeChange("editor");
              onSpacingOptionChange("both");
            }}
            className={`p-2 rounded-md border-2 transition ${
              textMode === "editor" ? "border-[#86EFAC]" : "border-transparent"
            }`}
          >
            {image ? (
              <EditorIconWithPreview image={image} size="mobile" />
            ) : (
              <DefaultEditorIcon size="mobile" />
            )}
          </button>
          <h1 className="text-[10px] -mt-1 text-white text-center">Add text</h1>
        </span>

        {/* Spacing icon row (main + top + bottom) */}
        <span className="flex flex-col justify-center items-center relative">
          {/* Show spacing options above the main icon when spacing mode is active */}
          {textMode === "spacing" && (
            <div className="absolute bottom-full mb-2 flex flex-col gap-1">
              <button
                onClick={() => {
                  onTextModeChange("spacing");
                  onSpacingOptionChange("top");
                }}
                className={`p-[1px] rounded-md border-2 transition ${
                  spacingOption === "top"
                    ? "border-[#86EFAC]"
                    : "border-transparent"
                }`}
                title="Top Only"
              >
                {image ? (
                  <SpacingIconWithPreview
                    image={image}
                    spacingOption="top"
                    size="mobile"
                  />
                ) : (
                  <DefaultSpacingIcon spacingOption="top" size="mobile" />
                )}
              </button>

              <button
                onClick={() => {
                  onTextModeChange("spacing");
                  onSpacingOptionChange("bottom");
                }}
                className={`p-[1px] rounded-md border-2 transition ${
                  spacingOption === "bottom"
                    ? "border-[#86EFAC]"
                    : "border-transparent"
                }`}
                title="Bottom Only"
              >
                {image ? (
                  <SpacingIconWithPreview
                    image={image}
                    spacingOption="bottom"
                    size="mobile"
                  />
                ) : (
                  <DefaultSpacingIcon spacingOption="bottom" size="mobile" />
                )}
              </button>
            </div>
          )}

          <button
            onClick={() => {
              onTextModeChange("spacing");
              onSpacingOptionChange("both");
            }}
            className={`p-2 rounded-md border-2 transition ${
              textMode === "spacing" ? "border-[#86EFAC]" : "border-transparent"
            }`}
          >
            {image ? (
              <SpacingIconWithPreview
                image={image}
                spacingOption="both"
                size="mobile"
              />
            ) : (
              <DefaultSpacingIcon spacingOption="both" size="mobile" />
            )}
          </button>
          <h1 className="text-[10px] -mt-1 text-white text-center">
            Add Top/Bottom text
          </h1>
        </span>

        <span className="flex flex-col justify-center items-center">
          <button
            onClick={() => {
              onTextModeChange("demotivational");
              onSpacingOptionChange("both");
            }}
            className={`p-2 rounded-md border-2 transition ${
              textMode === "demotivational"
                ? "border-[#86EFAC]"
                : "border-transparent"
            }`}
          >
            {image ? (
              <DemotivationalIconWithPreview image={image} size="mobile" />
            ) : (
              <DefaultDemotivationalIcon size="mobile" />
            )}
          </button>
          <h1 className="text-[10px] -mt-1 text-white text-center">
            "Demotivational"
          </h1>
        </span>
      </div>
    );
  }

  // Desktop layout - Now properly aligned
  return (
    <div className={`hidden mt- md:flex flex-col mt-8 gap-4 transition-all duration-300 ease-in-out ${textMode === "spacing" ? "pr-28" : ""}`}>
      <p className="text-[#FFFFFF] text-[14px] font-bold text-center whitespace-nowrap">Select Layout</p>
  
      {/* Add text icon with label */}
      <div className="flex flex-col items-center ">
        <p className="text-gray-200 text-xs font-medium">Add text</p>
        <div className="relative">
          <button
            onMouseOver={() => handleMouseOver("editor")}
            onMouseLeave={() => handleMouseLeave()}
            onClick={() => {
              onTextModeChange("editor");
              onSpacingOptionChange("both");
              handleMouseLeave();
            }}
            className={`w-full h-full flex cursor-pointer items-center justify-center p-2 rounded-md border transition ${
              textMode === "editor"
                ? "border-[#86EFAC] rounded-[6px]"
                : "border-transparent"
            }`}
          >
            {image ? (
              <EditorIconWithPreview image={image} size="desktop" />
            ) : (
              <DefaultEditorIcon size="desktop" />
            )}
          </button>
        </div>
      </div>
  
      {/* Top/Bottom text icon with label - Now aligned with others */}
      <div className="flex flex-col items-center ">
        <p className="text-gray-200 text-xs font-medium">Top/Bottom text</p>
        <div className="relative">
          {/* Main "both" spacing button - stays in the vertical line */}
          <button
            onMouseOver={() => handleMouseOver("spacing-both")}
            onMouseLeave={() => handleMouseLeave()}
            onClick={() => {
              onTextModeChange("spacing");
              onSpacingOptionChange("both");
              handleMouseLeave();
            }}
            className={`w-full h-full cursor-pointer flex items-center justify-center p-2 rounded-md border  ${
              textMode === "spacing" && spacingOption === "both"
                ? "border-[#86EFAC] rounded-[6px]"
                : "border-transparent"
            }`}
          >
            {image ? (
              <SpacingIconWithPreview
                image={image}
                spacingOption="both"
                size="desktop"
              />
            ) : (
              <DefaultSpacingIcon spacingOption="both" size="desktop" />
            )}
          </button>

          {/* Top spacing option - positioned to the right, same vertical level */}
          {textMode === "spacing" && (
            <button
              onMouseOver={() => handleMouseOver("spacing-top")}
              onMouseLeave={() => handleMouseLeave()}
              onClick={() => {
                onTextModeChange("spacing");
                onSpacingOptionChange("top");
              }}
              className={`absolute top-0 -right-[68px] p-2 cursor-pointer rounded-md border  ${
                textMode === "spacing" && spacingOption === "top"
                  ? "border-[#86EFAC] rounded-[6px]"
                  : "border-transparent"
              }`}
            >
              {image ? (
                <SpacingIconWithPreview
                  image={image}
                  spacingOption="top"
                  size="desktop"
                />
              ) : (
                <DefaultSpacingIcon spacingOption="top" size="desktop" />
              )}
            </button>
          )}

          {/* Bottom spacing option - positioned further to the right, same vertical level */}
          {textMode === "spacing" && (
            <button
              onMouseOver={() => handleMouseOver("spacing-bottom")}
              onMouseLeave={() => handleMouseLeave()}
              onClick={() => {
                onTextModeChange("spacing");
                onSpacingOptionChange("bottom");
              }}
              className={`absolute top-0 -right-[132px] cursor-pointer p-2 rounded-md border transition ${
                textMode === "spacing" && spacingOption === "bottom"
                  ? "border-[#86EFAC] rounded-[6px]"
                  : "border-transparent"
              }`}
            >
              {image ? (
                <SpacingIconWithPreview
                  image={image}
                  spacingOption="bottom"
                  size="desktop"
                />
              ) : (
                <DefaultSpacingIcon spacingOption="bottom" size="desktop" />
              )}
            </button>
          )}
        </div>
      </div>
  
      {/* Demotivational icon with label */}
      <div className="flex flex-col items-center">
        <p className="text-gray-200 text-xs font-medium">Demotivational</p>
        <div className="relative">
          <button
            onMouseOver={() => handleMouseOver("demotivational")}
            onMouseLeave={() => handleMouseLeave()}
            onClick={() => {
              onTextModeChange("demotivational");
              onSpacingOptionChange("both");
              handleMouseLeave();
            }}
            className={`w-full h-full flex items-center cursor-pointer justify-center p-2 rounded-md border transition ${
              textMode === "demotivational"
                ? "border-[#86EFAC] rounded-[6px]"
                : "border-transparent"
            }`}
          >
            {image ? (
              <DemotivationalIconWithPreview image={image} size="desktop" />
            ) : (
              <DefaultDemotivationalIcon size="desktop" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LayoutSelector;