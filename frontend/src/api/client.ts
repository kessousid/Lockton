const BASE_URL = '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  upload: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: 'POST', body: formData }),
};

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ access_token: string; token_type: string }>('/auth/login', { email, password }),
  me: () => api.get<import('../types').User>('/auth/me'),
  users: () => api.get<import('../types').User[]>('/auth/users'),
  register: (data: { email: string; password: string; full_name: string; role: string }) =>
    api.post<import('../types').User>('/auth/register', data),
  updateUser: (id: number, data: Record<string, unknown>) =>
    api.put<import('../types').User>(`/auth/users/${id}`, data),
  deleteUser: (id: number) => api.del(`/auth/users/${id}`),
};

// Clients
export const clientsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<import('../types').Client[]>(`/clients${qs}`);
  },
  get: (id: number) => api.get<import('../types').Client>(`/clients/${id}`),
  summary: (id: number) => api.get<any>(`/clients/${id}/summary`),
  create: (data: Record<string, unknown>) => api.post<import('../types').Client>('/clients', data),
  update: (id: number, data: Record<string, unknown>) =>
    api.put<import('../types').Client>(`/clients/${id}`, data),
  delete: (id: number) => api.del(`/clients/${id}`),
};

// Policies
export const policiesApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<import('../types').Policy[]>(`/policies${qs}`);
  },
  get: (id: number) => api.get<import('../types').Policy>(`/policies/${id}`),
  create: (data: Record<string, unknown>) => api.post<import('../types').Policy>('/policies', data),
  update: (id: number, data: Record<string, unknown>) =>
    api.put<import('../types').Policy>(`/policies/${id}`, data),
  delete: (id: number) => api.del(`/policies/${id}`),
  compare: (id1: number, id2: number) => api.get<any>(`/policies/compare/${id1}/${id2}`),
};

// Claims
export const claimsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<import('../types').Claim[]>(`/claims${qs}`);
  },
  get: (id: number) => api.get<import('../types').Claim>(`/claims/${id}`),
  analytics: () => api.get<any>('/claims/analytics'),
  create: (data: Record<string, unknown>) => api.post<import('../types').Claim>('/claims', data),
  update: (id: number, data: Record<string, unknown>) =>
    api.put<import('../types').Claim>(`/claims/${id}`, data),
};

// Carriers
export const carriersApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<import('../types').Carrier[]>(`/carriers${qs}`);
  },
  get: (id: number) => api.get<import('../types').Carrier>(`/carriers/${id}`),
  metrics: (id: number) => api.get<any>(`/carriers/${id}/metrics`),
  create: (data: Record<string, unknown>) => api.post<import('../types').Carrier>('/carriers', data),
  update: (id: number, data: Record<string, unknown>) =>
    api.put<import('../types').Carrier>(`/carriers/${id}`, data),
};

// Renewals
export const renewalsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<import('../types').Renewal[]>(`/renewals${qs}`);
  },
  get: (id: number) => api.get<import('../types').Renewal>(`/renewals/${id}`),
  create: (data: Record<string, unknown>) => api.post<import('../types').Renewal>('/renewals', data),
  update: (id: number, data: Record<string, unknown>) =>
    api.put<import('../types').Renewal>(`/renewals/${id}`, data),
};

// Certificates
export const certificatesApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<import('../types').Certificate[]>(`/certificates${qs}`);
  },
  get: (id: number) => api.get<import('../types').Certificate>(`/certificates/${id}`),
  create: (data: Record<string, unknown>) =>
    api.post<import('../types').Certificate>('/certificates', data),
  pdf: (id: number) => api.get<any>(`/certificates/${id}/pdf`),
  bulk: (items: Record<string, unknown>[]) =>
    api.post<import('../types').Certificate[]>('/certificates/bulk', items),
};

// Analytics
export const analyticsApi = {
  dashboard: () => api.get<any>('/analytics/dashboard'),
  lossRatio: () => api.get<any[]>('/analytics/loss-ratio'),
  brokerProductivity: () => api.get<any[]>('/analytics/broker-productivity'),
  revenueForecast: () => api.get<any[]>('/analytics/revenue-forecast'),
};

// Documents
export const documentsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<import('../types').Document[]>(`/documents${qs}`);
  },
  upload: (formData: FormData) => api.upload<import('../types').Document>('/documents', formData),
  delete: (id: number) => api.del(`/documents/${id}`),
};

// Workflows
export const workflowsApi = {
  list: () => api.get<import('../types').Workflow[]>('/workflows'),
  get: (id: number) => api.get<import('../types').Workflow>(`/workflows/${id}`),
  create: (data: Record<string, unknown>) =>
    api.post<import('../types').Workflow>('/workflows', data),
  update: (id: number, data: Record<string, unknown>) =>
    api.put<import('../types').Workflow>(`/workflows/${id}`, data),
  tasks: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<import('../types').WorkflowTask[]>(`/workflows/tasks/all${qs}`);
  },
  createTask: (data: Record<string, unknown>) =>
    api.post<import('../types').WorkflowTask>('/workflows/tasks', data),
  updateTask: (id: number, data: Record<string, unknown>) =>
    api.put<import('../types').WorkflowTask>(`/workflows/tasks/${id}`, data),
  completeTask: (id: number) =>
    api.post<import('../types').WorkflowTask>(`/workflows/tasks/${id}/complete`),
};

// AI
export const aiApi = {
  chat: (message: string, client_id?: number) =>
    api.post<{ response: string }>('/ai/chat', { message, client_id }),
  analyzeDocument: (text: string) => api.post<any>('/ai/analyze-document', { text }),
  predictRisk: (client_id: number) => api.post<any>('/ai/predict-risk', { client_id }),
};

// Notifications
export const notificationsApi = {
  list: () => api.get<import('../types').Notification[]>('/notifications'),
};
