import React, { useState } from 'react';
import { PROVIDER_PRESETS, PROVIDER_MODELS } from '../constants';
import { useProvider } from '../context/ProviderContext';
import ModelSelector from './ModelSelector';

const ProviderPicker: React.FC = () => {
  const { providerConfig, updateProviderConfig, rememberKey, setRememberKey, clearApiKey } = useProvider();
  const [showKey, setShowKey] = useState(false);
  const [isOpen, setIsOpen] = useState(() => !providerConfig.apiKey);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const isCustom = providerConfig.provider === 'custom';

  const handleProviderChange = (id: string) => {
    const preset = PROVIDER_PRESETS.find(p => p.id === id);
    updateProviderConfig({
      provider: id,
      baseURL: preset?.baseUrl ?? '',
      models: preset?.defaultModel ? [preset.defaultModel] : [],
    });
  };

  const inputClass =
    'w-full p-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-200 text-sm ' +
    'focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all ' +
    'placeholder-gray-500 hover:bg-gray-800/80';

  const labelClass = 'text-xs font-bold text-gray-400 uppercase tracking-wider';

  const currentPreset = PROVIDER_PRESETS.find(p => p.id === providerConfig.provider);

  return (
    <div className="glass rounded-2xl shadow-xl animate-fade-in overflow-hidden">
      {/* Header / toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-indigo-500/10 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
              <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
              <rect x="9" y="9" width="6" height="6" />
              <line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" />
              <line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" />
              <line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" />
              <line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-200">AI Provider</span>
          {providerConfig.apiKey && currentPreset && providerConfig.models.length > 0 && (
            <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
              {currentPreset.name} &middot; {providerConfig.models[0]}
              {providerConfig.models.length > 1 && ` +${providerConfig.models.length - 1}`}
            </span>
          )}
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Expandable body */}
      {isOpen && (
        <div className="px-5 pb-5 pt-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {/* Provider */}
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Provider</label>
            <div className="relative">
              <select
                value={providerConfig.provider}
                onChange={(e) => handleProviderChange(e.target.value)}
                className={`${inputClass} appearance-none cursor-pointer pr-8`}
              >
                {PROVIDER_PRESETS.map(p => (
                  <option key={p.id} value={p.id} className="bg-gray-900 text-gray-200">
                    {p.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
              </div>
            </div>
          </div>

          {/* Models */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className={labelClass}>Models</label>
            <ModelSelector
              models={providerConfig.models}
              onChange={(models) => updateProviderConfig({ models })}
              suggestedModels={PROVIDER_MODELS[providerConfig.provider] ?? []}
            />
          </div>

          {/* API Key */}
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>API Key</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={providerConfig.apiKey}
                onChange={(e) => updateProviderConfig({ apiKey: e.target.value })}
                placeholder="Enter your API key"
                className={`${inputClass} pr-10`}
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setShowKey(prev => !prev)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-0.5"
                tabIndex={-1}
                aria-label={showKey ? 'Hide API key' : 'Show API key'}
              >
                {showKey ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                )}
              </button>
            </div>
            <div className="flex items-center justify-between mt-1">
              <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none hover:text-gray-300 transition-colors">
                <input
                  type="checkbox"
                  checked={rememberKey}
                  onChange={(e) => setRememberKey(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-800 text-indigo-500 focus:ring-indigo-500/50 w-3 h-3 accent-indigo-500"
                />
                Remember for this session
              </label>
              {providerConfig.apiKey && (
                <button
                  type="button"
                  onClick={clearApiKey}
                  className="text-xs text-red-400/70 hover:text-red-300 transition-colors"
                >
                  Clear key
                </button>
              )}
            </div>
          </div>

          {/* Base URL — shown inline when Custom is selected */}
          {isCustom && (
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Base URL</label>
              <input
                type="text"
                value={providerConfig.baseURL}
                onChange={(e) => updateProviderConfig({ baseURL: e.target.value })}
                placeholder="https://api.example.com/v1"
                className={inputClass}
                spellCheck={false}
              />
            </div>
          )}

          {/* Custom provider warning */}
          {isCustom && (
            <div className="col-span-1 md:col-span-2 bg-amber-500/10 border border-amber-500/20 text-amber-200 px-3 py-2.5 rounded-lg flex items-start gap-2.5 text-xs leading-relaxed">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
              <span>You are sending your code to a custom AI endpoint. Ensure you trust this provider before converting.</span>
            </div>
          )}

          {/* Advanced Settings — base URL override for non-custom providers */}
          {!isCustom && (
            <div className="col-span-1 md:col-span-2">
              <button
                type="button"
                onClick={() => setShowAdvanced(prev => !prev)}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className={`transition-transform duration-200 ${showAdvanced ? 'rotate-90' : ''}`}
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                Advanced Settings
              </button>

              {showAdvanced && (
                <div className="mt-3 flex flex-col gap-1.5">
                  <label className={labelClass}>Base URL Override</label>
                  <input
                    type="text"
                    value={providerConfig.baseURL}
                    onChange={(e) => updateProviderConfig({ baseURL: e.target.value })}
                    placeholder={currentPreset?.baseUrl ?? 'https://api.openai.com/v1'}
                    className={inputClass}
                    spellCheck={false}
                  />
                  <p className="text-xs text-gray-500 mt-0.5">
                    Auto-assigned from provider. Only change this if you use a proxy or self-hosted endpoint.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProviderPicker;
