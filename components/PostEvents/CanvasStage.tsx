'use client'

import React, { useRef, useEffect, RefObject } from "react";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Text as KonvaText,
  Transformer,
  Rect,
} from "react-konva";
import Konva from "konva";


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

interface CanvasStageProps {

  image: ImageData | null;
  mediaType: string;
  canvasSize: { width: number; height: number };
  fallbackWidth: number;
  defaultFallbackHeight: number;
  fallbackHeight: number;


  topText: string;
  bottomText: string;
  topFontSize: number;
  bottomFontSize: number;
  topTextColor: string;
  bottomTextColor: string;
  customTexts: CustomText[];
  setCustomTexts: React.Dispatch<React.SetStateAction<CustomText[]>>;

 
  topTextPosition: Position;
  setTopTextPosition: React.Dispatch<React.SetStateAction<Position>>;
  bottomTextPosition: Position;
  setBottomTextPosition: React.Dispatch<React.SetStateAction<Position>>;

  
  textMode: string;
  spacingOption: string;

  
  selectedTextId: string | number | null;
  setSelectedTextId: React.Dispatch<React.SetStateAction<string | number | null>>;


  topTextRef: RefObject<Konva.Text | null>;
  bottomTextRef: RefObject<Konva.Text | null>;
  transformerRef: RefObject<Konva.Transformer | null>;

  
  shrinkOrGrowTextToFit: (
    textRef: RefObject<Konva.Text | null>,
    setFontSize: (fontSize: number) => void,
    baseWidth: number,
    maxFontSize: number,
    customWidth?: number | null
  ) => void;
  getDemotivationalFitWidth: (img: HTMLImageElement) => number;
  getDemotivationalFitHeight: (img: HTMLImageElement) => number;

  
  demoImageWidth: number;
  demoImageHeight: number;


  onStageRef?: (stage: Konva.Stage) => void;
}

