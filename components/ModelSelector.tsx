import React, { useState, useRef } from 'react';

interface ModelSelectorProps {
  models: string[];
  onChange: (models: string[]) => void;
  suggestedModels: string[];
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ models, onChange, suggestedModels }) => {
  const [customInput, setCustomInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleModel = (model: string) => {
    if (models.includes(model)) {
      onChange(models.filter(m => m !== model));
    } else {
      onChange([...models, model]);
    }
  };

  const addCustomModel = (value?: string) => {
    const trimmed = (value ?? customInput).trim();
    if (trimmed && !models.includes(trimmed)) {
      onChange([...models, trimmed]);
    }
    setCustomInput('');
  };

  const removeModel = (model: string) => {
    onChange(models.filter(m => m !== model));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addCustomModel();
    }
    if (e.key === 'Backspace' && !customInput) {
      const customModels = models.filter(m => !suggestedModels.includes(m));
      if (customModels.length > 0) {
        removeModel(customModels[customModels.length - 1]);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    if (text.includes(',')) {
      e.preventDefault();
      const newModels = text
        .split(',')
        .map(s => s.trim())
        .filter(s => s && !models.includes(s));
      if (newModels.length > 0) {
        onChange([...models, ...newModels]);
      }
    }
  };

  const customModels = models.filter(m => !suggestedModels.includes(m));

  return (
    <div className="flex flex-col gap-2.5">
      {/* Checkbox grid for suggested models */}
      {suggestedModels.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {suggestedModels.map(model => {
            const checked = models.includes(model);
            return (
              <label
                key={model}
                className={
                  'flex items-center gap-1.5 text-xs cursor-pointer select-none transition-colors py-0.5 ' +
                  (checked ? 'text-indigo-300' : 'text-gray-500 hover:text-gray-300')
                }
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleModel(model)}
                  className="rounded border-gray-600 bg-gray-800 text-indigo-500 focus:ring-indigo-500/50 w-3.5 h-3.5 accent-indigo-500 cursor-pointer"
                />
                <span className="font-mono">{model}</span>
              </label>
            );
          })}
        </div>
      )}

      {/* Custom model chips + input */}
      <div
        className={
          'flex flex-wrap gap-1.5 p-2 bg-gray-800/50 border border-gray-700/50 rounded-lg min-h-[38px] items-center ' +
          'focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500/50 transition-all ' +
          'hover:bg-gray-800/80 cursor-text'
        }
        onClick={() => inputRef.current?.focus()}
      >
        {customModels.map(model => (
          <span
            key={model}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-500/15 text-violet-300 rounded-md text-xs font-medium border border-violet-500/25 select-none"
          >
            {model}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeModel(model); }}
              className="text-violet-400/60 hover:text-white transition-colors ml-0.5"
              aria-label={`Remove ${model}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addCustomModel()}
          onPaste={handlePaste}
          placeholder={customModels.length === 0 ? 'Add custom model...' : 'Add more...'}
          className="flex-1 min-w-[100px] bg-transparent text-gray-200 text-sm outline-none placeholder-gray-500"
          spellCheck={false}
          autoComplete="off"
        />
      </div>

      {/* Footer info */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {models.length === 0
            ? 'Select at least one model to convert.'
            : models.length === 1
              ? '1 model selected.'
              : `${models.length} models selected — outputs will be compared side-by-side.`}
        </p>
      </div>
    </div>
  );
};

export default ModelSelector;
