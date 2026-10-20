import React, { useEffect, useRef, useState } from 'react';

export default function AddActionItemModal({
  isOpen,
  onClose,
  onAddTask,
  users = [],
  meetings = [],
  currentMeeting,
  currentMeetingId,
}) {
  const [assigneeInput, setAssigneeInput] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState(null);
  const [showAssigneeSuggestions, setShowAssigneeSuggestions] = useState(false);
  const assigneeDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (assigneeDropdownRef.current && !assigneeDropdownRef.current.contains(event.target)) {
        setShowAssigneeSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setAssigneeInput('');
      setSelectedAssignee(null);
      setShowAssigneeSuggestions(false);
    }
  }, [isOpen]);

  const availableAssigneeSuggestions = users.filter((user) => {
    const query = assigneeInput.toLowerCase();
    return (user.name || '').toLowerCase().includes(query) || (user.email || '').toLowerCase().includes(query);
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedAssignee) {
      setShowAssigneeSuggestions(true);
      return;
    }

    const formData = new FormData(e.target);
    
    const newTaskData = {
      title: formData.get('title'),
      meeting_id: formData.get('meeting_id'),
      priority: formData.get('priority'),
      assignee: formData.get('assignee'),
      dueDate: formData.get('dueDate'),
      status: "To Do"
    };
    
    onAddTask(newTaskData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Add New Action Item</h2>
          <button 
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          
          {/* Task Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Task Title *</label>
            <input 
              type="text" 
              name="title"
              required
              placeholder="e.g. Prepare Q2 marketing strategy deck" 
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Project / Meeting */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Project / Meeting</label>
              {currentMeetingId ? (
                <>
                  <input
                    type="text"
                    value={currentMeeting?.title || `Meeting #${currentMeetingId}`}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input type="hidden" name="meeting_id" value={currentMeetingId} />
                </>
              ) : (
                <select
                  name="meeting_id"
                  required
                  defaultValue=""
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="" disabled>Select meeting...</option>
                  {meetings.map((meeting) => {
                    const id = meeting.meeting_id ?? meeting.id ?? meeting.meetingId;
                    return (
                      <option key={id} value={id}>
                        {meeting.title || `Meeting #${id}`}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Priority</label>
              <select name="priority" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                <option value="Low">Low</option>
                <option value="Medium" defaultValue>Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Assignee */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Assignee</label>
              <div className="relative" ref={assigneeDropdownRef}>
                <input
                  type="text"
                  value={assigneeInput}
                  required
                  autoComplete="off"
                  placeholder="Select team member..."
                  aria-autocomplete="list"
                  aria-expanded={showAssigneeSuggestions}
                  onChange={(e) => {
                    setAssigneeInput(e.target.value);
                    setSelectedAssignee(null);
                    setShowAssigneeSuggestions(true);
                  }}
                  onFocus={() => setShowAssigneeSuggestions(true)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
                <input
                  type="hidden"
                  name="assignee"
                  value={selectedAssignee ? (selectedAssignee.name || selectedAssignee.email) : ''}
                />
                {showAssigneeSuggestions && availableAssigneeSuggestions.length > 0 && (
                  <ul role="listbox" className="absolute z-30 w-full bg-white border border-gray-100 rounded-xl shadow-lg mt-1 max-h-40 overflow-y-auto divide-y divide-gray-50">
                    {availableAssigneeSuggestions.map((user, index) => (
                      <li
                        key={user.email || user.zoho_user_id || user.id || index}
                        role="option"
                        aria-selected={selectedAssignee === user}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setSelectedAssignee(user);
                          setAssigneeInput(user.name || 'Unnamed user');
                          setShowAssigneeSuggestions(false);
                        }}
                        className="px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer transition-colors"
                      >
                        <div className="font-medium text-gray-900">{user.name || 'Unnamed user'}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Due Date</label>
              <input 
                type="date" 
                name="dueDate"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-600"
              />
            </div>
          </div>

          {/* Modal Footer / Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 text-sm font-semibold text-white bg-[#5538ee] hover:bg-[#482ee0] rounded-lg shadow-sm transition-colors"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
