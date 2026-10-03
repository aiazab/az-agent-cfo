import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'system';
}

export interface Expense {
  id: number;
  userId: string;
  amount: number;
  category: string;
  description: string;
  expenseDate: string;
  paymentMethod: string;
  status: string;
}

export interface AgentResponse {
  response: string;
  success: boolean;
}

// Chat API
export const chatAPI = {
  sendMessage: async (userId: string, message: string): Promise<AgentResponse> => {
    const response = await apiClient.post('/api/agent/ask', {
      userId,
      message,
    });
    return response.data;
  },
};

// Expenses API
export const expensesAPI = {
  create: async (expense: Partial<Expense>): Promise<Expense> => {
    const response = await apiClient.post('/api/expenses', expense);
    return response.data;
  },

  getByUserId: async (userId: string): Promise<Expense[]> => {
    const response = await apiClient.get(`/api/expenses/user/${userId}`);
    return response.data;
  },

  getByCategory: async (userId: string, category: string): Promise<Expense[]> => {
    const response = await apiClient.get(
      `/api/expenses/user/${userId}/category/${category}`
    );
    return response.data;
  },

  getMonthlyTotal: async (
    userId: string,
    yearMonth: string
  ): Promise<{ totalExpenses: number }> => {
    const response = await apiClient.get(
      `/api/expenses/user/${userId}/month/${yearMonth}/total`
    );
    return response.data;
  },

  getCategoryTotal: async (
    userId: string,
    category: string,
    yearMonth: string
  ): Promise<{ total: number }> => {
    const response = await apiClient.get(
      `/api/expenses/user/${userId}/category/${category}/month/${yearMonth}/total`
    );
    return response.data;
  },

  update: async (id: number, expense: Partial<Expense>): Promise<Expense> => {
    const response = await apiClient.put(`/api/expenses/${id}`, expense);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/expenses/${id}`);
  },
};

export default apiClient;
