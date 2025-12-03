/**
 * React Gantt Chart Component - Library Exports
 * 
 * This file contains all exports for the npm package.
 * For React app entry point, see src/index.js
 * 
 * @module react-gantt-chart
 */

// CSS (for bundlers that support CSS imports)
import '../components/GanttChart.css';

export { default as GanttChart } from '../components/GanttChart';
export { default as GanttTable } from '../components/GanttTable';
export { default as GanttTimeline } from '../components/GanttTimeline';
export { default as GanttTableRow } from '../components/GanttTableRow';
export { default as GanttTaskBar } from '../components/GanttTaskBar';
export { default as GanttSearchBar } from '../components/GanttSearchBar';
export { default as GanttTableHeader } from '../components/GanttTableHeader';
export { default as GanttTimelineHeader } from '../components/GanttTimelineHeader';

// Utils
export * from '../utils/ganttUtils';

// Types
export * from '../types';

// Examples (for development/demo purposes)
export * from '../examples';

