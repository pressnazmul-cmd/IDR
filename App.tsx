
import React, { useState, useEffect, useCallback } from 'react';
import { ViewMode, DeliveryRecord } from './types';
import { getLocalRecords, saveRecordsLocally, fetchFromSupabase, pushToSupabase } from './services/dataService';
import Header from './components/Header';
import ReportView from './components/ReportView';
import AdminView from './components/AdminView';
import Login from './components/Login';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>('view');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [records, setRecords] = useState<DeliveryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsSyncing(true);
    setFetchError(null);
    try {
      const cloudData = await fetchFromSupabase();
      setRecords(cloudData);
      await saveRecordsLocally(cloudData);
    } catch (err: any) {
      const msg = err.message || "Unknown database connection error.";
      console.warn("Supabase fetch failed:", msg);
      setFetchError(msg);
      
      const cached = await getLocalRecords();
      if (cached && cached.length > 0) {
        setRecords(cached);
      }
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpload = async (newRecords: DeliveryRecord[]) => {
    try {
      await pushToSupabase(newRecords);
      setRecords(newRecords);
      await saveRecordsLocally(newRecords);
    } catch (err: any) {
      console.error("Cloud push failed:", err.message);
      throw err; 
    }
  };

  if (loading && records.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4 max-w-md text-center px-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div>
            <p className="font-bold text-slate-800 text-lg">Connecting to Cloud</p>
            <p className="text-slate-500 text-xs mt-1">ldwxltpzaqcddblnnrlb.supabase.co</p>
          </div>
          {fetchError && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-[11px] text-red-600 font-mono break-words w-full shadow-sm">
              <span className="font-bold block mb-1 uppercase tracking-widest text-[9px]">Connection Status: Failed</span>
              {fetchError}
              <button 
                onClick={loadData}
                className="mt-3 block w-full py-2 bg-white border border-red-200 rounded-lg text-red-700 font-bold hover:bg-red-100 transition"
              >
                Retry Connection
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        currentView={view} 
        setView={setView} 
        isLoggedIn={isLoggedIn}
        onLogout={() => setIsLoggedIn(false)}
        isSyncing={isSyncing}
        onRefresh={loadData}
      />
      
      <main className="flex-grow p-4 md:p-8">
        {view === 'view' ? (
          <ReportView records={records} />
        ) : (
          !isLoggedIn ? (
            <Login onLoginSuccess={() => setIsLoggedIn(true)} />
          ) : (
            <AdminView onUpload={handleUpload} recordsCount={records.length} />
          )
        )}
      </main>

      <footer className="bg-white border-t py-6 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-2">
          <p className="text-sm text-gray-500 font-medium">© {new Date().getFullYear()} IOM Delivery Report System</p>
          <div className="flex items-center gap-4 text-[10px] uppercase font-bold tracking-widest">
            <span className="flex items-center text-emerald-600">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              Project ID: ldwxltpzaqcddblnnrlb
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-400">Lead Dev: Nazmul Ferdous</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
