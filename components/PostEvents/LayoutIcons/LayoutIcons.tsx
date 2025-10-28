'use client'

import React from "react";
import Image from "next/image";

// Define types
interface ImageData {
  element: HTMLImageElement;
  originalWidth: number;
  originalHeight: number;
  displayWidth: number;
  displayHeight: number;
  aspectRatio: number;
}

type IconSize = "mobile" | "desktop";
type SpacingOption = "top" | "bottom" | "both";

interface BaseIconProps {
  size?: IconSize;
}

interface ImageIconProps extends BaseIconProps {
  image: ImageData | null;
}

interface SpacingIconProps extends ImageIconProps {
  spacingOption?: SpacingOption;
}

interface DefaultSpacingIconProps extends BaseIconProps {
  spacingOption?: SpacingOption;
}

// Export types for use in other components
export type { ImageData, IconSize, SpacingOption };

// Icon components with image preview capability
export const EditorIconWithPreview: React.FC<ImageIconProps> = ({ 
  image, 
  size = "desktop" 
}) => {
  const dimensions = size === "mobile" ? "w-10 h-10" : "w-12 h-12";

  return (
    <div
      className={`${dimensions} border border-gray-500 overflow-hidden bg-gray-800 flex flex-col`}
    >
      {/* Image background */}
      <div className="flex-1 relative">
        {image ? (
          <Image
            src={image.element.src}
            alt="preview"
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gray-700"></div>
        )}

        {/* Text placement indicators */}
        <div className="absolute inset-0 flex flex-col justify-between p-1">
          <div className="w-full h-1 md:h-1.5 bg-white shadow-sm"></div>
          <div className="w-full h-1 md:h-1.5 bg-white shadow-sm"></div>
        </div>
      </div>
    </div>
  );
};

export const SpacingIconWithPreview: React.FC<SpacingIconProps> = ({
  image,
  spacingOption = "both",
  size = "desktop",
}) => {
  const dimensions = size === "mobile" ? "w-10 h-10" : "w-12 h-12";

  return (
    <div
      className={`${dimensions} border border-gray-500 overflow-hidden bg-gray-800 relative`}
    >
      <div className="w-full h-full">
        {image ? (
          <Image
            src={image.element.src}
            alt="preview"
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-700"></div>
        )}
      </div>

      <div className="absolute inset-0">
        {/* Top text bar - at the very top */}
        {(spacingOption === "top" || spacingOption === "both") && (
          <div className="absolute top-0 left-0 w-full h-1 md:h-1.5 bg-white shadow-sm"></div>
        )}

        {(spacingOption === "bottom" || spacingOption === "both") && (
          <div className="absolute bottom-0 left-0 w-full h-1 md:h-1.5 bg-white shadow-sm"></div>
        )}
      </div>
    </div>
  );
};

export const DemotivationalIconWithPreview: React.FC<ImageIconProps> = ({ 
  image, 
  size = "desktop" 
}) => {
  const dimensions = size === "mobile" ? "w-10 h-10" : "w-12 h-12";

  return (
    <div
      className={`${dimensions} bg-black border border-gray-600 overflow-hidden flex flex-col p-1`}
    >
      {/* Image area (smaller, centered) */}
      <div className="flex-1 flex items-center justify-center mb-1 relative">
        <div className="w-4/5 h-4/5 overflow-hidden bg-gray-800">
          {image ? (
            <Image
              src={image.element.src}
              alt="preview"
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-gray-700"></div>
          )}
        </div>
      </div>

      {/* Text areas */}
      <div className="flex flex-col items-center space-y-0.5">
        <div className="w-4/5 h-0.5 md:h-0.5 bg-white"></div>
        <div className="w-3/5 h-0.5 md:h-0.5 bg-white bg-opacity-60"></div>
      </div>
    </div>
  );
};

// Fallback icons when no image is uploaded (simplified versions)
export const DefaultEditorIcon: React.FC<BaseIconProps> = ({ 
  size = "desktop" 
}) => {
  const dimensions = size === "mobile" ? "w-8 h-8" : "w-12 h-12";

  return (
    <div
      className={`${dimensions} border border-gray-500 bg-gray-700 flex flex-col justify-between p-1`}
    >
      <div className="w-full h-1.5 bg-white rounded"></div>
      <div className="flex-1"></div>
      <div className="w-full h-1.5 bg-white rounded"></div>
    </div>
  );
};

export const DefaultSpacingIcon: React.FC<DefaultSpacingIconProps> = ({ 
  spacingOption = "both", 
  size = "desktop" 
}) => {
  const dimensions = size === "mobile" ? "w-8 h-8" : "w-12 h-12";

  return (
    <div
      className={`${dimensions} rounded-sm border border-gray-500 bg-gray-700 flex flex-col`}
    >
      {(spacingOption === "top" || spacingOption === "both") && (
        <div
          className="bg-white border-b border-gray-400 flex items-center justify-center"
          style={{ height: spacingOption === "top" ? "40%" : "25%" }}
        >
          <div className="w-3/4 h-1.5 bg-gray-600 rounded"></div>
        </div>
      )}

      <div className="flex-1 bg-gray-800"></div>

      {(spacingOption === "bottom" || spacingOption === "both") && (
        <div
          className="bg-white border-t border-gray-400 flex items-center justify-center"
          style={{ height: spacingOption === "bottom" ? "40%" : "25%" }}
        >
          <div className="w-3/4 h-1.5 bg-gray-600 rounded"></div>
        </div>
      )}
    </div>
  );
};

export const DefaultDemotivationalIcon: React.FC<BaseIconProps> = ({ 
  size = "desktop" 
}) => {
  const dimensions = size === "mobile" ? "w-8 h-8" : "w-12 h-12";

  return (
    <div
      className={`${dimensions} bg-black border border-gray-600 flex flex-col p-1`}
    >
      <div className="flex-1 flex items-center justify-center mb-1">
        <div className="w-4/5 h-3/5 border border-gray-400 bg-gray-700"></div>
      </div>

      <div className="flex flex-col items-center space-y-0.5">
        <div className="w-4/5 h-0.5 bg-white rounded"></div>
        <div className="w-3/5 h-0.5 bg-white bg-opacity-60 rounded"></div>
      </div>
    </div>
  );
};