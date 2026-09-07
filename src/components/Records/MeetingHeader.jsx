import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronRight, 
  Calendar, 
  Clock, 
  MapPin, 
  MoreVertical, 
  Link as LinkIcon, 
  Mail, 
  Share2,
  Check,
  MessageCircle,
  Send
} from 'lucide-react';

export default function MeetingHeader({ 
  title = "BD Strategy Discussion", 
  status = "done",
  englishSummary = "The meeting discussed partnership opportunities with ABC Company, Q2 sales target, marketing campaign, and product roadmap. The team aligned on key actions and responsibilities.",
  myanmarSummary = "အစည်းအဝေးတွင် ABC ကုမ္ပဏီနှင့် မိတ်ဖက်ပူးပေါင်းဆောင်ရွက်မည့် အခွင့်အလမ်းများ၊ ဒုတိယသုံးလပတ် အရောင်းရည်မှန်းချက်၊ စျေးကွက်ရှာဖွေရေး ကမ်ပိန်းနှင့် ထုတ်ကုန်လမ်းပြမြေပုံတို့အကြောင်း ဆွေးနွေးခဲ့ကြသည်။",
  keyDecisions = [
    "Approve partnership proposal with ABC Company",
    "Q2 Sales Target set to MMK 2.5 Billion"
  ],
  actionItems = [
    { task: "Prepare partnership agreement", owner: "U Aung", dueDate: "25 May 2025", status: "In Progress" },
    { task: "Prepare partnership agreement", owner: "U Ko", dueDate: "25 May 2025", status: "In Progress" }
  ]
}) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const dropdownRef = useRef(null);

  const isReady = status === "done";

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

    const actionRowsHtml = actionItems.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #f3f4f6; color: #374151;">${item.task}</td>
        <td style="padding: 10px; border-bottom: 1px solid #f3f4f6; color: #4b5563;">${item.owner}</td>
        <td style="padding: 10px; border-bottom: 1px solid #f3f4f6; color: #4b5563;">${item.dueDate}</td>
        <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;">
          <span style="background: #FFF4ED; color: #B93815; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;">
            ${item.status}
          </span>
        </td>
      </tr>
    `).join('');

    const decisionsHtml = keyDecisions.map(decision => `
      <li style="margin-bottom: 8px; color: #374151;">✔ ${decision}</li>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - Meeting Summary</title>
          <style>
            @page { margin: 15mm; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937; line-height: 1.6; padding: 10px; }
            .header { border-bottom: 2px solid #f3f4f6; padding-bottom: 16px; margin-bottom: 24px; }
            .title { font-size: 22px; font-weight: bold; margin-bottom: 10px; color: #111827; }
            .meta-info { font-size: 12px; color: #4b5563; margin-bottom: 8px; }
            .meta-info span { margin-right: 16px; display: inline-block; }
            .attendees { font-size: 12px; color: #4b5563; margin-top: 6px; }
            .badge { background: #f3f4f6; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
            .section { margin-bottom: 24px; }
            .section-title { font-size: 15px; font-weight: 600; color: #6d28d9; margin-bottom: 10px; padding-bottom: 4px; border-bottom: 1px solid #e5e7eb; }
            .content { font-size: 13px; color: #374151; white-space: pre-wrap; line-height: 1.7; }
            ul { margin: 0; padding-left: 18px; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; }
            th { border-bottom: 1px solid #e5e7eb; padding: 8px 10px; color: #6b7280; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${title}</div>
            <div class="meta-info">
              <span>📅 20 May 2025 (Tue)</span>
              <span>🕒 10:00 AM - 11:30 AM</span>
              <span>📍 Meeting Room A</span>
            </div>
            <div class="attendees">
              👥 <b>Attendees:</b> 👨🏻 👩🏻 👨🏽 👩🏽 <span class="badge">+5 others</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">AI Summary (English)</div>
            <div class="content">${englishSummary}</div>
          </div>

          <div class="section">
            <div class="section-title">AI Summary (Myanmar)</div>
            <div class="content">${myanmarSummary}</div>
          </div>

          <div class="section">
            <div class="section-title">Key Decisions</div>
            <ul>
              ${decisionsHtml}
            </ul>
          </div>

          <div class="section">
            <div class="section-title">Action Items</div>
            <table>
              <thead>
                <tr>
                  <th style="width: 45%;">Task</th>
                  <th>Owner</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${actionRowsHtml}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(htmlContent);
    doc.close();

    iframe.contentWindow.focus();
    setTimeout(() => {
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
    }, 300);
  };

  // --- Share Handlers ---
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Meeting Record: ${title}`);
    const body = encodeURIComponent(`Meeting record URL:\n${window.location.href}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Meeting Record: ${title}\n${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleTelegramShare = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Meeting Record: ${title}`);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: window.location.href });
      } catch (err) {
        console.log("Sharing cancelled");
      }
    } else {
      handleCopyLink();
    }
  };

  const shareMenuItems = [
    { id: 'copy', label: isCopied ? "Copied to clipboard!" : "Copy Link", icon: isCopied ? <Check size={16} className="text-green-500" /> : <LinkIcon size={16} className="text-gray-400" />, action: handleCopyLink, divider: false },
    { id: 'email', label: "Email to team", icon: <Mail size={16} className="text-gray-400" />, action: handleEmailShare, divider: true },
    { id: 'whatsapp', label: "WhatsApp", icon: <MessageCircle size={16} className="text-green-500" />, action: handleWhatsAppShare, divider: false },
    { id: 'telegram', label: "Telegram", icon: <Send size={16} className="text-blue-500" />, action: handleTelegramShare, divider: true },
    { id: 'native', label: "System Share", icon: <Share2 size={16} className="text-gray-400" />, action: handleNativeShare, divider: false }
  ];

  return (
    <div className="flex flex-col gap-4">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center text-sm font-medium text-gray-500">
        <span className="text-violet-600 cursor-pointer hover:underline">Meeting Records</span>
        <ChevronRight size={16} className="mx-2" />
        <span className="text-gray-900">{title}</span>
      </div>
      
      {/* Main Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left Section: Title & Details */}
        <div>
          <h1 className="text-2xl lg:text-[28px] font-bold text-gray-900 mb-3">{title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1.5"><Calendar size={16}/> 20 May 2025 (Tue)</span>
            <span className="flex items-center gap-1.5"><Clock size={16}/> 10:00 AM - 11:30 AM</span>
            <span className="flex items-center gap-1.5"><MapPin size={16}/> Meeting Room A</span>
            
            {/* Attendees */}
            <div className="flex items-center ml-2">
              <div className="flex -space-x-2">
                {['👨🏻', '👩🏻', '👨🏽', '👩🏽'].map((emoji, index) => (
                  <div 
                    key={index} 
                    className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px]"
                  >
                    {emoji}
                  </div>
                ))}
              </div>
              <span className="ml-1 text-xs font-medium bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                +5
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-3">
          
          {/* Download PDF Button */}
          <button 
            onClick={handleDownloadPDF}
            disabled={!isReady}
            className="px-4 py-2 text-sm font-semibold border rounded-lg transition-all
                       text-violet-600 border-violet-200 hover:bg-violet-50 
                       disabled:text-gray-400 disabled:border-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:hover:bg-gray-50"
          >
            Download PDF
          </button>
          
          {/* Share Dropdown Button */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsShareOpen(!isShareOpen)}
              disabled={!isReady}
              className={`px-4 py-2 text-sm font-semibold border rounded-lg transition-all flex items-center gap-2
                         disabled:text-gray-400 disabled:border-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:hover:bg-gray-50
                         ${isShareOpen ? 'bg-gray-100 border-gray-300 text-gray-900' : 'text-gray-700 border-gray-200 hover:bg-gray-50'}`}
            >
              Share
            </button>

            {/* Dynamic Share Menu */}
            {isShareOpen && isReady && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] z-50 py-2">
                {shareMenuItems.map((item) => (
                  <React.Fragment key={item.id}>
                    <button 
                      onClick={() => {
                        item.action();
                        if (item.id !== 'copy') setIsShareOpen(false);
                      }} 
                      className="w-full px-4 py-2.5 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    >
                      {item.icon}
                      {item.label}
                    </button>
                    {item.divider && <div className="h-px bg-gray-100 my-1 mx-2" />}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          {/* More Options Button */}
          <button 
            disabled={!isReady}
            className="p-2 border border-gray-200 rounded-lg transition-colors text-gray-500 hover:bg-gray-50 
                       disabled:bg-gray-50 disabled:text-gray-300 disabled:border-gray-200 disabled:cursor-not-allowed"
          >
            <MoreVertical size={18} />
          </button>

        </div>

      </div>
    </div>
  );
}