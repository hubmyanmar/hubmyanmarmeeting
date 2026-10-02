import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  Calendar, 
  MapPin, 
  Download, 
  TrendingUp, 
  Check 
} from 'lucide-react';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonthNumber = currentDate.getMonth() + 1;

const YEARS = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
const formatDateForInput = (dateStr) => {
  if (!dateStr) return '';
  if (typeof dateStr === 'string') {
    return dateStr.split('T')[0];
  }
  return dateStr;
};

export default function Header({ 
  filter, 
  onFilterChange, 
  roomFilter = 'All Rooms', 
  onRoomChange, 
  onExport 
}) {
  const [open, setOpen] = useState({ picker: false, room: false, export: false });
  const [customStart, setCustomStart] = useState(formatDateForInput(filter?.startDate));
  const [customEnd, setCustomEnd] = useState(formatDateForInput(filter?.endDate));
  const [activeTab, setActiveTab] = useState(filter?.view || 'month');

  const containerRef = useRef(null);

  const view = filter?.view || 'month';
  const year = filter?.year ? parseInt(filter.year, 10) : currentYear;
  
  const monthNum = typeof filter?.month === 'number'
    ? filter.month 
    : parseInt(filter?.month ?? currentMonthNumber, 10);

  const isThisMonth = view === 'month' && year === currentYear && monthNum === currentMonthNumber;
  useEffect(() => {
  
    if (filter) {
      if (filter.startDate !== undefined) setCustomStart(formatDateForInput(filter.startDate));
      if (filter.endDate !== undefined) setCustomEnd(formatDateForInput(filter.endDate));
      if (filter.view) setActiveTab(filter.view);
    }
  }, [filter]);

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen({ picker: false, room: false, export: false });
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelectMonth = (mNum, yVal) => {
    const payload = {
      view: 'month',
      month: mNum.toString(),
      year: yVal
    };

    setOpen({ picker: false, room: false, export: false });
    if (onFilterChange) {
      onFilterChange(payload);
    } else {
      console.error(' [Header] onFilterChange prop is missing!');
    }
  };

  const handleSelectYear = (yVal) => {
    const payload = {
      view: 'year',
      month: monthNum.toString(),
      year: yVal
    };

    setOpen({ picker: false, room: false, export: false });
    if (onFilterChange) {
      onFilterChange(payload);
    } else {
      console.error(' [Header] onFilterChange prop is missing!');
    }
  };

  const handleApplyCustomDate = (e) => {
    if (e) e.preventDefault();

    if (!customStart || !customEnd) {
      return;
    }

    if (new Date(customStart) > new Date(customEnd)) {
      alert("Start Date သည် End Date ထက် ပိုမကြီးရပါ။");
      return;
    }

    const payload = {
      view: 'custom',
      startDate: customStart,
      endDate: customEnd
    };

    setOpen({ picker: false, room: false, export: false });
    if (onFilterChange) {
      onFilterChange(payload);
    } else {
      console.error('[Header] onFilterChange prop is missing!');
    }
  };

  const togglePicker = () => {
    const nextState = !open.picker;
    if (nextState) {
      setActiveTab(view);
      if (filter?.startDate) setCustomStart(formatDateForInput(filter.startDate));
      if (filter?.endDate) setCustomEnd(formatDateForInput(filter.endDate));
    }
    setOpen({ picker: nextState, room: false, export: false });
  };

  let label = '';
  if (view === 'custom' && (filter?.startDate || customStart) && (filter?.endDate || customEnd)) {
    const displayStart = formatDateForInput(filter?.startDate || customStart);
    const displayEnd = formatDateForInput(filter?.endDate || customEnd);
    label = `${displayStart} ~ ${displayEnd}`;
  } else if (view === 'year') {
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
      className={`w-full flex justify-between items-center px-3.5 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
        active ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      <span>{val}</span> 
      {active && <Check className="w-4 h-4 text-indigo-600" />}
    </button>
  );

  return (
    <div data-report-pdf-section="header" className="flex flex-col md:flex-row md:items-start justify-between mb-6 gap-4">
      {/* Title Section */}
      <div>
        <div className="flex items-center gap-2.5">
          <TrendingUp className="w-7 h-7 text-indigo-600 stroke-[2.5]" />
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Reports</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1 font-normal">
          Meeting insights, room usage and performance.
        </p>
      </div>

      {/* Filter Controls & Export */}
      <div className="flex w-full flex-col items-start gap-1.5 md:w-auto md:items-end" ref={containerRef}>
        <div className="flex w-full items-center justify-between gap-1.5 md:w-auto md:justify-start md:gap-2.5 md:flex-wrap">
          
          {/* Date Picker Dropdown */}
          <div className="relative min-w-0">
            <button 
              type="button"
              onClick={togglePicker} 
              className="flex h-9 max-w-[44vw] min-w-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-left text-xs font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 md:h-auto md:gap-2 md:px-3.5 md:py-2 md:max-w-none md:text-center"
            >
              <Calendar className="h-4 w-4 shrink-0 text-indigo-600" /> 
              <span className="min-w-0 truncate">{label}</span> 
              <ChevronDown className="hidden w-3.5 h-3.5 text-gray-400 md:block" />
            </button>
            
            {open.picker && (
              <div 
                className="absolute right-0 mt-2 w-72 bg-white border border-gray-100 rounded-xl shadow-lg p-3 z-50 max-h-96 overflow-y-auto max-md:fixed max-md:inset-x-3 max-md:top-auto max-md:bottom-[4.5rem] max-md:mt-0 max-md:w-auto max-md:max-h-[min(24rem,calc(100dvh-5.5rem))] max-md:pb-2"
                onMouseDown={(e) => e.stopPropagation()}
              >
                
                {/* Switcher Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-lg mb-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('month')}
                    className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition-all ${
                      activeTab === 'month' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('year')}
                    className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition-all ${
                      activeTab === 'year' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Yearly
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('custom')}
                    className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition-all ${
                      activeTab === 'custom' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Custom Date
                  </button>
                </div>

                {/* Monthly Tab */}
                {activeTab === 'month' && (
                  <div>
                    <div className="px-1 py-1 text-[11px] font-bold text-gray-400 border-b mb-1 flex justify-between items-center">
                      <span>SELECT MONTH</span>
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
                    </div>

                    <div className="space-y-0.5 max-h-48 overflow-y-auto">
                      {year === currentYear && (
                        <>
                          <Item 
                            val="This Month" 
                            active={view === 'month' && isThisMonth} 
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
                            active={view === 'month' && !isThisMonth && monthNum === actualMonthNumber} 
                            onClick={() => handleSelectMonth(actualMonthNumber, year)} 
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Yearly Tab */}
                {activeTab === 'year' && (
                  <div>
                    <div className="px-1 py-1 text-[11px] font-bold text-gray-400 border-b mb-1">
                      SELECT YEAR
                    </div>
                    <div className="space-y-0.5 max-h-48 overflow-y-auto">
                      {YEARS.map(y => (
                        <Item 
                          key={y} 
                          val={`${y}`} 
                          active={view === 'year' && year === y} 
                          onClick={() => handleSelectYear(y)} 
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Date Tab */}
                {activeTab === 'custom' && (
                  <form onSubmit={handleApplyCustomDate} className="space-y-3 pt-1">
                    <div className="px-1 text-[11px] font-bold text-gray-400 border-b pb-1">
                      CHOOSE DATE RANGE
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 mb-1">Start Date</label>
                      <input 
                        type="date" 
                        value={customStart}
                        onChange={(e) => {
                          console.log('✏️ [Header] Start Date Changed:', e.target.value);
                          setCustomStart(e.target.value);
                        }}
                        className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 mb-1">End Date</label>
                      <input 
                        type="date" 
                        value={customEnd}
                        onChange={(e) => {
                          console.log('✏️ [Header] End Date Changed:', e.target.value);
                          setCustomEnd(e.target.value);
                        }}
                        className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!customStart || !customEnd}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-semibold py-2 rounded-lg text-xs transition-colors shadow-sm mt-1 cursor-pointer disabled:cursor-not-allowed"
                    >
                      Apply Custom Date
                    </button>
                  </form>
                )}

              </div>
            )}
          </div>

          {/* Room Filter Dropdown */}
          <div className="relative">
            <button 
              type="button"
              onClick={() => setOpen({ picker: false, room: !open.room, export: false })} 
              className="flex h-9 min-w-0 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-2 text-xs font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 md:h-auto md:gap-2 md:px-3.5 md:py-2"
            >
              <MapPin className="w-4 h-4 text-indigo-600" /> 
              <span className="max-w-[72px] truncate md:max-w-none">{roomFilter}</span> 
              <ChevronDown className="hidden w-3.5 h-3.5 text-gray-400 md:block" />
            </button>
            
            {open.room && (
              <div 
                className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-lg p-1.5 z-50"
                onMouseDown={(e) => e.stopPropagation()}
              >
                {['All Rooms', 'MD Room', 'Bagan Room', 'Konebaung Room', 'BOD Home'].map((room) => (
                  <Item 
                    key={room} 
                    val={room} 
                    active={roomFilter === room} 
                    onClick={() => {
                      console.log('🏢 [Header] Room Filter Changed:', room);
                      if (onRoomChange) onRoomChange(room);
                      setOpen({ picker: false, room: false, export: false });
                    }} 
                  />
                ))}
              </div>
            )}
          </div>

          {/* Export Dropdown */}
          <div className="relative" data-html2canvas-ignore="true">
            <button 
              type="button"
              onClick={() => setOpen({ picker: false, room: false, export: !open.export })} 
              className="flex h-9 shrink-0 items-center gap-1 rounded-xl border border-indigo-100 bg-indigo-50 px-2 text-xs font-semibold text-indigo-600 shadow-sm transition-colors hover:bg-indigo-100 md:h-auto md:gap-1.5 md:px-4 md:py-2"
            >
              <Download className="w-4 h-4 text-indigo-600" />
              <span>Export</span>
              <ChevronDown className="hidden w-3.5 h-3.5 text-indigo-400 md:block" />
            </button>
            
            {open.export && (
              <div 
                className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-lg p-1.5 z-50"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => {
                    console.log('📥 [Header] Exporting as Excel');
                    if (onExport) onExport('excel');
                    setOpen({ picker: false, room: false, export: false });
                  }}
                  className="w-full text-left px-3.5 py-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                >
                  Export as Excel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    console.log('📥 [Header] Exporting as PDF');
                    if (onExport) onExport('pdf');
                    setOpen({ picker: false, room: false, export: false });
                  }}
                  className="w-full text-left px-3.5 py-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                >
                  Export as PDF
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
