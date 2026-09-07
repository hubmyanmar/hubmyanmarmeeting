import React from 'react';
import { Square, Mic, Activity, CheckCircle2 } from 'lucide-react';

const SkeletonText = ({ lines = 3 }) => (
  <div className="animate-pulse flex flex-col gap-3">
    {[...Array(lines)].map((_, i) => (
      <div key={i} className={`h-4 bg-gray-200 rounded ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}></div>
    ))}
  </div>
);

export default function RightPanel({ 
  status, 
  actionType, 
  liveTranscript,
  keyDecisions = [
    "Approve partnership proposal with ABC Company",
    "Q2 Sales Target set to MMK 2.5 Billion"
  ],
  actionItems = [
    { task: "Prepare partnership agreement", owner: "U Aung", dueDate: "25 May 2025", status: "In Progress" },
    { task: "Prepare partnership agreement", owner: "U Ko", dueDate: "25 May 2025", status: "In Progress" }
  ]
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full overflow-hidden min-h-[500px]">
      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-100 px-6 pt-1">
        <button className={`py-4 text-sm font-semibold border-b-2 ${actionType !== 'live_transcription' || status !== 'active' ? 'text-violet-600 border-violet-600' : 'text-gray-500 border-transparent'}`}>Summary</button>
        <button className={`py-4 text-sm font-semibold border-b-2 ${actionType === 'live_transcription' && status === 'active' ? 'text-violet-600 border-violet-600' : 'text-gray-500 border-transparent hover:text-gray-900'}`}>Transcript</button>
        <button className="py-4 text-sm font-medium text-gray-500 hover:text-gray-900">Notes</button>
        <button className="py-4 text-sm font-medium text-gray-500 hover:text-gray-900">Files (2)</button>
      </div>

      <div className="p-6 flex flex-col gap-8 flex-1">
        {status === "idle" && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm gap-2 mt-10">
            <Square className="opacity-30" size={32} />
            <p>Data will appear here after processing.</p>
          </div>
        )}
        
        {status === "active" && actionType === "quick_voice_note" && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm gap-2 mt-10">
            <Mic className="opacity-30 animate-pulse text-red-500" size={32} />
            <p>Recording audio...</p>
          </div>
        )}

        {status === "active" && actionType === "live_transcription" && (
          <div className="h-full flex flex-col animate-in fade-in">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={18} className="text-emerald-500 animate-pulse" />
              <h3 className="font-semibold text-gray-900">Live Transcript</h3>
            </div>
            <div className="bg-emerald-50/30 p-5 rounded-xl border border-emerald-100 flex-1 overflow-y-auto min-h-[300px]">
              <p className="text-gray-700 leading-relaxed text-[15px]">
                {liveTranscript}
                <span className="animate-pulse ml-1 inline-block w-1.5 h-4 bg-emerald-500 align-middle"></span>
              </p>
            </div>
          </div>
        )}
        
        {status === "processing" && (
          <div className="space-y-8">
            <div><h4 className="text-sm font-semibold mb-3">Key Decisions</h4><SkeletonText lines={4} /></div>
            <div><h4 className="text-sm font-semibold mb-3">Action Items</h4><SkeletonText lines={5} /></div>
          </div>
        )}

        {status === "done" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
            {/* Key Decisions */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-[15px]">Key Decisions</h3>
              <ul className="space-y-3.5">
                {keyDecisions.map((decision, index) => (
                  <li key={index} className="flex items-start gap-3 text-[14px] text-gray-700">
                    <CheckCircle2 size={18} className="text-emerald-500 mt-[2px] shrink-0" />
                    {decision}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Items */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-[15px]">Action Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-500">
                      <th className="pb-3 font-medium w-[45%]">Task</th>
                      <th className="pb-3 font-medium">Owner</th>
                      <th className="pb-3 font-medium">Due Date</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {actionItems.map((item, index) => (
                      <tr key={index}>
                        <td className="py-4 text-[#475467] font-medium pr-2">{item.task}</td>
                        <td className="py-4 text-[#475467]">{item.owner}</td>
                        <td className="py-4 text-[#475467]">{item.dueDate}</td>
                        <td className="py-4">
                          <span className="px-2.5 py-1 rounded-[6px] text-xs font-medium bg-[#FFF4ED] text-[#B93815]">
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}