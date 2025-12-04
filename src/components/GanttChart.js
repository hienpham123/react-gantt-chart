import React, { useState, useMemo, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import GanttSearchBar from './GanttSearchBar';
import GanttTableHeader from './GanttTableHeader';
import GanttTimelineHeader from './GanttTimelineHeader';
import GanttTable from './GanttTable';
import GanttTimeline from './GanttTimeline';
import TaskEditDialog from './TaskEditDialog';
import {
  calculateTimelineDates,
  calculateWeeklyRanges,
  flattenTasks,
  getDuration,
} from '../utils/ganttUtils';
import { GanttChartProps, GanttChartDefaultProps } from '../types';
import './GanttChart.css';

const GanttChart = ({
  tasks,
  onTasksChange,
  onTaskSelect,
  onTaskDrag,
  defaultTableWidth,
  defaultExpandedTasks,
  showTimeline: defaultShowTimeline,
  endYear,
  weekColumnWidth,
  rowHeight,
  searchPlaceholder,
  className,
  style,
  columns,
  onRenderCell,
  onCellChange,
}) => {
  const [expandedTasks, setExpandedTasks] = useState(new Set(defaultExpandedTasks));
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tableWidth, setTableWidth] = useState(defaultTableWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [showTimeline, setShowTimeline] = useState(defaultShowTimeline);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'
  const timelineRef = useRef(null);
  const tableRef = useRef(null);
  const resizeHandleRef = useRef(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const tableWrapperRef = useRef(null);
  const timelineWrapperRef = useRef(null);
  const [tableScrollLeft, setTableScrollLeft] = useState(0);
  const [timelineScrollLeft, setTimelineScrollLeft] = useState(0);
  const [canScrollTableLeft, setCanScrollTableLeft] = useState(false);
  const [canScrollTableRight, setCanScrollTableRight] = useState(false);
  const [canScrollTimelineLeft, setCanScrollTimelineLeft] = useState(false);
  const [canScrollTimelineRight, setCanScrollTimelineRight] = useState(false);
  const tableScrollIntervalRef = useRef(null);
  const timelineScrollIntervalRef = useRef(null);
  const tableLeftArrowRef = useRef(null);
  const tableRightArrowRef = useRef(null);
  const timelineLeftArrowRef = useRef(null);
  const timelineRightArrowRef = useRef(null);
  const [isDraggingTimeline, setIsDraggingTimeline] = useState(false);
  const timelineDragStartRef = useRef({ x: 0, scrollLeft: 0 });
  const tableFixedScrollbarRef = useRef(null);
  const timelineFixedScrollbarRef = useRef(null);

  // Tính toán timeline dates
  const timelineDates = useMemo(() => calculateTimelineDates(tasks, endYear), [tasks, endYear]);

  // Tính toán weekly ranges
  const weeklyRanges = useMemo(() => calculateWeeklyRanges(timelineDates), [timelineDates]);

  // Sort function - keep parent groups in original order, only sort children within each group
  const sortTasks = useCallback((tasksToSort, sortKey, direction) => {
    if (!sortKey) return tasksToSort;
    
    const compareValues = (aValue, bValue, taskA, taskB) => {
      // Handle different data types
      if (sortKey === 'startDate' || sortKey === 'endDate') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      } else if (sortKey === 'duration') {
        // Duration is calculated from startDate and endDate
        if (taskA && taskA.startDate && taskA.endDate) {
          aValue = getDuration(taskA.startDate, taskA.endDate);
        } else {
          aValue = 0;
        }
        if (taskB && taskB.startDate && taskB.endDate) {
          bValue = getDuration(taskB.startDate, taskB.endDate);
        } else {
          bValue = 0;
        }
      } else if (sortKey === 'name') {
        aValue = (aValue || '').toString().toLowerCase();
        bValue = (bValue || '').toString().toLowerCase();
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        // Numbers
      } else {
        aValue = (aValue || '').toString().toLowerCase();
        bValue = (bValue || '').toString().toLowerCase();
      }
      
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    };
    
    // Group tasks by level and parent
    const groups = new Map();
    tasksToSort.forEach((task) => {
      const groupKey = `${task.level}_${task.parent || 'null'}`;
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey).push(task);
    });
    
    // Only sort groups that are NOT root level (level 0)
    // Root level (parent groups) keep their original order
    groups.forEach((groupTasks, groupKey) => {
      const level = parseInt(groupKey.split('_')[0]);
      // Only sort if it's not a root level group (level > 0)
      if (level > 0 && groupTasks.length > 1) {
        groupTasks.sort((a, b) => {
          const aValue = a[sortKey];
          const bValue = b[sortKey];
          return compareValues(aValue, bValue, a, b);
        });
      }
    });
    
    // Rebuild result maintaining hierarchy: parent before children
    // Keep root tasks in their original order
    const processed = new Set();
    const result = [];
    
    // Helper to recursively add task and its children
    const addTaskAndChildren = (taskId) => {
      if (processed.has(taskId)) return;
      
      // Find task in any group
      let task = null;
      for (const [key, tasks] of groups.entries()) {
        const found = tasks.find(t => t.id === taskId);
        if (found) {
          task = found;
          break;
        }
      }
      
      if (!task) return;
      
      // Add this task
      result.push(task);
      processed.add(taskId);
      
      // Find and add all children of this task (recursively)
      const childrenGroupKey = `${task.level + 1}_${taskId}`;
      const children = groups.get(childrenGroupKey) || [];
      
      // Children are already sorted in their group (if level > 0)
      children.forEach(child => {
        if (!processed.has(child.id)) {
          addTaskAndChildren(child.id);
        }
      });
    };
    
    // Process all root tasks (level 0, no parent) in their ORIGINAL order
    // Find root tasks in original order from tasksToSort
    const rootTasks = tasksToSort.filter(t => t.level === 0 && !t.parent);
    rootTasks.forEach(rootTask => {
      addTaskAndChildren(rootTask.id);
    });
    
    return result;
  }, []);

  // Tính toán flat list của tasks
  const flatTasks = useMemo(() => {
    let flattened = flattenTasks(tasks, expandedTasks, searchQuery);
    
    // Apply sorting if sortColumn is set - sort within groups only
    if (sortColumn) {
      flattened = sortTasks(flattened, sortColumn, sortDirection);
    }
    
    return flattened;
  }, [tasks, expandedTasks, searchQuery, sortColumn, sortDirection, sortTasks]);

  // Tính tổng width của tất cả columns
  const totalColumnsWidth = useMemo(() => {
    const defaultColumns = [
      { key: 'name', label: 'Task name', width: 200, fixed: true },
      { key: 'startDate', label: 'Start time', width: 120 },
      { key: 'duration', label: 'Duration', width: 120 },
    ];
    const displayColumns = columns || defaultColumns;
    return displayColumns.reduce((sum, col) => sum + (col.width || 120), 0);
  }, [columns]);

  // Refs để sync scroll giữa header và table body
  const tableHeaderRef = useRef(null);
  const tableBodyRef = useRef(null);

  // Toggle expand/collapse
  const toggleExpand = useCallback((taskId) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  }, []);

  // Collapse all tasks
  const collapseAll = useCallback(() => {
    setExpandedTasks(new Set());
  }, []);

  // Expand all tasks
  const expandAll = useCallback(() => {
    // Get all task IDs that have children
    const allTaskIdsWithChildren = tasks
      .filter(task => task.children && task.children.length > 0)
      .map(task => task.id);
    setExpandedTasks(new Set(allTaskIdsWithChildren));
  }, [tasks]);

  // Handle column sort
  const handleSort = useCallback((columnKey) => {
    if (sortColumn === columnKey) {
      // Toggle direction if same column
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to ascending
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  }, [sortColumn]);

  // Handle task select
  const handleTaskSelect = useCallback((task) => {
    setSelectedTask(task);
    onTaskSelect(task);
  }, [onTaskSelect]);

  // Handle task double click - open edit dialog
  const handleTaskDoubleClick = useCallback((task) => {
    console.log('🟢🟢🟢 GanttChart: handleTaskDoubleClick CALLED 🟢🟢🟢');
    console.log('Task received:', task);
    
    // Use functional updates to ensure state is set correctly
    setTaskToEdit((prevTask) => {
      console.log('setTaskToEdit called, prevTask:', prevTask, 'newTask:', task);
      return task;
    });
    
    setIsEditDialogOpen((prevIsOpen) => {
      console.log('setIsEditDialogOpen called, prevIsOpen:', prevIsOpen, 'setting to: true');
      return true;
    });
    
    console.log('✅ State update functions called');
  }, []);

  // Handle save task from dialog
  const handleTaskSave = useCallback((updatedTask) => {
    onTasksChange(
      tasks.map(t =>
        t.id === updatedTask.id ? updatedTask : t
      )
    );
    setSelectedTask(updatedTask);
    setIsEditDialogOpen(false);
    setTaskToEdit(null);
  }, [tasks, onTasksChange]);

  // Handle close dialog
  const handleDialogClose = useCallback(() => {
    setIsEditDialogOpen(false);
    setTaskToEdit(null);
  }, []);

  // Sync scroll between table and timeline (vertical)
  const handleTableScroll = useCallback((e) => {
    const scrollValue = e.target.scrollTop;
    if (timelineRef.current) {
      timelineRef.current.scrollTop = scrollValue;
    }
  }, []);

  // Handle table horizontal scroll
  const handleTableHorizontalScroll = useCallback((e) => {
    const scrollLeft = e.target.scrollLeft;
    setTableScrollLeft(scrollLeft);
    
    // Update arrow visibility
    const element = e.target;
    const maxScrollLeft = element.scrollWidth - element.clientWidth;
    setCanScrollTableLeft(scrollLeft > 0);
    setCanScrollTableRight(scrollLeft < maxScrollLeft - 1);
    
    // Sync with header
    if (tableHeaderRef.current) {
      tableHeaderRef.current.scrollLeft = scrollLeft;
    }
  }, []);

  // Handle timeline horizontal scroll
  const handleTimelineHorizontalScroll = useCallback((e) => {
    const scrollLeft = e.target.scrollLeft;
    setTimelineScrollLeft(scrollLeft);
    setScrollLeft(scrollLeft);
    
    // Update arrow visibility
    const element = e.target;
    const maxScrollLeft = element.scrollWidth - element.clientWidth;
    setCanScrollTimelineLeft(scrollLeft > 0);
    setCanScrollTimelineRight(scrollLeft < maxScrollLeft - 1);
  }, []);

  // Handle timeline drag-to-scroll
  const handleTimelineMouseDown = useCallback((e) => {
    // Only start drag if clicking on timeline background, not on task bars
    // Check if the click target is the timeline container or grid, not a task bar
    const target = e.target;
    const isTaskBar = target.closest('.task-bar') !== null;
    const isTaskRow = target.closest('.timeline-task-row') !== null && !isTaskBar;
    
    // Only start drag if clicking on empty timeline area (not on task bars)
    if (!isTaskBar && timelineRef.current) {
      setIsDraggingTimeline(true);
      timelineDragStartRef.current = {
        x: e.clientX,
        scrollLeft: timelineRef.current.scrollLeft
      };
      
      // Change cursor to grabbing
      if (timelineRef.current) {
        timelineRef.current.style.cursor = 'grabbing';
      }
      
      // Prevent default to avoid text selection
      e.preventDefault();
    }
  }, []);

  const handleTimelineMouseMove = useCallback((e) => {
    if (isDraggingTimeline && timelineRef.current) {
      const deltaX = e.clientX - timelineDragStartRef.current.x;
      const newScrollLeft = timelineDragStartRef.current.scrollLeft - deltaX;
      
      // Clamp scroll position
      const maxScrollLeft = timelineRef.current.scrollWidth - timelineRef.current.clientWidth;
      const clampedScrollLeft = Math.max(0, Math.min(maxScrollLeft, newScrollLeft));
      
      timelineRef.current.scrollLeft = clampedScrollLeft;
      
      // Update state
      setTimelineScrollLeft(clampedScrollLeft);
      setScrollLeft(clampedScrollLeft);
      
      // Update arrow visibility
      setCanScrollTimelineLeft(clampedScrollLeft > 0);
      setCanScrollTimelineRight(clampedScrollLeft < maxScrollLeft - 1);
    }
  }, [isDraggingTimeline]);

  const handleTimelineMouseUp = useCallback(() => {
    if (isDraggingTimeline) {
      setIsDraggingTimeline(false);
      
      // Reset cursor - remove inline style to let CSS handle it
      if (timelineRef.current) {
        timelineRef.current.style.cursor = '';
      }
    }
  }, [isDraggingTimeline]);

  // Stop auto-scroll table
  const stopScrollTable = useCallback(() => {
    if (tableScrollIntervalRef.current) {
      clearInterval(tableScrollIntervalRef.current);
      tableScrollIntervalRef.current = null;
    }
  }, []);

  // Stop auto-scroll timeline
  const stopScrollTimeline = useCallback(() => {
    if (timelineScrollIntervalRef.current) {
      clearInterval(timelineScrollIntervalRef.current);
      timelineScrollIntervalRef.current = null;
    }
  }, []);

  // Scroll table left
  const scrollTableLeft = useCallback(() => {
    if (tableBodyRef.current) {
      const element = tableBodyRef.current;
      const currentScroll = element.scrollLeft;
      if (currentScroll <= 0) {
        stopScrollTable();
        return;
      }
      const newScrollLeft = Math.max(0, currentScroll - 20);
      element.scrollLeft = newScrollLeft;
      setTableScrollLeft(newScrollLeft);
    }
  }, [stopScrollTable]);

  // Scroll table right
  const scrollTableRight = useCallback(() => {
    if (tableBodyRef.current) {
      const element = tableBodyRef.current;
      const maxScrollLeft = element.scrollWidth - element.clientWidth;
      const currentScroll = element.scrollLeft;
      if (currentScroll >= maxScrollLeft) {
        stopScrollTable();
        return;
      }
      const newScrollLeft = Math.min(maxScrollLeft, currentScroll + 23);
      element.scrollLeft = newScrollLeft;
      setTableScrollLeft(newScrollLeft);
    }
  }, [stopScrollTable]);

  // Scroll timeline left
  const scrollTimelineLeft = useCallback(() => {
    if (timelineRef.current) {
      const element = timelineRef.current;
      const currentScroll = element.scrollLeft;
      if (currentScroll <= 0) {
        stopScrollTimeline();
        return;
      }
      const newScrollLeft = Math.max(0, currentScroll - 23);
      element.scrollLeft = newScrollLeft;
      setTimelineScrollLeft(newScrollLeft);
      setScrollLeft(newScrollLeft);
    }
  }, [stopScrollTimeline]);

  // Scroll timeline right
  const scrollTimelineRight = useCallback(() => {
    if (timelineRef.current) {
      const element = timelineRef.current;
      const maxScrollLeft = element.scrollWidth - element.clientWidth;
      const currentScroll = element.scrollLeft;
      if (currentScroll >= maxScrollLeft) {
        stopScrollTimeline();
        return;
      }
      const newScrollLeft = Math.min(maxScrollLeft, currentScroll + 20);
      element.scrollLeft = newScrollLeft;
      setTimelineScrollLeft(newScrollLeft);
      setScrollLeft(newScrollLeft);
    }
  }, [stopScrollTimeline]);

  // Start auto-scroll table left
  const startScrollTableLeft = useCallback(() => {
    if (tableScrollIntervalRef.current) {
      clearInterval(tableScrollIntervalRef.current);
    }
    tableScrollIntervalRef.current = setInterval(() => {
      scrollTableLeft();
    }, 50); // Scroll every 50ms for smooth continuous scrolling
  }, [scrollTableLeft]);

  // Start auto-scroll table right
  const startScrollTableRight = useCallback(() => {
    if (tableScrollIntervalRef.current) {
      clearInterval(tableScrollIntervalRef.current);
    }
    tableScrollIntervalRef.current = setInterval(() => {
      scrollTableRight();
    }, 50);
  }, [scrollTableRight]);

  // Start auto-scroll timeline left
  const startScrollTimelineLeft = useCallback(() => {
    if (timelineScrollIntervalRef.current) {
      clearInterval(timelineScrollIntervalRef.current);
    }
    timelineScrollIntervalRef.current = setInterval(() => {
      scrollTimelineLeft();
    }, 50);
  }, [scrollTimelineLeft]);

  // Start auto-scroll timeline right
  const startScrollTimelineRight = useCallback(() => {
    if (timelineScrollIntervalRef.current) {
      clearInterval(timelineScrollIntervalRef.current);
    }
    timelineScrollIntervalRef.current = setInterval(() => {
      scrollTimelineRight();
    }, 50);
  }, [scrollTimelineRight]);

  // Sync horizontal scroll between table header and body (bidirectional)
  React.useEffect(() => {
    if (tableBodyRef.current && tableHeaderRef.current) {
      const bodyElement = tableBodyRef.current;
      const headerElement = tableHeaderRef.current;
      
      let isScrolling = false;
      
      // Handle body scroll -> sync to header
      const handleBodyScroll = () => {
        if (!isScrolling) {
          isScrolling = true;
          headerElement.scrollLeft = bodyElement.scrollLeft;
          requestAnimationFrame(() => {
            isScrolling = false;
          });
        }
      };
      
      // Handle header scroll -> sync to body
      const handleHeaderScroll = () => {
        if (!isScrolling) {
          isScrolling = true;
          bodyElement.scrollLeft = headerElement.scrollLeft;
          requestAnimationFrame(() => {
            isScrolling = false;
          });
        }
      };
      
      bodyElement.addEventListener('scroll', handleBodyScroll);
      headerElement.addEventListener('scroll', handleHeaderScroll);
      
      return () => {
        bodyElement.removeEventListener('scroll', handleBodyScroll);
        headerElement.removeEventListener('scroll', handleHeaderScroll);
      };
    }
  }, [flatTasks, totalColumnsWidth, tableWidth]);

  // Sync resize handle height with table height
  React.useEffect(() => {
    if (tableBodyRef.current && resizeHandleRef.current) {
      const updateHeight = () => {
        const tableElement = tableBodyRef.current;
        const handleElement = resizeHandleRef.current;
        if (tableElement && handleElement) {
          // Get the actual scroll height of the table content
          const tableContent = tableElement.querySelector('.gantt-table');
          if (tableContent) {
            const tableHeight = tableContent.scrollHeight;
            handleElement.style.height = `${tableHeight}px`;
          }
        }
      };

      // Initial update
      updateHeight();

      // Update on resize
      const resizeObserver = new ResizeObserver(updateHeight);
      if (tableBodyRef.current) {
        resizeObserver.observe(tableBodyRef.current);
      }

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [flatTasks]);

  // Cleanup intervals on unmount
  React.useEffect(() => {
    return () => {
      if (tableScrollIntervalRef.current) {
        clearInterval(tableScrollIntervalRef.current);
      }
      if (timelineScrollIntervalRef.current) {
        clearInterval(timelineScrollIntervalRef.current);
      }
    };
  }, []);

  // Handle global mouse events for timeline drag-to-scroll
  React.useEffect(() => {
    if (isDraggingTimeline) {
      document.addEventListener('mousemove', handleTimelineMouseMove);
      document.addEventListener('mouseup', handleTimelineMouseUp);
      // Prevent text selection while dragging
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleTimelineMouseMove);
        document.removeEventListener('mouseup', handleTimelineMouseUp);
        document.body.style.userSelect = '';
      };
    }
  }, [isDraggingTimeline, handleTimelineMouseMove, handleTimelineMouseUp]);

  // Update arrow positions based on container positions
  React.useEffect(() => {
    const updateArrowPositions = () => {
      const viewportHeight = window.innerHeight;
      
      // Update table arrows
      if (tableWrapperRef.current) {
        const tableRect = tableWrapperRef.current.getBoundingClientRect();
        // Get actual scroll height of table content
        let tableContentHeight = tableRect.height;
        if (tableBodyRef.current) {
          const tableContent = tableBodyRef.current.querySelector('.gantt-table');
          if (tableContent) {
            tableContentHeight = tableContent.scrollHeight;
          }
        }
        
        // If table height exceeds viewport, center in viewport; otherwise center in table
        let arrowTop;
        if (tableContentHeight > viewportHeight) {
          arrowTop = viewportHeight / 2;
        } else {
          arrowTop = tableRect.top + tableRect.height / 2;
        }
        
        if (tableLeftArrowRef.current) {
          tableLeftArrowRef.current.style.left = `${tableRect.left + 8}px`;
          tableLeftArrowRef.current.style.top = `${arrowTop}px`;
        }
        if (tableRightArrowRef.current) {
          tableRightArrowRef.current.style.right = `${window.innerWidth - tableRect.right + 8}px`;
          tableRightArrowRef.current.style.top = `${arrowTop}px`;
        }
      }

      // Update timeline arrows
      if (timelineWrapperRef.current && showTimeline) {
        const timelineRect = timelineWrapperRef.current.getBoundingClientRect();
        // Get actual scroll height of timeline content
        let timelineContentHeight = timelineRect.height;
        if (timelineRef.current) {
          timelineContentHeight = timelineRef.current.scrollHeight;
        }
        
        // If timeline height exceeds viewport, center in viewport; otherwise center in timeline
        let arrowTop;
        if (timelineContentHeight > viewportHeight) {
          arrowTop = viewportHeight / 2;
        } else {
          arrowTop = timelineRect.top + timelineRect.height / 2;
        }
        
        if (timelineLeftArrowRef.current) {
          timelineLeftArrowRef.current.style.left = `${timelineRect.left + 8}px`;
          timelineLeftArrowRef.current.style.top = `${arrowTop}px`;
        }
        if (timelineRightArrowRef.current) {
          timelineRightArrowRef.current.style.right = `${window.innerWidth - timelineRect.right + 8}px`;
          timelineRightArrowRef.current.style.top = `${arrowTop}px`;
        }
      }
    };

    // Initial update with delay to ensure DOM is ready
    const timeoutId = setTimeout(updateArrowPositions, 0);
    // Also update after a short delay to catch DOM updates from collapse/expand
    const delayedUpdate = setTimeout(updateArrowPositions, 100);

    // Update on scroll and resize
    window.addEventListener('scroll', updateArrowPositions, true);
    window.addEventListener('resize', updateArrowPositions);

    // Update when table/timeline dimensions change
    const resizeObserver = new ResizeObserver(updateArrowPositions);
    if (tableWrapperRef.current) {
      resizeObserver.observe(tableWrapperRef.current);
    }
    if (tableBodyRef.current) {
      resizeObserver.observe(tableBodyRef.current);
    }
    if (timelineWrapperRef.current) {
      resizeObserver.observe(timelineWrapperRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(delayedUpdate);
      window.removeEventListener('scroll', updateArrowPositions, true);
      window.removeEventListener('resize', updateArrowPositions);
      resizeObserver.disconnect();
    };
  }, [tableWidth, showTimeline, flatTasks]);

  // Handle fixed scrollbar at bottom of viewport
  React.useEffect(() => {
    // Use refs to track sync state to avoid infinite loops
    const isSyncingFromFixedRef = { current: false };
    const isSyncingToFixedRef = { current: false };

    // Sync scroll from fixed scrollbar to original (when user scrolls on fixed scrollbar)
    const syncTableScrollFromFixed = (e) => {
      if (isSyncingToFixedRef.current) return;
      isSyncingFromFixedRef.current = true;
      
      const fixedScrollbar = tableFixedScrollbarRef.current;
      if (!fixedScrollbar || !fixedScrollbar.classList.contains('fixed_scrollbar')) {
        isSyncingFromFixedRef.current = false;
        return;
      }
      
      const scrollLeft = fixedScrollbar.scrollLeft;
      // Sync to original elements
      if (tableBodyRef.current) {
        tableBodyRef.current.scrollLeft = scrollLeft;
      }
      if (tableHeaderRef.current) {
        tableHeaderRef.current.scrollLeft = scrollLeft;
      }
      
      requestAnimationFrame(() => {
        isSyncingFromFixedRef.current = false;
      });
    };

    const syncTimelineScrollFromFixed = (e) => {
      if (isSyncingToFixedRef.current) return;
      isSyncingFromFixedRef.current = true;
      
      const fixedScrollbar = timelineFixedScrollbarRef.current;
      if (!fixedScrollbar || !fixedScrollbar.classList.contains('fixed_scrollbar')) {
        isSyncingFromFixedRef.current = false;
        return;
      }
      
      const scrollLeft = fixedScrollbar.scrollLeft;
      if (timelineRef.current) {
        timelineRef.current.scrollLeft = scrollLeft;
      }
      
      requestAnimationFrame(() => {
        isSyncingFromFixedRef.current = false;
      });
    };

    // Sync scroll from original to fixed scrollbar (when user scrolls on original)
    const syncTableScrollToFixed = () => {
      if (isSyncingFromFixedRef.current) return;
      isSyncingToFixedRef.current = true;
      
      if (tableBodyRef.current && tableFixedScrollbarRef.current) {
        const fixedScrollbar = tableFixedScrollbarRef.current;
        if (fixedScrollbar.classList.contains('fixed_scrollbar')) {
          fixedScrollbar.scrollLeft = tableBodyRef.current.scrollLeft;
        }
      }
      
      requestAnimationFrame(() => {
        isSyncingToFixedRef.current = false;
      });
    };

    const syncTimelineScrollToFixed = () => {
      if (isSyncingFromFixedRef.current) return;
      isSyncingToFixedRef.current = true;
      
      if (timelineRef.current && timelineFixedScrollbarRef.current) {
        const fixedScrollbar = timelineFixedScrollbarRef.current;
        if (fixedScrollbar.classList.contains('fixed_scrollbar')) {
          fixedScrollbar.scrollLeft = timelineRef.current.scrollLeft;
        }
      }
      
      requestAnimationFrame(() => {
        isSyncingToFixedRef.current = false;
      });
    };

    const handleFixedScrollbar = () => {
      const tableBodyElement = tableBodyRef.current;
      const timelineElement = timelineRef.current;
      const viewportHeight = window.innerHeight;
      
      // Handle table scrollbar
      if (tableBodyElement && tableFixedScrollbarRef.current) {
        const tableContainer = tableBodyElement.closest('.gantt-table-wrapper');
        if (tableContainer) {
          const containerRect = tableContainer.getBoundingClientRect();
          const tableContent = tableBodyElement.querySelector('.gantt-table');
          const tableScrollWidth = tableContent ? tableContent.scrollWidth : 0;
          const tableClientWidth = tableBodyElement.clientWidth;
          
          // Check if table has horizontal scroll and is out of viewport
          const hasHorizontalScroll = tableScrollWidth > tableClientWidth;
          const isOutViewPort = containerRect.bottom > viewportHeight;
          
          if (hasHorizontalScroll && isOutViewPort) {
            const fixedScrollbar = tableFixedScrollbarRef.current;
            fixedScrollbar.classList.add('fixed_scrollbar');
            fixedScrollbar.style.display = 'block';
            fixedScrollbar.style.left = `${containerRect.left}px`;
            fixedScrollbar.style.width = `${containerRect.width}px`;
            
            // Create/update inner element with correct width (giống dhtmlx-gantt: .gantt_hor_scroll > div)
            let innerElement = fixedScrollbar.querySelector('div');
            if (!innerElement) {
              innerElement = document.createElement('div');
              fixedScrollbar.appendChild(innerElement);
            }
            // Inner div phải có width = scrollWidth để scrollbar có thể scroll
            // Đảm bảo width lớn hơn clientWidth để có thể scroll
            const scrollbarWidth = containerRect.width;
            // Đảm bảo inner width > scrollbar width để có thể scroll
            const innerWidth = Math.max(tableScrollWidth, scrollbarWidth + 1);
            innerElement.style.width = `${innerWidth}px`;
            innerElement.style.height = '40px';
            innerElement.style.display = 'block';
            innerElement.style.minWidth = `${innerWidth}px`;
            innerElement.style.flexShrink = '0';
            // innerElement.style.pointerEvents = 'none'; // Không block mouse events
            
            // Ensure fixed scrollbar can scroll - luôn set overflowX = auto để có scrollbar
            fixedScrollbar.style.overflowX = 'auto';
            fixedScrollbar.style.overflowY = 'hidden';
            fixedScrollbar.style.position = 'relative';
            fixedScrollbar.style.cursor = 'pointer';
            fixedScrollbar.style.userSelect = 'none'; // Prevent text selection when dragging
            
            // Đảm bảo scrollbar có thể scroll bằng cách set scrollLeft
            // Sync scroll position from original to fixed (tạm thời remove listener để tránh loop)
            isSyncingToFixedRef.current = true;
            fixedScrollbar.scrollLeft = tableBodyElement.scrollLeft;
            requestAnimationFrame(() => {
              isSyncingToFixedRef.current = false;
              // Re-attach listeners after sync
              attachListeners();
            });
          } else {
            const fixedScrollbar = tableFixedScrollbarRef.current;
            fixedScrollbar.classList.remove('fixed_scrollbar');
            fixedScrollbar.style.display = 'none';
          }
        }
      }
      
      // Handle timeline scrollbar
      if (timelineElement && showTimeline && timelineFixedScrollbarRef.current) {
        const timelineContainer = timelineElement.closest('.gantt-timeline-wrapper');
        if (timelineContainer) {
          const containerRect = timelineContainer.getBoundingClientRect();
          const timelineScrollWidth = timelineElement.scrollWidth;
          const timelineClientWidth = timelineElement.clientWidth;
          
          // Check if timeline has horizontal scroll and is out of viewport
          const hasHorizontalScroll = timelineScrollWidth > timelineClientWidth;
          const isOutViewPort = containerRect.bottom > viewportHeight;
          
          if (hasHorizontalScroll && isOutViewPort) {
            const fixedScrollbar = timelineFixedScrollbarRef.current;
            fixedScrollbar.classList.add('fixed_scrollbar');
            fixedScrollbar.style.display = 'block';
            fixedScrollbar.style.left = `${containerRect.left}px`;
            fixedScrollbar.style.width = `${containerRect.width}px`;
            
            // Create/update inner element with correct width (giống dhtmlx-gantt: .gantt_hor_scroll > div)
            let innerElement = fixedScrollbar.querySelector('div');
            if (!innerElement) {
              innerElement = document.createElement('div');
              fixedScrollbar.appendChild(innerElement);
            }
            // Inner div phải có width = scrollWidth để scrollbar có thể scroll
            // Đảm bảo width lớn hơn clientWidth để có thể scroll
            const scrollbarWidth = containerRect.width;
            // Đảm bảo inner width > scrollbar width để có thể scroll
            const innerWidth = Math.max(timelineScrollWidth, scrollbarWidth + 1);
            innerElement.style.width = `${innerWidth}px`;
            innerElement.style.height = '40px';
            innerElement.style.display = 'block';
            innerElement.style.minWidth = `${innerWidth}px`;
            innerElement.style.flexShrink = '0';
            // innerElement.style.pointerEvents = 'none'; // Không block mouse events
            
            // Ensure fixed scrollbar can scroll - luôn set overflowX = auto để có scrollbar
            fixedScrollbar.style.overflowX = 'auto';
            fixedScrollbar.style.overflowY = 'hidden';
            fixedScrollbar.style.position = 'relative';
            fixedScrollbar.style.cursor = 'pointer';
            fixedScrollbar.style.userSelect = 'none'; // Prevent text selection when dragging
            
            // Đảm bảo scrollbar có thể scroll bằng cách set scrollLeft
            // Sync scroll position from original to fixed (tạm thời remove listener để tránh loop)
            isSyncingToFixedRef.current = true;
            fixedScrollbar.scrollLeft = timelineElement.scrollLeft;
            requestAnimationFrame(() => {
              isSyncingToFixedRef.current = false;
              // Re-attach listeners after sync
              attachListeners();
            });
          } else {
            const fixedScrollbar = timelineFixedScrollbarRef.current;
            fixedScrollbar.classList.remove('fixed_scrollbar');
            fixedScrollbar.style.display = 'none';
          }
        }
      }
    };

    // Restore click to jump functionality and add drag support
    let isDraggingTableScrollbar = false;
    let isDraggingTimelineScrollbar = false;
    let scrollbarDragStartX = 0;
    let scrollbarDragStartScrollLeft = 0;
    let scrollbarDragStartMouseX = 0;
    let dragStartTime = 0;

    const handleTableFixedScrollbarMouseDown = (e) => {
      const fixedScrollbar = tableFixedScrollbarRef.current;
      if (!fixedScrollbar || !fixedScrollbar.classList.contains('fixed_scrollbar')) return;
      
      // Always prevent default to handle all interactions ourselves
      e.preventDefault();
      e.stopPropagation();
      
      const scrollbarRect = fixedScrollbar.getBoundingClientRect();
      const clickX = e.clientX - scrollbarRect.left;
      const scrollbarWidth = fixedScrollbar.clientWidth;
      const scrollWidth = fixedScrollbar.scrollWidth;
      const scrollLeft = fixedScrollbar.scrollLeft;
      const maxScrollLeft = scrollWidth - scrollbarWidth;
      
      if (maxScrollLeft <= 0) return;
      
      // Store initial values for drag
      scrollbarDragStartX = e.clientX;
      scrollbarDragStartMouseX = clickX;
      scrollbarDragStartScrollLeft = scrollLeft;
      dragStartTime = Date.now();
      
      // Always start dragging mode - user can drag from anywhere
      isDraggingTableScrollbar = true;
      fixedScrollbar.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
      
      // If clicking on track (not thumb), also jump to position immediately
      const thumbWidth = Math.max(40, (scrollbarWidth / scrollWidth) * scrollbarWidth);
      const thumbLeft = (scrollLeft / maxScrollLeft) * (scrollbarWidth - thumbWidth);
      const isOnThumb = clickX >= thumbLeft - 5 && clickX <= thumbLeft + thumbWidth + 5;
      
      if (!isOnThumb) {
        // Click on track - jump to position first, then allow drag
        const scrollRatio = clickX / scrollbarWidth;
        const newScrollLeft = scrollRatio * maxScrollLeft;
        fixedScrollbar.scrollLeft = Math.max(0, Math.min(newScrollLeft, maxScrollLeft));
        scrollbarDragStartScrollLeft = fixedScrollbar.scrollLeft; // Update start position
        syncTableScrollFromFixed();
      }
    };

    const handleTimelineFixedScrollbarMouseDown = (e) => {
      const fixedScrollbar = timelineFixedScrollbarRef.current;
      if (!fixedScrollbar || !fixedScrollbar.classList.contains('fixed_scrollbar')) return;
      
      // Always prevent default to handle all interactions ourselves
      e.preventDefault();
      e.stopPropagation();
      
      const scrollbarRect = fixedScrollbar.getBoundingClientRect();
      const clickX = e.clientX - scrollbarRect.left;
      const scrollbarWidth = fixedScrollbar.clientWidth;
      const scrollWidth = fixedScrollbar.scrollWidth;
      const scrollLeft = fixedScrollbar.scrollLeft;
      const maxScrollLeft = scrollWidth - scrollbarWidth;
      
      if (maxScrollLeft <= 0) return;
      
      // Store initial values for drag
      scrollbarDragStartX = e.clientX;
      scrollbarDragStartMouseX = clickX;
      scrollbarDragStartScrollLeft = scrollLeft;
      dragStartTime = Date.now();
      
      // Always start dragging mode - user can drag from anywhere
      isDraggingTimelineScrollbar = true;
      fixedScrollbar.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
      
      // If clicking on track (not thumb), also jump to position immediately
      const thumbWidth = Math.max(40, (scrollbarWidth / scrollWidth) * scrollbarWidth);
      const thumbLeft = (scrollLeft / maxScrollLeft) * (scrollbarWidth - thumbWidth);
      const isOnThumb = clickX >= thumbLeft - 5 && clickX <= thumbLeft + thumbWidth + 5;
      
      if (!isOnThumb) {
        // Click on track - jump to position first, then allow drag
        const scrollRatio = clickX / scrollbarWidth;
        const newScrollLeft = scrollRatio * maxScrollLeft;
        fixedScrollbar.scrollLeft = Math.max(0, Math.min(newScrollLeft, maxScrollLeft));
        scrollbarDragStartScrollLeft = fixedScrollbar.scrollLeft; // Update start position
        syncTimelineScrollFromFixed();
      }
    };

    const handleScrollbarMouseMove = (e) => {
      if (isDraggingTableScrollbar && tableFixedScrollbarRef.current) {
        e.preventDefault();
        const fixedScrollbar = tableFixedScrollbarRef.current;
        const scrollbarRect = fixedScrollbar.getBoundingClientRect();
        const mouseX = e.clientX - scrollbarRect.left;
        const scrollbarWidth = fixedScrollbar.clientWidth;
        const scrollWidth = fixedScrollbar.scrollWidth;
        const maxScrollLeft = scrollWidth - scrollbarWidth;
        
        if (maxScrollLeft > 0) {
          // Calculate scroll based on mouse movement from start position
          const deltaX = mouseX - scrollbarDragStartMouseX;
          const scrollRatio = deltaX / scrollbarWidth;
          const newScrollLeft = scrollbarDragStartScrollLeft + (scrollRatio * maxScrollLeft);
          fixedScrollbar.scrollLeft = Math.max(0, Math.min(newScrollLeft, maxScrollLeft));
          syncTableScrollFromFixed();
        }
      }
      
      if (isDraggingTimelineScrollbar && timelineFixedScrollbarRef.current) {
        e.preventDefault();
        const fixedScrollbar = timelineFixedScrollbarRef.current;
        const scrollbarRect = fixedScrollbar.getBoundingClientRect();
        const mouseX = e.clientX - scrollbarRect.left;
        const scrollbarWidth = fixedScrollbar.clientWidth;
        const scrollWidth = fixedScrollbar.scrollWidth;
        const maxScrollLeft = scrollWidth - scrollbarWidth;
        
        if (maxScrollLeft > 0) {
          // Calculate scroll based on mouse movement from start position
          const deltaX = mouseX - scrollbarDragStartMouseX;
          const scrollRatio = deltaX / scrollbarWidth;
          const newScrollLeft = scrollbarDragStartScrollLeft + (scrollRatio * maxScrollLeft);
          fixedScrollbar.scrollLeft = Math.max(0, Math.min(newScrollLeft, maxScrollLeft));
          syncTimelineScrollFromFixed();
        }
      }
    };

    const handleScrollbarMouseUp = () => {
      if (isDraggingTableScrollbar && tableFixedScrollbarRef.current) {
        tableFixedScrollbarRef.current.style.cursor = 'pointer';
      }
      if (isDraggingTimelineScrollbar && timelineFixedScrollbarRef.current) {
        timelineFixedScrollbarRef.current.style.cursor = 'pointer';
      }
      document.body.style.userSelect = '';
      isDraggingTableScrollbar = false;
      isDraggingTimelineScrollbar = false;
    };

    // Attach event listeners - đảm bảo listeners được attach đúng cách
    const attachListeners = () => {
      // Remove old listeners first
      if (tableFixedScrollbarRef.current) {
        tableFixedScrollbarRef.current.removeEventListener('scroll', syncTableScrollFromFixed);
        tableFixedScrollbarRef.current.removeEventListener('mousedown', handleTableFixedScrollbarMouseDown);
      }
      if (timelineFixedScrollbarRef.current) {
        timelineFixedScrollbarRef.current.removeEventListener('scroll', syncTimelineScrollFromFixed);
        timelineFixedScrollbarRef.current.removeEventListener('mousedown', handleTimelineFixedScrollbarMouseDown);
      }
      if (tableBodyRef.current) {
        tableBodyRef.current.removeEventListener('scroll', syncTableScrollToFixed);
      }
      if (timelineRef.current) {
        timelineRef.current.removeEventListener('scroll', syncTimelineScrollToFixed);
      }
      
      // Attach new listeners - dùng scroll event và mouse events
      if (tableFixedScrollbarRef.current && tableFixedScrollbarRef.current.classList.contains('fixed_scrollbar')) {
        tableFixedScrollbarRef.current.addEventListener('scroll', syncTableScrollFromFixed);
        tableFixedScrollbarRef.current.addEventListener('mousedown', handleTableFixedScrollbarMouseDown);
      }
      if (timelineFixedScrollbarRef.current && timelineFixedScrollbarRef.current.classList.contains('fixed_scrollbar')) {
        timelineFixedScrollbarRef.current.addEventListener('scroll', syncTimelineScrollFromFixed);
        timelineFixedScrollbarRef.current.addEventListener('mousedown', handleTimelineFixedScrollbarMouseDown);
      }
      
      // Attach global mouse events for dragging
      document.addEventListener('mousemove', handleScrollbarMouseMove);
      document.addEventListener('mouseup', handleScrollbarMouseUp);
      if (tableBodyRef.current) {
        tableBodyRef.current.addEventListener('scroll', syncTableScrollToFixed);
      }
      if (timelineRef.current) {
        timelineRef.current.addEventListener('scroll', syncTimelineScrollToFixed);
      }
    };

    // Attach listeners initially
    setTimeout(attachListeners, 200);
    
    // Initial check with delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      handleFixedScrollbar();
      // Re-attach listeners after initial setup
      setTimeout(attachListeners, 100);
    }, 100);
    
    // Update on scroll and resize
    window.addEventListener('scroll', handleFixedScrollbar, true);
    window.addEventListener('resize', handleFixedScrollbar);
    
    // Update when table/timeline dimensions change
    const resizeObserver = new ResizeObserver(handleFixedScrollbar);
    if (tableBodyRef.current) {
      resizeObserver.observe(tableBodyRef.current);
    }
    if (timelineRef.current) {
      resizeObserver.observe(timelineRef.current);
    }
    if (tableWrapperRef.current) {
      resizeObserver.observe(tableWrapperRef.current);
    }
    if (timelineWrapperRef.current) {
      resizeObserver.observe(timelineWrapperRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleFixedScrollbar, true);
      window.removeEventListener('resize', handleFixedScrollbar);
      resizeObserver.disconnect();
      if (tableFixedScrollbarRef.current) {
        tableFixedScrollbarRef.current.removeEventListener('scroll', syncTableScrollFromFixed);
        tableFixedScrollbarRef.current.removeEventListener('mousedown', handleTableFixedScrollbarMouseDown);
      }
      if (timelineFixedScrollbarRef.current) {
        timelineFixedScrollbarRef.current.removeEventListener('scroll', syncTimelineScrollFromFixed);
        timelineFixedScrollbarRef.current.removeEventListener('mousedown', handleTimelineFixedScrollbarMouseDown);
      }
      if (tableBodyRef.current) {
        tableBodyRef.current.removeEventListener('scroll', syncTableScrollToFixed);
      }
      if (timelineRef.current) {
        timelineRef.current.removeEventListener('scroll', syncTimelineScrollToFixed);
      }
      document.removeEventListener('mousemove', handleScrollbarMouseMove);
      document.removeEventListener('mouseup', handleScrollbarMouseUp);
    };
  }, [flatTasks, showTimeline, tableWidth]);

  // Handle resize
  const handleResizeStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startWidth = tableWidth;
    
    const handleMouseMove = (moveEvent) => {
      moveEvent.preventDefault();
      const diff = moveEvent.clientX - startX;
      const newWidth = startWidth + diff;
      const minWidth = 200;
      const container = document.querySelector('.gantt-container');
      const maxWidth = container ? container.offsetWidth * 0.7 : window.innerWidth * 0.7;
      
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setTableWidth(newWidth);
      }
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [tableWidth]);

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
  }, []);

  const handleTimelineToggle = useCallback(() => {
    setShowTimeline(prev => !prev);
  }, []);

  return (
    <div className={`gantt-container ${className}`} style={style}>
      <GanttSearchBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        showTimeline={showTimeline}
        onTimelineToggle={handleTimelineToggle}
      />
      
      <div className="gantt-header">
        <div 
          className="gantt-table-header-wrapper"
          style={{ 
            width: showTimeline ? `${tableWidth}px` : '100%',
            overflowX: totalColumnsWidth > tableWidth ? 'auto' : 'hidden',
            overflowY: 'hidden',
          }}
          ref={tableHeaderRef}
        >
          <GanttTableHeader
            tableWidth={totalColumnsWidth}
            showTimeline={showTimeline}
            onResizeStart={handleResizeStart}
            onCollapseAll={collapseAll}
            onExpandAll={expandAll}
            expandedTasks={expandedTasks}
            tasks={tasks}
            columns={columns}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        </div>
        {showTimeline && (
          <GanttTimelineHeader
            weeklyRanges={weeklyRanges}
            scrollLeft={scrollLeft}
            weekColumnWidth={weekColumnWidth}
          />
        )}
      </div>

      <div 
        className="gantt-body"
        onScroll={handleTableScroll}
        ref={tableRef}
      >
        {/* Table wrapper with scrollbar */}
        <div
          ref={tableWrapperRef}
          className="gantt-table-wrapper"
          style={{
            width: showTimeline ? `${tableWidth - 4}px` : '100%',
            position: 'relative',
          }}
        >
          {/* Left arrow */}
          <button
            ref={tableLeftArrowRef}
            className="gantt-scroll-arrow gantt-scroll-arrow-left"
            onClick={scrollTableLeft}
            onMouseEnter={startScrollTableLeft}
            onMouseLeave={stopScrollTable}
            title="Scroll left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048" width="30" height="30">
              <path d="M1443 2045L421 1024 1443 3l90 90-930 931 930 931-90 90z" fill="currentColor"/>
            </svg>
          </button>
          
          <div
            ref={tableBodyRef}
            className="gantt-table-body-scroll"
            style={{
              overflowX: totalColumnsWidth > tableWidth ? 'auto' : 'hidden',
              overflowY: 'hidden',
            }}
            onScroll={handleTableHorizontalScroll}
          >
            <GanttTable
              flatTasks={flatTasks}
              selectedTask={selectedTask}
              tableWidth={totalColumnsWidth}
              showTimeline={showTimeline}
              onTaskSelect={handleTaskSelect}
              onToggleExpand={toggleExpand}
              columns={columns}
              onRenderCell={onRenderCell}
              onCellChange={onCellChange}
            />
          </div>
          
          {/* Right arrow */}
          <button
            ref={tableRightArrowRef}
            className="gantt-scroll-arrow gantt-scroll-arrow-right"
            onClick={scrollTableRight}
            onMouseEnter={startScrollTableRight}
            onMouseLeave={stopScrollTable}
            title="Scroll right"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048" width="30" height="30" style={{transform: 'scaleX(-1)'}}>
              <path d="M1443 2045L421 1024 1443 3l90 90-930 931 930 931-90 90z" fill="currentColor"/>
            </svg>
          </button>
        </div>
        
        {showTimeline && (
          <div 
            className="gantt-resize-handle"
            ref={resizeHandleRef}
            onMouseDown={handleResizeStart}
          />
        )}

        {/* Timeline wrapper with scrollbar */}
        {showTimeline && (
          <div
            ref={timelineWrapperRef}
            className="gantt-timeline-wrapper"
            style={{
              flex: 1,
              position: 'relative',
              minWidth: 0,
            }}
          >
            {/* Left arrow */}
            <button
              ref={timelineLeftArrowRef}
              className="gantt-scroll-arrow gantt-scroll-arrow-left"
              onClick={scrollTimelineLeft}
              onMouseEnter={startScrollTimelineLeft}
              onMouseLeave={stopScrollTimeline}
              title="Scroll left"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048" width="30" height="30">
                <path d="M1443 2045L421 1024 1443 3l90 90-930 931 930 931-90 90z" fill="currentColor"/>
              </svg>
            </button>
            
            <GanttTimeline
              ref={timelineRef}
              flatTasks={flatTasks}
              selectedTask={selectedTask}
              weeklyRanges={weeklyRanges}
              weekColumnWidth={weekColumnWidth}
              onTaskSelect={handleTaskSelect}
              onTaskDoubleClick={handleTaskDoubleClick}
              onScroll={handleTimelineHorizontalScroll}
              onMouseDown={handleTimelineMouseDown}
              onMouseMove={handleTimelineMouseMove}
              onMouseUp={handleTimelineMouseUp}
            />
            
            {/* Right arrow */}
            <button
              ref={timelineRightArrowRef}
              className="gantt-scroll-arrow gantt-scroll-arrow-right"
              onClick={scrollTimelineRight}
              onMouseEnter={startScrollTimelineRight}
              onMouseLeave={stopScrollTimeline}
              title="Scroll right"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048" width="30" height="30" style={{transform: 'scaleX(-1)'}}>
                <path d="M1443 2045L421 1024 1443 3l90 90-930 931 930 931-90 90z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        )}
      </div>

      <TaskEditDialog
        task={taskToEdit}
        isOpen={isEditDialogOpen}
        onClose={handleDialogClose}
        onSave={handleTaskSave}
      />

      {/* Fixed scrollbar for table */}
      <div
        ref={tableFixedScrollbarRef}
        className="gantt-fixed-scrollbar gantt-table-fixed-scrollbar"
        style={{ display: 'none' }}
      />

      {/* Fixed scrollbar for timeline */}
      {showTimeline && (
        <div
          ref={timelineFixedScrollbarRef}
          className="gantt-fixed-scrollbar gantt-timeline-fixed-scrollbar"
          style={{ display: 'none' }}
        />
      )}
    </div>
  );
};

GanttChart.propTypes = GanttChartProps;
GanttChart.defaultProps = GanttChartDefaultProps;

export default GanttChart;
