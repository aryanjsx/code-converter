
import React from 'react';
import { SUPPORTED_LANGUAGES } from '../constants';
import type { Language } from '../types';

interface LanguageSelectorProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  title: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ id, value, onChange, title }) => {
  return (
    <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
      <label htmlFor={id} className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">{title}</label>
      <div className="relative group">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all appearance-none cursor-pointer hover:bg-gray-800/80"
        >
          {SUPPORTED_LANGUAGES.map((lang: Language) => (
            <option key={lang.id} value={lang.id} className="bg-gray-900 text-gray-200">
              {lang.name}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 group-hover:text-indigo-400 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector;
