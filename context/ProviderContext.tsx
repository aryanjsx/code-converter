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
  rememberKey: boolean;
  setRememberKey: (value: boolean) => void;
  clearApiKey: () => void;
}

const STORAGE_KEY = 'codex-convert-provider';
const REMEMBER_FLAG = 'codex-convert-remember-key';

const DEFAULT_CONFIG: ProviderConfig = {
  provider: 'openai',
  model: 'gpt-4o-mini',
  apiKey: '',
  baseURL: 'https://api.openai.com/v1',
};

function loadConfig(): ProviderConfig {
  try {
    // One-time migration: remove old localStorage data
    localStorage.removeItem('codex-convert-provider');
  } catch { /* noop */ }

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const shouldRemember = sessionStorage.getItem(REMEMBER_FLAG) === 'true';
      return {
        provider: typeof parsed.provider === 'string' ? parsed.provider : DEFAULT_CONFIG.provider,
        model: typeof parsed.model === 'string' ? parsed.model : DEFAULT_CONFIG.model,
        baseURL: typeof parsed.baseURL === 'string' ? parsed.baseURL : DEFAULT_CONFIG.baseURL,
        apiKey: shouldRemember && typeof parsed.apiKey === 'string' ? parsed.apiKey : '',
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
  const [rememberKey, setRememberKeyRaw] = useState<boolean>(
    () => sessionStorage.getItem(REMEMBER_FLAG) === 'true'
  );

  useEffect(() => {
    try {
      const toStore: Record<string, string> = {
        provider: providerConfig.provider,
        model: providerConfig.model,
        baseURL: providerConfig.baseURL,
      };
      if (rememberKey) {
        toStore.apiKey = providerConfig.apiKey;
      }
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch { /* sessionStorage unavailable */ }
  }, [providerConfig, rememberKey]);

  const setProviderConfig = useCallback((config: ProviderConfig) => {
    setProviderConfigRaw(config);
  }, []);

  const updateProviderConfig = useCallback((partial: Partial<ProviderConfig>) => {
    setProviderConfigRaw(prev => ({ ...prev, ...partial }));
  }, []);

  const setRememberKey = useCallback((value: boolean) => {
    setRememberKeyRaw(value);
    try {
      if (value) {
        sessionStorage.setItem(REMEMBER_FLAG, 'true');
      } else {
        sessionStorage.removeItem(REMEMBER_FLAG);
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          delete parsed.apiKey;
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        }
      }
    } catch { /* noop */ }
  }, []);

  const clearApiKey = useCallback(() => {
    setProviderConfigRaw(prev => ({ ...prev, apiKey: '' }));
    setRememberKeyRaw(false);
    try {
      sessionStorage.removeItem(REMEMBER_FLAG);
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        delete parsed.apiKey;
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
    } catch { /* noop */ }
  }, []);

  const isConfigValid = !!(
    providerConfig.apiKey.trim() &&
    providerConfig.baseURL.trim() &&
    providerConfig.model.trim()
  );

  return (
    <ProviderContext.Provider value={{
      providerConfig, setProviderConfig, updateProviderConfig,
      isConfigValid, rememberKey, setRememberKey, clearApiKey,
    }}>
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
