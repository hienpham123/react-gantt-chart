import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './GanttChart.css';

const TaskEditDialog = ({ task, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    progress: 0,
    type: 'task',
  });

  useEffect(() => {
    if (task && isOpen) {
      setFormData({
        name: task.name || '',
        startDate: task.startDate || '',
        endDate: task.endDate || '',
        progress: task.progress || 0,
        type: task.type || 'task',
      });
    }
  }, [task, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'progress' ? parseInt(value, 10) || 0 : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.startDate && formData.endDate) {
      onSave({
        ...task,
        ...formData,
        progress: Math.min(100, Math.max(0, formData.progress))
      });
      onClose();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  // Debug logging
  useEffect(() => {
    console.log('📋 TaskEditDialog useEffect triggered - isOpen:', isOpen, 'task:', task);
    if (isOpen && task) {
      console.log('✅ TaskEditDialog should be visible now!');
    }
  }, [isOpen, task]);
  
  console.log('📋 TaskEditDialog render - isOpen:', isOpen, 'typeof isOpen:', typeof isOpen, 'task:', task);
  console.log('📋 Condition check - !isOpen:', !isOpen, '!task:', !task, 'combined:', !isOpen || !task);
  
  if (!isOpen || !task) {
    console.log('❌ TaskEditDialog: NOT rendering - isOpen:', isOpen, 'task:', task);
    return null;
  }
  
  console.log('✅✅✅ TaskEditDialog: RENDERING with task:', task, 'isOpen:', isOpen);

  return (
    <div className="task-edit-dialog-overlay" onClick={handleCancel}>
      <div className="task-edit-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="task-edit-dialog-header">
          <h3>Edit Task</h3>
          <button 
            className="task-edit-dialog-close"
            onClick={handleCancel}
            type="button"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="task-edit-dialog-form">
          <div className="task-edit-dialog-field">
            <label htmlFor="task-name">Task Name:</label>
            <input
              id="task-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="task-edit-dialog-field">
            <label htmlFor="task-start-date">Start Date:</label>
            <input
              id="task-start-date"
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="task-edit-dialog-field">
            <label htmlFor="task-end-date">End Date:</label>
            <input
              id="task-end-date"
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="task-edit-dialog-field">
            <label htmlFor="task-progress">Progress (%):</label>
            <input
              id="task-progress"
              type="number"
              name="progress"
              value={formData.progress}
              onChange={handleChange}
              min="0"
              max="100"
            />
          </div>

          <div className="task-edit-dialog-field">
            <label htmlFor="task-type">Type:</label>
            <select
              id="task-type"
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="task">Task</option>
              <option value="project">Project</option>
              <option value="milestone">Milestone</option>
            </select>
          </div>

          <div className="task-edit-dialog-actions">
            <button type="button" onClick={handleCancel} className="task-edit-dialog-button cancel">
              Cancel
            </button>
            <button type="submit" className="task-edit-dialog-button save">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

TaskEditDialog.propTypes = {
  task: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

TaskEditDialog.defaultProps = {
  task: null,
};

export default TaskEditDialog;

