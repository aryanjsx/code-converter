import React from 'react';

interface ConversionWorkspaceProps {
  leftPanel: React.ReactNode;
  centerPanel: React.ReactNode;
  rightPanel?: React.ReactNode;
}

const ConversionWorkspace: React.FC<ConversionWorkspaceProps> = ({
  leftPanel,
  centerPanel,
  rightPanel,
}) => {
  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden">
      <div className="hidden lg:flex w-72 shrink-0 flex-col border-r border-white/5 overflow-hidden bg-gray-950/30">
        {leftPanel}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {centerPanel}
      </div>

      {rightPanel && (
        <div className="hidden xl:block w-80 shrink-0 border-l border-white/5 overflow-y-auto custom-scrollbar bg-gray-950/30">
          {rightPanel}
        </div>
      )}
    </div>
  );
};

export default ConversionWorkspace;
