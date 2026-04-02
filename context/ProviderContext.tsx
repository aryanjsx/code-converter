import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export interface ProviderConfig {
  provider: string;
  model: string;
  apiKey: string;
  baseURL: string;
}

interface ProviderContextType {
  providerConfig: ProviderConfig;
  setProviderConfig: (config: ProviderConfig) => void;
  updateProviderConfig: (partial: Partial<ProviderConfig>) => void;
  isConfigValid: boolean;
}

const STORAGE_KEY = 'codex-convert-provider';

const DEFAULT_CONFIG: ProviderConfig = {
  provider: 'openai',
  model: 'gpt-4o-mini',
  apiKey: '',
  baseURL: 'https://api.openai.com/v1',
};

function loadConfig(): ProviderConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        provider: typeof parsed.provider === 'string' ? parsed.provider : DEFAULT_CONFIG.provider,
        model: typeof parsed.model === 'string' ? parsed.model : DEFAULT_CONFIG.model,
        apiKey: typeof parsed.apiKey === 'string' ? parsed.apiKey : DEFAULT_CONFIG.apiKey,
        baseURL: typeof parsed.baseURL === 'string' ? parsed.baseURL : DEFAULT_CONFIG.baseURL,
      };
    }
  } catch {
    // Corrupted storage — fall back to defaults
  }
  return { ...DEFAULT_CONFIG };
}

const ProviderContext = createContext<ProviderContextType | undefined>(undefined);

export const ProviderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [providerConfig, setProviderConfigRaw] = useState<ProviderConfig>(loadConfig);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(providerConfig));
    } catch {
      // localStorage may be unavailable (e.g. incognito with quota exceeded)
    }
  }, [providerConfig]);

  const setProviderConfig = useCallback((config: ProviderConfig) => {
    setProviderConfigRaw(config);
  }, []);

  const updateProviderConfig = useCallback((partial: Partial<ProviderConfig>) => {
    setProviderConfigRaw(prev => ({ ...prev, ...partial }));
  }, []);

  const isConfigValid = !!(
    providerConfig.apiKey.trim() &&
    providerConfig.baseURL.trim() &&
    providerConfig.model.trim()
  );

  return (
    <ProviderContext.Provider value={{ providerConfig, setProviderConfig, updateProviderConfig, isConfigValid }}>
      {children}
    </ProviderContext.Provider>
  );
};

export const useProvider = (): ProviderContextType => {
  const context = useContext(ProviderContext);
  if (!context) {
    throw new Error('useProvider must be used within a ProviderProvider');
  }
  return context;
};
