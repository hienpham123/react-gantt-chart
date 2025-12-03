import React from 'react';
import PropTypes from 'prop-types';
import { formatDateFull, getDuration } from '../utils/ganttUtils';
import './GanttChart.css';

const GanttTableRow = ({ 
  task, 
  isSelected, 
  onSelect,
  onToggleExpand,
  columns,
  onRenderCell,
  onCellChange,
}) => {
  const handleClick = () => {
    onSelect(task);
  };

  const handleToggleExpand = (e) => {
    e.stopPropagation();
    onToggleExpand(task.id);
  };

  // Default columns if not provided
  const defaultColumns = [
    { key: 'name', label: 'Task name', width: 200, fixed: true },
    { key: 'startDate', label: 'Start time', width: 120 },
    { key: 'duration', label: 'Duration', width: 120 },
  ];

  const displayColumns = columns || defaultColumns;

  const renderCellContent = (column) => {
    const isFirstColumn = column.fixed && column.key === 'name';
    
    if (isFirstColumn) {
      return (
        <div className="task-indent" style={{ paddingLeft: `${task.level * 20}px` }}>
          {task.hasChildren && (
            <button
              className="expand-button"
              onClick={handleToggleExpand}
              type="button"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 2048 2048" 
                className={`expand-icon ${task.isExpanded ? 'expanded' : 'collapsed'}`}
              >
                <path d="M1939 467l90 90-1005 1005L19 557l90-90 915 915 915-915z"></path>
              </svg>
            </button>
          )}
          {!task.hasChildren && <span className="expand-spacer" />}
          <span className="task-name">{task.name}</span>
        </div>
      );
    }

    // Use custom render function if provided
    if (onRenderCell) {
      return onRenderCell(task, column, onCellChange);
    }

    // Use column's render function if provided
    if (column.render) {
      return column.render(task, column, onCellChange);
    }

    // Default rendering based on column key
    switch (column.key) {
      case 'startDate':
        return formatDateFull(task.startDate);
      case 'duration':
        return <span className="duration-value">{getDuration(task.startDate, task.endDate)}</span>;
      default:
        return <span>{task[column.key] || ''}</span>;
    }
  };

  return (
    <div
      className={`gantt-table-row ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
    >
      {displayColumns.map((column, index) => {
        const isFirstColumn = index === 0 && column.fixed;
        return (
          <div
            key={column.key}
            className={`gantt-table-cell ${isFirstColumn ? 'task-name-cell' : ''}`}
            style={{
              width: column.width ? `${column.width}px` : undefined,
              flex: column.width ? `0 0 ${column.width}px` : '1 1 auto',
              minWidth: column.width ? `${column.width}px` : undefined,
            }}
          >
            {renderCellContent(column)}
          </div>
        );
      })}
    </div>
  );
};

GanttTableRow.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string.isRequired,
    level: PropTypes.number,
    hasChildren: PropTypes.bool,
    isExpanded: PropTypes.bool,
  }).isRequired,
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  onToggleExpand: PropTypes.func.isRequired,
  columns: PropTypes.arrayOf(PropTypes.object),
  onRenderCell: PropTypes.func,
  onCellChange: PropTypes.func,
};

GanttTableRow.defaultProps = {
  isSelected: false,
  columns: null,
  onRenderCell: null,
  onCellChange: () => {},
};

// Remove React.memo temporarily to debug
export default GanttTableRow;

