import { useState } from "react";
import {
  Settings, Mic, FileText, Home, Bookmark,
  Lightbulb, BookOpen, ChevronLeft, MoreHorizontal, Check,
  Activity, Upload 
} from "lucide-react";

import QuickVoiceNote from './components/QuickVoiceNote';
import LiveTranscription from './components/LiveTranscription';
import UploadFile from './components/UploadFile';
import TranscribeToText from './components/TranscribeToText';
import RecentNotes from './components/RecentNotes';

function AudioToNoteApp() {
  const [screen, setScreen] = useState("home");
  const [title, setTitle] = useState("Vue.js Composables");
  const [note, setNote] = useState("Today I want to learn Vue.js composables and practice them this week.");
  
  const [showSpeakSelect, setShowSpeakSelect] = useState(false);

  return (
    <div className="min-h-screen bg-[#f6f7fb] flex flex-col md:flex-row text-gray-800 font-sans">
      
      {/* 1. WEB SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 p-6 h-screen sticky top-0 justify-between shrink-0">
        <div>
          <div className="px-3 py-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Voice<span className="text-violet-600">Note</span>
            </h1>
          </div>

          <nav className="mt-8 flex flex-col gap-2">
            <button 
              onClick={() => setScreen("home")}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition ${
                screen === "home" ? "bg-violet-50 text-violet-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              <Home size={20} />
              <span>Home</span>
            </button>

            <button 
              onClick={() => setScreen("review")}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition ${
                screen === "review" ? "bg-violet-50 text-violet-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              <FileText size={20} />
              <span>Notes</span>
            </button>
          </nav>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => setShowSpeakSelect(true)}
            className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-violet-100 transition"
          >
            <Mic size={18} />
            <span>Create Note</span>
          </button>
          
          <button className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-gray-800 font-medium transition">
            <Settings size={20} />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col min-h-screen relative">
        <div className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-10 pb-28 md:pb-10">

          {/* HOME SCREEN */}
          {screen === "home" && (
            <main className="animate-fade-in">
              <header className="flex md:hidden items-center justify-between mb-6 pt-2">
                <h1 className="text-2xl font-bold">
                  Voice<span className="text-violet-600">Note</span>
                </h1>
                <button className="p-2 hover:bg-gray-100 rounded-full transition">
                  <Settings size={22} className="text-gray-700" />
                </button>
              </header>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Welcome to HUB Myanmar Meeting,👋
              </h2>
              <p className="text-gray-500 mt-1">
                What do you want to remember?
              </p>
              <RecentNotes onOpenSpeak={() => setShowSpeakSelect(true)} />
            </main>
          )}

          {screen === "quick_voice_note" && (
            <QuickVoiceNote
              goBack={() => setScreen("home")}
              goReview={() => setScreen("transcribe_text")} 
            />
          )}

          {/* 2. Upload File -> TranscribeToText သို့သွားမည် */}
          {screen === "upload_file" && (
            <UploadFile 
              goBack={() => setScreen("home")} 
              goReview={() => setScreen("transcribe_text")} 
            />
          )}

          {/* 3. Live Transcription -> Real-time ပြပြီး Home/Review သို့ တိုက်ရိုက်သွားနိုင်မည် */}
          {screen === "live_transcription" && (
            <LiveTranscription 
              goBack={() => setScreen("home")} 
              goReview={() => setScreen("review")} 
            />
          )}

          {/* 4. TranscribeToText (Intermediate Screen) -> Save နှိပ်ပါက Notes (review) သို့သွားမည် */}
          {screen === "transcribe_text" && (
            <TranscribeToText 
              goBack={() => setScreen("home")}
              onSave={() => setScreen("review")}
            />
          )}

          {/* 5. NOTES (REVIEW) SCREEN */}
          {screen === "review" && (
            <main className="max-w-xl mx-auto pt-6 animate-fade-in">
              <div className="flex items-center justify-between mb-8">
                <button onClick={() => setScreen("home")} className="p-2 hover:bg-gray-100 rounded-full transition">
                  <ChevronLeft size={24} />
                </button>
                <h2 className="font-semibold text-lg">My Notes</h2>
                <button className="p-2 hover:bg-gray-100 rounded-full transition">
                  <MoreHorizontal size={22} />
                </button>
              </div>

              <div className="space-y-6 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
                <div>
                  <label className="font-semibold text-sm text-gray-700">Title</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-violet-500" />
                </div>
                
                <div>
                  <label className="font-semibold text-sm text-gray-700">Note</label>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} rows="5" className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-200 outline-none resize-none focus:border-violet-500" />
                </div>

                <div className="flex gap-3 pt-4">
                  <button onClick={() => setScreen("home")} className="flex-1 py-3.5 rounded-xl border border-gray-200 font-semibold hover:bg-gray-50 transition">
                    Edit
                  </button>
                  <button onClick={() => setScreen("home")} className="flex-1 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold flex items-center justify-center gap-2 shadow-md shadow-violet-100 transition">
                    Save <Check size={18} />
                  </button>
                </div>
              </div>
            </main>
          )}

        </div>

        {/* MOBILE BOTTOM NAVIGATION */}
        {(screen === "home" || screen === "review") && (
          <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 border-t border-gray-100 flex items-center justify-around bg-white/90 backdrop-blur-md z-30">
            <button onClick={() => setScreen("home")} className={`flex flex-col items-center gap-1 ${screen === "home" ? "text-violet-600" : "text-gray-400"}`}>
              <Home size={22} />
              <span className="text-[11px]">Home</span>
            </button>
            <button onClick={() => setScreen("review")} className={`flex flex-col items-center gap-1 ${screen === "review" ? "text-violet-600" : "text-gray-400"}`}>
              <FileText size={22} />
              <span className="text-[11px]">Notes</span>
            </button>
            <button onClick={() => setShowSpeakSelect(!showSpeakSelect)} className="flex flex-col items-center gap-1 text-gray-400">
              <div className="bg-violet-50 text-violet-600 p-2 rounded-full">
                <Mic size={20} />
              </div>
            </button>
          </nav>
        )}
      </div>

      {/* ACTION SHEET / MODAL MENU */}
      {showSpeakSelect && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div 
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowSpeakSelect(false)}
          />

          <div className="relative w-full md:max-w-md bg-white rounded-t-[28px] md:rounded-[28px] p-4 md:p-6 shadow-2xl border border-gray-100/50 z-10 transition-transform animate-in fade-in slide-in-from-bottom-5">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4 md:hidden" />
            
            <h3 className="hidden md:block font-bold text-lg text-gray-800 mb-4 px-2">Choose Action</h3>

            <div className="flex flex-col gap-1">
              <OptionItem 
                icon={<Mic size={22} className="text-violet-600" />} bg="bg-violet-100" title="Quick Voice Note" desc="Record and save directly" 
                onClick={() => { setShowSpeakSelect(false); setScreen("quick_voice_note"); }} 
              />
              <OptionItem 
                icon={<Activity size={22} className="text-emerald-600" />} bg="bg-emerald-50" title="Live Transcription" desc="Real-time voice to text conversion" 
                onClick={() => { setShowSpeakSelect(false); setScreen("live_transcription"); }} 
              />
              <OptionItem 
                icon={<Upload size={22} className="text-amber-600" />} bg="bg-amber-50" title="Upload File" desc="Import existing audio for transcription" 
                onClick={() => { setShowSpeakSelect(false); setScreen("upload_file"); }} 
              />
            </div>

            <div className="h-px bg-gray-100 my-3" />

            <button 
              onClick={() => setShowSpeakSelect(false)} 
              className="w-full py-3 font-semibold text-gray-500 hover:bg-gray-50 rounded-2xl transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

function NoteItem({ icon, title, time, description }) {
  return (
    <div className="p-4 hover:bg-gray-50 transition cursor-pointer flex gap-4">
      <div className="text-violet-600 mt-0.5">{icon}</div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h4 className="font-semibold text-gray-800">{title}</h4>
          <Bookmark size={16} className="text-gray-300 hover:text-violet-600 transition" />
        </div>
        <p className="text-xs text-gray-400 font-medium mt-0.5">{time}</p>
        <p className="text-sm text-gray-500 mt-1 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function OptionItem({ icon, bg, title, desc, onClick }) {
  return (
    <button 
      onClick={onClick} 
      className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 active:bg-gray-100 transition text-left"
    >
      <div className={`w-12 h-12 rounded-full ${bg} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="font-semibold text-gray-800 text-sm md:text-base">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
    </button>
  );
}

export default AudioToNoteApp;