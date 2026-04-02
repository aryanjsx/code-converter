import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ToastProvider } from './context/ToastContext';
import { ProviderProvider } from './context/ProviderContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ProviderProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ProviderProvider>
  </React.StrictMode>
);