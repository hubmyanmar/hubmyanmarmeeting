import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initialColumns } from '../data/actionItemData';
import ActionNavbar from './ActionItem/ActionNavbar';
import ActionStats from './ActionItem/ActionStats';
import KanbanColumn from './ActionItem/KanbanColumn';
import AddActionItemModal from './ActionItem/AddActionItemModal';

export default function ActionItem({ meetingData: propMeetingData }) {
  const location = useLocation();
  const meetingData = propMeetingData || location.state?.meetingData || location.state;
  
  const loadActionItemsData = (currentMeetingData) => {
    const savedKanbanState = localStorage.getItem('myKanbanColumnsState');
    if (savedKanbanState && !currentMeetingData) {
      try {
        const parsedColumns = JSON.parse(savedKanbanState);
        if (Array.isArray(parsedColumns) && parsedColumns.length > 0) {
          return parsedColumns;
        }
      } catch (e) {
        console.error("Error parsing saved kanban state:", e);
      }
    }

    const updatedColumns = JSON.parse(JSON.stringify(initialColumns));
    const cleanColumns = updatedColumns.map(col => ({ ...col, tasks: [] }));
    let allActionItems = [];

    if (currentMeetingData && currentMeetingData.actionItems && currentMeetingData.actionItems.length > 0) {
      const meetingTime = currentMeetingData.createdAt || currentMeetingData.date || new Date().toLocaleString();
      currentMeetingData.actionItems.forEach(item => {
        allActionItems.push({
          ...item,
          meetingTitle: currentMeetingData.title || "Meeting Record",
          recordedAt: meetingTime
        });
      });
    } else {
      const savedSessionsRaw = localStorage.getItem('meetingSessions');
      if (savedSessionsRaw) {
        try {
          const savedSessions = JSON.parse(savedSessionsRaw);
          const sessionsList = Array.isArray(savedSessions) ? savedSessions : Object.values(savedSessions);
          sessionsList.forEach((session) => {
            if (session.actionItems && Array.isArray(session.actionItems)) {
              const sessionTime = session.date || session.timestamp || session.createdAt || new Date().toLocaleString();
              const sessionTitle = session.title || "Meeting Record";
              session.actionItems.forEach((item) => {
                allActionItems.push({
                  ...item,
                  meetingTitle: sessionTitle,
                  recordedAt: sessionTime
                });
              });
            }
          });
        } catch (e) {}
      }
    }

    const savedManualTasksRaw = localStorage.getItem('myManualActionItems');
    if (savedManualTasksRaw) {
      try {
        const manualTasks = JSON.parse(savedManualTasksRaw);
        if (Array.isArray(manualTasks)) {
          manualTasks.forEach(task => allActionItems.push(task));
        }
      } catch (e) {}
    }

    if (allActionItems.length > 0) {
      allActionItems.forEach((item, index) => {
        if (item.isManual) {
          const targetStatus = item.status || "To Do";
          let colIndex = cleanColumns.findIndex(c => c.title.toLowerCase() === targetStatus.toLowerCase());
          if (colIndex === -1) colIndex = 0;
          cleanColumns[colIndex].tasks.push(item);
          return;
        }

        let rawAssignees = item.owner || item.assignee || "Unassigned";
        let assigneesList = Array.isArray(rawAssignees) ? rawAssignees : 
                            (typeof rawAssignees === 'string' ? rawAssignees.split(',').map(n => n.trim()) : [String(rawAssignees)]);

        assigneesList.forEach((singleAssignee, subIndex) => {
          const assigneeName = singleAssignee || "Unassigned";
          const newTask = {
            id: item.id || `task-${Date.now()}-${index}-${subIndex}`,
            title: item.task || item.title || "Untitled Task",
            assignee: assigneeName,
            date: item.dueDate ? `Due: ${item.dueDate}` : `Recorded: ${item.recordedAt}`,
            meeting: item.meeting || `${item.meetingTitle} • ${item.recordedAt}`, 
            priority: item.priority || "Medium",
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(assigneeName)}&background=random`,
            completed: item.status === "Done" || item.status === "Completed",
            status: item.status || "To Do",
            isManual: false
          };

          const targetStatus = item.status || "To Do";
          let colIndex = cleanColumns.findIndex(c => c.title.toLowerCase() === targetStatus.toLowerCase());
          if (colIndex === -1) colIndex = 0; 
          cleanColumns[colIndex].tasks.push(newTask);
        });
      });
    }

    return cleanColumns;
  };

  const [columns, setColumns] = useState(() => loadActionItemsData(meetingData));
  const [searchQuery, setSearchQuery] = useState('');
  
  // 💡 1. Date Range များကို သိမ်းဆည်းရန် State အသစ်
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setColumns(loadActionItemsData(meetingData));
  }, [meetingData]);

  const handleDragStart = (e, taskId, sourceColId) => {
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.setData("sourceColId", sourceColId);
  };

  const handleDrop = (e, destColId) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    const sourceColId = e.dataTransfer.getData("sourceColId");
    
    if (sourceColId === destColId) return;

    setColumns((prevCols) => {
      const newCols = JSON.parse(JSON.stringify(prevCols));
      const sourceColIndex = newCols.findIndex(c => c.id === sourceColId);
      const destColIndex = newCols.findIndex(c => c.id === destColId);

      if (sourceColIndex === -1 || destColIndex === -1) return prevCols;

      const sourceCol = newCols[sourceColIndex];
      const destCol = newCols[destColIndex];

      const taskIndex = sourceCol.tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return prevCols;

      const [movedTask] = sourceCol.tasks.splice(taskIndex, 1);

      if (movedTask) {
        movedTask.status = destCol.title;
        destCol.tasks.push(movedTask);
      }

      localStorage.setItem('myKanbanColumnsState', JSON.stringify(newCols));
      return newCols;
    });
  };
  const filteredColumns = columns.map((col) => {
    const filteredTasks = col.tasks.filter((task) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || (
        task.title?.toLowerCase().includes(query) ||
        task.meeting?.toLowerCase().includes(query) ||
        task.assignee?.toLowerCase().includes(query) ||
        task.priority?.toLowerCase().includes(query)
      );
      let matchesDate = true;
      if (dateRange.start && dateRange.end && task.date) {
        
        const rawDateStr = task.date.replace(/^(Due|Created|Recorded):\s*/i, '').split(',')[0].trim();
        
        const taskDate = new Date(rawDateStr);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        
        taskDate.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        if (!isNaN(taskDate.getTime())) {
          matchesDate = taskDate >= startDate && taskDate <= endDate;
        }
      }

      return matchesSearch && matchesDate;
    });

    return {
      ...col,
      tasks: filteredTasks,
    };
  });

  const handleAddTask = (newTaskData) => {
    const targetStatus = newTaskData.status || "To Do";
    const newTask = {
      id: `task-manual-${Date.now()}`,
      title: newTaskData.title || "Untitled Task",
      assignee: newTaskData.assignee || "Unassigned",
      date: newTaskData.dueDate ? `Due: ${newTaskData.dueDate}` : `Created: ${new Date().toLocaleDateString()}`,
      meeting: newTaskData.meeting ? `${newTaskData.meeting} • Manual` : "Manual Task",
      priority: newTaskData.priority || "Medium",
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newTaskData.assignee || 'A')}&background=random`,
      completed: false,
      status: targetStatus,
      isManual: true 
    };

    const existingManualRaw = localStorage.getItem('myManualActionItems');
    let manualTasksList = [];
    try {
      if (existingManualRaw) {
        manualTasksList = JSON.parse(existingManualRaw);
        if (!Array.isArray(manualTasksList)) manualTasksList = [];
      }
    } catch (e) {}
    manualTasksList.push(newTask);
    localStorage.setItem('myManualActionItems', JSON.stringify(manualTasksList));

    setColumns((prevCols) => {
      const newCols = JSON.parse(JSON.stringify(prevCols));
      let colIndex = newCols.findIndex(c => c.title.toLowerCase() === targetStatus.toLowerCase());
      if (colIndex === -1) colIndex = 0; 
      newCols[colIndex].tasks.push(newTask);
      localStorage.setItem('myKanbanColumnsState', JSON.stringify(newCols));
      return newCols;
    });

    setIsModalOpen(false);
  };

  
  const totalTasksCount = filteredColumns.reduce((acc, col) => acc + col.tasks.length, 0);
  const inProgressCol = filteredColumns.find(c => c.title.toLowerCase() === 'in progress');
  const inProgressCount = inProgressCol ? inProgressCol.tasks.length : 0;
  const reviewCol = filteredColumns.find(c => c.title.toLowerCase() === 'under review' || c.title.toLowerCase() === 'overdue');
  const reviewCount = reviewCol ? reviewCol.tasks.length : 0;
  const completedCol = filteredColumns.find(c => c.title.toLowerCase() === 'completed' || c.title.toLowerCase() === 'done');
  const completedCount = completedCol ? completedCol.tasks.length : 0;

  const dynamicStats = [
    { id: 1, type: 'list', title: 'Total Tasks', count: totalTasksCount, change: '+12% from last month', trendColor: 'text-emerald-600', bgColor: 'bg-indigo-50', iconColor: 'text-[#5538ee]', sparklinePath: 'M2 25L25 15L50 18L75 8L98 20L118 5' },
    { id: 2, type: 'progress', title: 'In Progress', count: inProgressCount, change: '+2% from last month', trendColor: 'text-emerald-600', bgColor: 'bg-blue-50', iconColor: 'text-blue-600', sparklinePath: 'M2 20L25 22L50 12L75 15L98 8L118 12' },
    { id: 3, type: 'overdue', title: 'Under Review', count: reviewCount, change: '+67% from last month', trendColor: 'text-rose-600', bgColor: 'bg-rose-50', iconColor: 'text-rose-600', sparklinePath: 'M2 10L25 18L50 8L75 22L98 12L118 18' },
    { id: 4, type: 'completed', title: 'Completed', count: completedCount, change: '+22% from last month', trendColor: 'text-emerald-600', bgColor: 'bg-emerald-50', iconColor: 'text-emerald-600', sparklinePath: 'M2 22L25 15L50 18L75 10L98 15L118 4' }
  ];

  return (
    <div className="min-h-screen bg-[#f8faef]/40 text-gray-800 font-sans pb-12 relative">
      
      <ActionNavbar 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery} 
        onDateRangeChange={(start, end) => setDateRange({ start, end })}
      />

      <div className="max-w-[1440px] mx-auto px-8 pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {meetingData?.title ? `Action Items: ${meetingData.title}` : "Action Items (All Meetings)"}
            </h1>
            <p className="text-gray-400 mt-1 text-xs sm:text-sm font-normal">
              Track and manage tasks from your meetings. Turn discussions into outcomes.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#5538ee] hover:bg-[#482ee0] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Action Item</span>
            </button>
          </div>
        </div>

        <ActionStats stats={dynamicStats} />

        {meetingData?.keyDecisions && meetingData.keyDecisions.length > 0 && (
          <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#5538ee]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Key Decisions
            </h3>
            <ul className="space-y-2">
              {meetingData.keyDecisions.map((decision, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5538ee] mt-1.5 shrink-0" />
                  {decision}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start mt-8">
          {filteredColumns.map((col) => (
            <KanbanColumn 
              key={col.id} 
              column={col} 
              onDragStart={handleDragStart} 
              onDrop={handleDrop}           
            />
          ))}
        </div>
      </div>

      <AddActionItemModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddTask={handleAddTask} 
      />
    </div>
  );
}