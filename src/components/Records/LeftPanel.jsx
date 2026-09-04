import React from 'react';
import { Mic, Play, Download } from 'lucide-react';

const SkeletonText = ({ lines = 3 }) => (
  <div className="animate-pulse flex flex-col gap-3">
    {[...Array(lines)].map((_, i) => (
      <div key={i} className={`h-4 bg-gray-200 rounded ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}></div>
    ))}
  </div>
);

export default function LeftPanel({ status, timer, formatTime }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Recording Box */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 text-[15px]">Recording</h3>
        <div className={`flex items-center gap-4 p-3 rounded-xl border ${status === 'active' ? 'bg-red-50/50 border-red-100' : 'bg-[#f8f9fc] border-gray-100'}`}>
          <button className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 ${status === 'active' ? 'bg-red-500 animate-pulse' : 'bg-violet-600'}`}>
            {status === "active" ? <Mic size={18} /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
          </button>
          <div className="flex-1 h-8 flex items-center gap-[2px] opacity-40 overflow-hidden">
            {[...Array(40)].map((_, i) => (
              <div key={i} className={`w-[3px] rounded-full ${status === 'active' ? 'bg-red-500' : 'bg-gray-500'}`} style={{ height: `${Math.max(20, Math.random() * 100)}%` }}></div>
            ))}
          </div>
          <span className="text-xs font-medium text-gray-500 shrink-0">
            {status === "active" ? formatTime(timer) : (status === "idle" ? "--:--" : "00:59 / 01:15:30")}
          </span>
          <button className="text-gray-400 hover:text-violet-600 shrink-0 ml-2"><Download size={18} /></button>
        </div>
      </div>

      {/* English Summary */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-3 text-[15px]">AI Summary (English)</h3>
        {(status === "active" || status === "idle") ? (
          <div className="py-4 text-gray-400 text-sm text-center">Waiting for processing...</div>
        ) : status === "processing" ? (
          <div className="py-1"><SkeletonText lines={3} /></div>
        ) : (
          <p className="text-[#475467] text-[14px] leading-[1.6]">
            The meeting discussed partnership opportunities with ABC Company, Q2 sales target, marketing campaign, and product roadmap. The team aligned on key actions and responsibilities.
          </p>
        )}
      </div>

      {/* Myanmar Summary */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-3 text-[15px]">AI Summary (Myanmar)</h3>
        {(status === "active" || status === "idle") ? (
          <div className="py-4 text-gray-400 text-sm text-center">Waiting for processing...</div>
        ) : status === "processing" ? (
          <div className="py-1"><SkeletonText lines={4} /></div>
        ) : (
          <>
            <p className="text-[#475467] text-[14px] leading-[1.8] font-myanmar mb-5">
              အစည်းအဝေးတွင် ABC ကုမ္ပဏီနှင့် မိတ်ဖက်ပူးပေါင်းဆောင်ရွက်မည့် အခွင့်အလမ်းများ၊ ဒုတိယသုံးလပတ် အရောင်းရည်မှန်းချက်၊ စျေးကွက်ရှာဖွေရေး ကမ်ပိန်းနှင့် ထုတ်ကုန်လမ်းပြမြေပုံတို့အကြောင်း ဆွေးနွေးခဲ့ကြသည်။ အဖွဲ့သည် အဓိကလုပ်ဆောင်ရမည့်အချက်များနှင့် တာဝန်များကို ညှိနှိုင်းသဘောတူညီခဲ့ကြသည်။
            </p>
            <button className="px-4 py-2 text-sm font-semibold text-violet-600 border border-violet-200 rounded-lg hover:bg-violet-50 transition-colors">Regenerate Summary</button>
          </>
        )}
      </div>
    </div>
  );
}