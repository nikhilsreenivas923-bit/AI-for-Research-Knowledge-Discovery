const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') + '/api';

class ApiClient {
  constructor() {
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...(options.headers || {})
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(data.message || data.error || `HTTP error ${response.status}`);
        error.status = response.status;
        error.details = data.details || null;
        throw error;
      }

      return data;
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Could not connect to Research Mind AI backend server. Please verify the backend is running on port 5000.');
      }
      throw err;
    }
  }

  // Auth sync
  async syncAuth() {
    return this.request('/auth/sync', { method: 'POST' });
  }

  // Workspaces
  async listWorkspaces() {
    return this.request('/workspaces', { method: 'GET' });
  }

  async getWorkspace(id) {
    return this.request(`/workspaces/${id}`, { method: 'GET' });
  }

  async createWorkspace(payload) {
    return this.request('/workspaces', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async deleteWorkspace(id) {
    return this.request(`/workspaces/${id}`, { method: 'DELETE' });
  }

  // Documents
  async listDocuments(workspaceId) {
    return this.request(`/documents/${workspaceId}`, { method: 'GET' });
  }

  async getDocument(docId) {
    return this.request(`/documents/single/${docId}`, { method: 'GET' });
  }

  async ingestDocument(payload) {
    return this.request('/documents', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async deleteDocument(docId) {
    return this.request(`/documents/${docId}`, { method: 'DELETE' });
  }

  // Queries
  async submitQuery(payload) {
    return this.request('/query', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async listQueries(workspaceId) {
    return this.request(`/query/${workspaceId}`, { method: 'GET' });
  }
}

export const api = new ApiClient();

