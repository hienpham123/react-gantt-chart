# React Gantt Chart

A customizable, high-performance Gantt chart component for React with timeline visualization, task management, drag-and-drop support, and hierarchical task structure.

## Features

- 📊 **Timeline Visualization**: Visual representation of tasks on a weekly timeline
- 🎯 **Task Management**: Support for tasks, projects, and milestones
- 🔄 **Drag & Drop**: Drag tasks to update their dates
- 📱 **Responsive**: Fully responsive design
- 🔍 **Search**: Filter tasks by name
- 📈 **Hierarchical Tasks**: Support for unlimited nested levels (parent → child → grandchild → ...)
- 🔀 **Multiple Task Bars**: Display two task bars on the same row using `startDate2` and `endDate2`
- 🎨 **Customizable**: Highly customizable styling and behavior
- ⚡ **Performance Optimized**: Built with React.memo and useMemo for optimal performance

## Installation

```bash
npm install react-gantt-chart
# or
yarn add react-gantt-chart
```

## Quick Start

```jsx
import React, { useState } from 'react';
import GanttChart from './components/GanttChart';

const App = () => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      name: 'Project Alpha',
      startDate: '2025-05-01',
      endDate: '2025-05-30',
      progress: 50,
      type: 'project',
      parent: null,
      children: [2, 3],
    },
    {
      id: 2,
      name: 'Task 1',
      startDate: '2025-05-01',
      endDate: '2025-05-10',
      startDate2: '2025-05-15',  // Optional: Second task bar
      endDate2: '2025-05-20',     // Optional: Second task bar
      progress: 100,
      type: 'task',
      parent: 1,
      children: [4],  // Has sub-task
    },
    {
      id: 4,
      name: 'Sub-task 1.1',
      startDate: '2025-05-01',
      endDate: '2025-05-05',
      progress: 80,
      type: 'task',
      parent: 2,
      children: [],
    },
    {
      id: 3,
      name: 'Task 2',
      startDate: '2025-05-10',
      endDate: '2025-05-25',
      progress: 30,
      type: 'task',
      parent: 1,
      children: [],
    },
  ]);

  return (
    <GanttChart
      tasks={tasks}
      onTasksChange={setTasks}
      defaultExpandedTasks={[1, 2]}  // Expand tasks to show children
      onTaskSelect={(task) => console.log('Selected:', task)}
      onTaskDrag={(newTask, oldTask) => console.log('Dragged:', newTask)}
    />
  );
};

export default App;
```

## API Reference

### GanttChart Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tasks` | `Array<Task>` | **required** | Array of task objects |
| `onTasksChange` | `Function` | `() => {}` | Callback when tasks are updated |
| `onTaskSelect` | `Function` | `() => {}` | Callback when a task is selected |
| `onTaskDrag` | `Function` | `() => {}` | Callback when a task is dragged |
| `defaultTableWidth` | `number` | `440` | Default width of the task table |
| `defaultExpandedTasks` | `Array<id>` | `[]` | IDs of tasks expanded by default |
| `showTimeline` | `boolean` | `true` | Show/hide timeline view |
| `endYear` | `number` | `2028` | End year for timeline |
| `weekColumnWidth` | `number` | `150` | Width of each week column |
| `rowHeight` | `number` | `40` | Height of each task row |
| `searchPlaceholder` | `string` | `'Enter task name to filter'` | Placeholder for search input |
| `className` | `string` | `''` | Additional CSS class |
| `style` | `object` | `{}` | Additional inline styles |

### Task Object

```typescript
interface Task {
  id: string | number;           // Unique identifier
  name: string;                  // Task name
  startDate: string;            // Start date (YYYY-MM-DD) - required
  endDate: string;              // End date (YYYY-MM-DD) - required
  startDate2?: string;          // Optional: Second task bar start date (YYYY-MM-DD)
  endDate2?: string;            // Optional: Second task bar end date (YYYY-MM-DD)
  progress?: number;           // Progress percentage (0-100)
  type?: 'task' | 'project' | 'milestone';
  parent?: string | number;     // Parent task ID (null for root tasks)
  children?: Array<string | number>; // Child task IDs (empty array for leaf tasks)
  [key: string]: any;          // Additional custom fields (assignee, priority, status, etc.)
}
```

#### Key Features:

