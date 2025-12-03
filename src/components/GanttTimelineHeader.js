import React from 'react';
import PropTypes from 'prop-types';
import { formatDateShort } from '../utils/ganttUtils';
import './GanttChart.css';

const GanttTimelineHeader = ({ weeklyRanges, scrollLeft, weekColumnWidth }) => {
  // Tính toán month groups
  const monthGroups = React.useMemo(() => {
    if (weeklyRanges.length === 0) return [];
    
    const groups = [];
    let currentMonthKey = null;
    let monthStartIndex = 0;
    
    weeklyRanges.forEach((week, index) => {
      const month = week.start.getMonth();
      const year = week.start.getFullYear();
      const monthKey = `${year}-${month}`;
      
      if (currentMonthKey === null) {
        currentMonthKey = monthKey;
        monthStartIndex = index;
      } else if (currentMonthKey !== monthKey) {
        const prevWeek = weeklyRanges[monthStartIndex];
        const prevMonthLabel = prevWeek.start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const weekCount = index - monthStartIndex;
        
        groups.push({
          month: prevMonthLabel,
          weekCount: weekCount
        });
        
        currentMonthKey = monthKey;
        monthStartIndex = index;
      }
    });
    
    if (currentMonthKey !== null && monthStartIndex < weeklyRanges.length) {
      const lastWeek = weeklyRanges[monthStartIndex];
      const lastMonthLabel = lastWeek.start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const weekCount = weeklyRanges.length - monthStartIndex;
      
      groups.push({
        month: lastMonthLabel,
        weekCount: weekCount
      });
    }
    
    return groups;
  }, [weeklyRanges]);

  return (
    <div className="gantt-timeline-header-wrapper">
      <div 
        className="gantt-timeline-header" 
        style={{ 
          width: `${weeklyRanges.length * weekColumnWidth}px`, 
          overflow: 'hidden',
          transform: `translateX(-${scrollLeft}px)`
        }}
      >
        {/* Level 1: Month Header */}
        <div className="timeline-header-level-1">
          {monthGroups.map((group, groupIndex) => (
            <div
              key={`month-group-${groupIndex}`}
              className="timeline-header-month-cell"
              style={{ 
                width: `${group.weekCount * weekColumnWidth}px`,
                flex: `0 0 ${group.weekCount * weekColumnWidth}px`
              }}
            >
              <div className="timeline-month-label">{group.month}</div>
            </div>
          ))}
        </div>
        
        {/* Level 2: Week Header */}
        <div className="timeline-header-level-2">
          {weeklyRanges.map((week, index) => (
            <div
              key={`week-${index}`}
              className="timeline-header-week-cell"
              style={{ width: `${weekColumnWidth}px` }}
            >
              {formatDateShort(week.start)}
            </div>
          ))}
        </div>
      </div>
      <div className="gantt-timeline-header-border"></div>
    </div>
  );
};

GanttTimelineHeader.propTypes = {
  weeklyRanges: PropTypes.arrayOf(PropTypes.shape({
    start: PropTypes.instanceOf(Date).isRequired,
    end: PropTypes.instanceOf(Date).isRequired,
  })).isRequired,
  scrollLeft: PropTypes.number.isRequired,
  weekColumnWidth: PropTypes.number.isRequired,
};

export default React.memo(GanttTimelineHeader);

