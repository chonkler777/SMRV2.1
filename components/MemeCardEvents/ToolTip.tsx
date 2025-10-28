'use client';

import { useState, useEffect, RefObject } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
    text: string;
    visible: boolean;
    itemRef: RefObject<HTMLElement | null>;
    tooltipRef?: RefObject<HTMLDivElement>;
}

const Tooltip: React.FC<TooltipProps> = ({ text, visible, itemRef, tooltipRef }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (visible && itemRef?.current) {
      const rect = itemRef.current.getBoundingClientRect();
      
      setPosition({
        top: rect.top + (rect.height / 2),
        left: rect.right + 8,
      });
    }
  }, [visible, itemRef]);

  if (!visible) return null;
  
  const getTooltipStyle = (): React.CSSProperties => {
    return {
      top: position.top,
      left: position.left,
      maxWidth: "224px",
      wordWrap: "break-word" as const,
      zIndex: 9999,
      transform: "translateY(-50%)",
    };
  };
  
  const getArrowClasses = (): string => {
    return 'absolute top-1/2 -left-1 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-[#C3C8CC]';
  };
  
  const tooltipElement = (
    <div 
      ref={tooltipRef}
      className="fixed px-2 py-1 bg-[#C3C8CC] shadow-[0_3px_7px_rgba(12,18,25,0.7)] w-auto text-[#25394E] font-semibold text-[12px] rounded whitespace-normal break-words"
      style={getTooltipStyle()}
    >
      {text}
      <div className={getArrowClasses()}></div>
    </div>
  );
  
  return createPortal(tooltipElement, document.body);
};

export default Tooltip;