1. **Hierarchical Structure (Multiple Levels)**:
   - Use `parent` and `children` to create nested groups
   - Supports unlimited nesting levels
   - Root tasks have `parent: null`
   - Tasks with children will show expand/collapse button

2. **Multiple Task Bars on Same Row**:
   - Use `startDate2` and `endDate2` to display a second task bar
   - The second bar appears as a secondary (green) bar on the timeline
   - Useful for representing phases, sprints, or separate work periods

#### Example with Multiple Levels and Multiple Bars:

```jsx
const tasks = [
  // Level 0: Root Project
  {
    id: 1,
    name: 'Development',
    startDate: '2025-05-01',
    endDate: '2025-05-30',
    progress: 50,
    type: 'project',
    parent: null,
    children: [2, 3, 4],  // References to child task IDs
  },
  
  // Level 1: Child Task with Sub-tasks
  {
    id: 2,
    name: 'Frontend Development',
    startDate: '2025-05-01',
    endDate: '2025-05-10',
    startDate2: '2025-05-12',  // Second task bar
    endDate2: '2025-05-18',     // Second task bar
    progress: 60,
    type: 'task',
    parent: 1,                  // Parent is Development (id: 1)
    children: [5, 6, 7],        // Has its own sub-tasks
  },
  
  // Level 2: Sub-task (grandchild)
  {
    id: 5,
    name: 'Component Design',
    startDate: '2025-05-01',
    endDate: '2025-05-06',
    progress: 80,
    type: 'task',
    parent: 2,                  // Parent is Frontend Development (id: 2)
    children: [],                // No children - leaf task
  },
  
  {
    id: 6,
    name: 'State Management',
    startDate: '2025-05-07',
    endDate: '2025-05-09',
    progress: 60,
    type: 'task',
    parent: 2,
    children: [],
  },
];
```

## Examples

### Basic Usage

```jsx
<GanttChart tasks={tasks} onTasksChange={setTasks} />
```

### Multi-Level Hierarchical Structure

```jsx
const tasks = [
  // Level 0: Root Project
  {
    id: 1,
    name: 'Development Project',
    startDate: '2025-05-01',
    endDate: '2025-05-30',
    progress: 50,
    type: 'project',
    parent: null,
    children: [2, 3],
  },
  
  // Level 1: Child Task
  {
    id: 2,
    name: 'Frontend Development',
    startDate: '2025-05-01',
    endDate: '2025-05-15',
    progress: 60,
    type: 'task',
    parent: 1,
    children: [4, 5],  // Has sub-tasks
  },
  
  // Level 2: Sub-task (grandchild)
  {
    id: 4,
    name: 'Component Design',
    startDate: '2025-05-01',
    endDate: '2025-05-05',
    progress: 80,
    type: 'task',
    parent: 2,         // Parent is Frontend Development
    children: [],       // Leaf task
  },
  
  {
    id: 5,
    name: 'UI Styling',
    startDate: '2025-05-06',
    endDate: '2025-05-10',
    progress: 40,
    type: 'task',
    parent: 2,
    children: [],
  },
  
  {
    id: 3,
    name: 'Backend Development',
    startDate: '2025-05-05',
    endDate: '2025-05-20',
    progress: 30,
    type: 'task',
    parent: 1,
    children: [],
  },
];

// Remember to expand tasks to see children
<GanttChart 
  tasks={tasks} 
  onTasksChange={setTasks}
  defaultExpandedTasks={[1, 2]}  // Expand project and Frontend Development
/>
```

### Task with Multiple Bars (Two Task Periods)

```jsx
const tasks = [
  {
    id: 1,
    name: 'Development Phase 1 & 2',
    startDate: '2025-05-01',    // First task bar
    endDate: '2025-05-10',
    startDate2: '2025-05-15',   // Second task bar (green)
    endDate2: '2025-05-25',
    progress: 50,
    type: 'task',
    parent: null,
    children: [],
  },
];
```

### Complete Example with Custom Columns

