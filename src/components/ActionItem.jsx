import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api';
import { initialColumns, statusToApi, statusFromApi } from '../data/actionItemData';
import ActionNavbar from './ActionItem/ActionNavbar';
import ActionStats from './ActionItem/ActionStats';
import KanbanColumn from './ActionItem/KanbanColumn';
import AddActionItemModal from './ActionItem/AddActionItemModal';
import MobileActionItems from './ActionItem/MobileActionItems';

const getMeetingId = (meeting) => meeting?.meeting_id ?? meeting?.id ?? meeting?.meetingId ?? null;

const toTask = (item, meetings) => {
  const meeting = meetings.find((entry) => String(getMeetingId(entry)) === String(item.meeting_id));
  const assignee = item.owner_name || 'Unassigned';
  const status = statusFromApi[item.status] || 'To Do';
  return {
    id: item.id,
    title: item.task || 'Untitled Task',
    assignee,
    date: item.due_date ? `Due: ${item.due_date}` : `Created: ${item.created_at || ''}`,
    meeting: meeting?.title || `Meeting #${item.meeting_id}`,
    priority: item.priority || 'Medium',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(assignee)}&background=random`,
    completed: status === 'Completed',
    status,
    meeting_id: item.meeting_id,
  };
};

export default function ActionItem({ meetingData: propMeetingData }) {
  const location = useLocation();
  const meetingData = propMeetingData || location.state?.meetingData || location.state?.meeting || location.state;
  const contextMeetingId = getMeetingId(meetingData);
  const [columns, setColumns] = useState(() => initialColumns.map((column) => ({ ...column, tasks: [] })));
  const [meetings, setMeetings] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    const [itemsResult, meetingsResult, usersResult] = await Promise.allSettled([
      api.get('/action-items/'),
      api.get('/meetings/'),
      api.get('/auth/users'),
    ]);
    const fetchedMeetings = meetingsResult.status === 'fulfilled' && Array.isArray(meetingsResult.value.data)
      ? meetingsResult.value.data
      : [];
    const fetchedItems = itemsResult.status === 'fulfilled' && Array.isArray(itemsResult.value.data)
      ? itemsResult.value.data
      : [];
    if (itemsResult.status === 'rejected') {
      console.error('Failed to load action items:', itemsResult.reason);
    }
    if (meetingsResult.status === 'rejected') {
      console.error('Failed to load meetings:', meetingsResult.reason);
    }
    if (usersResult.status === 'rejected') {
      console.error('Failed to load Zoho users:', usersResult.reason);
    }
    setMeetings(fetchedMeetings);
    setUsers(usersResult.status === 'fulfilled' && Array.isArray(usersResult.value.data)
      ? usersResult.value.data
      : []);
    const tasks = fetchedItems.map((item) => toTask(item, fetchedMeetings));
    setColumns(initialColumns.map((column) => ({
      ...column,
      tasks: tasks.filter((task) => statusToApi[task.status] === statusToApi[column.title]),
    })));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDateRangeChange = useCallback((start, end) => {
    setDateRange((prevRange) => (
      prevRange.start === start && prevRange.end === end ? prevRange : { start, end }
    ));
  }, []);

  const handleDragStart = (e, taskId, sourceColId) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.setData('sourceColId', sourceColId);
  };

  const handleDrop = async (e, destColId) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const sourceColId = e.dataTransfer.getData('sourceColId');
    if (sourceColId === destColId) return;

    const sourceColumn = columns.find((column) => column.id === sourceColId);
    const destinationColumn = columns.find((column) => column.id === destColId);
    const task = sourceColumn?.tasks.find((item) => String(item.id) === String(taskId));
    if (!task || !destinationColumn) return;

    try {
      const { data } = await api.put(`/action-items/${task.id}`, {
        status: statusToApi[destinationColumn.title],
      });
      const updatedTask = toTask(data, meetings);
      setColumns((previous) => previous.map((column) => ({
        ...column,
        tasks: column.id === sourceColId
          ? column.tasks.filter((item) => String(item.id) !== String(task.id))
          : column.id === destColId
            ? [...column.tasks.filter((item) => String(item.id) !== String(task.id)), updatedTask]
            : column.tasks,
      })));
    } catch (error) {
      console.error('Failed to update action item status:', error);
    }
  };

  const filteredColumns = useMemo(() => columns.map((column) => ({
    ...column,
    tasks: column.tasks.filter((task) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || [task.title, task.meeting, task.assignee, task.priority]
        .some((value) => value?.toLowerCase().includes(query));
      let matchesDate = true;
      if (dateRange.start && dateRange.end && task.date) {
        const rawDate = task.date.replace(/^(Due|Created|Recorded):\s*/i, '').split(',')[0].trim();
        const taskDate = new Date(rawDate);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        taskDate.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        if (!isNaN(taskDate.getTime())) matchesDate = taskDate >= startDate && taskDate <= endDate;
      }
      return matchesSearch && matchesDate;
    }),
  })), [columns, searchQuery, dateRange]);

  const totalTasksCount = filteredColumns.reduce((total, column) => total + column.tasks.length, 0);
  const countFor = (apiStatus) => filteredColumns.reduce((total, column) => (
    total + column.tasks.filter((task) => statusToApi[task.status] === apiStatus).length
  ), 0);
  const inProgressCount = countFor('in_progress');
  const reviewCount = countFor('under_review');
  const completedCount = countFor('complete');
  const calculateChange = (current, previous) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const percent = ((current - previous) / previous) * 100;
    return `${percent > 0 ? '+' : ''}${Math.round(percent)}%`;
  };
  let previousTotal = 0;
  let previousInProgress = 0;
  let previousReview = 0;
  let previousCompleted = 0;
  let periodLabel = 'from previous period';

  if (dateRange.start && dateRange.end) {
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const years = end.getFullYear() - start.getFullYear();
    const daysDiff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff >= 6 && daysDiff <= 8) periodLabel = 'from last week';
    else if (months === 1 || (months === 0 && daysDiff >= 28)) periodLabel = 'from last month';
    else if (months > 1 && months < 12) periodLabel = `from previous ${months} months`;
    else if (months === 12 || years === 1) periodLabel = 'from last year';
    else if (years > 1) periodLabel = `from previous ${years} years`;
    else periodLabel = `from previous ${daysDiff} days`;

    const duration = end.getTime() - start.getTime();
    const previousEnd = new Date(start.getTime() - 1);
    const previousStart = new Date(previousEnd.getTime() - duration);

    columns.forEach((column) => {
      const previousCount = column.tasks.filter((task) => {
        if (!task.date) return false;
        const rawDate = task.date.replace(/^(Due|Created|Recorded):\s*/i, '').split(',')[0].trim();
        const taskDate = new Date(rawDate);
        taskDate.setHours(0, 0, 0, 0);
        const rangeStart = new Date(previousStart);
        const rangeEnd = new Date(previousEnd);
        rangeStart.setHours(0, 0, 0, 0);
        rangeEnd.setHours(23, 59, 59, 999);
        return !isNaN(taskDate.getTime()) && taskDate >= rangeStart && taskDate <= rangeEnd;
      }).length;
      previousTotal += previousCount;
      if (statusToApi[column.title] === 'in_progress') previousInProgress += previousCount;
      else if (statusToApi[column.title] === 'under_review') previousReview += previousCount;
      else if (statusToApi[column.title] === 'complete') previousCompleted += previousCount;
    });
  }

  const dynamicStats = [
    { id: 1, type: 'list', title: 'Total Tasks', count: totalTasksCount, change: `${calculateChange(totalTasksCount, previousTotal)} ${periodLabel}`, trendColor: 'text-emerald-600', bgColor: 'bg-indigo-50', iconColor: 'text-[#5538ee]', sparklinePath: 'M2 25L25 15L50 18L75 8L98 20L118 5' },
    { id: 2, type: 'progress', title: 'In Progress', count: inProgressCount, change: `${calculateChange(inProgressCount, previousInProgress)} ${periodLabel}`, trendColor: 'text-emerald-600', bgColor: 'bg-blue-50', iconColor: 'text-blue-600', sparklinePath: 'M2 20L25 22L50 12L75 15L98 8L118 12' },
    { id: 3, type: 'overdue', title: 'Under Review', count: reviewCount, change: `${calculateChange(reviewCount, previousReview)} ${periodLabel}`, trendColor: 'text-rose-600', bgColor: 'bg-rose-50', iconColor: 'text-rose-600', sparklinePath: 'M2 10L25 18L50 8L75 22L98 12L118 18' },
    { id: 4, type: 'completed', title: 'Completed', count: completedCount, change: `${calculateChange(completedCount, previousCompleted)} ${periodLabel}`, trendColor: 'text-emerald-600', bgColor: 'bg-emerald-50', iconColor: 'text-emerald-600', sparklinePath: 'M2 22L25 15L50 18L75 10L98 15L118 4' },
  ];

  const handleAddTask = async (newTaskData) => {
    try {
      const { data } = await api.post('/action-items/', {
        meeting_id: Number(newTaskData.meeting_id || contextMeetingId),
        task: newTaskData.title,
        owner_name: newTaskData.assignee,
        due_date: newTaskData.dueDate || null,
        priority: newTaskData.priority,
        status: 'to_do',
      });
      const createdTask = toTask(data, meetings);
      setColumns((previous) => previous.map((column) => (
        column.id === 'todo' ? { ...column, tasks: [...column.tasks, createdTask] } : column
      )));
      setIsModalOpen(false);
      return true;
    } catch (error) {
      console.error('Failed to create action item:', error);
      return false;
    }
  };

  const handleMobileStatusChange = async (task, status) => {
    try {
      const { data } = await api.put(`/action-items/${task.id}`, { status: statusToApi[status] });
      const updatedTask = toTask(data, meetings);
      const updatedStatus = statusToApi[updatedTask.status];
      setColumns((previous) => previous.map((column) => ({
        ...column,
        tasks: [
          ...column.tasks.filter((item) => String(item.id) !== String(task.id)),
          ...(statusToApi[column.title] === updatedStatus ? [updatedTask] : []),
        ],
      })));
      return true;
    } catch (error) {
      console.error('Failed to update action item status:', error);
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faef]/40 text-gray-800 font-sans pb-12 relative">
      <div className="md:hidden">
        <MobileActionItems
          columns={filteredColumns}
          stats={dynamicStats}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onDateRangeChange={handleDateRangeChange}
          users={users}
          meetings={meetings}
          currentMeeting={meetingData}
          currentMeetingId={contextMeetingId}
          onAddTask={handleAddTask}
          onStatusChange={handleMobileStatusChange}
        />
      </div>
      <div className="hidden md:block">
      <ActionNavbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onDateRangeChange={handleDateRangeChange}
      />

      <div className="max-w-[1440px] mx-auto px-8 pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {meetingData?.title ? `Action Items: ${meetingData.title}` : 'Action Items (All Meetings)'}
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
              {meetingData.keyDecisions.map((decision, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5538ee] mt-1.5 shrink-0" />
                  {decision}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start mt-8">
          {filteredColumns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
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
        users={users}
        meetings={meetings}
        currentMeeting={meetingData}
        currentMeetingId={contextMeetingId}
      />
      </div>
    </div>
  );
}
