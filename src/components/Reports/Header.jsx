import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Calendar, Check } from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();

// အနောက် ၅ နှစ် မှ အရှေ့ ၅ နှစ်အထိ Year List
const YEARS = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

export default function Header({ onFilterChange }) {
  const [view, setView] = useState('month');
  const [month, setMonth] = useState('this_month');
  const [year, setYear] = useState(currentYear);
  const [open, setOpen] = useState({ picker: false, view: false }); 
  
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => !containerRef.current?.contains(e.target) && setOpen({ picker: false, view: false });
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleChange = (v, m, y) => {
    setView(v); setMonth(m); setYear(y);
    setOpen({ picker: false, view: false });
    if (onFilterChange) onFilterChange({ view: v, month: m, year: y });
  };

  const lastMonthIndex = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthName = MONTHS[lastMonthIndex];

  const label = view === 'year' 
    ? year 
    : (month === 'this_month' 
        ? 'This Month' 
        : month === 'last_month' 
          ? lastMonthName 
          : MONTHS[month]);

  const availableMonths = year === currentYear 
    ? MONTHS.slice(0, currentMonth + 1) 
    : (year < currentYear ? MONTHS : []);
    
  const Item = ({ val, active, onClick }) => (
    <button onClick={onClick} className="w-full flex justify-between px-3.5 py-2 hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors">
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
          <button onClick={() => setOpen({ picker: !open.picker, view: false })} className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-xl text-sm font-medium shadow-sm hover:bg-gray-50">
            <Calendar className="w-4 h-4 text-gray-500" /> {label} <ChevronDown className="w-4 h-4" />
          </button>
          
          {open.picker && (
            <div className="absolute right-0 mt-2 w-44 bg-white border rounded-xl shadow-lg py-2 z-50 max-h-64 overflow-y-auto">
              {view === 'month' ? (
                <>
                  <Item val="This Month" active={month === 'this_month'} onClick={() => handleChange('month', 'this_month', year)} />
                  <Item val={lastMonthName} active={month === 'last_month'} onClick={() => handleChange('month', 'last_month', year)} />
                  
                  {availableMonths.map((m, i) => (
                    <Item key={m} val={m} active={month === i} onClick={() => handleChange('month', i, year)} />
                  ))}
                </>
              ) : (
                YEARS.map(y => <Item key={y} val={y} active={year === y} onClick={() => handleChange('year', month, y)} />)
              )}
            </div>
          )}
        </div>

        {/* View Mode Switcher (+) Dropdown */}
        <div className="relative">
          <button onClick={() => setOpen({ picker: false, view: !open.view })} className={`p-2 border rounded-xl shadow-sm ${open.view ? 'bg-blue-50 text-blue-600' : 'bg-white hover:bg-gray-50'}`}>
            <Plus className={`w-5 h-5 transition-transform ${open.view ? 'rotate-45' : ''}`} />
          </button>
          
          {open.view && (
            <div className="absolute right-0 mt-2 w-36 bg-white border rounded-xl shadow-lg py-2 z-50">
              <Item val="Month View" active={view === 'month'} onClick={() => handleChange('month', month, year)} />
              <Item val="Year View" active={view === 'year'} onClick={() => handleChange('year', month, year)} />
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}