import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronRight, Calendar, Clock, MapPin, MoreVertical, 
  Link as LinkIcon, Mail, Share2, Check, MessageCircle, Send
} from 'lucide-react';

const formatDisplayValue = (val, fallback = '') => {
  if (!val) return fallback;
  if (typeof val === 'object') {
    return val.name || val.title || val.room_name || val.room || val.label || JSON.stringify(val);
  }
  return String(val);
};

export default function MeetingHeader({ 
  title = "", 
  date = "",
  startTime = "",
  endTime = "",
  room = "",
  participants = [],
  
  status = "done",
  englishSummary = "",
  myanmarSummary = "",
  keyDecisions = [],
  actionItems = []
}) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const dropdownRef = useRef(null);

  const isReady = status === "done";
  
  const safeDateStr = formatDisplayValue(date);
  const parsedDate = safeDateStr ? new Date(safeDateStr) : new Date();
  const formattedDate = !isNaN(parsedDate.getTime()) 
    ? parsedDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', weekday: 'short' })
    : safeDateStr || 'Today';

  const safeTitle = formatDisplayValue(title, 'Untitled Meeting');
  const safeRoom = formatDisplayValue(room, 'Main Room');
  const safeStartTime = formatDisplayValue(startTime);
  const safeEndTime = formatDisplayValue(endTime);

  const visibleParticipants = Array.isArray(participants) ? participants.slice(0, 4) : [];
  const remainingCount = Array.isArray(participants) && participants.length > 4 ? participants.length - 4 : 0;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsShareOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDownloadPDF = () => {
    if (!isReady) return;

    const actionRowsHtml = Array.isArray(actionItems) ? actionItems.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;">${formatDisplayValue(item.task)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;">${formatDisplayValue(item.owner)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;">${formatDisplayValue(item.dueDate)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;">
          <span style="background: #FFF4ED; color: #B93815; padding: 3px 8px; border-radius: 6px; font-size: 11px;">
            ${formatDisplayValue(item.status)}
          </span>
        </td>
      </tr>
    `).join('') : '';

    const decisionsHtml = Array.isArray(keyDecisions) ? keyDecisions.map(d => `<li style="margin-bottom: 8px;">✔ ${formatDisplayValue(d)}</li>`).join('') : '';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${safeTitle} - Meeting Summary</title>
          <style>
            @page { margin: 15mm; }
            body { font-family: sans-serif; color: #1f2937; line-height: 1.6; padding: 10px; }
            .header { border-bottom: 2px solid #f3f4f6; padding-bottom: 16px; margin-bottom: 24px; }
            .title { font-size: 22px; font-weight: bold; margin-bottom: 10px; }
            .meta-info { font-size: 12px; color: #4b5563; margin-bottom: 8px; }
            .meta-info span { margin-right: 16px; display: inline-block; }
            .section-title { font-size: 15px; font-weight: 600; color: #6d28d9; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; }
            th { border-bottom: 1px solid #e5e7eb; padding: 8px 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${safeTitle}</div>
            <div class="meta-info">
              <span>📅 ${formattedDate}</span>
              <span>🕒 ${safeStartTime} ${safeEndTime ? `- ${safeEndTime}` : ''}</span>
              <span>📍 ${safeRoom}</span>
              <span>👥 ${Array.isArray(participants) ? participants.length : 0} Attendees</span>
            </div>
          </div>
          <div class="section-title">AI Summary (English)</div>
          <p>${formatDisplayValue(englishSummary)}</p>
          <div class="section-title">AI Summary (Myanmar)</div>
          <p>${formatDisplayValue(myanmarSummary)}</p>
          <div class="section-title">Key Decisions</div>
          <ul>${decisionsHtml}</ul>
          <div class="section-title">Action Items</div>
          <table>
            <tr><th>Task</th><th>Owner</th><th>Due Date</th><th>Status</th></tr>
            ${actionRowsHtml}
          </table>
        </body>
      </html>
    `;
    
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
    document.body.appendChild(iframe);
    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(htmlContent);
    iframe.contentWindow.document.close();
    iframe.contentWindow.focus();
    setTimeout(() => {
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
    }, 300);
  };

  const shareActions = {
    copy: async () => { await navigator.clipboard.writeText(window.location.href); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); },
    email: () => window.location.href = `mailto:?subject=${encodeURIComponent(safeTitle)}&body=${encodeURIComponent(window.location.href)}`,
    whatsapp: () => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(safeTitle + '\n' + window.location.href)}`),
    telegram: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(safeTitle)}`),
    native: async () => navigator.share ? await navigator.share({ title: safeTitle, url: window.location.href }) : shareActions.copy()
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center text-sm font-medium text-gray-500">
        <span className="text-violet-600 cursor-pointer hover:underline">Meeting Records</span>
        <ChevronRight size={16} className="mx-2" />
        <span className="text-gray-900">{safeTitle}</span>
      </div>
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-[28px] font-bold text-gray-900 mb-3">{safeTitle}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1.5"><Calendar size={16}/> {formattedDate}</span>
            {safeStartTime && (
              <span className="flex items-center gap-1.5">
                <Clock size={16}/> {safeStartTime} {safeEndTime ? `- ${safeEndTime}` : ''}
              </span>
            )}
            <span className="flex items-center gap-1.5"><MapPin size={16}/> {safeRoom}</span>
            
            {Array.isArray(participants) && participants.length > 0 && (
              <div className="flex items-center ml-2">
                <div className="flex -space-x-2">
                  {visibleParticipants.map((p, i) => {
                    // p က object ဖြစ်နေရင် name, username, email ဒါမှမဟုတ် index ပေါ်မူတည်ပြီး သေချာထုတ်ရန်
                    let pName = 'User';
                    if (typeof p === 'object' && p !== null) {
                      pName = p.name || p.username || p.email || p.title || `User ${i + 1}`;
                    } else if (typeof p === 'string') {
                      pName = p;
                    }

                    // နာမည်ရဲ့ ပထမဆုံး စာလုံးတစ်လုံးတည်းကိုသာ ယူခြင်း (ဥပမာ - "Aung Min" ဆိုရင် "A")
                    const trimmedName = String(pName).trim();
                    let initial = trimmedName.length > 0 ? trimmedName.charAt(0).toUpperCase() : 'U';

                    return (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700 uppercase" title={pName}>
                        {initial}
                      </div>
                    );
                  })}
                </div>
                {remainingCount > 0 && (
                  <span className="ml-1 text-xs font-medium bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                    +{remainingCount}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleDownloadPDF} disabled={!isReady} className="px-4 py-2 text-sm font-semibold border rounded-lg text-violet-600 border-violet-200 hover:bg-violet-50 disabled:opacity-50">
            Download PDF
          </button>
          
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsShareOpen(!isShareOpen)} disabled={!isReady} className="px-4 py-2 text-sm font-semibold border rounded-lg flex items-center gap-2 border-gray-200 hover:bg-gray-50 disabled:opacity-50">
              Share
            </button>
            {isShareOpen && isReady && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-2">
                <button onClick={shareActions.copy} className="w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 flex items-center gap-3">
                  {isCopied ? <Check size={16} className="text-green-500" /> : <LinkIcon size={16} className="text-gray-400" />} {isCopied ? "Copied!" : "Copy Link"}
                </button>
                <div className="h-px bg-gray-100 my-1 mx-2" />
                <button onClick={shareActions.email} className="w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 flex items-center gap-3"><Mail size={16} className="text-gray-400"/> Email</button>
                <button onClick={shareActions.whatsapp} className="w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 flex items-center gap-3"><MessageCircle size={16} className="text-green-500"/> WhatsApp</button>
              </div>
            )}
          </div>
          <button disabled={!isReady} className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50"><MoreVertical size={18} /></button>
        </div>
      </div>
    </div>
  );
}