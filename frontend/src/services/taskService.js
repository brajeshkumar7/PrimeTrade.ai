import api from './api';

export const taskService = {
  createTask: async (title, description) => {
    const response = await api.post('/tasks', { title, description });
    return response.data;
  },

  getOwnTasks: async () => {
    const response = await api.get('/tasks');
    return response.data;
  },

  getAllTasks: async () => {
    const response = await api.get('/tasks/all');
    return response.data;
  },

  getTaskById: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  },

  updateTask: async (taskId, title, description, status) => {
    const response = await api.patch(`/tasks/${taskId}`, {
      title,
      description,
      status,
    });
    return response.data;
  },

  deleteTask: async (taskId) => {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  },
};
