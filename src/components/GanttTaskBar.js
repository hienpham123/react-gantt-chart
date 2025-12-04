import React from 'react';
import PropTypes from 'prop-types';
import './GanttChart.css';

const GanttTaskBar = ({ 
  task, 
  barStyle, 
  isSelected, 
  onSelect,
  onDoubleClick,
  isSecondary = false
}) => {
  const isMilestone = task.type === 'milestone';

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(task);
  };

  const handleMouseDown = (e) => {
    e.stopPropagation();
  };

  const handleDoubleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🎯 GanttTaskBar: Double click on task bar');
    if (onDoubleClick) {
      onDoubleClick(task);
    }
  };

  if (isMilestone) {
    return (
      <div
        className="task-bar task-bar-milestone"
        style={{
          left: `calc(${barStyle.left} - 8px)`,
          width: '16px',
          height: '16px',
          top: '12px',
          borderRadius: '50%'
        }}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        title={task.name}
      />
    );
  }

  return (
    <div
      className={`task-bar task-bar-default ${isSecondary ? 'task-bar-secondary' : ''}`}
      style={{
        ...barStyle,
        top: isSecondary ? '8px' : '8px',
        height: '24px'
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      <div className="task-bar-content">
        <span className="task-bar-label">{task.name}</span>
      </div>
    </div>
  );
};

GanttTaskBar.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['task', 'project', 'milestone']),
  }).isRequired,
  barStyle: PropTypes.shape({
    left: PropTypes.string.isRequired,
    width: PropTypes.string.isRequired,
  }).isRequired,
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  onDoubleClick: PropTypes.func,
  isSecondary: PropTypes.bool,
};

GanttTaskBar.defaultProps = {
  isSelected: false,
  onDoubleClick: null,
  isSecondary: false,
};

export default React.memo(GanttTaskBar);

