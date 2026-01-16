
import React, { useState } from 'react';
import { DeliveryRecord } from '../types';

interface DataTableProps {
  records: DeliveryRecord[];
}

const DataTable: React.FC<DataTableProps> = ({ records }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const totalPages = Math.ceil(records.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentRecords = records.slice(startIndex, startIndex + rowsPerPage);

  // Helper to format date to DD-MM-YY, including handling Excel serial numbers
  const formatDate = (val: any) => {
    if (val === null || val === undefined || val === '') return '-';
    
    let date: Date;
    
    // Check if it's an Excel serial number (e.g., 45291.00023)
    if (typeof val === 'number' || !isNaN(Number(val)) && !isNaN(parseFloat(val))) {
      const serial = parseFloat(val);
      // Excel dates are number of days since Dec 30, 1899
      date = new Date((serial - 25569) * 86400 * 1000);
    } else {
      date = new Date(val);
    }

    if (isNaN(date.getTime())) return val;

    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = String(date.getFullYear()).slice(-2);
    return `${d}-${m}-${y}`;
  };

  // Strictly defined columns based on user request (13 columns)
  const columns = [
    { key: 'IOM NO.', label: 'IOM NO.' },
    { key: 'BUYER', label: 'BUYER' },
    { key: 'FABRIC COMPOSITION', label: 'FABRIC COMPOSITION' },
    { key: 'CONSTRUCTION', label: 'CONSTRUCTION' },
    { key: 'WEAVE', label: 'WEAVE' },
    { key: 'COLOR', label: 'COLOR' },
    { key: 'EMERIZING', label: 'EMERIZING' },
    { key: 'Dyeing Floor', label: 'Dyeing Floor' },
    { key: 'Dye MC Name', label: 'Dye MC Name' },
    { key: 'Finish Date', label: 'Finish Date', isDate: true },
    { key: 'DELIVERY DATE', label: 'DELIVERY DATE', isDate: true },
    { key: 'DELIVERY QTY. (YDS)', label: 'DELIVERY QTY. (YDS)' },
    { key: 'Remarks', label: 'Remarks' }
  ];

  return (
    <div className="flex flex-col bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky left-0 bg-white z-20">
        <h3 className="font-bold text-slate-800 uppercase tracking-tight">Full Report Data (66 Columns)</h3>
        <div className="flex gap-4">
          <select value={rowsPerPage} onChange={e => setRowsPerPage(Number(e.target.value))} className="text-sm border rounded px-2 py-1 outline-none">
            <option value={20}>20 Rows</option>
            <option value={50}>50 Rows</option>
            <option value={100}>100 Rows</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto relative custom-scrollbar">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-4 py-3 text-left text-[10px] font-extrabold text-slate-500 uppercase tracking-widest whitespace-nowrap border-b border-r border-slate-100 ${idx === 0 ? 'sticky left-0 bg-slate-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]' : ''}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentRecords.map((record, rIdx) => (
              <tr key={rIdx} className="hover:bg-blue-50/50 transition-colors group">
                {columns.map((col, cIdx) => {
                  const rawValue = record[col.key];
                  const displayValue = col.isDate ? formatDate(rawValue) : (rawValue ?? '-');
                  
                  return (
                    <td key={cIdx} className={`px-4 py-3 text-[11px] text-slate-600 border-r border-slate-50 whitespace-nowrap ${cIdx === 0 ? 'sticky left-0 bg-white group-hover:bg-blue-50/50 z-10 font-bold text-slate-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]' : ''}`}>
                      {displayValue === '' ? '-' : displayValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 bg-slate-50 border-t flex items-center justify-between sticky left-0">
        <span className="text-xs text-slate-500">Showing {startIndex + 1}-{Math.min(startIndex + rowsPerPage, records.length)} of {records.length}</span>
        <div className="flex gap-2">
          <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="px-3 py-1 border rounded text-xs hover:bg-white disabled:opacity-50">Prev</button>
          <span className="text-xs font-bold py-1">Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded text-xs hover:bg-white disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
