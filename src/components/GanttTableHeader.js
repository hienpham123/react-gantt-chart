import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import './GanttChart.css';

const GanttTableHeader = ({ 
  tableWidth, 
  showTimeline, 
  onResizeStart,
  onCollapseAll,
  onExpandAll,
  expandedTasks,
  tasks,
  columns,
  sortColumn,
  sortDirection,
  onSort
}) => {
  // Check if all tasks with children are expanded
  const allExpanded = useMemo(() => {
    const tasksWithChildren = tasks.filter(task => task.children && task.children.length > 0);
    if (tasksWithChildren.length === 0) return false;
    return tasksWithChildren.every(task => expandedTasks.has(task.id));
  }, [tasks, expandedTasks]);

  // Check if all tasks are collapsed
  const allCollapsed = useMemo(() => {
    const tasksWithChildren = tasks.filter(task => task.children && task.children.length > 0);
    if (tasksWithChildren.length === 0) return true;
    return tasksWithChildren.every(task => !expandedTasks.has(task.id));
  }, [tasks, expandedTasks]);

  const handleToggleExpandAll = () => {
    if (allExpanded) {
      onCollapseAll();
    } else {
      onExpandAll();
    }
  };

  // Default columns if not provided
  const defaultColumns = [
    { key: 'name', label: 'Task name', width: 200, fixed: true },
    { key: 'startDate', label: 'Start time', width: 120 },
    { key: 'duration', label: 'Duration', width: 120 },
  ];

  const displayColumns = columns || defaultColumns;

  return (
    <div 
      className="gantt-table-header"
      style={{ 
        width: `${tableWidth}px`,
        minWidth: `${tableWidth}px`,
      }}
      onMouseMove={showTimeline ? (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const edgeThreshold = 5;
        if (mouseX >= rect.width - edgeThreshold && mouseX <= rect.width) {
          e.currentTarget.style.cursor = 'col-resize';
        } else {
          e.currentTarget.style.cursor = '';
        }
      } : undefined}
      onMouseLeave={showTimeline ? (e) => {
        e.currentTarget.style.cursor = '';
      } : undefined}
      onMouseDown={showTimeline ? (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const edgeThreshold = 5;
        if (clickX >= rect.width - edgeThreshold && clickX <= rect.width) {
          onResizeStart(e);
        }
      } : undefined}
    >
      {displayColumns.map((column, index) => {
        const isFirstColumn = index === 0 && column.fixed;
        return (
          <div
            key={column.key}
            className={`gantt-table-header-cell ${isFirstColumn ? 'task-name-header' : ''}`}
            style={{
              width: column.width ? `${column.width}px` : undefined,
              flex: column.width ? `0 0 ${column.width}px` : '1 1 auto',
              minWidth: column.width ? `${column.width}px` : undefined,
            }}
          >
            {isFirstColumn && (
              <button
                className="expand-all-button"
                onClick={handleToggleExpandAll}
                title={allExpanded ? 'Collapse All' : 'Expand All'}
                type="button"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 2048 2048" 
                  className={`expand-all-icon ${allExpanded ? 'expanded' : 'collapsed'}`}
                >
                  <path d="M1939 467l90 90-1005 1005L19 557l90-90 915 915 915-915z"></path>
                </svg>
              </button>
            )}
            <span 
              className={`${isFirstColumn ? 'task-name-header-text' : ''} ${column.sortable !== false ? 'sortable-header' : ''}`}
              onClick={column.sortable !== false && onSort ? () => onSort(column.key) : undefined}
              style={{ 
                cursor: column.sortable !== false && onSort ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                userSelect: 'none'
              }}
            >
              {column.label}
              {column.sortable !== false && sortColumn === column.key && (
                <span className="sort-indicator">
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
};

GanttTableHeader.propTypes = {
  tableWidth: PropTypes.number.isRequired,
  showTimeline: PropTypes.bool.isRequired,
  onResizeStart: PropTypes.func.isRequired,
  onCollapseAll: PropTypes.func,
  onExpandAll: PropTypes.func,
  expandedTasks: PropTypes.instanceOf(Set),
  tasks: PropTypes.arrayOf(PropTypes.object),
  columns: PropTypes.arrayOf(PropTypes.object),
  sortColumn: PropTypes.string,
  sortDirection: PropTypes.oneOf(['asc', 'desc']),
  onSort: PropTypes.func,
};

GanttTableHeader.defaultProps = {
  onCollapseAll: () => {},
  onExpandAll: () => {},
  expandedTasks: new Set(),
  tasks: [],
  columns: null,
  sortColumn: null,
  sortDirection: 'asc',
  onSort: null,
};

export default React.memo(GanttTableHeader);

