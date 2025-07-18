import React, { useState, useEffect } from 'react';
import api from '../api';
import io from 'socket.io-client';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const initialFormState = {
  title: '',
  description: '',
  deadline: '',
  priority: 1,
  status: 'todo',
  _id: null,
};

// A separate component for each sortable task item. This is a cleaner pattern.
function SortableTaskItem({ task, handleEditClick, handleDeleteClick }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging, // dnd-kit provides this boolean for visual cues
    } = useSortable({ id: task._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    // Apply a 'dragging' class for visual feedback
    return (
        <li ref={setNodeRef} style={style} className={isDragging ? "dragging" : ""} {...attributes} {...listeners}>
            <div style={{ flexGrow: 1, marginRight: '10px', display: 'flex', flexDirection: 'column' }}>
                <strong>{task.title}</strong>
                <small>Priority: {task.priority}</small>
                {task.description && <p style={{ margin: '5px 0', fontSize: '0.9em' }}>{task.description}</p>}
                {task.deadline && <p style={{ margin: '5px 0', fontSize: '0.9em' }}><small>Deadline: {new Date(task.deadline).toLocaleDateString()}</small></p>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flexShrink: 0 }}>
                <button onClick={() => handleEditClick(task)} style={{ backgroundColor: '#5bc0de', border: 'none' }}>Edit</button>
                <button onClick={() => handleDeleteClick(task._id)} style={{ backgroundColor: '#d9534f', border: 'none' }}>Delete</button>
            </div>
        </li>
    );
};

// The main TaskList Component
const TaskList = () => {
  const { token, logout, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState(initialFormState);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchTasks = async () => {
      if (!token) {
        logout();
        return;
      }
      try {
        setLoading(true);
        const response = await api.get('/tasks', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setTasks(response.data.data);
        } else {
          throw new Error(response.data.message || 'Failed to fetch tasks.');
        }
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Could not load your tasks.');
        if (err.response && err.response.status === 401) logout();
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [token, logout]);

  // --- REAL-TIME UPDATES with Socket.IO ---
  useEffect(() => {
    if (!user?._id) return;
    const socketURL = process.env.NODE_ENV === 'production'
      ? process.env.REACT_APP_SOCKET_URL
      : 'http://localhost:5000';
    const socket = io(socketURL, {
      query: { userId: user._id }
    });
    
    socket.on('taskCreated', (createdTask) => {
        setTasks(prev => [...prev, createdTask]);
    });

    socket.on('taskUpdated', (updatedTask) => {
      setTasks(prev => prev.map(t => (t._id === updatedTask._id ? updatedTask : t)));
    });

    socket.on('taskDeleted', (deletedTaskId) => {
      setTasks(prev => prev.filter(t => t._id !== deletedTaskId));
    });
    return () => socket.disconnect();
  }, [user]);

  // --- FORM AND CRUD HANDLERS ---
  const handleInputChange = (e) => {
    const {name, value} = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const taskData = { ...newTask, deadline: newTask.deadline || null };
    delete taskData._id; 
    
    const isUpdating = !!newTask._id;

    try {
        if (isUpdating) {
            await api.put(`/tasks/${newTask._id}`, taskData, { headers: { Authorization: `Bearer ${token}` } });
        } else {
            await api.post('/tasks', taskData, { headers: { Authorization: `Bearer ${token}` } });
        }
        setNewTask(initialFormState); // Reset form on success
    } catch (err) {
        const message = err.response?.data?.message || `Failed to ${isUpdating ? 'update' : 'add'} task.`;
        setError(message);
    }
  };

  const handleEditClick = (task) => {
    setError('');
    setNewTask({
      ...task,
      deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
    });
    const form = document.querySelector('.add-task-form');
    if (form) {
        form.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const handleDeleteClick = async (id) => {
    setError('');
    if (window.confirm('Are you sure you want to delete this task?')) {
        try {
            await api.delete(`/tasks/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete task.');
        }
    }
  };
  
  const handleLogout = () => {
      logout();
      navigate('/login');
  }
  
  const cancelEdit = () => {
    setNewTask(initialFormState);
    setError('');
  }

  const handleDragEnd = (event) => {
    const { active, over } = event;    if (over && active.id !== over.id) {
        setTasks(items => {
            const oldIndex = items.findIndex(item => item._id === active.id);
            const newIndex = items.findIndex(item => item._id === over.id);            
            const movedTask = items[oldIndex];
            const newStatus = items[newIndex].status;

            if (movedTask.status !== newStatus) {
                const updatedTask = { ...movedTask, status: newStatus };
                api.put(`/tasks/${movedTask._id}`, updatedTask, {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch(err => {
                    console.error("Failed to update task status:", err);
                    setError("Failed to update task status.");                    
                    return items;
                  });

                return items.map(item => item._id === movedTask._id ? updatedTask : item);
            } else {
                return arrayMove(items, oldIndex, newIndex);
            }
        });
    }
  };

  if (loading) {
    return <div className="task-list-page">Loading tasks...</div>;
  }
  
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'done').length;
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  
  const statusOrder = ['todo', 'in-progress', 'done'];
  const tasksByStatus = statusOrder.reduce((acc, status) => {
    acc[status] = tasks.filter(task => task.status === status);
    return acc;
  }, {});

  const statusDisplayName = {
      'todo': 'To Do',
      'in-progress': 'In Progress',
      'done': 'Done'
  }
  
  return (
    <div className="task-list-page">
      <button onClick={handleLogout} className="link-button" style={{float: 'right', color: '#d9534f'}}>Logout</button>
      <h1>Task Manager</h1>
      
      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${completionPercentage}%` }}>
            {completionPercentage > 10 && `${Math.round(completionPercentage)}%`}
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      
      <div className="task-lists-container">
        {statusOrder.map(status => (
          <div key={status} className={`task-list-column ${status}`}>
            <h2>{statusDisplayName[status]}</h2>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={tasksByStatus[status].map(task => task._id)} strategy={verticalListSortingStrategy}>
                <ul>
                  {tasksByStatus[status].length > 0 ? (
                    tasksByStatus[status].map(task => (
                      <SortableTaskItem 
                        key={task._id} 
                        task={task} 
                        handleEditClick={handleEditClick}
                        handleDeleteClick={handleDeleteClick}
                      />
                    ))
                  ) : (
                    <li className="no-tasks-message">No tasks in this column.</li>
                  )}
                </ul>
              </SortableContext>
            </DndContext>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="add-task-form">
        <h3>{newTask._id ? 'Edit Task' : 'Add New Task'}</h3>
        <input type="text" name="title" value={newTask.title} onChange={handleInputChange} placeholder="Title" required />
        <textarea name="description" value={newTask.description || ''} onChange={handleInputChange} placeholder="Description" rows="3" />
        <label htmlFor="deadline">Deadline:</label>
        <input id="deadline" type="date" name="deadline" value={newTask.deadline} onChange={handleInputChange} />
        <label htmlFor="priority">Priority:</label>
        <input id="priority" type="number" name="priority" min="1" max="5" value={newTask.priority} onChange={handleInputChange} />
        <label htmlFor="status">Status:</label>
        <select id="status" name="status" value={newTask.status} onChange={handleInputChange}>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <div style={{display: 'flex', gap: '10px'}}>
            <button type="submit">{newTask._id ? 'Update Task' : 'Add Task'}</button>
            {newTask._id && <button type="button" onClick={cancelEdit} style={{backgroundColor: '#777'}}>Cancel</button>}
        </div>
      </form>
    </div>
  );
};

export default TaskList;
