import React from 'react';
import TaskCard from './TaskCard';

export default function KanbanColumn({ column }) {
  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${column.dotColor}`} />
          <h3 className="text-sm font-bold text-gray-900">{column.title}</h3>
          <span className="text-xs font-semibold text-gray-400 bg-gray-200/60 px-2 py-0.5 rounded-full">
            {column.count}
          </span>
        </div>
        <button type="button" className="text-gray-400 hover:text-gray-600 p-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </button>
      </div>

      {/* Add Task Button */}
      <button
        type="button"
        className="w-full py-2 bg-white/70 hover:bg-white border border-dashed border-gray-200 rounded-xl text-xs font-semibold text-gray-500 flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>Add task</span>
      </button>

      {/* Tasks List */}
      <div className="space-y-3">
        {column.tasks.length > 0 ? (
          column.tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))
        ) : (
          <div className="py-8 text-center bg-white/40 rounded-2xl border border-dashed border-gray-200/60">
            <p className="text-xs font-medium text-gray-400">No tasks found</p>
          </div>
        )}
      </div>
    </div>
  );
}