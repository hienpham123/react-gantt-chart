# Demo Guide - React Gantt Chart

Hướng dẫn chạy các file demo để xem cách sử dụng React Gantt Chart.

## Cách chạy Demo

### Option 1: Sử dụng DemoApp (Khuyến nghị)

1. Thay đổi import trong `src/index.js`:
```jsx
// Thay vì import App, import AppDemo
import AppDemo from './AppDemo';
export default AppDemo;
```

2. Hoặc tạo file mới `src/index-demo.js`:
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import AppDemo from './AppDemo';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppDemo />
  </React.StrictMode>
);
```

3. Chạy:
```bash
npm start
```

### Option 2: Sử dụng từng Example riêng lẻ

Trong `src/App.js`, import example bạn muốn:

```jsx
import BasicExample from './examples/BasicExample';
// hoặc
import AdvancedExample from './examples/AdvancedExample';
// hoặc
import TableOnlyExample from './examples/TableOnlyExample';
// hoặc
import CustomizedExample from './examples/CustomizedExample';

function App() {
  return <BasicExample />;
}
```

## Các Examples có sẵn

### 1. BasicExample
- **File**: `src/examples/BasicExample.js`
- **Mô tả**: Ví dụ cơ bản nhất, phù hợp cho người mới bắt đầu
- **Tính năng**: 
  - Task list đơn giản
  - Event handlers cơ bản
  - Cấu hình mặc định

### 2. AdvancedExample
- **File**: `src/examples/AdvancedExample.js`
- **Mô tả**: Ví dụ đầy đủ tính năng
- **Tính năng**:
  - Hierarchical tasks (parent-child)
  - Multiple task types (project, task, milestone)
  - Drag and drop
  - Search functionality
  - Timeline toggle
  - Resizable table
  - Custom event handlers

### 3. TableOnlyExample
- **File**: `src/examples/TableOnlyExample.js`
- **Mô tả**: Chỉ hiển thị table, ẩn timeline
- **Tính năng**:
  - Timeline toggle off
  - Table-only view
  - Phù hợp cho list view

### 4. CustomizedExample
- **File**: `src/examples/CustomizedExample.js`
- **Mô tả**: Ví dụ với custom styling và configuration
- **Tính năng**:
  - Custom table width
  - Custom week column width
  - Custom row height
  - Custom styling
  - Pre-expanded tasks

## Code Examples

### Basic Usage
```jsx
import GanttChart from 'react-gantt-chart';

const [tasks, setTasks] = useState([
  {
    id: 1,
    name: 'Task 1',
    startDate: '2025-05-01',
    endDate: '2025-05-10',
    type: 'task',
    parent: null,
    children: []
  }
]);

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
  onTaskSelect={(task) => {
    console.log('Selected:', task);
    // Do something with selected task
  }}
  onTaskDrag={(newTask, oldTask) => {
    console.log('Dragged from', oldTask.startDate, 'to', newTask.startDate);
    // Save to backend, update state, etc.
  }}
/>
```

### Customized Configuration
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
  searchPlaceholder="Tìm kiếm..."
  className="my-custom-gantt"
  style={{ height: '600px', border: '1px solid #ccc' }}
/>
```

## Task Data Structure

```javascript
{
  id: 1,                    // Required: Unique identifier (string or number)
  name: 'Task Name',        // Required: Task name
  startDate: '2025-05-01',  // Required: Start date (YYYY-MM-DD format)
  endDate: '2025-05-10',    // Required: End date (YYYY-MM-DD format)
  progress: 50,            // Optional: Progress percentage (0-100)
  type: 'task',            // Optional: 'task' | 'project' | 'milestone'
  parent: null,            // Optional: Parent task ID (null for root tasks)
  children: [2, 3]         // Optional: Array of child task IDs
}
```

## Tips

1. **Hierarchical Tasks**: Đảm bảo `parent` và `children` khớp với nhau
2. **Date Format**: Luôn sử dụng format `YYYY-MM-DD`
3. **Performance**: Component đã được tối ưu với React.memo, nhưng với >1000 tasks nên cân nhắc virtualization
4. **Styling**: Có thể override CSS classes để customize giao diện
5. **Event Handlers**: Luôn cập nhật state trong `onTasksChange` để component re-render đúng

## Troubleshooting

### Timeline không hiển thị
- Kiểm tra `showTimeline={true}`
- Kiểm tra `endYear` có đủ lớn không

### Tasks không expand/collapse
- Kiểm tra `children` array có đúng không
- Kiểm tra `defaultExpandedTasks` prop

### Drag không hoạt động
- Đảm bảo `onTasksChange` được implement
- Kiểm tra console có lỗi không

### Styling không apply
- Đảm bảo đã import CSS: `import 'react-gantt-chart/dist/index.css'`
- Kiểm tra CSS specificity