const CanvasStage: React.FC<CanvasStageProps> = ({
  
  image,
  fallbackWidth,
  defaultFallbackHeight,
  fallbackHeight,

 
  topText,
  bottomText,
  topFontSize,
  bottomFontSize,
  topTextColor,
  bottomTextColor,
  customTexts,
  setCustomTexts,

 
  topTextPosition,
  setTopTextPosition,
  bottomTextPosition,
  setBottomTextPosition,

  
  textMode,
  spacingOption,


  selectedTextId,
  setSelectedTextId,

 
  topTextRef,
  bottomTextRef,
  transformerRef,


  shrinkOrGrowTextToFit,
  getDemotivationalFitWidth,
  getDemotivationalFitHeight,


  demoImageHeight,


  onStageRef,
}) => {
  const stageRef = useRef<Konva.Stage | null>(null);

  const BASE_DISPLAY_WIDTH = typeof window !== "undefined" && window.innerWidth < 768 ? 350 : 400;
  

  useEffect(() => {
    if (onStageRef && stageRef.current) {
      onStageRef(stageRef.current);
    }
  }, [onStageRef, stageRef.current]);

  const getExportScaleFactor = (): number => {
    if (!image || !image.originalWidth) return 1;
    return image.originalWidth / BASE_DISPLAY_WIDTH;
  };

  const getDisplayImageWidth = (): number => {
    if (!image) return fallbackWidth;
    return BASE_DISPLAY_WIDTH;
  };

  const getDisplayImageHeight = (): number => {
    if (!image) return fallbackHeight;
    const aspectRatio = image.originalHeight / image.originalWidth;
    return BASE_DISPLAY_WIDTH * aspectRatio;
  };

  const getStageWidth = (): number => {
    if (image && image.originalWidth) {
      return getDisplayImageWidth();
    }
    if (textMode === "spacing" || textMode === "demotivational") {
      return fallbackWidth;
    }
    return fallbackWidth;
  };

  const getStageHeight = (): number => {
    if (image && image.originalHeight) {
      const displayHeight = getDisplayImageHeight();
      if (textMode === "demotivational") {
        const constrainedImageHeight = getDemotivationalFitHeight(image.element);
        return 50 + constrainedImageHeight + 130;
      }
      if (textMode === "spacing") {
        const spacingHeight = spacingOption === "both" ? 100 : 50;
        return displayHeight + spacingHeight;
      }
      return displayHeight;
    }

    if (textMode === "spacing") {
      const spacingHeight = spacingOption === "both" ? 100 : 50;
      return fallbackHeight + spacingHeight;
    }
    if (textMode === "demotivational") {
      return 50 + demoImageHeight + 130;
    }
    return defaultFallbackHeight;
  };

  const getDisplayFontSize = (baseFontSize: number): number => {
    return baseFontSize;
  };

  const getDisplayPosition = (position: Position): Position => {
    return {
      x: position.x,
      y: position.y,
    };
  };

  const getDisplaySpacing = (spacing: number): number => {
    return spacing;
  };

  const createExportCanvas = (): HTMLCanvasElement | null => {
    if (!image) {
      return stageRef.current?.toCanvas({
        pixelRatio: 1,
        x: 0,
        y: 0,
        width: getStageWidth(),
        height: getStageHeight(),
      }) || null;
    }

    const exportScale = getExportScaleFactor();

    let exportWidth = image.originalWidth;
    let exportHeight = image.originalHeight;

    if (textMode === "demotivational") {
      const constrainedImageHeight = getDemotivationalFitHeight(image.element);
      exportHeight = (50 + constrainedImageHeight + 130) * exportScale;
    } else if (textMode === "spacing") {
      const spacingHeight = spacingOption === "both" ? 100 : 50;
      exportHeight = image.originalHeight + spacingHeight * exportScale;
    }

    const tempStage = stageRef.current?.clone();
    if (!tempStage) return null;

    tempStage.size({
      width: exportWidth,
      height: exportHeight,
    });

    tempStage.scale({
      x: exportScale,
      y: exportScale,
    });

    const canvas = tempStage.toCanvas({
      pixelRatio: 1,
      x: 0,
      y: 0,
      width: exportWidth,
      height: exportHeight,
    });

    tempStage.destroy();

    return canvas;
  };

  useEffect(() => {
    if (stageRef.current) {
      (stageRef.current as any).createExportCanvas = createExportCanvas;
    }
  }, [image, textMode, spacingOption, topText, bottomText, customTexts]);

  const handleTextTransform = (e: Konva.KonvaEventObject<Event>): void => {
    const textNode = e.target as Konva.Text;
    const scaleX = textNode.scaleX();
    const scaleY = textNode.scaleY();

    const newWidth = Math.max(textNode.width() * scaleX, 50);
    textNode.width(newWidth);

    const oldFontSize = textNode.fontSize();
    const newFontSize = Math.max(oldFontSize * scaleY, 10);
    textNode.fontSize(newFontSize);

    textNode.scaleX(1);
    textNode.scaleY(1);
  };

  useEffect(() => {
    if (!transformerRef.current) return;

    if (selectedTextId === "topText") {
      transformerRef.current.nodes([topTextRef.current].filter(Boolean) as Konva.Node[]);
    } else if (selectedTextId === "bottomText") {
      transformerRef.current.nodes([bottomTextRef.current].filter(Boolean) as Konva.Node[]);
    } else {
      const selectedCustomText = customTexts.find((t) => t.id === selectedTextId);
      if (selectedCustomText && selectedCustomText.ref?.current) {
        transformerRef.current.nodes([selectedCustomText.ref.current]);
      } else {
        transformerRef.current.nodes([]);
      }
    }

    transformerRef.current.getLayer()?.batchDraw();
  }, [selectedTextId, customTexts, transformerRef, topTextRef, bottomTextRef]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (
        stageRef.current &&
        !stageRef.current.getStage().container().contains(e.target as Node)
      ) {
        setSelectedTextId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setSelectedTextId]);


  const handleCustomTextDragEnd = (e: Konva.KonvaEventObject<DragEvent>, itemId: string | number): void => {
    const updatedTexts = customTexts.map((t) =>
      t.id === itemId
        ? {
            ...t,
            x: e.target.x(),
            y: e.target.y(),
          }
        : t
    );
    setCustomTexts(updatedTexts);
  };

  const handleTopTextDragEnd = (e: Konva.KonvaEventObject<DragEvent>): void => {
    setTopTextPosition({
      x: e.target.x(),
      y: e.target.y() - (textMode === "spacing" ? getDisplaySpacing(50) : 0),
    });
  };

  const handleBottomTextDragEnd = (e: Konva.KonvaEventObject<DragEvent>): void => {
    setBottomTextPosition({
      x: e.target.x(),
      y: e.target.y() - (textMode === "spacing" ? getDisplaySpacing(50) : 0),
    });
  };

  const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>): void => {
    const clickedOnEmpty = e.target === e.target.getStage();
    const clickedOnImage = e.target.getClassName() === 'Image';
    if (clickedOnEmpty || clickedOnImage) {
      setSelectedTextId(null);
    }
  };

  return (
    <Stage
      ref={stageRef}
      width={getStageWidth()}
      height={getStageHeight()}
      className="w-full"
      onMouseDown={handleStageMouseDown}
    >
      <Layer>
        {/* Black background for demotivational mode */}
        {textMode === "demotivational" && (
          <Rect
            x={0}
            y={0}
            width={getStageWidth()}
            height={getStageHeight()}
            fill="black"
          />
        )}

        {/* Demotivational border rect */}
        {image && textMode === "demotivational" && (
          <Rect
            x={
              (getStageWidth() - getDemotivationalFitWidth(image.element)) / 2 -
              getDisplaySpacing(2)
            }
            y={getDisplaySpacing(50) - getDisplaySpacing(2)}
            width={
              getDemotivationalFitWidth(image.element) + getDisplaySpacing(4)
            }
            height={
              getDemotivationalFitHeight(image.element) + getDisplaySpacing(4)
            }
            fillEnabled={false}
          />
        )}

        {/* Spacing bars */}
        {textMode === "spacing" && (
          <>
            {(spacingOption === "top" || spacingOption === "both") && (
              <Rect
                x={0}
                y={0}
                width={getStageWidth()}
                height={getDisplaySpacing(50)}
                fill="white"
              />
            )}
            {(spacingOption === "bottom" || spacingOption === "both") && (
              <Rect
                x={0}
                y={
                  getDisplayImageHeight() +
                  (spacingOption === "both" 
                    ? getDisplaySpacing(50)
                    : 0)
                }
                width={getStageWidth()}
                height={getDisplaySpacing(50)}
                fill="white"
              />
            )}
          </>
        )}

        {/* Placeholder text when no image */}
        {!image &&
          (textMode === "spacing" || textMode === "demotivational") && (
            <KonvaText
              text="Click the + icon to upload file"
              fontSize={getDisplayFontSize(16)}
              fontFamily="Arial"
              fill={textMode === "demotivational" ? "white" : "gray"}
              align="center"
              width={getStageWidth() - getDisplaySpacing(20)}
              x={getDisplaySpacing(10)}
              y={
                textMode === "demotivational"
                  ? getDisplaySpacing(50) +
                    getDisplayImageHeight() / 2 -
                    getDisplaySpacing(10)
                  : getStageHeight() / 1.5 - getDisplaySpacing(10)
              }
            />
          )}

        {/* Main image */}
        {image && image.originalWidth && image.originalHeight && (
          <KonvaImage
            image={image.element}
            width={
              textMode === "demotivational"
                ? getDemotivationalFitWidth(image.element)
                : getDisplayImageWidth()
            }
            height={
              textMode === "demotivational"
                ? getDemotivationalFitHeight(image.element)
                : getDisplayImageHeight()
            }
            x={
              textMode === "demotivational"
                ? (getStageWidth() - getDemotivationalFitWidth(image.element)) / 2
                : 0
            }
            y={
              textMode === "spacing"
                ? spacingOption === "top" || spacingOption === "both"
                  ? getDisplaySpacing(50)
                  : 0
                : textMode === "demotivational"
                ? getDisplaySpacing(50)
                : 0
            }
          />
        )}

        {/* Top text for non-demotivational modes */}
        {topText && textMode !== "demotivational" && (
          <KonvaText
            ref={topTextRef}
            text={topText}
            fontSize={getDisplayFontSize(topFontSize)}
            fontFamily="Impact"
            fontStyle="bold"
            fill={topTextColor}
            stroke="black"
            strokeWidth={getDisplaySpacing(2)}
            draggable
            x={getDisplayPosition(topTextPosition).x}
            y={
              getDisplayPosition(topTextPosition).y +
              (textMode === "spacing" &&
              (spacingOption === "top" || spacingOption === "both")
                ? getDisplaySpacing(50)
                : 0)
            }
            align="center"
            verticalAlign="middle"
            onDragEnd={handleTopTextDragEnd}
            onClick={() => setSelectedTextId("topText")}
            onTransform={handleTextTransform}
          />
        )}

        {/* Bottom text for non-demotivational modes */}
        {bottomText && textMode !== "demotivational" && (
          <KonvaText
            ref={bottomTextRef}
            text={bottomText}
            fontSize={getDisplayFontSize(bottomFontSize)}
            fontFamily="Impact"
            fontStyle="bold"
            fill={bottomTextColor}
            stroke="black"
            strokeWidth={getDisplaySpacing(2)}
            draggable
            x={getDisplayPosition(bottomTextPosition).x}
            y={
              getDisplayPosition(bottomTextPosition).y +
              (textMode === "spacing" &&
              (spacingOption === "top" || spacingOption === "both")
                ? getDisplaySpacing(50)
                : 0)
            }
            offsetY={(bottomTextRef.current?.getHeight() || 0) * 0.7}
            align="center"
            verticalAlign="middle"
            onDragEnd={handleBottomTextDragEnd}
            onClick={() => setSelectedTextId("bottomText")}
            onTransform={handleTextTransform}
          />
        )}

        {/* Top text for demotivational mode */}
        {topText && textMode === "demotivational" && (
          <KonvaText
            ref={topTextRef}
            text={topText}
            fontSize={getDisplayFontSize(20)}
            draggable
            fontFamily="alexandria"
            fill={topTextColor}
            x={getDisplaySpacing(10)}
            y={
              getDisplaySpacing(50) +
              getDemotivationalFitHeight(image?.element || new Image()) +
              getDisplaySpacing(20)
            }
            align="center"
            width={getStageWidth() - getDisplaySpacing(20)}
            onClick={() => setSelectedTextId("topText")}
          />
        )}

        {/* Bottom text for demotivational mode */}
        {bottomText && textMode === "demotivational" && (
          <KonvaText
            ref={bottomTextRef}
            text={bottomText}
            fontSize={getDisplayFontSize(13)}
            fontFamily="alexandria"
            fill="#FFFFFFCC"
            draggable
            x={getDisplaySpacing(10)}
            y={
              getDisplaySpacing(50) +
              getDemotivationalFitHeight(image?.element || new Image()) +
              getDisplaySpacing(50)
            }
            align="center"
            width={getStageWidth() - getDisplaySpacing(20)}
            onClick={() => setSelectedTextId("bottomText")}
          />
        )}

        {/* Watermark */}
        {image?.element?.width && image?.element?.height && (
          <KonvaText
            text="CHONKLER.COM"
            fontSize={getDisplayFontSize(12)}
            fontFamily="Impact"
            fill="white"
            fontStyle="bold"
            stroke="black"
            strokeWidth={1}
            opacity={0.8}
            x={getDisplaySpacing(10)}
            y={
              textMode === "demotivational"
                ? getStageHeight() - getDisplaySpacing(20)
                : (textMode === "spacing"
                    ? getDisplayImageHeight() +
                      (spacingOption === "both" || spacingOption === "top"
                        ? getDisplaySpacing(50)
                        : 0)
                    : getDisplayImageHeight()) - getDisplaySpacing(15)
            }
          />
        )}

        {/* Custom texts */}
        {customTexts.map((item) => (
          <KonvaText
            key={item.id}
            ref={item.ref}
            text={item.text.toUpperCase()}
            fontSize={getDisplayFontSize(item.fontSize)}
            fontFamily="Impact"
            fill={item.color}
            stroke="black"
            strokeWidth={getDisplaySpacing(2)}
            draggable
            x={getDisplayPosition({ x: item.x || 10, y: item.y || 0 }).x}
            y={
              getDisplayPosition({
                x: item.x || 10,
                y:
                  item.y ||
                  (getStageHeight() - getDisplayFontSize(item.fontSize)) / 2,
              }).y
            }
            verticalAlign="middle"
            align="center"
            onDragEnd={(e) => handleCustomTextDragEnd(e, item.id)}
            onTransform={handleTextTransform}
            onClick={() => setSelectedTextId(item.id)}
          />
        ))}

        {/* Transformer */}
        <Transformer ref={transformerRef} />
      </Layer>
    </Stage>
  );
};

export default CanvasStage;