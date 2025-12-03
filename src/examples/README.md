# React Gantt Chart - Examples

This directory contains example implementations demonstrating various use cases of the React Gantt Chart component.

## Examples

### BasicExample.js
Simple usage with minimal configuration. Perfect for getting started.

**Features:**
- Basic task list
- Default configuration
- Event handlers

### AdvancedExample.js
Full-featured example showcasing all capabilities.

**Features:**
- Hierarchical tasks (parent-child)
- Multiple task types (project, task, milestone)
- Drag and drop
- Search functionality
- Timeline toggle
- Resizable table
- Custom event handlers

### TableOnlyExample.js
Example with timeline hidden, showing only the task table.

**Features:**
- Timeline toggle off
- Table-only view
- Useful for list views

### CustomizedExample.js
Example with custom styling and configuration.

**Features:**
- Custom table width
- Custom week column width
- Custom row height
- Custom styling
- Pre-expanded tasks

## Running Examples

### Option 1: Use DemoApp
```jsx
import DemoApp from './examples/DemoApp';

// In your App.js
<DemoApp />
```

### Option 2: Use Individual Examples
```jsx
import { BasicExample, AdvancedExample } from './examples';

// In your App.js
<BasicExample />
// or
<AdvancedExample />
```

## Code Examples

### Basic Usage
```jsx
import { GanttChart } from 'react-gantt-chart';

const [tasks, setTasks] = useState([...]);

<GanttChart
  tasks={tasks}
  onTasksChange={setTasks}
/>
```

### With Event Handlers
```jsx
<GanttChart
  tasks={tasks}
  onTasksChange={setTasks}
  onTaskSelect={(task) => console.log('Selected:', task)}
  onTaskDrag={(newTask, oldTask) => console.log('Dragged:', newTask)}
/>
```

### Customized
```jsx
<GanttChart
  tasks={tasks}
  onTasksChange={setTasks}
  defaultTableWidth={600}
  defaultExpandedTasks={[1, 2]}
  showTimeline={true}
  endYear={2026}
  weekColumnWidth={200}
  rowHeight={50}
  className="my-gantt"
  style={{ height: '600px' }}
/>
```

## Task Data Structure

```javascript
{
  id: 1,                    // Required: Unique identifier
  name: 'Task Name',        // Required: Task name
  startDate: '2025-05-01',  // Required: Start date (YYYY-MM-DD)
  endDate: '2025-05-10',    // Required: End date (YYYY-MM-DD)
  progress: 50,            // Optional: Progress (0-100)
  type: 'task',            // Optional: 'task' | 'project' | 'milestone'
  parent: null,            // Optional: Parent task ID
  children: [2, 3]         // Optional: Array of child task IDs
}
```

