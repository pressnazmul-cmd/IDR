
import React from 'react';
import { ViewMode } from '../types';

interface HeaderProps {
  currentView: ViewMode;
  setView: (view: ViewMode) => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  isSyncing?: boolean;
  onRefresh?: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView, isLoggedIn, onLogout, isSyncing, onRefresh }) => {
  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold text-lg shadow-sm shadow-blue-400">I</div>
          <h1 className="text-xl font-bold tracking-tight hidden sm:block">IOM DELIVERY REPORT</h1>
          <h1 className="text-lg font-bold tracking-tight sm:hidden">IOM REPORT</h1>
        </div>
        
        <nav className="flex items-center space-x-2 sm:space-x-4">
          {currentView === 'view' && onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isSyncing}
              className={`p-2 rounded-lg text-gray-300 hover:text-white hover:bg-slate-800 transition-all ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Sync with Google Sheets"
            >
              <svg className={`h-5 w-5 ${isSyncing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}

          <button
            onClick={() => setView('view')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentView === 'view' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            View
          </button>
          
          <div className="flex items-center">
            <button
              onClick={() => setView('admin')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'admin' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Admin
            </button>
            {isLoggedIn && currentView === 'admin' && (
              <button
                onClick={onLogout}
                className="ml-2 text-[10px] text-gray-500 hover:text-red-400 font-bold uppercase tracking-wider"
              >
                Logout
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
