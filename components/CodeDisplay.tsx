import React, { useState } from 'react';

interface CodeDisplayProps {
  originalCode: string | null;
  convertedCode: string | null;
  sourceLanguage: string;
  targetLanguage: string;
}

const CopyIcon: React.FC<{ isCopied: boolean }> = ({ isCopied }) => {
  if (isCopied) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
  );
};

const CodePanel: React.FC<{ title: string; code: string | null; language: string }> = ({ title, code, language }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <div className="flex justify-between items-center px-4 py-3 border-b border-white/5 bg-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${code ? 'bg-emerald-500' : 'bg-gray-600'}`}></div>
          <h3 className="text-sm font-semibold text-gray-300">{title}</h3>
        </div>
        <div className="flex items-center gap-3">
          {code !== null && language && <span className="text-xs font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20">{language}</span>}
          {title === 'Converted Code' && code && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-default group"
              disabled={isCopied}
              aria-label="Copy converted code"
            >
              <CopyIcon isCopied={isCopied} />
              <span className="group-hover:underline decoration-indigo-500 underline-offset-2">{isCopied ? 'Copied!' : 'Copy'}</span>
            </button>
          )}
        </div>
      </div>
      <div className="p-0 overflow-auto flex-1 custom-scrollbar bg-gray-950/50 relative">
        {code !== null ? (
          <pre className="text-sm font-mono leading-relaxed p-4">
            <code className={`language-${language.toLowerCase()}`}>{code}</code>
          </pre>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
            <p className="text-sm font-medium">
              {title === 'Original Code'
                ? 'Select a file to view content'
                : 'Converted code appears here'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};


const CodeDisplay: React.FC<CodeDisplayProps> = ({ originalCode, convertedCode, sourceLanguage, targetLanguage }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 h-full divide-y lg:divide-y-0 lg:divide-x divide-white/5">
      <CodePanel title="Original Code" code={originalCode} language={sourceLanguage} />
      <CodePanel title="Converted Code" code={convertedCode} language={targetLanguage} />
    </div>
  );
};

export default CodeDisplay;