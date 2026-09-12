import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Calendar, Check } from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();

const YEARS = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

export default function Header({ onFilterChange }) {
  const [view, setView] = useState('month');
  const [month, setMonth] = useState('this_month');
  const [year, setYear] = useState(currentYear);
  const [open, setOpen] = useState({ picker: false, view: false }); 
  
  const containerRef = useRef(null);

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({ view: 'month', month: 'this_month', year: currentYear });
    }
  }, []);

  useEffect(() => {
    const handleClick = (e) => !containerRef.current?.contains(e.target) && setOpen({ picker: false, view: false });
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

 
  const handleChange = (v, m, y) => {
    let updatedYear = y;
    let updatedMonth = m;

    if (m === 'this_month') {
      updatedYear = currentYear;
    } 
    
    else if (m === 'last_month') {
      updatedYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    }

    setView(v); 
    setMonth(updatedMonth); 
    setYear(updatedYear);
    setOpen({ picker: false, view: false });

    if (onFilterChange) {
      onFilterChange({ view: v, month: updatedMonth, year: updatedYear });
    }
  };

  const lastMonthIndex = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthName = MONTHS[lastMonthIndex];

 
  const label = view === 'year' 
    ? `${year}` 
    : (month === 'this_month' 
        ? 'This Month' 
        : month === 'last_month' 
          ? `${lastMonthName}` 
          : `${MONTHS[month]} ${year}`);

  
  const availableMonths = year === currentYear 
    ? MONTHS.slice(0, currentMonth + 1) 
    : (year < currentYear ? MONTHS : []);
    
  const Item = ({ val, active, onClick }) => (
    <button onClick={onClick} className="w-full flex justify-between items-center px-3.5 py-2 hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors">
      <span>{val}</span> {active && <Check className="w-4 h-4 text-blue-600" />}
    </button>
  );

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">MD Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Executive overview of meetings and actions</p>
      </div>

      <div className="flex items-center gap-3" ref={containerRef}>
        
        {/* Dynamic Date Picker Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setOpen({ picker: !open.picker, view: false })} 
            className="flex items-center gap-2 bg-white border border-gray-200 px-3.5 py-2 rounded-xl text-sm font-medium shadow-sm hover:bg-gray-50"
          >
            <Calendar className="w-4 h-4 text-gray-500" /> {label} <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          
          {open.picker && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50 max-h-72 overflow-y-auto">
              
              
              <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 border-b mb-1 flex justify-between items-center">
                <span>SELECT {view.toUpperCase()}</span>
                {view === 'month' && (
                  <select 
                    value={year} 
                    onChange={(e) => {
                      const selectedY = parseInt(e.target.value, 10);
                      handleChange('month', typeof month === 'number' ? month : currentMonth, selectedY);
                    }}
                    className="text-xs bg-gray-100 rounded px-1.5 py-0.5 font-bold text-gray-700 border-none focus:outline-none cursor-pointer"
                  >
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                )}
              </div>

              {view === 'month' ? (
                <>
                  {year === currentYear && (
                    <>
                      <Item val="This Month" active={month === 'this_month'} onClick={() => handleChange('month', 'this_month', currentYear)} />
                      <Item val={lastMonthName} active={month === 'last_month'} onClick={() => handleChange('month', 'last_month', currentYear)} />
                      <div className="my-1 border-t border-gray-100" />
                    </>
                  )}
                  
                  {availableMonths.map((m, i) => (
                    <Item key={m} val={`${m} ${year}`} active={month === i} onClick={() => handleChange('month', i, year)} />
                  ))}
                </>
              ) : (
                YEARS.map(y => (
                  <Item key={y} val={`${y}`} active={year === y} onClick={() => handleChange('year', month, y)} />
                ))
              )}
            </div>
          )}
        </div>

        {/* View Mode Switcher (+) Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setOpen({ picker: false, view: !open.view })} 
            className={`p-2 border rounded-xl shadow-sm transition-colors ${open.view ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white hover:bg-gray-50 border-gray-200'}`}
            title="Switch View Mode"
          >
            <Plus className={`w-5 h-5 transition-transform duration-200 ${open.view ? 'rotate-45' : ''}`} />
          </button>
          
          {open.view && (
            <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50">
              <Item val="Month View" active={view === 'month'} onClick={() => handleChange('month', month, year)} />
              <Item val="Year View" active={view === 'year'} onClick={() => handleChange('year', month, year)} />
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}