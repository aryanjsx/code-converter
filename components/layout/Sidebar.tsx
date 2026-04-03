import React from 'react';
import PrivacyBadge from '../PrivacyBadge';

export type AppView = 'converter' | 'leaderboard';

interface SidebarProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate, isOpen, onClose }) => {
  const handleNav = (view: AppView) => {
    onNavigate(view);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-60 bg-gray-950/95 backdrop-blur-xl border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="px-5 h-14 flex items-center gap-3 border-b border-white/5 shrink-0">
          <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg shadow-lg shadow-indigo-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight leading-none">CodexConvert</h1>
            <p className="text-[10px] text-gray-500 mt-0.5">AI Code Platform</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <button
            onClick={() => handleNav('converter')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeView === 'converter'
                ? 'bg-indigo-500/15 text-indigo-300'
                : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            Converter
          </button>

          <button
            onClick={() => handleNav('leaderboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeView === 'leaderboard'
                ? 'bg-indigo-500/15 text-indigo-300'
                : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 21h8" /><path d="M12 17v4" /><path d="M7 4h10" />
              <path d="M9 4v4.5a.5.5 0 0 0 .5.5h5a.5.5 0 0 0 .5-.5V4" />
              <circle cx="12" cy="13" r="3" />
            </svg>
            Leaderboard
          </button>
        </nav>

        <div className="px-3 py-4 border-t border-white/5 space-y-2">
          <div className="px-1">
            <PrivacyBadge />
          </div>
          <a
            href="https://github.com/aryanjsx/code-converter"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-gray-300 transition-colors rounded-lg hover:bg-white/5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
            GitHub
          </a>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
