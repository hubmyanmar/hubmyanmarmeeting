import * as XLSX from 'xlsx';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const getReportPeriod = (filter = {}) => {
  if (filter.view === 'year') return String(filter.year);
  if (filter.view === 'custom') return `${filter.startDate || ''} to ${filter.endDate || ''}`;
  const month = parseInt(filter.month, 10);
  return `${MONTHS[month - 1] || 'Selected month'} ${filter.year}`;
};

const getTrendText = (change, label) => {
  if (change.isSame) return `0% vs ${label}`;
  return `${change.isIncrease ? '+' : '-'}${change.pct}% vs ${label}`;
};

const appendTableSheet = (workbook, name, headers, rows, widths) => {
  const sheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  sheet['!cols'] = widths.map((wch) => ({ wch }));
  if (rows.length > 0) {
    sheet['!autofilter'] = {
      ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rows.length, c: headers.length - 1 } }),
    };
  }
  XLSX.utils.book_append_sheet(workbook, sheet, name);
};

export function createReportWorkbook(reportData, filter = {}, exportedAt = new Date()) {
  const workbook = XLSX.utils.book_new();
  const summary = reportData.summary;
  const summarySheet = XLSX.utils.aoa_to_sheet([
    ['Report Summary'],
    ['Period', getReportPeriod(filter)],
    ['Room', filter.room || 'All Rooms'],
    ['Exported', exportedAt.toLocaleString()],
    [],
    ['Metric', 'Value', 'Unit', 'Comparison'],
    ['Total Meetings', summary.meetings.current, 'meetings', getTrendText(summary.meetings.change, summary.compareLabel)],
    ['Completed Meeting Hours', summary.hours.current, 'hours', getTrendText(summary.hours.change, summary.compareLabel)],
    ['Completed Actions', summary.completedPct.current, '%', getTrendText(summary.completedPct.change, summary.compareLabel)],
    ['Overdue Actions', summary.overdue.current, 'actions', getTrendText(summary.overdue.change, summary.compareLabel)],
  ]);
  summarySheet['!cols'] = [{ wch: 28 }, { wch: 18 }, { wch: 14 }, { wch: 28 }];
  summarySheet['!autofilter'] = { ref: 'A6:D10' };
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  appendTableSheet(workbook, 'Meetings by Company',
    ['Company', 'Meeting Count', 'Share (%)'],
    reportData.companies.chartData.map(({ name, count, percentage }) => [name, count, percentage]),
    [36, 18, 14]);

  appendTableSheet(workbook, 'Actions Overview',
    ['Period', 'Completed', 'Overdue'],
    reportData.actions.labels.map((label, index) => [label, reportData.actions.completed[index], reportData.actions.overdue[index]]),
    [22, 16, 16]);

  appendTableSheet(workbook, 'Top Meeting Rooms',
    ['Meeting Room', 'Meeting Count'],
    reportData.rooms.map(({ name, count }) => [name, count]),
    [32, 18]);

  appendTableSheet(workbook, 'Overdue Actions',
    ['Action Title', 'Company', 'Department', 'Due Date', 'Days Overdue', 'Action ID'],
    reportData.overdueActions.map((item) => [item.title, item.company, item.dept, item.dueDate, item.diffDays, item.id]),
    [44, 28, 24, 22, 16, 18]);

  return workbook;
}
