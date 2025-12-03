import React from 'react';
import PropTypes from 'prop-types';
import './GanttChart.css';

const GanttSearchBar = ({ searchQuery, onSearchChange, showTimeline, onTimelineToggle }) => {
  return (
    <div className="gantt-search-bar">
      <label htmlFor="task-search">Search Tasks:</label>
      <input
        id="task-search"
        type="text"
        placeholder="Enter task name to filter"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="gantt-search-input"
      />
      <div className="gantt-timeline-toggle">
        <label className="toggle-label">Timeline</label>
        <button
          className={`toggle-switch ${showTimeline ? 'active' : ''}`}
          onClick={onTimelineToggle}
          type="button"
          aria-label="Toggle timeline"
        >
          <span className="toggle-slider"></span>
        </button>
      </div>
    </div>
  );
};

GanttSearchBar.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  showTimeline: PropTypes.bool.isRequired,
  onTimelineToggle: PropTypes.func.isRequired,
};

export default React.memo(GanttSearchBar);

