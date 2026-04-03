import React, { useState, useRef, useEffect } from 'react';

const PrivacyBadge: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-label="Privacy mode active"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/15 hover:border-emerald-500/40 transition-all cursor-pointer select-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span className="hidden sm:inline">Privacy Mode</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 glass rounded-xl shadow-2xl border border-white/10 p-4 z-50 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1 bg-emerald-500/10 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-white">Privacy Mode Enabled</span>
          </div>
          <ul className="space-y-2 text-xs text-gray-300 leading-relaxed">
            <li className="flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400 flex-shrink-0 mt-0.5"><polyline points="20 6 9 17 4 12" /></svg>
              <span>Your API key never leaves your browser except when sent directly to the selected AI provider.</span>
            </li>
            <li className="flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400 flex-shrink-0 mt-0.5"><polyline points="20 6 9 17 4 12" /></svg>
              <span>Uploaded code is processed only in memory and is never stored or logged.</span>
            </li>
            <li className="flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400 flex-shrink-0 mt-0.5"><polyline points="20 6 9 17 4 12" /></svg>
              <span>Requests go directly from your browser to the AI provider — no intermediary server.</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default PrivacyBadge;
