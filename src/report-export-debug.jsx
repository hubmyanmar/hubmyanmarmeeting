import React from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import './index.css';
import Reports from './components/Reports.jsx';
import html2canvas from 'html2canvas';

const originalError = console.error.bind(console);
console.error = (...args) => {
  if (args[0] === 'Unable to export Report PDF:') {
    document.body.dataset.pdfError = `${args[1]?.message || args[1]}\n${args[1]?.stack || ''}`;
  }
  originalError(...args);
};
window.alert = (message) => { document.body.dataset.pdfAlert = message; };

const today = new Date();
const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
const oldDate = `${today.getFullYear() - 1}-01-10`;
const normalizeSvgColors = (clonedDocument) => {
  const normalize = (value) => {
    value = value.replace(/oklch\(\s*([\d.]+)(%)?\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+)(%)?)?\s*\)/gi, (_, lightness, lightnessPercent, chroma, hue, alpha, alphaPercent) => {
      const L = Number(lightness) / (lightnessPercent ? 100 : 1);
      const C = Number(chroma);
      const radians = Number(hue) * Math.PI / 180;
      const a = C * Math.cos(radians), b = C * Math.sin(radians);
      const l0 = L + 0.3963377774 * a + 0.2158037573 * b;
      const m0 = L - 0.1055613458 * a - 0.0638541728 * b;
      const s0 = L - 0.0894841775 * a - 1.2914855480 * b;
      const l = l0 ** 3, m = m0 ** 3, s = s0 ** 3;
      const linear = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
      const rgb = linear.map((channel) => Math.round(255 * Math.max(0, Math.min(1, channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055))));
      return alpha === undefined ? `rgb(${rgb.join(', ')})` : `rgba(${rgb.join(', ')}, ${Number(alpha) / (alphaPercent ? 100 : 1)})`;
    });
    return value.replace(/oklab\(\s*([\d.]+)(%)?\s+([+-]?[\d.]+)\s+([+-]?[\d.]+)(?:\s*\/\s*([\d.]+)(%)?)?\s*\)/gi, (_, lightness, lightnessPercent, a, b, alpha, alphaPercent) => {
      const L = Number(lightness) / (lightnessPercent ? 100 : 1);
      const aValue = Number(a), bValue = Number(b);
      const l0 = L + 0.3963377774 * aValue + 0.2158037573 * bValue;
      const m0 = L - 0.1055613458 * aValue - 0.0638541728 * bValue;
      const s0 = L - 0.0894841775 * aValue - 1.2914855480 * bValue;
      const l = l0 ** 3, m = m0 ** 3, s = s0 ** 3;
      const linear = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
      const rgb = linear.map((channel) => Math.round(255 * Math.max(0, Math.min(1, channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055))));
      return alpha === undefined ? `rgb(${rgb.join(', ')})` : `rgba(${rgb.join(', ')}, ${Number(alpha) / (alphaPercent ? 100 : 1)})`;
    });
  };
  const normalizeRules = (rules) => {
    [...rules].forEach((rule) => {
      if (rule.style) {
        [...rule.style].forEach((property) => {
          const value = rule.style.getPropertyValue(property);
          if (value.includes('oklch(')) rule.style.setProperty(property, normalize(value), rule.style.getPropertyPriority(property));
        });
      }
      if (rule.cssRules) normalizeRules(rule.cssRules);
    });
  };
  [...clonedDocument.styleSheets].forEach((sheet) => {
    try { normalizeRules(sheet.cssRules); } catch { /* Cross-origin stylesheets are not editable. */ }
  });
  document.body.dataset.cloneHook = 'called';
  document.body.dataset.cloneVariable = clonedDocument.defaultView.getComputedStyle(clonedDocument.documentElement).getPropertyValue('--color-slate-900');
  document.body.dataset.cloneInlineVariable = clonedDocument.documentElement.style.getPropertyValue('--color-slate-900');
  document.body.dataset.cloneSvgColor = clonedDocument.defaultView.getComputedStyle(clonedDocument.querySelector('svg')).color;
  const rootStyle = clonedDocument.defaultView.getComputedStyle(clonedDocument.documentElement);
  for (let index = 0; index < rootStyle.length; index += 1) {
    const property = rootStyle[index];
    const value = rootStyle.getPropertyValue(property);
    if (!property.startsWith('--') || !value.includes('oklch(')) continue;
    clonedDocument.documentElement.style.setProperty(property, normalize(value));
  }
  clonedDocument.querySelectorAll('*').forEach((element) => {
    const computed = clonedDocument.defaultView.getComputedStyle(element);
    for (let index = 0; index < computed.length; index += 1) {
      const property = computed[index];
      const value = computed.getPropertyValue(property);
      if (!value.includes('oklch(')) continue;
      element.style.setProperty(property, normalize(value), 'important');
    }
  });
};
const meetings = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1, title: `Strategy meeting ${i + 1}`, company_name: `Company ${i % 6 + 1}`,
  department: `Department ${i % 4 + 1}`, meeting_date: date, start_time: '09:00', end_time: '10:00',
  room: `Room ${i % 5 + 1}`,
  actions: [{ id: 100 + i, title: `Action ${i + 1}`, dueDate: oldDate, status: 'pending', company: `Company ${i % 6 + 1}`, department: `Department ${i % 4 + 1}` }],
}));
const sessions = Object.fromEntries(meetings.map((meeting, i) => [meeting.id, {
  status: i % 2 ? 'completed' : 'running', actual_started_at: `${date}T09:00:00`, actual_ended_at: i % 2 ? `${date}T10:00:00` : null,
} ]));
createRoot(document.getElementById('root')).render(<MemoryRouter><Reports bookedMeetings={meetings} meetingSessions={sessions} /></MemoryRouter>);

window.runPdfCheck = async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  try {
    for (const section of document.querySelectorAll('[data-report-pdf-section]')) {
      await html2canvas(section, { scale: 1, backgroundColor: '#f8fafc', useCORS: true, logging: false, onclone: normalizeSvgColors, ignoreElements: (element) => element.hasAttribute('data-html2canvas-ignore') });
    }
    document.body.dataset.directCapture = 'success';
  } catch (error) {
    document.body.dataset.directCapture = `${error?.message || error}`;
    document.body.dataset.directCaptureStack = `${error?.stack || ''}`;
  }
  [...document.querySelectorAll('button')].find((button) => button.textContent.includes('Export'))?.click();
  await new Promise((resolve) => setTimeout(resolve, 100));
  [...document.querySelectorAll('button')].find((button) => button.textContent.includes('Export as PDF'))?.click();
  await new Promise((resolve) => setTimeout(resolve, 8000));
  document.body.dataset.pdfDone = 'true';
};
window.runPdfCheck();
