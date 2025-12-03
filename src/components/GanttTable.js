import React from 'react';
import PropTypes from 'prop-types';
import GanttTableRow from './GanttTableRow';
import './GanttChart.css';

const GanttTable = ({ 
  flatTasks, 
  selectedTask, 
  tableWidth, 
  showTimeline,
  onTaskSelect,
  onToggleExpand,
  onScroll,
  columns,
  onRenderCell,
  onCellChange,
}) => {
  return (
    <div 
      className="gantt-table" 
      style={{ 
        width: `${tableWidth}px`,
        minWidth: `${tableWidth}px`,
      }}
    >
      <div className="gantt-table-content">
        {flatTasks.map((task) => (
          <GanttTableRow
            key={task.id}
            task={task}
            isSelected={selectedTask?.id === task.id}
            onSelect={onTaskSelect}
            onToggleExpand={onToggleExpand}
            columns={columns}
            onRenderCell={onRenderCell}
            onCellChange={onCellChange}
          />
        ))}
      </div>
    </div>
  );
};

GanttTable.propTypes = {
  flatTasks: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedTask: PropTypes.object,
  tableWidth: PropTypes.number.isRequired,
  showTimeline: PropTypes.bool.isRequired,
  onTaskSelect: PropTypes.func.isRequired,
  onToggleExpand: PropTypes.func.isRequired,
  onScroll: PropTypes.func,
  columns: PropTypes.arrayOf(PropTypes.object),
  onRenderCell: PropTypes.func,
  onCellChange: PropTypes.func,
};

GanttTable.defaultProps = {
  selectedTask: null,
  onScroll: () => {},
  columns: null,
  onRenderCell: null,
  onCellChange: () => {},
};

// Remove React.memo temporarily to debug
export default GanttTable;

