import React, { useState } from 'react';
import GanttChart from '../components/GanttChart';
import { formatDateFull, getDuration } from '../utils/ganttUtils';

// Editable Cell Components
const EditableDateCell = ({ value, onSave, displayValue }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (onSave && editValue !== value) {
      onSave(editValue);
    } else {
      setEditValue(value);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        type="date"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        style={{ width: '100%', border: '2px solid #007bff', padding: '4px' }}
      />
    );
  }

  return (
    <span
      onDoubleClick={handleDoubleClick}
      style={{ cursor: 'pointer', padding: '4px' }}
      title="Double-click to edit"
    >
      {displayValue || formatDateFull(value)}
    </span>
  );
};

const EditableTextCell = ({ value, onSave, placeholder = 'Unassigned' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');

  React.useEffect(() => {
    setEditValue(value || '');
  }, [value]);

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (onSave && editValue !== (value || '')) {
      onSave(editValue);
    } else {
      setEditValue(value || '');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setEditValue(value || '');
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        style={{ width: '100%', border: '2px solid #007bff', padding: '4px' }}
      />
    );
  }

  return (
    <span
      onDoubleClick={handleDoubleClick}
      style={{ cursor: 'pointer', padding: '4px' }}
      title="Double-click to edit"
    >
      {value || placeholder}
    </span>
  );
};

const EditableSelectCell = ({ value, onSave, options, getColor, getDisplayValue }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  React.useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (onSave && editValue !== value) {
      onSave(editValue);
    } else {
      setEditValue(value);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <select
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        style={{ width: '100%', border: '2px solid #007bff', padding: '4px' }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    );
  }

  const color = getColor ? getColor(editValue) : '#6c757d';
  const display = getDisplayValue ? getDisplayValue(editValue) : editValue;

  return (
    <span
      onDoubleClick={handleDoubleClick}
      style={{
        cursor: 'pointer',
        padding: '4px 8px',
        borderRadius: '4px',
        backgroundColor: color + '20',
        color: color,
        fontWeight: '500',
      }}
      title="Double-click to edit"
    >
      {display}
    </span>
  );
};

const EditableNumberCell = ({ value, onSave, min = 0, max = 100, suffix = '%' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || 0);

  React.useEffect(() => {
    setEditValue(value || 0);
  }, [value]);

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    const numValue = parseInt(editValue, 10);
    if (onSave && !isNaN(numValue) && numValue !== (value || 0)) {
      onSave(numValue);
    } else {
      setEditValue(value || 0);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setEditValue(value || 0);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        type="number"
        min={min}
        max={max}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        style={{ width: '100%', border: '2px solid #007bff', padding: '4px' }}
      />
    );
  }

  return (
    <span
      onDoubleClick={handleDoubleClick}
      style={{ cursor: 'pointer', padding: '4px' }}
      title="Double-click to edit"
    >
      {value || 0}{suffix}
    </span>
  );
};

/**
 * Advanced Example - Using all features and customizations with columns and inline editing
 */
