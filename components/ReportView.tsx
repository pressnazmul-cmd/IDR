
import React, { useState, useMemo } from 'react';
import { DeliveryRecord } from '../types';
import DashboardCards from './DashboardCards';
import Filters from './Filters';
import DataTable from './DataTable';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Strictly defined visible columns based on user request (13 columns)
const VISIBLE_COLUMNS = [
  'IOM NO.',
  'BUYER',
  'FABRIC COMPOSITION',
  'CONSTRUCTION',
  'WEAVE',
  'COLOR',
  'EMERIZING',
  'Dyeing Floor',
  'Dye MC Name',
  'Finish Date',
  'DELIVERY DATE',
  'DELIVERY QTY. (YDS)',
  'Remarks'
];

interface ReportViewProps {
  records: DeliveryRecord[];
}

const ReportView: React.FC<ReportViewProps> = ({ records }) => {
  const [filterValues, setFilterValues] = useState({
    'IOM NO.': '',
    BUYER: '',
    'FABRIC COMPOSITION': '',
    CONSTRUCTION: '',
    COLOR: ''
  });

  const [dateFilter, setDateFilter] = useState({
    from: '',
    to: ''
  });

  // Date formatting helper for exports, handles Excel serials
  const formatExportDate = (val: any) => {
    if (val === null || val === undefined || val === '') return '-';
    
    let date: Date;
    
    if (typeof val === 'number' || !isNaN(Number(val)) && !isNaN(parseFloat(val))) {
      const serial = parseFloat(val);
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

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchText = (
        (!filterValues['IOM NO.'] || String(record['IOM NO.'] || '').toLowerCase().includes(filterValues['IOM NO.'].toLowerCase())) &&
        (!filterValues.BUYER || String(record.BUYER || '').toLowerCase().includes(filterValues.BUYER.toLowerCase())) &&
        (!filterValues['FABRIC COMPOSITION'] || String(record['FABRIC COMPOSITION'] || '').toLowerCase().includes(filterValues['FABRIC COMPOSITION'].toLowerCase())) &&
        (!filterValues.CONSTRUCTION || String(record.CONSTRUCTION || '').toLowerCase().includes(filterValues.CONSTRUCTION.toLowerCase())) &&
        (!filterValues.COLOR || String(record.COLOR || '').toLowerCase().includes(filterValues.COLOR.toLowerCase()))
      );

      if (!matchText) return false;

      // Date filtering
      if (dateFilter.from || dateFilter.to) {
        const deliveryDateStr = String(record['DELIVERY DATE'] || '');
        if (!deliveryDateStr) return false;

        let recordDate: Date;
        if (!isNaN(Number(deliveryDateStr))) {
          recordDate = new Date((parseFloat(deliveryDateStr) - 25569) * 86400 * 1000);
        } else {
          recordDate = new Date(deliveryDateStr);
        }

        if (isNaN(recordDate.getTime())) return true; 

        if (dateFilter.from) {
          const fromDate = new Date(dateFilter.from);
          if (recordDate < fromDate) return false;
        }

        if (dateFilter.to) {
          const toDate = new Date(dateFilter.to);
          toDate.setHours(23, 59, 59, 999);
          if (recordDate > toDate) return false;
        }
      }

      return true;
    });
  }, [records, filterValues, dateFilter]);

  const handleExportXlsx = () => {
    // Export ONLY the visible 13 columns with formatted dates
    const dataToExport = filteredRecords.map(record => {
      const cleanRecord: any = {};
      VISIBLE_COLUMNS.forEach(col => {
        let val = record[col];
        if (col === 'Finish Date' || col === 'DELIVERY DATE') {
          val = formatExportDate(val);
        }
        cleanRecord[col] = val ?? '-';
      });
      return cleanRecord;
    });

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Delivery_Report");
    XLSX.writeFile(wb, `Delivery_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handlePdfDownload = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    }) as any;

    doc.setFontSize(16);
    doc.text('IOM Delivery Report', 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

    const body = filteredRecords.map(record => 
      VISIBLE_COLUMNS.map(col => {
        let val = record[col];
        if (col === 'Finish Date' || col === 'DELIVERY DATE') {
          val = formatExportDate(val);
        }
        return String(val ?? '-');
      })
    );

    doc.autoTable({
      head: [VISIBLE_COLUMNS],
      body: body,
      startY: 28,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak' },
      headStyles: { fillStyle: 'DF', fillColor: [51, 65, 85], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save(`Delivery_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <DashboardCards records={filteredRecords} />
      
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-bold text-slate-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Search & Filters
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExportXlsx}
              className="flex items-center justify-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm active:scale-95 whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5l5 5v11a2 2 0 01-2 2z" />
              </svg>
              Export XLSX
            </button>
            <button
              onClick={handlePdfDownload}
              className="flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition shadow-sm active:scale-95 whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              PFD Download
            </button>
          </div>
        </div>
        <Filters 
          records={records} 
          filterValues={filterValues as any} 
          setFilterValues={setFilterValues as any} 
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <DataTable records={filteredRecords} />
      </div>
    </div>
  );
};

export default ReportView;
