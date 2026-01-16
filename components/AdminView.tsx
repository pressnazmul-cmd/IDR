
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { DeliveryRecord } from '../types';
import { getSupabaseConfig, setSupabaseConfig, getSupabase } from '../services/supabaseClient';

interface AdminViewProps {
  onUpload: (records: DeliveryRecord[]) => Promise<void>;
  recordsCount: number;
}

const AdminView: React.FC<AdminViewProps> = ({ onUpload, recordsCount }) => {
  const [mode, setMode] = useState<'file' | 'sheets'>('file');
  const [isProcessing, setIsProcessing] = useState(false);
  const [sheetUrl, setSheetUrl] = useState(() => localStorage.getItem('gsheet_url') || '');
  const [pendingRecords, setPendingRecords] = useState<DeliveryRecord[] | null>(null);
  const [status, setStatus] = useState<{ type: 'info' | 'success' | 'error', message: string, code?: string } | null>(null);
  const [config, setConfig] = useState(getSupabaseConfig());
  const [showConfig, setShowConfig] = useState(false); 
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => { localStorage.setItem('gsheet_url', sheetUrl); }, [sheetUrl]);

  const handleSaveConfig = () => {
    setSupabaseConfig(config.url, config.key);
    setStatus({ type: 'success', message: 'Credentials saved locally.' });
    setShowConfig(false);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setStatus({ type: 'info', message: 'Testing Supabase...' });
    setSupabaseConfig(config.url, config.key);
    try {
      const { error } = await getSupabase().from('delivery_records').select('count', { count: 'exact', head: true });
      if (error) throw error;
      setStatus({ type: 'success', message: 'Connected! Database structure verified.' });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message, code: err.code });
    } finally { setIsTesting(false); }
  };

  const setupSQL = `
DROP TABLE IF EXISTS delivery_records;
CREATE TABLE delivery_records (
  id bigint primary key generated always as identity,
  iom_no bigint,
  ref_iom_fab_iom text,
  buyer text,
  garments text,
  fabric_composition text,
  construction text,
  weave text,
  blend_non_blend text,
  finish_gsm numeric,
  greige_width numeric,
  finish_width numeric,
  color text,
  order_qty_yds numeric,
  emerizing text,
  emerizing_mc_name text,
  finish text,
  process_route text,
  development_type text,
  user_name text,
  iom_creation_date text,
  weaving_iom_recv_date text,
  proposed_greige_rcv_date text,
  finished_s_y_ready_date_tentative text,
  actual_grey_issue_date text,
  otp_iom_cration_to_delivery text,
  otp_weaving text,
  grey_rcvd_yds numeric,
  department text,
  stage_1 text,
  stage_2 text,
  grey_hold text,
  actual_sample_ready_date text,
  process_otp text,
  greige_source text,
  floor text,
  lead_time_iom_creation_to_dispatch text,
  singeing_desize_process_date text,
  singeing_qty numeric,
  bleach text,
  mercerized text,
  peach text,
  ptr_days numeric,
  dye_lab_in text,
  dye_lab_out text,
  dye_lab_days numeric,
  dyeing_in_date text,
  dyeing_floor text,
  dye_mc_name text,
  dyeing_qty numeric,
  topping_1 text,
  topping_2 text,
  topping_3 text,
  topping_4 text,
  dyeing_out_date text,
  dyeing_days numeric,
  print_in_date text,
  print_qty numeric,
  print_out_date text,
  print_days numeric,
  finish_date text,
  delivery_date text,
  delivery_qty_yds numeric,
  before_ins_mkt_rcvd_qty_yds numeric,
  mcp_folder_status text,
  remarks text,
  created_at timestamptz default now()
);
ALTER TABLE delivery_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON delivery_records FOR ALL USING (true) WITH CHECK (true);
  `.trim();

  const handleCommit = async () => {
    if (!pendingRecords) return;
    setIsProcessing(true);
    setStatus({ type: 'info', message: 'Syncing to cloud database...' });
    try {
      await onUpload(pendingRecords);
      setStatus({ type: 'success', message: 'Sync complete! Cloud data updated.' });
      setPendingRecords(null);
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message, code: err.code });
    } finally { setIsProcessing(false); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {(status?.code === 'PGRST205' || status?.code === '42703') && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-4 animate-in zoom-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center font-bold text-xl">!</div>
            <div>
              <h3 className="text-amber-900 font-bold">Cloud Table Missing</h3>
              <p className="text-amber-700 text-xs">The database table needs to be created in your Supabase SQL Editor.</p>
            </div>
          </div>
          <pre className="bg-slate-900 p-4 rounded-xl text-[9px] text-emerald-400 overflow-x-auto max-h-40">{setupSQL}</pre>
          <div className="flex justify-end">
            <button onClick={() => { navigator.clipboard.writeText(setupSQL); alert("SQL Copied! Paste this in Supabase SQL Editor."); }} className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg text-xs font-bold transition">Copy SQL Script</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Push to Cloud</h2>
            <p className="text-slate-500 text-sm">Upload your 65-column Excel report to sync with Supabase.</p>
          </div>
          <button onClick={() => setShowConfig(!showConfig)} className="p-2 text-slate-400 hover:text-slate-600 transition">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
        </div>

        {showConfig && (
          <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-4 animate-in slide-in-from-top-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Project URL</label>
                <input type="text" value={config.url} onChange={(e) => setConfig({...config, url: e.target.value})} className="w-full px-3 py-2 rounded border text-xs font-mono outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Anon Key</label>
                <input type="password" value={config.key} onChange={(e) => setConfig({...config, key: e.target.value})} className="w-full px-3 py-2 rounded border text-xs font-mono outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={handleTestConnection} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded transition">{isTesting ? 'Testing...' : 'Test Connection'}</button>
              <button onClick={handleSaveConfig} className="px-6 py-2 bg-slate-800 text-white text-xs font-bold rounded transition hover:bg-black">Save Credentials</button>
            </div>
          </div>
        )}

        <div className="flex bg-slate-100 p-1 rounded-xl mb-6 w-fit">
          <button onClick={() => setMode('file')} className={`px-6 py-2 rounded-lg text-sm font-bold transition ${mode === 'file' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Local File</button>
          <button onClick={() => setMode('sheets')} className={`px-6 py-2 rounded-lg text-sm font-bold transition ${mode === 'sheets' ? 'bg-white shadow text-emerald-600' : 'text-slate-500'}`}>Google Sheets</button>
        </div>

        {!pendingRecords ? (
          mode === 'file' ? (
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-16 text-center relative hover:bg-blue-50/30 hover:border-blue-300 transition-all cursor-pointer group">
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".csv, .xlsx" onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setIsProcessing(true);
                const reader = new FileReader();
                reader.onload = (evt) => {
                  try {
                    const bstr = evt.target?.result;
                    const wb = XLSX.read(bstr, { type: 'binary' });
                    const ws = wb.Sheets[wb.SheetNames[0]];
                    const data = XLSX.utils.sheet_to_json(ws) as DeliveryRecord[];
                    setPendingRecords(data);
                    setStatus({ type: 'info', message: `${data.length} records ready for sync.` });
                  } catch (err) {
                    setStatus({ type: 'error', message: 'Failed to parse Excel file.' });
                  } finally { setIsProcessing(false); }
                };
                reader.readAsBinaryString(file);
              }} />
              <div className="mx-auto w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              </div>
              <p className="font-bold text-slate-700 text-lg">Click to select Report File</p>
              <p className="text-slate-400 text-sm mt-1">Excel (.xlsx) or CSV format</p>
            </div>
          ) : (
            <div className="p-8 bg-emerald-50 rounded-2xl border border-emerald-100">
               <label className="text-[10px] font-bold text-emerald-600 uppercase block mb-2 ml-1">Google Sheets CSV Export URL</label>
               <div className="flex gap-3">
                 <input type="text" value={sheetUrl} onChange={(e) => setSheetUrl(e.target.value)} placeholder="https://docs.google.com/..." className="flex-grow px-4 py-3 rounded-xl border border-emerald-200 outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-mono" />
                 <button onClick={async () => {
                   setIsProcessing(true);
                   setStatus({ type: 'info', message: 'Fetching sheets data...' });
                   Papa.parse(sheetUrl, {
                     download: true, header: true, skipEmptyLines: true, dynamicTyping: true,
                     complete: (results) => {
                       setPendingRecords(results.data as DeliveryRecord[]);
                       setStatus({ type: 'info', message: `${results.data.length} records fetched from cloud.` });
                       setIsProcessing(false);
                     },
                     error: () => { setStatus({ type: 'error', message: 'Failed to fetch from Google Sheets URL.' }); setIsProcessing(false); }
                   });
                 }} className="bg-emerald-600 text-white px-8 rounded-xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition">Fetch</button>
               </div>
            </div>
          )
        ) : (
          <div className="bg-blue-50 p-8 rounded-2xl border border-blue-100 animate-in zoom-in duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>
                <div>
                  <h3 className="text-slate-900 font-bold text-lg">{pendingRecords.length} Records Loaded</h3>
                  <p className="text-slate-500 text-sm">Ready to overwrite cloud database.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setPendingRecords(null)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                <button onClick={handleCommit} disabled={isProcessing} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition active:scale-95">{isProcessing ? 'Syncing...' : 'Confirm Sync'}</button>
              </div>
            </div>
          </div>
        )}

        {status && <div className={`mt-6 p-4 rounded-xl text-xs font-mono border ${status.type === 'error' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-blue-50 text-blue-700 border-blue-100'} animate-in fade-in duration-300`}>{status.message}</div>}
      </div>
    </div>
  );
};

export default AdminView;
