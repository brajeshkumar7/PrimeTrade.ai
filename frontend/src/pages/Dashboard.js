import React, { useState, useEffect, useContext } from 'react';
import { taskService } from '../services/taskService';
import { AuthContext } from '../contexts/AuthContext';

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '2rem auto',
    padding: '2rem',
  },
  section: {
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    marginBottom: '1rem',
    color: '#2c3e50',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '1.5rem',
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    fontFamily: 'inherit',
  },
  textarea: {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    fontFamily: 'inherit',
    minHeight: '100px',
    resize: 'vertical',
  },
  button: {
    padding: '0.75rem',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  taskList: {
    display: 'grid',
    gap: '1rem',
  },
  taskCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  taskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '0.5rem',
  },
  taskTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  taskStatus: {
    padding: '0.25rem 0.75rem',
    borderRadius: '4px',
    fontSize: '0.875rem',
    fontWeight: 'bold',
  },
  statusPending: {
    backgroundColor: '#f39c12',
    color: 'white',
  },
  statusCompleted: {
    backgroundColor: '#27ae60',
    color: 'white',
  },
  taskDescription: {
    color: '#555',
    marginBottom: '0.75rem',
  },
  taskMeta: {
    fontSize: '0.875rem',
    color: '#999',
    marginBottom: '1rem',
  },
  taskActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  smallButton: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  editButton: {
    backgroundColor: '#3498db',
    color: 'white',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    color: 'white',
  },
  completeButton: {
    backgroundColor: '#27ae60',
    color: 'white',
  },
  error: {
    color: '#e74c3c',
    padding: '0.75rem',
    backgroundColor: '#fadbd8',
    borderRadius: '4px',
    marginBottom: '1rem',
  },
  success: {
    color: '#27ae60',
    padding: '0.75rem',
    backgroundColor: '#d5f4e6',
    borderRadius: '4px',
    marginBottom: '1rem',
  },
  modal: {
    display: 'none',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
  },
  modalShow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    maxWidth: '500px',
    width: '90%',
  },
  modalButtons: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem',
    justifyContent: 'flex-end',
  },
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [editingTask, setEditingTask] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const result = user?.role === 'admin' 
        ? await taskService.getAllTasks() 
        : await taskService.getOwnTasks();
      setTasks(result.data.tasks || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      if (editingTask) {
        await taskService.updateTask(
          editingTask._id,
          formData.title,
          formData.description,
          editingTask.status
        );
        setSuccess('Task updated successfully');
      } else {
        await taskService.createTask(formData.title, formData.description);
        setSuccess('Task created successfully');
      }

      setFormData({ title: '', description: '' });
      setEditingTask(null);
      setShowModal(false);
      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({ title: task.title, description: task.description });
    setShowModal(true);
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        setError('');
        await taskService.deleteTask(taskId);
        setSuccess('Task deleted successfully');
        await loadTasks();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete task');
      }
    }
  };

  const handleToggleStatus = async (task) => {
    try {
      setError('');
      const newStatus = task.status === 'pending' ? 'completed' : 'pending';
      await taskService.updateTask(task._id, task.title, task.description, newStatus);
      setSuccess(`Task marked as ${newStatus}`);
      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task status');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setFormData({ title: '', description: '' });
  };

  return (
    <div style={styles.container}>
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          {user?.role === 'admin' ? 'All Tasks' : 'My Tasks'}
        </h2>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <button
          style={{
            ...styles.button,
            marginBottom: '1rem',
          }}
          onClick={() => setShowModal(true)}
        >
          Create New Task
        </button>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
            No tasks found. Create one to get started!
          </div>
        ) : (
          <div style={styles.taskList}>
            {tasks.map((task) => (
              <div key={task._id} style={styles.taskCard}>
                <div style={styles.taskHeader}>
                  <div style={styles.taskTitle}>{task.title}</div>
                  <div
                    style={{
                      ...styles.taskStatus,
                      ...(task.status === 'pending'
                        ? styles.statusPending
                        : styles.statusCompleted),
                    }}
                  >
                    {task.status}
                  </div>
                </div>
                {task.description && (
                  <div style={styles.taskDescription}>{task.description}</div>
                )}
                <div style={styles.taskMeta}>
                  {user?.role === 'admin' && task.owner && (
                    <div>Owner: {task.owner.name} ({task.owner.email})</div>
                  )}
                  <div>
                    Created: {new Date(task.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={styles.taskActions}>
                  <button
                    style={{
                      ...styles.smallButton,
                      ...styles.completeButton,
                    }}
                    onClick={() => handleToggleStatus(task)}
                  >
                    {task.status === 'pending' ? 'Mark Complete' : 'Mark Pending'}
                  </button>
                  <button
                    style={{
                      ...styles.smallButton,
                      ...styles.editButton,
                    }}
                    onClick={() => handleEdit(task)}
                  >
                    Edit
                  </button>
                  <button
                    style={{
                      ...styles.smallButton,
                      ...styles.deleteButton,
                    }}
                    onClick={() => handleDelete(task._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <div style={{
        ...styles.modal,
        ...(showModal && styles.modalShow),
      }}>
        <div style={styles.modalContent}>
          <h3>{editingTask ? 'Edit Task' : 'Create New Task'}</h3>
          <form style={styles.form} onSubmit={handleSubmit}>
            <input
              style={styles.input}
              type="text"
              name="title"
              placeholder="Task Title"
              value={formData.title}
              onChange={handleChange}
              autoFocus
            />
            <textarea
              style={styles.textarea}
              name="description"
              placeholder="Task Description (optional)"
              value={formData.description}
              onChange={handleChange}
            />
            <div style={styles.modalButtons}>
              <button
                type="button"
                style={{
                  ...styles.button,
                  backgroundColor: '#95a5a6',
                }}
                onClick={closeModal}
              >
                Cancel
              </button>
              <button style={styles.button} type="submit">
                {editingTask ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
