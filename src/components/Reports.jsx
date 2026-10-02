import React, { useMemo, useRef, useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import Header from './Reports/Header';
import MetricCards from './Reports/MetricCards';
import DepartmentChart from './Reports/DepartmentChart';
import ActionsChart from './Reports/ActionsChart';
import TopRooms from './Reports/TopRooms';
import OverdueActions from './Reports/OverdueActions';
import {
  getActionsOverview,
  getCompanyBreakdown,
  getOverdueActions,
  getReportSummary,
  getTopMeetingRooms,
} from './Reports/reportData';
import { createReportWorkbook } from './Reports/reportExports';

// html2canvas 1.x cannot parse the OKLCH colors emitted by Tailwind 4.
// Normalize them in html2canvas's cloned document so the live Report keeps
// its original browser colors and styling.
const normalizePdfCaptureColors = (clonedDocument) => {
  const colorFunctionPattern = /\b(oklch|oklab)\(\s*([+-]?[\d.]+)(%)?\s+([+-]?[\d.]+)\s+([+-]?[\d.]+)(?:\s*\/\s*([\d.]+)(%)?)?\s*\)/gi;
  const normalizeColors = (value) => value.replace(colorFunctionPattern, (_, type, first, firstPercent, second, third, alpha, alphaPercent) => {
    const L = Number(first) / (firstPercent ? 100 : 1);
    let a;
    let b;
    if (type.toLowerCase() === 'oklch') {
      const radians = Number(third) * Math.PI / 180;
      a = Number(second) * Math.cos(radians);
      b = Number(second) * Math.sin(radians);
    } else {
      a = Number(second);
      b = Number(third);
    }

    const l0 = L + 0.3963377774 * a + 0.2158037573 * b;
    const m0 = L - 0.1055613917 * a - 0.0638541728 * b;
    const s0 = L - 0.0894841775 * a - 1.2914855480 * b;
    const linear = [
      4.0767416621 * l0 ** 3 - 3.3077115913 * m0 ** 3 + 0.2309699292 * s0 ** 3,
      -1.2684380046 * l0 ** 3 + 2.6097574011 * m0 ** 3 - 0.3413193965 * s0 ** 3,
      -0.0041960863 * l0 ** 3 - 0.7034186147 * m0 ** 3 + 1.707614701 * s0 ** 3,
    ];
    const rgb = linear.map((channel) => {
      const srgb = channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055;
      return Math.round(255 * Math.max(0, Math.min(1, srgb)));
    });
    if (alpha === undefined) return `rgb(${rgb.join(', ')})`;
    return `rgba(${rgb.join(', ')}, ${Number(alpha) / (alphaPercent ? 100 : 1)})`;
  });

  const view = clonedDocument.defaultView;
  const reportRoot = clonedDocument.querySelector('[data-report-pdf-root]');
  const elements = [clonedDocument.documentElement, clonedDocument.body, reportRoot]
    .filter(Boolean)
    .concat(Array.from(reportRoot?.querySelectorAll('*') || []));
  elements.forEach((element) => {
    const computed = view.getComputedStyle(element);
    const properties = Array.from({ length: computed.length }, (_, index) => computed[index]);
    properties.forEach((property) => {
      const value = computed.getPropertyValue(property);
      if (/\b(?:oklch|oklab)\(/i.test(value)) {
        element.style.setProperty(property, normalizeColors(value), 'important');
      }
    });
  });
};

const formatDisplayValue = (val, fallback = '') => {
  if (!val) return fallback;
  if (typeof val === 'object') {
    return val.name || val.title || val.room_name || val.room || fallback;
  }
  return String(val);
};

export default function Reports({ bookedMeetings = [], meetingSessions = {} }) {
  const currentDate = new Date();
  
  const [filter, setFilter] = useState({
    view: 'month',
    month: (currentDate.getMonth() + 1).toString(), 
    year: currentDate.getFullYear().toString(),
    startDate: '',
    endDate: '',
    room: 'All Rooms'
  });

  const [filteredMeetings, setFilteredMeetings] = useState([]);
  const reportContentRef = useRef(null);

  useEffect(() => {
    const formatted = (Array.isArray(bookedMeetings) ? bookedMeetings : []).map((m) => ({
      ...m,
      title: formatDisplayValue(m.title || m.meeting_title || m.name, 'Untitled Meeting'),
      room: formatDisplayValue(m.room || m.meeting_room || m.room_name, 'Main Room'),
      date: formatDisplayValue(m.meeting_date || m.date || m.startTime || m.startedAt)
    }));

    const finalFiltered = formatted.filter((m) => {
      if (!m.date) return false;
      if (filter.room && filter.room !== 'All Rooms') {
        if (m.room !== filter.room) return false;
      }

      if (filter.view === 'custom') {
        if (!filter.startDate || !filter.endDate) return true;

        const meetingDate = new Date(m.date);
        if (isNaN(meetingDate.getTime())) return false;

        const start = new Date(filter.startDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(filter.endDate);
        end.setHours(23, 59, 59, 999);

        return meetingDate.getTime() >= start.getTime() && meetingDate.getTime() <= end.getTime();
      }
      let mYear, mMonth;
      if (typeof m.date === 'string' && m.date.includes('-')) {
        const datePart = m.date.split('T')[0];
        const parts = datePart.split('-');
        mYear = parseInt(parts[0], 10);
        mMonth = parseInt(parts[1], 10);
      } else {
        const parsedDate = new Date(m.date);
        if (isNaN(parsedDate.getTime())) return false;
        mYear = parsedDate.getFullYear();
        mMonth = parsedDate.getMonth() + 1; 
      }

      if (isNaN(mYear) || isNaN(mMonth)) return false;

      const selectedYear = parseInt(filter.year, 10);
      const selectedMonth = parseInt(filter.month, 10);

      // Yearly View Filter
      if (filter.view === 'year') {
        return mYear === selectedYear;
      }

      // Monthly View Filter
      return mYear === selectedYear && mMonth === selectedMonth;
    });

    setFilteredMeetings(finalFiltered);

  }, [filter, bookedMeetings]);

  const reportData = useMemo(() => ({
    summary: getReportSummary(filteredMeetings, meetingSessions, filter),
    companies: getCompanyBreakdown(filteredMeetings),
    actions: getActionsOverview(filter, filteredMeetings, meetingSessions),
    rooms: getTopMeetingRooms(filter, meetingSessions, bookedMeetings),
    overdueActions: getOverdueActions(filteredMeetings, meetingSessions),
  }), [filter, filteredMeetings, meetingSessions, bookedMeetings]);

  // Excel & PDF Export Logic
  const handleExport = async (type) => {
    const safeRoom = String(filter.room || 'All Rooms').replace(/[^a-z0-9_-]+/gi, '_');
    const timestamp = new Date().toISOString().slice(0, 10);
    const filePrefix = `Meeting_Report_${safeRoom}`;

    if (type === 'excel') {
      const workbook = createReportWorkbook(reportData, filter);
      XLSX.writeFile(workbook, `${filePrefix}_${timestamp}.xlsx`);
      return;
    }

    if (type === 'pdf') {
      try {
        await document.fonts?.ready;
        await new Promise((resolve) => window.requestAnimationFrame(resolve));

        const sections = Array.from(reportContentRef.current?.querySelectorAll('[data-report-pdf-section]') || []);
        if (!sections.length) throw new Error('Report content is not available for PDF export.');

        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 10;
        const contentWidth = pageWidth - margin * 2;
        const contentHeight = pageHeight - margin * 2;
        const sectionGap = 4;
        let cursorY = margin;

        for (const section of sections) {
          const canvas = await html2canvas(section, {
            scale: 2,
            backgroundColor: '#f8fafc',
            useCORS: true,
            logging: false,
            onclone: normalizePdfCaptureColors,
            ignoreElements: (element) => element.hasAttribute('data-html2canvas-ignore'),
          });
          const mmPerPixel = contentWidth / canvas.width;
          const imageHeight = canvas.height * mmPerPixel;

          if (imageHeight <= contentHeight) {
            if (cursorY + imageHeight > pageHeight - margin) {
              doc.addPage();
              cursorY = margin;
            }
            doc.addImage(canvas.toDataURL('image/png'), 'PNG', margin, cursorY, contentWidth, imageHeight);
            cursorY += imageHeight + sectionGap;
            continue;
          }

          if (cursorY > margin) {
            doc.addPage();
            cursorY = margin;
          }
          const maxSliceHeight = Math.floor(contentHeight / mmPerPixel);
          for (let offsetY = 0; offsetY < canvas.height; offsetY += maxSliceHeight) {
            const sliceHeight = Math.min(maxSliceHeight, canvas.height - offsetY);
            const slice = document.createElement('canvas');
            slice.width = canvas.width;
            slice.height = sliceHeight;
            slice.getContext('2d').drawImage(canvas, 0, offsetY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
            const sliceMmHeight = sliceHeight * mmPerPixel;
            doc.addImage(slice.toDataURL('image/png'), 'PNG', margin, margin, contentWidth, sliceMmHeight);
            if (offsetY + sliceHeight < canvas.height) doc.addPage();
          }
          cursorY = margin + Math.min(imageHeight, contentHeight) + sectionGap;
        }

        const pageCount = doc.getNumberOfPages();
        for (let page = 1; page <= pageCount; page += 1) {
          doc.setPage(page);
          doc.setFontSize(8);
          doc.setTextColor(100);
          doc.text(`Page ${page} of ${pageCount}`, pageWidth - margin, pageHeight - 5, { align: 'right' });
        }
        doc.save(`${filePrefix}_${timestamp}.pdf`);
      } catch (error) {
        document.body.dataset.debugPdfError = `${error?.message || error}\n${error?.stack || ''}`;
        console.error('Unable to export Report PDF:', error);
        alert('Unable to export the Report PDF. Please try again.');
      }
    }
  };

  return (
    <div className="w-full min-w-0 bg-slate-50/50 min-h-screen py-4 px-2 sm:px-4 font-sans max-md:w-auto max-md:-mx-8 max-md:-mt-8 max-md:px-3 max-md:pt-4 max-md:pb-24">
      <div ref={reportContentRef} data-report-pdf-root="true" className="w-full min-w-0 space-y-6 max-md:space-y-4"> 
        {/* Header Section */}
        <Header 
          filter={filter} 
          onFilterChange={(newFilter) => setFilter(prev => ({ ...prev, ...newFilter }))} 
          roomFilter={filter.room}
          onRoomChange={(selectedRoom) => setFilter(prev => ({ ...prev, room: selectedRoom }))}
          onExport={handleExport}
        />

        {/* Top Row: Metric Cards */}
        <MetricCards 
          filter={filter} 
          bookedMeetings={filteredMeetings} 
          meetingSessions={meetingSessions} 
          summary={reportData.summary}
        />
        
        {/* Middle Row: Charts */}
        <div data-report-pdf-section="charts-top" className="grid min-w-0 grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          <TopRooms 
            filter={filter} 
            meetingSessions={meetingSessions} 
            bookedMeetings={bookedMeetings} 
            rooms={reportData.rooms}
          />
          <ActionsChart 
            filter={filter} 
            bookedMeetings={filteredMeetings} 
            meetingSessions={meetingSessions} 
            chartData={reportData.actions}
          />
        </div>

        {/* Bottom Row: Meetings by Company & Overdue Actions */}
        <div data-report-pdf-section="charts-bottom" className="grid min-w-0 grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          <div className="min-w-0">
            <DepartmentChart bookedMeetings={filteredMeetings} breakdown={reportData.companies} />
          </div>
          <div className="min-w-0">
            <OverdueActions 
              bookedMeetings={filteredMeetings} 
              meetingSessions={meetingSessions}
              filter={filter}
              overdueItems={reportData.overdueActions}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
