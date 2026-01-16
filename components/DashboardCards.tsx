
import React from 'react';
import { DeliveryRecord } from '../types';

interface DashboardCardsProps {
  records: DeliveryRecord[];
}

const DashboardCards: React.FC<DashboardCardsProps> = ({ records }) => {
  const totalIOM = records.length;
  
  const uniqueBuyers = new Set(records.map(r => String(r.BUYER || '').trim()).filter(Boolean)).size;
  
  const totalQty = records.reduce((sum, record) => {
    // Exact key from 66-column header
    const qty = parseFloat(String(record['DELIVERY QTY. (YDS)'] || 0)) || 0;
    return sum + qty;
  }, 0);

  const formatValue = (val: number) => {
    if (val >= 1000) {
      return (val / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 }) + ' K';
    }
    return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const stats = [
    {
      name: 'IOM Count',
      value: totalIOM,
      label: 'Count of IOM NO.',
      icon: (
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5l5 5v11a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'bg-blue-50 border-blue-100',
    },
    {
      name: 'Unique Buyers',
      value: uniqueBuyers,
      label: 'Distinct Buyer Count',
      icon: (
        <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'bg-indigo-50 border-indigo-100',
    },
    {
      name: 'Delivery Qty',
      value: formatValue(totalQty),
      label: 'Units (Yds)',
      icon: (
        <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: 'bg-emerald-50 border-emerald-100',
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat) => (
        <div key={stat.name} className={`p-6 rounded-2xl border ${stat.color} transition-transform hover:scale-[1.02] shadow-sm`}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              {stat.icon}
            </div>
            <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">{stat.label}</span>
          </div>
          <div className="flex flex-col">
            <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
            <p className="text-gray-600 font-medium mt-1">{stat.name}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;