```jsx
import React, { useState } from 'react';
import GanttChart from './components/GanttChart';

const App = () => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      name: 'Project Alpha',
      startDate: '2025-05-01',
      endDate: '2025-05-30',
      progress: 50,
      type: 'project',
      parent: null,
      children: [2, 3],
      assignee: 'John Doe',
      priority: 'High',
    },
    {
      id: 2,
      name: 'Task 1',
      startDate: '2025-05-01',
      endDate: '2025-05-10',
      startDate2: '2025-05-15',  // Second bar
      endDate2: '2025-05-20',
      progress: 100,
      type: 'task',
      parent: 1,
      children: [4],  // Has sub-task
      assignee: 'Alice',
      priority: 'Medium',
    },
    {
      id: 4,
      name: 'Sub-task 1.1',
      startDate: '2025-05-01',
      endDate: '2025-05-05',
      progress: 80,
      type: 'task',
      parent: 2,
      children: [],
    },
    {
      id: 3,
      name: 'Task 2',
      startDate: '2025-05-10',
      endDate: '2025-05-25',
      progress: 30,
      type: 'task',
      parent: 1,
      children: [],
    },
  ]);

  const columns = [
    { key: 'name', label: 'Task name', width: 200, fixed: true },
    { key: 'assignee', label: 'Assignee', width: 120 },
    { key: 'priority', label: 'Priority', width: 100 },
    { key: 'startDate', label: 'Start Date', width: 120 },
    { key: 'duration', label: 'Duration', width: 100 },
  ];

  return (
    <GanttChart
      tasks={tasks}
      onTasksChange={setTasks}
      columns={columns}
      defaultExpandedTasks={[1, 2]}  // Expand by default
      onTaskSelect={(task) => console.log('Selected:', task)}
    />
  );
};

export default App;
```

### With Custom Styling

```jsx
<GanttChart
  tasks={tasks}
  onTasksChange={setTasks}
  className="my-gantt-chart"
  style={{ height: '600px' }}
/>
```

### With Event Handlers

```jsx
<GanttChart
  tasks={tasks}
  onTasksChange={setTasks}
  onTaskSelect={(task) => {
    console.log('Task selected:', task);
  }}
  onTaskDrag={(newTask, oldTask) => {
    console.log('Task dragged from', oldTask.startDate, 'to', newTask.startDate);
  }}
/>
```

### Hide Timeline

```jsx
<GanttChart
  tasks={tasks}
  onTasksChange={setTasks}
  showTimeline={false}
/>
```

## Usage Guide

### Creating Tasks with Multiple Levels

To create a hierarchical structure with multiple levels:

1. **Define root tasks** (level 0) with `parent: null`
2. **Add children array** with IDs of child tasks
3. **Create child tasks** with `parent` pointing to parent ID
4. **Repeat for deeper levels** - child tasks can also have `children` array

Example:
```jsx
// Level 0: Root
{ id: 1, name: 'Project', parent: null, children: [2, 3] }

// Level 1: Children
{ id: 2, name: 'Task Group', parent: 1, children: [4, 5] }
{ id: 3, name: 'Task', parent: 1, children: [] }

// Level 2: Grandchildren
{ id: 4, name: 'Sub-task', parent: 2, children: [] }
{ id: 5, name: 'Sub-task', parent: 2, children: [] }
```

### Displaying Two Task Bars on Same Row

To show two task periods on the same row (e.g., Phase 1 and Phase 2):

```jsx
{
  id: 1,
  name: 'Task with Two Phases',
  startDate: '2025-05-01',    // First bar (blue)
  endDate: '2025-05-10',
  startDate2: '2025-05-15',   // Second bar (green)
  endDate2: '2025-05-25',
  parent: null,
  children: [],
}
```

- First bar uses `startDate` and `endDate` (displayed in blue)
- Second bar uses `startDate2` and `endDate2` (displayed in green)
- Both bars appear on the same row in the timeline

### Expanding/Collapsing Tasks

- Tasks with children show an expand/collapse button
- Use `defaultExpandedTasks` prop to expand tasks by default:
```jsx
<GanttChart 
  tasks={tasks}
  defaultExpandedTasks={[1, 2]}  // IDs of tasks to expand initially
/>
```

## Styling

The component includes default styles. You can override them by importing the CSS and customizing:

```css
.gantt-container {
  /* Your custom styles */
}

.gantt-table-row {
  /* Your custom styles */
}

.task-bar {
  /* Your custom styles */
}
```

## Performance

The component is optimized for performance with:
- React.memo for component memoization
- useMemo for expensive calculations
- useCallback for event handlers
- Efficient re-rendering strategies

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
