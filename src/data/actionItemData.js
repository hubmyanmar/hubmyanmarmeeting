export const statsData = [
  {
    id: 'total',
    title: 'Total Tasks',
    count: '24',
    change: '↑ 12% from last month',
    bgColor: 'bg-purple-100/80',
    iconColor: 'text-purple-600',
    trendColor: 'text-purple-600',
    type: 'list',
    sparklinePath: 'M0 20 Q 20 15, 40 18 T 80 10 T 120 5'
  },
  {
    id: 'progress',
    title: 'In Progress',
    count: '8',
    change: '↑ 2% from last month',
    bgColor: 'bg-blue-100/80',
    iconColor: 'text-blue-600',
    trendColor: 'text-blue-600',
    type: 'progress',
    sparklinePath: 'M0 22 Q 30 18, 60 15 T 100 8 T 120 4'
  },
  {
    id: 'overdue',
    title: 'Overdue',
    count: '5',
    change: '↑ 67% from last month',
    bgColor: 'bg-red-100/80',
    iconColor: 'text-red-500',
    trendColor: 'text-red-500',
    type: 'overdue',
    sparklinePath: 'M0 25 Q 30 20, 60 12 T 90 15 T 120 2'
  },
  {
    id: 'completed',
    title: 'Completed',
    count: '11',
    change: '↑ 22% from last month',
    bgColor: 'bg-emerald-100/80',
    iconColor: 'text-emerald-600',
    trendColor: 'text-emerald-600',
    type: 'completed',
    sparklinePath: 'M0 20 Q 25 18, 50 12 T 85 8 T 120 3'
  }
];

export const initialColumns = [
  {
    id: 'todo',
    title: 'To Do',
    count: 7,
    dotColor: 'bg-gray-400',
    tasks: [
      {
        id: 't1',
        title: 'Prepare Q2 marketing strategy deck',
        meeting: 'Marketing Sync',
        priority: 'High',
        assignee: 'Alex Kim',
        avatar: 'https://i.pravatar.cc/100?img=11',
        date: 'Apr 25, 2025'
      },
      {
        id: 't2',
        title: 'Compile customer feedback summary',
        meeting: 'Product Review',
        priority: 'Medium',
        assignee: 'Jamie Park',
        avatar: 'https://i.pravatar.cc/100?img=12',
        date: 'Apr 28, 2025'
      },
      {
        id: 't3',
        title: 'Set up analytics tracking for new feature',
        meeting: 'Engineering Standup',
        priority: 'Low',
        assignee: 'Taylor Kim',
        avatar: 'https://i.pravatar.cc/100?img=13',
        date: 'May 2, 2025'
      },
      {
        id: 't4',
        title: 'Draft internal comms for launch',
        meeting: 'Leadership Meeting',
        priority: 'Medium',
        assignee: 'Morgan Lee',
        avatar: 'https://i.pravatar.cc/100?img=14',
        date: 'May 5, 2025'
      }
    ]
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    count: 8,
    dotColor: 'bg-blue-500',
    tasks: [
      {
        id: 't5',
        title: 'Update product roadmap based on Q1 learnings',
        meeting: 'Product Review',
        priority: 'High',
        assignee: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        date: 'Apr 24, 2025'
      },
      {
        id: 't6',
        title: 'Design new onboarding flow',
        meeting: 'UX Sync',
        priority: 'Medium',
        assignee: 'Priya Shah',
        avatar: 'https://i.pravatar.cc/100?img=22',
        date: 'Apr 27, 2025'
      },
      {
        id: 't7',
        title: 'Conduct competitor analysis',
        meeting: 'Strategy Meeting',
        priority: 'Medium',
        assignee: 'Daniel Park',
        avatar: 'https://i.pravatar.cc/100?img=33',
        date: 'May 1, 2025'
      },
      {
        id: 't8',
        title: 'Review legal terms with counsel',
        meeting: 'Operations Sync',
        priority: 'Low',
        assignee: 'Sophia Martinez',
        avatar: 'https://i.pravatar.cc/100?img=24',
        date: 'May 6, 2025'
      }
    ]
  },
  {
    id: 'under_review',
    title: 'Under Review',
    count: 4,
    dotColor: 'bg-purple-500',
    tasks: [
      {
        id: 't9',
        title: 'Finalize budget for Q2 campaigns',
        meeting: 'Finance Review',
        priority: 'High',
        assignee: 'Michael Chen',
        avatar: 'https://i.pravatar.cc/100?img=53',
        date: 'Apr 23, 2025'
      },
      {
        id: 't10',
        title: 'Review UX designs',
        meeting: 'Design Critique',
        priority: 'Medium',
        assignee: 'Emma Wilson',
        avatar: 'https://i.pravatar.cc/100?img=47',
        date: 'Apr 26, 2025'
      },
      {
        id: 't11',
        title: 'Approve vendor contract',
        meeting: 'Procurement',
        priority: 'Low',
        assignee: 'James Patel',
        avatar: 'https://i.pravatar.cc/100?img=68',
        date: 'May 3, 2025'
      },
      {
        id: 't12',
        title: 'Validate security requirements',
        meeting: 'Tech Review',
        priority: 'Medium',
        assignee: 'Olivia Carter',
        avatar: 'https://i.pravatar.cc/100?img=45',
        date: 'May 7, 2025'
      }
    ]
  },
  {
    id: 'completed',
    title: 'Completed',
    count: 5,
    dotColor: 'bg-emerald-500',
    tasks: [
      {
        id: 't13',
        title: 'Schedule user interviews',
        meeting: 'Customer Research',
        priority: 'Low',
        assignee: 'Hannah Brooks',
        avatar: 'https://i.pravatar.cc/100?img=49',
        date: 'Apr 18, 2025',
        completed: true
      },
      {
        id: 't14',
        title: 'Share meeting notes with team',
        meeting: 'All Hands',
        priority: 'Low',
        assignee: 'Ryan Tan',
        avatar: 'https://i.pravatar.cc/100?img=59',
        date: 'Apr 20, 2025',
        completed: true
      },
      {
        id: 't15',
        title: 'Update help center content',
        meeting: 'Support Sync',
        priority: 'Medium',
        assignee: 'Natalie Wong',
        avatar: 'https://i.pravatar.cc/100?img=44',
        date: 'Apr 21, 2025',
        completed: true
      },
      {
        id: 't16',
        title: 'Plan team offsite',
        meeting: 'Team Meeting',
        priority: 'Low',
        assignee: 'Chris Nguyen',
        avatar: 'https://i.pravatar.cc/100?img=60',
        date: 'Apr 22, 2025',
        completed: true
      }
    ]
  }
];