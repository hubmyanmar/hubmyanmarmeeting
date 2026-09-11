import React from 'react';

export default function AddActionItemModal({ isOpen, onClose, onAddTask }) {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    
    const newTaskData = {
      title: formData.get('title'),
      meeting: formData.get('meeting'),
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
              <input 
                type="text" 
                name="meeting"
                placeholder="e.g. Marketing Sync"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
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
              <select name="assignee" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                <option value="">Select team member...</option>
                <option value="Alex Kim">Alex Kim</option>
                <option value="Sarah Chen">Sarah Chen</option>
                <option value="Priya Shah">Priya Shah</option>
                <option value="Yu Yu">Yu Yu</option>
              </select>
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