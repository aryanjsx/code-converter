import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import type { AppView } from './Sidebar';

export type { AppView } from './Sidebar';

interface AppLayoutProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  topBarTitle: string;
  topBarSubtitle?: string;
  topBarActions?: React.ReactNode;
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  activeView,
  onNavigate,
  topBarTitle,
  topBarSubtitle,
  topBarActions,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-black text-gray-200 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/[0.07] blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-500/[0.07] blur-[100px]" />
      </div>

      <Sidebar
        activeView={activeView}
        onNavigate={onNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden z-10 min-w-0">
        <TopBar
          title={topBarTitle}
          subtitle={topBarSubtitle}
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
          actions={topBarActions}
        />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
