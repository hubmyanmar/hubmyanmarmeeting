import React, { useState } from 'react';
import { Mic, BookOpen, Lightbulb, X, Download } from 'lucide-react';

export default function RecentNotes({ onOpenSpeak }) {
  const [selectedNote, setSelectedNote] = useState(null);

  // စမ်းသပ်ရန် Note စာရင်းများ
  const notesList = [
    {
      id: 1,
      title: "Vue.js Composables",
      time: "Today · 10:30 AM",
      icon: <BookOpen size={20} />,
      description: "Learn Vue composables and practice building reusable logic. Composables are a unique way to leverage Vue's Composition API for stateful logic extraction and reusability across multiple components in large-scale applications."
    },
    {
      id: 2,
      title: "Project Idea",
      time: "Yesterday · 8:20 PM",
      icon: <Lightbulb size={20} />,
      description: "Build a voice to Notion app for personal productivity. This tool allows users to record quick voice notes, automatically transcribes them using AI, and saves them directly into structured Notion databases."
    },
    {
      id: 3,
      title: "Project Idea",
      time: "Yesterday · 8:20 PM",
      icon: <Lightbulb size={20} />,
      description: "Build a voice to Notion app for personal productivity. This tool allows users to record quick voice notes, automatically transcribes them using AI, and saves them directly into structured Notion databases."
    },
    {
      id: 4,
      title: "Project Idea",
      time: "Yesterday · 8:20 PM",
      icon: <Lightbulb size={20} />,
      description: "Build a voice to Notion app for personal productivity. This tool allows users to record quick voice notes, automatically transcribes them using AI, and saves them directly into structured Notion databases."
    },
    {
      id: 5,
      title: "Project Idea",
      time: "Yesterday · 8:20 PM",
      icon: <Lightbulb size={20} />,
      description: "Build a voice to Notion app for personal productivity. This tool allows users to record quick voice notes, automatically transcribes them using AI, and saves them directly into structured Notion databases."
    },
    {
      id: 6,
      title: "Project Idea",
      time: "Yesterday · 8:20 PM",
      icon: <Lightbulb size={20} />,
      description: "Build a voice to Notion app for personal productivity. This tool allows users to record quick voice notes, automatically transcribes them using AI, and saves them directly into structured Notion databases."
    }

  ];

  // Note ကို Text ဖိုင်အနေနဲ့ Download ဆွဲမယ့် Function
  const handleDownload = (note) => {
    const fileContent = `Title: ${note.title}\nTime: ${note.time}\n\nDescription:\n${note.description}`;
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${note.title.replace(/\s+/g, '_')}_note.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Grid မှာ items-start ထည့်ပေးထားလို့ ခလုတ်ပုံစံ မပျက်တော့ပါ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 items-start">
        
        {/* Tap to speak button */}
        <button
          onClick={onOpenSpeak} // အပြင်က Prop (သို့မဟုတ်) function ကို လှမ်းခေါ်မည်
          className="md:col-span-1 p-8 rounded-[28px] border border-gray-100 shadow-sm hover:shadow-md transition bg-white flex flex-col items-center justify-center text-center group self-start w-full cursor-pointer"
        >
          <div className="w-24 h-24 rounded-full bg-violet-50 flex items-center justify-center group-hover:scale-105 transition-transform">
            <div className="w-16 h-16 rounded-full bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-200">
              <Mic size={28} color="white" />
            </div>
          </div>
          <h3 className="font-semibold text-lg mt-5 text-gray-800">Tap to speak</h3>
          <p className="text-gray-400 text-sm mt-1">Start recording your thought</p>
        </button>

        {/* Recent notes section */}
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg text-gray-800">Recent notes</h3>
            <button className="text-violet-600 font-medium text-sm hover:underline">View all</button>
          </div>

          <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm divide-y divide-gray-50 max-h-[420px] overflow-y-auto">
            {notesList.map((note) => (
              <div 
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className="cursor-pointer hover:bg-gray-50 transition p-4 flex items-start gap-3"
              >
                <div className="p-2 bg-violet-50 text-violet-600 rounded-xl mt-1">
                  {note.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800">{note.title}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">{note.time}</p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-1">{note.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- DETAIL MODAL --- */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setSelectedNote(null)}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl">
                {selectedNote.icon}
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-800">{selectedNote.title}</h3>
                <p className="text-xs text-gray-400">{selectedNote.time}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 max-h-60 overflow-y-auto mb-6">
              <p className="text-gray-700 text-sm whitespace-pre-line leading-relaxed">
                {selectedNote.description}
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedNote(null)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition"
              >
                Close
              </button>
              
              <button
                onClick={() => handleDownload(selectedNote)}
                className="px-5 py-2.5 rounded-xl bg-violet-600 text-white font-medium text-sm hover:bg-violet-700 transition flex items-center gap-2 shadow-lg shadow-violet-200"
              >
                <Download size={16} />
                Download File
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}