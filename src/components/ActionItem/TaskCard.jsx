import React from 'react';

export default function TaskCard({ task, columnId, onDragStart }) {
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-50 text-red-600 border-red-100';
      case 'Medium':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Low':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };
  const isCompleted = task.completed || task.status === 'Completed' || columnId === 'completed' || columnId === 'done';

  return (
    <div 
      draggable={true} 
      onDragStart={(e) => onDragStart(e, task.id, columnId)}
      className={`cursor-grab active:cursor-grabbing rounded-2xl p-4 border transition-all flex flex-col justify-between h-[155px] ${
        isCompleted 
          ? 'bg-emerald-50/20 border-emerald-100 shadow-2xs' 
          : 'bg-white border-gray-100 shadow-2xs hover:shadow-md'
      }`}
    >
      {/* Top Section: Title & Icon */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 overflow-hidden">
          {isCompleted && (
            <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
          <h4 className={`text-xs font-bold leading-snug line-clamp-2 ${isCompleted ? 'line-through text-gray-500' : 'text-gray-950'}`}>
            {task.title}
          </h4>
        </div>
        <button type="button" className="text-gray-300 hover:text-gray-500 shrink-0">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </button>
      </div>

      {/* Middle Section: Badges (Meeting & Priority) */}
      <div className="flex items-center gap-2 flex-wrap my-2">
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50/80 rounded-lg text-[11px] font-semibold text-blue-600 truncate max-w-[130px]">
          <svg className="w-3 h-3 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
          <span className="truncate">{task.meeting}</span>
        </div>
        <span className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${getPriorityStyle(task.priority)}`}>
          {task.priority}
        </span>
      </div>

      {/* Bottom Section: Assignee & Date */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100/80">
        <div className="flex items-center gap-1.5">
          <img src={task.avatar} alt={task.assignee} className="w-5 h-5 rounded-full object-cover border border-gray-200" />
          <span className="text-[11px] font-medium text-gray-700 truncate max-w-[80px]">{task.assignee}</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium shrink-0">
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{task.date}</span>
        </div>
      </div>
    </div>
  );
}