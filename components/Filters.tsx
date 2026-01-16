
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { DeliveryRecord } from '../types';

interface FiltersProps {
  records: DeliveryRecord[];
  filterValues: {
    'IOM NO.': string;
    BUYER: string;
    'FABRIC COMPOSITION': string;
    CONSTRUCTION: string;
    COLOR: string;
  };
  setFilterValues: React.Dispatch<React.SetStateAction<{
    'IOM NO.': string;
    BUYER: string;
    'FABRIC COMPOSITION': string;
    CONSTRUCTION: string;
    COLOR: string;
  }>>;
  dateFilter: {
    from: string;
    to: string;
  };
  setDateFilter: React.Dispatch<React.SetStateAction<{
    from: string;
    to: string;
  }>>;
}

const SearchableSelect: React.FC<{
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  placeholder: string;
}> = ({ label, value, options, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    return options.filter(opt => 
      opt.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
        {label}
      </label>
      <div 
        className="group relative flex items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <input
          type="text"
          className="block w-full pl-3 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-none cursor-pointer"
          placeholder={placeholder}
          value={value || search}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!isOpen) setIsOpen(true);
            if (value) onChange(''); 
          }}
          onFocus={() => {
            setIsOpen(true);
            setSearch('');
          }}
        />
        <div className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-400 pointer-events-none">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-auto no-scrollbar">
          <div 
            className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 cursor-pointer font-medium border-b border-gray-50"
            onClick={() => {
              onChange('');
              setSearch('');
              setIsOpen(false);
            }}
          >
            All {label}s
          </div>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, idx) => (
              <div
                key={idx}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 transition-colors ${value === opt ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'}`}
                onClick={() => {
                  onChange(opt);
                  setSearch('');
                  setIsOpen(false);
                }}
              >
                {opt}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-400 italic">No matches found</div>
          )}
        </div>
      )}
    </div>
  );
};

const Filters: React.FC<FiltersProps> = ({ records, filterValues, setFilterValues, dateFilter, setDateFilter }) => {
  const getUniqueValues = (key: keyof typeof filterValues) => {
    const values = records.map(r => String(r[key] || '').trim()).filter(Boolean);
    return Array.from(new Set(values)).sort();
  };

  const handleFilterChange = (key: keyof typeof filterValues, value: string) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
  };

  const handleDateChange = (key: 'from' | 'to', value: string) => {
    setDateFilter(prev => ({ ...prev, [key]: value }));
  };

  const filterConfigs: { key: keyof typeof filterValues; label: string }[] = [
    { key: 'IOM NO.', label: 'IOM Number' },
    { key: 'BUYER', label: 'Buyer' },
    { key: 'FABRIC COMPOSITION', label: 'Fabric Composition' },
    { key: 'CONSTRUCTION', label: 'Construction' },
    { key: 'COLOR', label: 'Color' }
  ];

  const hasActiveFilters = Object.values(filterValues).some(v => v !== '') || dateFilter.from !== '' || dateFilter.to !== '';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {filterConfigs.map(({ key, label }) => (
          <SearchableSelect
            key={key}
            label={label}
            value={filterValues[key]}
            options={getUniqueValues(key)}
            placeholder={`Search ${label}...`}
            onChange={(val) => handleFilterChange(key, val)}
          />
        ))}
      </div>

      <div className="pt-4 border-t border-gray-100">
        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Date wise filter
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
              From Date
            </label>
            <input
              type="date"
              value={dateFilter.from}
              onChange={(e) => handleDateChange('from', e.target.value)}
              className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 transition outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
              To Date
            </label>
            <input
              type="date"
              value={dateFilter.to}
              onChange={(e) => handleDateChange('to', e.target.value)}
              className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 transition outline-none"
            />
          </div>
          
          {hasActiveFilters && (
            <div className="lg:col-start-4 flex justify-end">
              <button
                onClick={() => {
                  setFilterValues({
                    'IOM NO.': '',
                    BUYER: '',
                    'FABRIC COMPOSITION': '',
                    CONSTRUCTION: '',
                    COLOR: ''
                  });
                  setDateFilter({ from: '', to: '' });
                }}
                className="text-xs font-bold text-red-500 hover:text-red-700 transition flex items-center py-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                RESET ALL FILTERS
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Filters;
