import React from 'react';
import PropTypes from 'prop-types';
import GanttTaskBar from './GanttTaskBar';
import { getTaskBarStyle } from '../utils/ganttUtils';
import './GanttChart.css';

const GanttTimeline = React.forwardRef(({ 
  flatTasks, 
  selectedTask,
  weeklyRanges, 
  weekColumnWidth,
  onTaskSelect,
  onTaskDoubleClick,
  onScroll,
  onMouseDown,
  onMouseMove,
  onMouseUp
}, ref) => {
  return (
    <div
      ref={ref}
      className="gantt-timeline"
      onScroll={onScroll}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      <div className="timeline-grid" style={{ width: `${weeklyRanges.length * weekColumnWidth}px` }}>
        {weeklyRanges.map((week, index) => (
          <div
            key={index}
            className="timeline-grid-line"
            style={{ left: `${index * weekColumnWidth}px` }}
          />
        ))}
      </div>

      <div className="timeline-tasks" style={{ width: `${weeklyRanges.length * weekColumnWidth}px` }}>
        {flatTasks.map((task) => {
          const barStyle = getTaskBarStyle(task, weeklyRanges, weekColumnWidth);
          
          // Check if task has second date range (startDate2, endDate2)
          const hasSecondBar = task.startDate2 && task.endDate2;
          let secondBarStyle = null;
          if (hasSecondBar) {
            const secondTask = {
              ...task,
              startDate: task.startDate2,
              endDate: task.endDate2
            };
            secondBarStyle = getTaskBarStyle(secondTask, weeklyRanges, weekColumnWidth);
          }
          
          return (
            <div
              key={task.id}
              className={`timeline-task-row ${selectedTask?.id === task.id ? 'selected' : ''}`}
              style={{ height: '40px' }}
            >
              <GanttTaskBar
                task={task}
                barStyle={barStyle}
                isSelected={selectedTask?.id === task.id}
                onSelect={onTaskSelect}
                onDoubleClick={onTaskDoubleClick}
              />
              {hasSecondBar && secondBarStyle && (
                <GanttTaskBar
                  task={task}
                  barStyle={secondBarStyle}
                  isSelected={selectedTask?.id === task.id}
                  onSelect={onTaskSelect}
                  onDoubleClick={onTaskDoubleClick}
                  isSecondary={true}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

GanttTimeline.displayName = 'GanttTimeline';

GanttTimeline.propTypes = {
  flatTasks: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedTask: PropTypes.object,
  weeklyRanges: PropTypes.arrayOf(PropTypes.shape({
    start: PropTypes.instanceOf(Date).isRequired,
    end: PropTypes.instanceOf(Date).isRequired,
  })).isRequired,
  weekColumnWidth: PropTypes.number.isRequired,
  onTaskSelect: PropTypes.func.isRequired,
  onTaskDoubleClick: PropTypes.func,
  onScroll: PropTypes.func.isRequired,
  onMouseDown: PropTypes.func,
  onMouseMove: PropTypes.func,
  onMouseUp: PropTypes.func,
};

GanttTimeline.defaultProps = {
  selectedTask: null,
  onTaskDoubleClick: null,
  onMouseDown: null,
  onMouseMove: null,
  onMouseUp: null,
};

export default React.memo(GanttTimeline);

