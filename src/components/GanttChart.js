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

  // Update arrow positions based on container positions
  React.useEffect(() => {
    const updateArrowPositions = () => {
      // Update table arrows
      if (tableWrapperRef.current) {
        const tableRect = tableWrapperRef.current.getBoundingClientRect();
        
        if (tableLeftArrowRef.current) {
          tableLeftArrowRef.current.style.left = `${tableRect.left + 8}px`;
        }
        if (tableRightArrowRef.current) {
          tableRightArrowRef.current.style.right = `${window.innerWidth - tableRect.right + 8}px`;
        }
      }

      // Update timeline arrows
      if (timelineWrapperRef.current && showTimeline) {
        const timelineRect = timelineWrapperRef.current.getBoundingClientRect();
        
        if (timelineLeftArrowRef.current) {
          timelineLeftArrowRef.current.style.left = `${timelineRect.left + 8}px`;
        }
        if (timelineRightArrowRef.current) {
          timelineRightArrowRef.current.style.right = `${window.innerWidth - timelineRect.right + 8}px`;
        }
      }
    };

    // Initial update with delay to ensure DOM is ready
    const timeoutId = setTimeout(updateArrowPositions, 0);

    // Update on scroll and resize
    window.addEventListener('scroll', updateArrowPositions, true);
    window.addEventListener('resize', updateArrowPositions);

    // Update when table/timeline dimensions change
    const resizeObserver = new ResizeObserver(updateArrowPositions);
    if (tableWrapperRef.current) {
      resizeObserver.observe(tableWrapperRef.current);
    }
    if (timelineWrapperRef.current) {
      resizeObserver.observe(timelineWrapperRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', updateArrowPositions, true);
      window.removeEventListener('resize', updateArrowPositions);
      resizeObserver.disconnect();
    };
  }, [tableWidth, showTimeline, flatTasks]);


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
    </div>
  );
};

GanttChart.propTypes = GanttChartProps;
GanttChart.defaultProps = GanttChartDefaultProps;

export default GanttChart;
