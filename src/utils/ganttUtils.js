/**
 * Utility functions for Gantt Chart
 */

// Format date với YYYY-MM-DD
export const formatDateFull = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Format date ngắn gọn (30 Apr, 11 May)
export const formatDateShort = (date) => {
  const d = new Date(date);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
};

// Tính duration (số ngày)
export const getDuration = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

// Tính toán timeline dates
export const calculateTimelineDates = (tasks, endYear = 2028) => {
  const today = new Date();
  const startDate = tasks && tasks.length > 0 
    ? new Date(Math.min(...tasks.map(t => new Date(t.startDate).getTime())))
    : today;
  
  const endDate = new Date(`${endYear}-12-31`);
  
  const minDate = startDate < today ? startDate : today;
  minDate.setDate(minDate.getDate() - 7); // Thêm 1 tuần buffer
  
  const dates = [];
  const current = new Date(minDate);
  
  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
};

// Tính toán weekly ranges
export const calculateWeeklyRanges = (timelineDates) => {
  if (timelineDates.length === 0) return [];
  
  const weeks = [];
  let currentWeekStart = new Date(timelineDates[0]);
  
  // Điều chỉnh về đầu tuần (Monday)
  const dayOfWeek = currentWeekStart.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  currentWeekStart.setDate(currentWeekStart.getDate() + diff);
  
  while (currentWeekStart <= timelineDates[timelineDates.length - 1]) {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    weeks.push({
      start: new Date(currentWeekStart),
      end: weekEnd
    });
    
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  }
  
  return weeks;
};

// Tính toán vị trí và width của task bar
export const getTaskBarStyle = (task, weeklyRanges, WEEK_COLUMN_WIDTH = 150) => {
  const startDate = new Date(task.startDate);
  const endDate = new Date(task.endDate);
  
  if (weeklyRanges.length === 0) return { left: 0, width: 0 };
  
  let startWeekIndex = -1;
  let endWeekIndex = -1;
  
  weeklyRanges.forEach((week, index) => {
    if (startWeekIndex === -1 && startDate >= week.start && startDate <= week.end) {
      startWeekIndex = index;
    }
    if (endDate >= week.start && endDate <= week.end) {
      endWeekIndex = index;
    }
  });
  
  if (startWeekIndex === -1) {
    weeklyRanges.forEach((week, index) => {
      if (startDate < week.start && (startWeekIndex === -1 || week.start < weeklyRanges[startWeekIndex].start)) {
        startWeekIndex = index;
      }
    });
    if (startWeekIndex === -1) startWeekIndex = 0;
  }
  
  if (endWeekIndex === -1) {
    weeklyRanges.forEach((week, index) => {
      if (endDate < week.end && (endWeekIndex === -1 || week.end > weeklyRanges[endWeekIndex].end)) {
        endWeekIndex = index;
      }
    });
    if (endWeekIndex === -1) endWeekIndex = weeklyRanges.length - 1;
  }
  
  const startWeek = weeklyRanges[startWeekIndex];
  const endWeek = weeklyRanges[endWeekIndex];
  
  const weekDuration = 7 * 24 * 60 * 60 * 1000;
  const startInWeek = Math.max(0, (startDate - startWeek.start) / weekDuration);
  const endInWeek = Math.min(1, (endDate - endWeek.start) / weekDuration);
  
  const leftPx = startWeekIndex * WEEK_COLUMN_WIDTH + (startInWeek * WEEK_COLUMN_WIDTH);
  const numWeeks = endWeekIndex - startWeekIndex;
  const widthPx = numWeeks * WEEK_COLUMN_WIDTH + (endInWeek * WEEK_COLUMN_WIDTH) - (startInWeek * WEEK_COLUMN_WIDTH);
  
  return {
    left: `${Math.max(0, leftPx)}px`,
    width: `${Math.max(10, widthPx)}px`
  };
};

// Flatten tasks với hierarchy
export const flattenTasks = (tasks, expandedTasks, searchQuery) => {
  const result = [];
  const taskMap = new Map(tasks.map(t => [t.id, t]));
  
  const addTask = (taskId, level = 0) => {
    const task = taskMap.get(taskId);
    if (!task) return;
    
    const isExpanded = expandedTasks.has(taskId);
    const hasChildren = task.children && task.children.length > 0;
    
    const matchesSearch = !searchQuery || 
      task.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const shouldInclude = matchesSearch || hasChildren;
    
    if (shouldInclude) {
      result.push({ ...task, level, isExpanded, hasChildren });
    }
    
    if (hasChildren && isExpanded) {
      task.children.forEach(childId => addTask(childId, level + 1));
    }
  };
  
  tasks.filter(t => !t.parent).forEach(rootTask => {
    addTask(rootTask.id, 0);
  });
  
  return result;
};

