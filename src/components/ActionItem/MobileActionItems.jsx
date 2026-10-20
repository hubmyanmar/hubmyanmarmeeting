import React, { useEffect, useState } from 'react';

const STAT_COLORS = {
  'Total Tasks': 'border-indigo-100 bg-indigo-50 text-indigo-700',
  'In Progress': 'border-blue-100 bg-blue-50 text-blue-700',
  'Under Review': 'border-rose-100 bg-rose-50 text-rose-700',
  Completed: 'border-emerald-100 bg-emerald-50 text-emerald-700',
};

export default function MobileActionItems({
  columns,
  stats,
  searchQuery,
  onSearchChange,
  onDateRangeChange,
  users,
  meetings,
  currentMeeting,
  currentMeetingId,
  onAddTask,
  onStatusChange,
}) {
  const [activeColumnId, setActiveColumnId] = useState(columns[0]?.id || 'todo');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);
    const toInputDate = (date) => date.toISOString().split('T')[0];
    setStartDate(toInputDate(lastMonth));
    setEndDate(toInputDate(today));
  }, []);

  useEffect(() => {
    if (startDate && endDate) onDateRangeChange(startDate, endDate);
  }, [startDate, endDate, onDateRangeChange]);

  const activeColumn = columns.find((column) => column.id === activeColumnId) || columns[0];

  const handleCreate = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const created = await onAddTask({
      title: formData.get('title'),
      meeting_id: formData.get('meeting_id'),
      assignee: formData.get('assignee'),
      priority: formData.get('priority'),
      dueDate: formData.get('dueDate'),
      status: 'To Do',
    });
    if (created) setShowAddSheet(false);
  };

  const handleStatusChange = async (event) => {
    const status = event.target.value;
    const updated = await onStatusChange(selectedTask, status);
    if (updated) setSelectedTask(null);
  };

  const closeOnBackdrop = (event, close) => {
    if (event.target === event.currentTarget) close();
  };

  return (
    <div className="w-auto -mx-8 -mt-8 px-3 pt-4 pb-24">
      <h1 className="mb-4 text-xl font-extrabold tracking-tight text-gray-900">
        {currentMeeting?.title ? `Action Items: ${currentMeeting.title}` : 'Action Items'}
      </h1>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {columns.map((column) => (
          <button
            key={column.id}
            type="button"
            onClick={() => setActiveColumnId(column.id)}
            aria-pressed={activeColumnId === column.id}
            className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${activeColumnId === column.id ? 'border-[#5538ee] bg-[#5538ee] text-white' : 'border-gray-200 bg-white text-gray-600'}`}
          >
            {column.title} <span className="ml-1 opacity-75">{column.tasks.length}</span>
          </button>
        ))}
      </div>

      <div className="mb-4 -mx-3 overflow-x-auto px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max gap-4 pb-1">
          {stats.map((stat) => (
            <div key={stat.id} className={`w-36 shrink-0 rounded-2xl border p-3 ${STAT_COLORS[stat.title] || 'border-gray-100 bg-white text-gray-700'}`}>
              <p className="text-[11px] font-semibold opacity-80">{stat.title}</p>
              <p className="mt-1 text-2xl font-extrabold">{stat.count}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4 space-y-2.5">
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search tasks, meetings, people..."
          className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />
        <div className="grid grid-cols-2 gap-2">
          <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            Start date
            <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-2.5 py-2.5 text-xs font-normal text-gray-700" />
          </label>
          <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            End date
            <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-2.5 py-2.5 text-xs font-normal text-gray-700" />
          </label>
        </div>
      </div>

      <div className="space-y-2.5">
        {activeColumn?.tasks.length ? activeColumn.tasks.map((task) => (
          <button
            key={task.id}
            type="button"
            onClick={() => setSelectedTask(task)}
            className="block w-full rounded-2xl border border-gray-100 bg-white p-3.5 text-left shadow-sm active:bg-indigo-50/40"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-bold leading-snug text-gray-900">{task.title}</span>
              <span className={`shrink-0 rounded-lg border px-2 py-1 text-[10px] font-semibold ${task.priority === 'High' ? 'border-red-100 bg-red-50 text-red-600' : task.priority === 'Low' ? 'border-emerald-100 bg-emerald-50 text-emerald-600' : 'border-amber-100 bg-amber-50 text-amber-600'}`}>
                {task.priority}
              </span>
            </div>
            <p className="mt-1.5 truncate text-xs text-gray-500">{task.meeting}</p>
            <div className="mt-1.5 flex items-center justify-between border-t border-gray-100 pt-1.5 text-xs text-gray-500">
              <span className="truncate pr-3">{task.assignee}</span>
              <span className="shrink-0">{task.date?.replace(/^(Due|Created|Recorded):\s*/i, '')}</span>
            </div>
          </button>
        )) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white/70 px-4 py-10 text-center text-sm text-gray-400">No tasks found</div>
        )}
      </div>

      <button
        type="button"
        aria-label="Add action item"
        onClick={() => setShowAddSheet(true)}
        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#5538ee] text-3xl font-light text-white shadow-lg shadow-indigo-900/20 active:scale-95"
      >
        +
      </button>

      {selectedTask && (
        <div className="fixed inset-0 z-[80] flex items-end bg-black/40" onClick={(event) => closeOnBackdrop(event, () => setSelectedTask(null))}>
          <section role="dialog" aria-modal="true" aria-label="Action item details" className="max-h-[88dvh] w-full overflow-y-auto rounded-t-3xl bg-white px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3 shadow-2xl">
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-gray-300" />
            <div className="mb-5 flex items-start justify-between gap-3">
              <h2 className="text-lg font-bold leading-snug text-gray-900">{selectedTask.title}</h2>
              <button type="button" onClick={() => setSelectedTask(null)} className="rounded-full px-2 text-xl text-gray-400" aria-label="Close details">×</button>
            </div>
            <dl className="space-y-4 text-sm">
              <div><dt className="text-xs font-medium text-gray-400">Meeting</dt><dd className="mt-1 font-semibold text-gray-800">{selectedTask.meeting}</dd></div>
              <div className="grid grid-cols-2 gap-4">
                <div><dt className="text-xs font-medium text-gray-400">Priority</dt><dd className="mt-1 font-semibold text-gray-800">{selectedTask.priority}</dd></div>
                <div><dt className="text-xs font-medium text-gray-400">Assignee</dt><dd className="mt-1 font-semibold text-gray-800">{selectedTask.assignee}</dd></div>
              </div>
              <div><dt className="text-xs font-medium text-gray-400">Due date</dt><dd className="mt-1 font-semibold text-gray-800">{selectedTask.date?.startsWith('Due:') ? selectedTask.date.replace(/^Due:\s*/, '') : 'Not set'}</dd></div>
              <div>
                <label htmlFor="mobile-action-status" className="text-xs font-medium text-gray-400">Move to status</label>
                <select id="mobile-action-status" value={selectedTask.status} onChange={handleStatusChange} className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-semibold text-gray-800 outline-none focus:border-indigo-500">
                  {columns.map((column) => <option key={column.id} value={column.title}>{column.title}</option>)}
                </select>
              </div>
            </dl>
          </section>
        </div>
      )}

      {showAddSheet && (
        <div className="fixed inset-0 z-[80] flex items-end bg-black/40" onClick={(event) => closeOnBackdrop(event, () => setShowAddSheet(false))}>
          <section role="dialog" aria-modal="true" aria-label="Add action item" className="max-h-[90dvh] w-full overflow-y-auto rounded-t-3xl bg-white px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3 shadow-2xl">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-300" />
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Add Action Item</h2>
              <button type="button" onClick={() => setShowAddSheet(false)} className="rounded-full px-2 text-xl text-gray-400" aria-label="Close form">×</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3.5">
              <label className="block text-xs font-semibold text-gray-600">Task title *
                <input name="title" required maxLength={255} className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-3 text-sm font-normal outline-none focus:border-indigo-500" placeholder="Enter task title" />
              </label>
              <label className="block text-xs font-semibold text-gray-600">Meeting *
                {currentMeetingId ? (
                  <>
                    <input readOnly value={currentMeeting?.title || `Meeting #${currentMeetingId}`} className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm font-normal text-gray-700" />
                    <input type="hidden" name="meeting_id" value={currentMeetingId} />
                  </>
                ) : (
                  <select name="meeting_id" required defaultValue="" className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-normal text-gray-700">
                    <option value="" disabled>Select meeting...</option>
                    {meetings.map((meeting) => {
                      const id = meeting.meeting_id ?? meeting.id ?? meeting.meetingId;
                      return <option key={id} value={id}>{meeting.title || `Meeting #${id}`}</option>;
                    })}
                  </select>
                )}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-semibold text-gray-600">Assignee *
                  <select name="assignee" required defaultValue="" className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-2.5 py-3 text-xs font-normal text-gray-700">
                    <option value="" disabled>Select user...</option>
                    {users.map((user, index) => <option key={user.email || user.id || index} value={user.name || user.email}>{user.name || user.email} — {user.email}</option>)}
                  </select>
                </label>
                <label className="block text-xs font-semibold text-gray-600">Priority
                  <select name="priority" defaultValue="Medium" className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-normal text-gray-700">
                    <option>Low</option><option>Medium</option><option>High</option>
                  </select>
                </label>
              </div>
              <label className="block text-xs font-semibold text-gray-600">Due date
                <input type="date" name="dueDate" className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-normal text-gray-700" />
              </label>
              <button type="submit" className="mt-2 w-full rounded-xl bg-[#5538ee] px-4 py-3.5 text-sm font-semibold text-white active:bg-[#482ee0]">Create Task</button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
