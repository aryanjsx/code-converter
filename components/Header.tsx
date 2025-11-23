
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-gray-900/30 backdrop-blur-md sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">CodexConvert</h1>
          <p className="text-xs text-gray-400 font-medium">Multi-Language Converter</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <a href="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Documentation</a>
        <a href="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">GitHub</a>
      </div>
    </header>
  );
};

export default Header;
