import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Calendar, Check } from 'lucide-react';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonthNumber = currentDate.getMonth() + 1;

const YEARS = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

export default function Header({ filter, onFilterChange }) {
  const [open, setOpen] = useState({ picker: false, view: false });
  const containerRef = useRef(null);

  const view = filter?.view || 'month';
  const year = filter?.year ? parseInt(filter.year, 10) : currentYear;
  
  // 1-based Month Number
  const monthNum = typeof filter?.month === 'number'
    ? filter.month 
    : parseInt(filter?.month ?? currentMonthNumber, 10);

  const isThisMonth = year === currentYear && monthNum === currentMonthNumber;

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen({ picker: false, view: false });
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelectMonth = (mNum, yVal) => {
    setOpen({ picker: false, view: false });
    if (onFilterChange) {
      onFilterChange({
        view: 'month',
        month: mNum.toString(),
        year: yVal
      });
    }
  };

  const handleSelectYear = (yVal) => {
    setOpen({ picker: false, view: false });
    if (onFilterChange) {
      onFilterChange({
        view: view,
        month: monthNum.toString(),
        year: yVal
      });
    }
  };

  const handleViewChange = (newView) => {
    setOpen({ picker: false, view: false });
    if (onFilterChange) {
      onFilterChange({
        view: newView,
        month: monthNum.toString(),
        year: year
      });
    }
  };

  let label = '';
  if (view === 'year') {
    label = `${year}`;
  } else if (isThisMonth) {
    label = 'This Month';
  } else if (monthNum >= 1 && monthNum <= 12) {
    label = `${MONTHS[monthNum - 1]} ${year}`;
  } else {
    label = 'This Month';
  }

  const Item = ({ val, active, onClick }) => (
    <button 
      type="button"
      onClick={onClick} 
      className="w-full flex justify-between items-center px-3.5 py-2 hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors text-left"
    >
      <span>{val}</span> 
      {active && <Check className="w-4 h-4 text-blue-600" />}
    </button>
  );

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">MD Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Executive overview of meetings and actions</p>
      </div>

      <div className="flex items-center gap-3" ref={containerRef}>
        <div className="relative">
          <button 
            type="button"
            onClick={() => setOpen({ picker: !open.picker, view: false })} 
            className="flex items-center gap-2 bg-white border border-gray-200 px-3.5 py-2 rounded-xl text-sm font-medium shadow-sm hover:bg-gray-50"
          >
            <Calendar className="w-4 h-4 text-gray-500" /> 
            <span>{label}</span> 
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          
          {open.picker && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50 max-h-80 overflow-y-auto">
              
              <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 border-b mb-1 flex justify-between items-center">
                <span>SELECT {view.toUpperCase()}</span>
                {view === 'month' && (
                  <select 
                    value={year} 
                    onChange={(e) => {
                      const selectedY = parseInt(e.target.value, 10);
                      handleSelectMonth(monthNum, selectedY);
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
                      <Item 
                        val="This Month" 
                        active={isThisMonth} 
                        onClick={() => handleSelectMonth(currentMonthNumber, currentYear)} 
                      />
                      <div className="my-1 border-t border-gray-100" />
                    </>
                  )}
                  {MONTHS.map((mName, i) => {
                    const actualMonthNumber = i + 1;
                    if (year === currentYear && actualMonthNumber === currentMonthNumber) {
                      return null;
                    }

                    return (
                      <Item 
                        key={mName} 
                        val={`${mName} ${year}`} 
                        active={!isThisMonth && monthNum === actualMonthNumber} 
                        onClick={() => handleSelectMonth(actualMonthNumber, year)} 
                      />
                    );
                  })}
                </>
              ) : (
                YEARS.map(y => (
                  <Item 
                    key={y} 
                    val={`${y}`} 
                    active={year === y} 
                    onClick={() => handleSelectYear(y)} 
                  />
                ))
              )}
            </div>
          )}
        </div>
        
        <div className="relative">
          <button 
            type="button"
            onClick={() => setOpen({ picker: false, view: !open.view })} 
            className={`p-2 border rounded-xl shadow-sm transition-colors ${open.view ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white hover:bg-gray-50 border-gray-200'}`}
            title="Switch View Mode"
          >
            <Plus className={`w-5 h-5 transition-transform duration-200 ${open.view ? 'rotate-45' : ''}`} />
          </button>
          
          {open.view && (
            <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50">
              <Item 
                val="Month View" 
                active={view === 'month'} 
                onClick={() => handleViewChange('month')} 
              />
              <Item 
                val="Year View" 
                active={view === 'year'} 
                onClick={() => handleViewChange('year')} 
              />
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}