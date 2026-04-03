import React from 'react';

interface TopBarProps {
  title: string;
  subtitle?: string;
  onToggleSidebar: () => void;
  actions?: React.ReactNode;
}

const TopBar: React.FC<TopBarProps> = ({ title, subtitle, onToggleSidebar, actions }) => {
  return (
    <header className="h-14 flex items-center justify-between px-4 lg:px-6 border-b border-white/5 bg-gray-900/30 backdrop-blur-md shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Toggle menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
        <div>
          <h2 className="text-sm font-semibold text-white leading-none">{title}</h2>
          {subtitle && <p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2">{actions}</div>
      )}
    </header>
  );
};

export default TopBar;
