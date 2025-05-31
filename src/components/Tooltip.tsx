import React, { useState } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  if (!content) return <>{children}</>; // Não renderiza tooltip se não houver conteúdo

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="tooltip-trigger-container"
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute z-10 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm dark:bg-gray-700 tooltip-content max-w-xs text-wrap">
          {content}
          <div className="tooltip-arrow" data-popper-arrow></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
 