const AdvancedExample = () => {
  // Generate extensive mock data
  const generateMockTasks = () => {
    const tasks = [];
    let idCounter = 1;

    // Project 1: Development
    const devProject = {
      id: idCounter++,
      name: 'Development',
      startDate: '2025-05-01',
      endDate: '2025-05-30',
      progress: 50,
      type: 'project',
      parent: null,
      children: [],
      assignee: 'John Doe',
      priority: 'High',
      status: 'In Progress',
    };
    tasks.push(devProject);

    // Sub-tasks for Development
    const devTasks = [
      { name: 'Frontend Development', start: '2025-05-01', end: '2025-05-10', start2: '2025-05-12', end2: '2025-05-18', progress: 60, assignee: 'Alice', priority: 'High', status: 'In Progress' },
      { name: 'Backend Development', start: '2025-05-05', end: '2025-05-15', progress: 40, assignee: 'Bob', priority: 'High', status: 'In Progress' },
      { name: 'API Integration', start: '2025-05-10', end: '2025-05-20', start2: '2025-05-22', end2: '2025-05-28', progress: 30, assignee: 'Charlie', priority: 'Medium', status: 'In Progress' },
      { name: 'Database Design', start: '2025-05-01', end: '2025-05-05', progress: 100, assignee: 'David', priority: 'High', status: 'Completed' },
      { name: 'Testing', start: '2025-05-15', end: '2025-05-25', progress: 20, assignee: 'Eve', priority: 'Medium', status: 'In Progress' },
      { name: 'Code Review', start: '2025-05-20', end: '2025-05-30', start2: '2025-06-01', end2: '2025-06-05', progress: 10, assignee: 'Frank', priority: 'Low', status: 'Not Started' },
    ];

    devTasks.forEach(task => {
      const taskId = idCounter++;
      devProject.children.push(taskId);
      const taskObj = {
        id: taskId,
        name: task.name,
        startDate: task.start,
        endDate: task.end,
        ...(task.start2 && task.end2 ? { startDate2: task.start2, endDate2: task.end2 } : {}),
        progress: task.progress,
        type: 'task',
        parent: devProject.id,
        children: [],
        assignee: task.assignee,
        priority: task.priority,
        status: task.status,
      };
      tasks.push(taskObj);
      
      // Add sub-tasks for some tasks (2nd level grouping)
      if (task.name === 'Frontend Development') {
        const subTasks = [
          { name: 'Component Design', start: task.start, end: '2025-05-06', progress: 80 },
          { name: 'State Management', start: '2025-05-07', end: '2025-05-09', progress: 60 },
          { name: 'UI Styling', start: task.start2 || '2025-05-12', end: task.end2 || '2025-05-15', progress: 40 },
          { name: 'Integration Testing', start: task.end2 || '2025-05-16', end: task.end2 || '2025-05-18', progress: 20 },
        ];
        subTasks.forEach(subTask => {
          const subTaskId = idCounter++;
          taskObj.children.push(subTaskId);
          tasks.push({
            id: subTaskId,
            name: subTask.name,
            startDate: subTask.start,
            endDate: subTask.end,
            progress: subTask.progress,
            type: 'task',
            parent: taskId,
            children: [],
            assignee: task.assignee,
            priority: task.priority,
            status: 'In Progress',
          });
        });
      } else if (task.name === 'Backend Development') {
        const subTasks = [
          { name: 'API Endpoints', start: '2025-05-05', end: '2025-05-10', progress: 70 },
          { name: 'Database Models', start: '2025-05-11', end: '2025-05-13', progress: 50 },
          { name: 'Authentication', start: '2025-05-14', end: '2025-05-15', progress: 30 },
        ];
        subTasks.forEach(subTask => {
          const subTaskId = idCounter++;
          taskObj.children.push(subTaskId);
          tasks.push({
            id: subTaskId,
            name: subTask.name,
            startDate: subTask.start,
            endDate: subTask.end,
            progress: subTask.progress,
            type: 'task',
            parent: taskId,
            children: [],
            assignee: task.assignee,
            priority: task.priority,
            status: 'In Progress',
          });
        });
      } else if (task.name === 'Testing') {
        const subTasks = [
          { name: 'Unit Tests', start: '2025-05-15', end: '2025-05-18', progress: 60 },
          { name: 'Integration Tests', start: '2025-05-19', end: '2025-05-22', progress: 30 },
          { name: 'E2E Tests', start: '2025-05-23', end: '2025-05-25', progress: 10 },
        ];
        subTasks.forEach(subTask => {
          const subTaskId = idCounter++;
          taskObj.children.push(subTaskId);
          tasks.push({
            id: subTaskId,
            name: subTask.name,
            startDate: subTask.start,
            endDate: subTask.end,
            progress: subTask.progress,
            type: 'task',
            parent: taskId,
            children: [],
            assignee: task.assignee,
            priority: task.priority,
            status: 'In Progress',
          });
        });
      }
    });

    // Project 2: Testing
    const testProject = {
      id: idCounter++,
      name: 'Meta test',
      startDate: '2025-05-14',
      endDate: '2025-05-28',
      progress: 25,
      type: 'project',
      parent: null,
      children: [],
      assignee: 'Grace',
      priority: 'Medium',
      status: 'In Progress',
    };
    tasks.push(testProject);

    const testTasks = [
      { name: 'Functional Testing', start: '2025-05-14', end: '2025-05-18', start2: '2025-05-20', end2: '2025-05-22', progress: 75, assignee: 'Henry', priority: 'High', status: 'In Progress' },
      { name: 'UI Testing', start: '2025-05-16', end: '2025-05-20', progress: 50, assignee: 'Ivy', priority: 'Medium', status: 'In Progress' },
      { name: 'Performance Testing', start: '2025-05-18', end: '2025-05-22', progress: 30, assignee: 'Jack', priority: 'Medium', status: 'In Progress' },
      { name: 'Security Testing', start: '2025-05-20', end: '2025-05-24', start2: '2025-05-26', end2: '2025-05-28', progress: 10, assignee: 'Kate', priority: 'High', status: 'Not Started' },
      { name: 'User Acceptance Testing', start: '2025-05-22', end: '2025-05-28', progress: 0, assignee: 'Liam', priority: 'High', status: 'Not Started' },
    ];

    testTasks.forEach(task => {
      const taskId = idCounter++;
      testProject.children.push(taskId);
      const taskObj = {
        id: taskId,
        name: task.name,
        startDate: task.start,
        endDate: task.end,
        ...(task.start2 && task.end2 ? { startDate2: task.start2, endDate2: task.end2 } : {}),
        progress: task.progress,
        type: 'task',
        parent: testProject.id,
        children: [],
        assignee: task.assignee,
        priority: task.priority,
        status: task.status,
      };
      tasks.push(taskObj);
      
      // Add sub-tasks for some tasks (2nd level grouping)
      if (task.name === 'Functional Testing') {
        const subTasks = [
          { name: 'Test Cases Design', start: task.start, end: '2025-05-16', progress: 90 },
          { name: 'Test Execution', start: '2025-05-17', end: task.end, progress: 70 },
          { name: 'Regression Testing', start: task.start2 || '2025-05-20', end: task.end2 || '2025-05-22', progress: 40 },
        ];
        subTasks.forEach(subTask => {
          const subTaskId = idCounter++;
          taskObj.children.push(subTaskId);
          tasks.push({
            id: subTaskId,
            name: subTask.name,
            startDate: subTask.start,
            endDate: subTask.end,
            progress: subTask.progress,
            type: 'task',
            parent: taskId,
            children: [],
            assignee: task.assignee,
            priority: task.priority,
            status: 'In Progress',
          });
        });
      } else if (task.name === 'UI Testing') {
        const subTasks = [
          { name: 'Component Testing', start: task.start, end: '2025-05-17', progress: 70 },
          { name: 'Responsive Testing', start: '2025-05-18', end: task.end, progress: 30 },
        ];
        subTasks.forEach(subTask => {
          const subTaskId = idCounter++;
          taskObj.children.push(subTaskId);
          tasks.push({
            id: subTaskId,
            name: subTask.name,
            startDate: subTask.start,
            endDate: subTask.end,
            progress: subTask.progress,
            type: 'task',
            parent: taskId,
            children: [],
            assignee: task.assignee,
            priority: task.priority,
            status: 'In Progress',
          });
        });
      }
    });

    // Project 3: Deployment
    const deployProject = {
      id: idCounter++,
      name: 'Deployment',
      startDate: '2025-05-25',
      endDate: '2025-06-10',
      progress: 0,
      type: 'project',
      parent: null,
      children: [],
      assignee: 'Mike',
      priority: 'High',
      status: 'Not Started',
    };
    tasks.push(deployProject);

    const deployTasks = [
      { name: 'Environment Setup', start: '2025-05-25', end: '2025-05-28', progress: 0, assignee: 'Nancy', priority: 'High', status: 'Not Started' },
      { name: 'Build Configuration', start: '2025-05-28', end: '2025-06-01', progress: 0, assignee: 'Oscar', priority: 'High', status: 'Not Started' },
      { name: 'Deploy to Staging', start: '2025-06-01', end: '2025-06-03', progress: 0, assignee: 'Paul', priority: 'High', status: 'Not Started' },
      { name: 'Deploy to Production', start: '2025-06-05', end: '2025-06-07', progress: 0, assignee: 'Quinn', priority: 'High', status: 'Not Started' },
      { name: 'Post-Deployment Check', start: '2025-06-07', end: '2025-06-10', progress: 0, assignee: 'Rachel', priority: 'Medium', status: 'Not Started' },
    ];

    deployTasks.forEach(task => {
      const taskId = idCounter++;
      deployProject.children.push(taskId);
      tasks.push({
        id: taskId,
        name: task.name,
        startDate: task.start,
        endDate: task.end,
        ...(task.start2 && task.end2 ? { startDate2: task.start2, endDate2: task.end2 } : {}),
        progress: task.progress,
        type: 'task',
        parent: deployProject.id,
        children: [],
        assignee: task.assignee,
        priority: task.priority,
        status: task.status,
      });
    });

    // Project 4: Documentation
    const docProject = {
      id: idCounter++,
      name: 'Documentation',
      startDate: '2025-05-10',
      endDate: '2025-06-05',
      progress: 35,
      type: 'project',
      parent: null,
      children: [],
      assignee: 'Sarah',
      priority: 'Medium',
      status: 'In Progress',
    };
    tasks.push(docProject);

    const docTasks = [
      { name: 'API Documentation', start: '2025-05-10', end: '2025-05-20', progress: 60, assignee: 'Tom', priority: 'Medium', status: 'In Progress' },
      { name: 'User Guide', start: '2025-05-15', end: '2025-05-25', progress: 40, assignee: 'Uma', priority: 'Medium', status: 'In Progress' },
      { name: 'Technical Documentation', start: '2025-05-20', end: '2025-05-30', progress: 20, assignee: 'Victor', priority: 'Low', status: 'In Progress' },
      { name: 'Video Tutorials', start: '2025-05-25', end: '2025-06-05', progress: 10, assignee: 'Wendy', priority: 'Low', status: 'Not Started' },
    ];

    docTasks.forEach(task => {
      const taskId = idCounter++;
      docProject.children.push(taskId);
      tasks.push({
        id: taskId,
        name: task.name,
        startDate: task.start,
        endDate: task.end,
        ...(task.start2 && task.end2 ? { startDate2: task.start2, endDate2: task.end2 } : {}),
        progress: task.progress,
        type: 'task',
        parent: docProject.id,
        children: [],
        assignee: task.assignee,
        priority: task.priority,
        status: task.status,
      });
    });

    // Milestones
    tasks.push({
      id: idCounter++,
      name: 'Alpha Release',
      startDate: '2025-05-15',
      endDate: '2025-05-15',
      progress: 0,
      type: 'milestone',
      parent: null,
      children: [],
      assignee: 'Team Lead',
      priority: 'High',
      status: 'Not Started',
    });

    tasks.push({
      id: idCounter++,
      name: 'Beta Release',
      startDate: '2025-05-30',
      endDate: '2025-05-30',
      progress: 0,
      type: 'milestone',
      parent: null,
      children: [],
      assignee: 'Team Lead',
      priority: 'High',
      status: 'Not Started',
    });

    tasks.push({
      id: idCounter++,
      name: 'RC Release',
      startDate: '2025-06-05',
      endDate: '2025-06-05',
      progress: 0,
      type: 'milestone',
      parent: null,
      children: [],
      assignee: 'Team Lead',
      priority: 'High',
      status: 'Not Started',
    });

    tasks.push({
      id: idCounter++,
      name: 'Final Release',
      startDate: '2025-06-10',
      endDate: '2025-06-10',
      progress: 0,
      type: 'milestone',
      parent: null,
      children: [],
      assignee: 'Team Lead',
      priority: 'High',
      status: 'Not Started',
    });

    return tasks;
  };

  const [tasks, setTasks] = useState(generateMockTasks());

  // Define custom columns
  const columns = [
    {
      key: 'name',
      label: 'Task name',
      width: 250,
      fixed: true,
    },
    {
      key: 'startDate',
      label: 'Start time',
      width: 150,
      render: (task, column, onCellChange) => (
        <EditableDateCell
          value={task.startDate}
          onSave={(newValue) => onCellChange && onCellChange(task, newValue, column.key)}
          displayValue={formatDateFull(task.startDate)}
        />
      ),
    },
    {
      key: 'duration',
      label: 'Duration',
      width: 120,
      render: (task) => <span>{getDuration(task.startDate, task.endDate)}</span>,
    },
    {
      key: 'assignee',
      label: 'Assignee',
      width: 150,
      render: (task, column, onCellChange) => (
        <EditableTextCell
          value={task.assignee}
          onSave={(newValue) => onCellChange && onCellChange(task, newValue, column.key)}
          placeholder="Unassigned"
        />
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      width: 120,
      render: (task, column, onCellChange) => (
        <EditableSelectCell
          value={task.priority || 'Medium'}
          onSave={(newValue) => onCellChange && onCellChange(task, newValue, column.key)}
          options={[
            { value: 'High', label: 'High' },
            { value: 'Medium', label: 'Medium' },
            { value: 'Low', label: 'Low' },
          ]}
          getColor={(priority) => {
            switch (priority) {
              case 'High': return '#dc3545';
              case 'Medium': return '#ffc107';
              case 'Low': return '#28a745';
              default: return '#6c757d';
            }
          }}
        />
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: 130,
      render: (task, column, onCellChange) => (
        <EditableSelectCell
          value={task.status || 'Not Started'}
          onSave={(newValue) => onCellChange && onCellChange(task, newValue, column.key)}
          options={[
            { value: 'Not Started', label: 'Not Started' },
            { value: 'In Progress', label: 'In Progress' },
            { value: 'Completed', label: 'Completed' },
          ]}
          getColor={(status) => {
            switch (status) {
              case 'Completed': return '#28a745';
              case 'In Progress': return '#007bff';
              case 'Not Started': return '#6c757d';
              default: return '#6c757d';
            }
          }}
        />
      ),
    },
    {
      key: 'progress',
      label: 'Progress',
      width: 100,
      render: (task, column, onCellChange) => (
        <EditableNumberCell
          value={task.progress || 0}
          onSave={(newValue) => onCellChange && onCellChange(task, newValue, column.key)}
          min={0}
          max={100}
          suffix="%"
        />
      ),
    },
  ];

  const handleTasksChange = (newTasks) => {
    setTasks(newTasks);
  };

  const handleTaskSelect = (task) => {
    console.log('Task selected:', task);
  };

  const handleTaskDrag = (newTask, oldTask) => {
    console.log('Task dragged:', {
      task: newTask.name,
      from: oldTask.startDate,
      to: newTask.startDate,
    });
  };

  const handleCellChange = (task, newValue, columnKey) => {
    const updatedTasks = tasks.map((t) => {
      if (t.id === task.id) {
        return { ...t, [columnKey]: newValue };
      }
      return t;
    });
    setTasks(updatedTasks);
    console.log(`Updated ${columnKey} for task ${task.name}:`, newValue);
  };

  return (
    <div style={{ padding: '0', height: '100%', width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <GanttChart
        tasks={tasks}
        onTasksChange={handleTasksChange}
        onTaskSelect={handleTaskSelect}
        onTaskDrag={handleTaskDrag}
        defaultTableWidth={800}
        defaultExpandedTasks={[1, 17, 24, 30]}
        showTimeline={true}
        endYear={2028}
        weekColumnWidth={150}
        rowHeight={40}
        searchPlaceholder="Search tasks..."
        className="custom-gantt"
        style={{ height: '100%', flex: 1, width: '100%' }}
        columns={columns}
        onRenderCell={(task, column, onCellChange) => {
          // Use custom render function from column definition
          if (column.render) {
            return column.render(task, column, onCellChange);
          }
          // Default rendering
          return <span>{task[column.key]}</span>;
        }}
        onCellChange={handleCellChange}
      />
    </div>
  );
};

export default AdvancedExample;
