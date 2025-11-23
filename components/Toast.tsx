import React, { useEffect } from 'react';
import type { ToastMessage } from '../context/ToastContext';

const Toast: React.FC<{ toast: ToastMessage; onDismiss: (id: number) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const defaultDuration = 5000;
    // Do not auto-dismiss if there are actions
    if (!toast.actions) {
      const timer = setTimeout(() => {
        onDismiss(toast.id);
      }, toast.duration || defaultDuration);
      return () => clearTimeout(timer);
    }
  }, [toast, onDismiss]);

  const typeClasses = {
    success: 'bg-green-600/90 border-green-500 text-white',
    error: 'bg-red-600/90 border-red-500 text-white',
    info: 'bg-indigo-600/90 border-indigo-500 text-white',
    warning: 'bg-yellow-600/90 border-yellow-500 text-gray-900',
  };

  const Icon = () => {
    switch (toast.type) {
      case 'success': return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
      case 'error': return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
      case 'info': return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
      case 'warning': return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
      default: return null;
    }
  };

  return (
    <div
      className={`relative w-80 max-w-sm rounded-lg shadow-lg border p-4 flex items-start gap-3 transform transition-all duration-300 animate-slide-in ${typeClasses[toast.type]}`}
      role="alert"
    >
      <div className="flex-shrink-0">
        <Icon />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{toast.message}</p>
        {toast.actions && (
          <div className="mt-2 flex gap-2">
            {toast.actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.onClick();
                  onDismiss(toast.id);
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-md ${toast.type === 'warning' ? 'bg-black/20 hover:bg-black/30 text-yellow-950' : 'bg-white/20 hover:bg-white/30'}`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/20"
        aria-label="Dismiss"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
       <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Toast;
