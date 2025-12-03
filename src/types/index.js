/**
 * Type definitions and PropTypes for Gantt Chart components
 */

import PropTypes from 'prop-types';

// Task shape
export const TaskShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  name: PropTypes.string.isRequired,
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  progress: PropTypes.number,
  type: PropTypes.oneOf(['task', 'project', 'milestone']),
  parent: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  children: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
});

// Column shape
export const ColumnShape = PropTypes.shape({
  key: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  width: PropTypes.number,
  fixed: PropTypes.bool,
  render: PropTypes.func, // (task, column, onCellChange) => ReactNode
});

// Gantt Chart Props
export const GanttChartProps = {
  tasks: PropTypes.arrayOf(TaskShape).isRequired,
  onTasksChange: PropTypes.func,
  onTaskSelect: PropTypes.func,
  onTaskDrag: PropTypes.func,
  defaultTableWidth: PropTypes.number,
  defaultExpandedTasks: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  showTimeline: PropTypes.bool,
  endYear: PropTypes.number,
  weekColumnWidth: PropTypes.number,
  rowHeight: PropTypes.number,
  searchPlaceholder: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  columns: PropTypes.arrayOf(ColumnShape),
  onRenderCell: PropTypes.func, // (task, column, onCellChange) => ReactNode
  onCellChange: PropTypes.func, // (task, newValue, columnKey) => void
};

// Default props
export const GanttChartDefaultProps = {
  onTasksChange: () => {},
  onTaskSelect: () => {},
  onTaskDrag: () => {},
  defaultTableWidth: 440,
  defaultExpandedTasks: [],
  showTimeline: true,
  endYear: 2028,
  weekColumnWidth: 150,
  rowHeight: 40,
  searchPlaceholder: 'Enter task name to filter',
  className: '',
  style: {},
  columns: null,
  onRenderCell: null,
  onCellChange: () => {},
};

