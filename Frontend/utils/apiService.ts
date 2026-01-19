import { Participant, Winner, DrawConfig } from '../types';

// Auto-detect API URL based on current location
const getApiBaseUrl = () => {
  // Determine version suffix
  const version = (import.meta as any).env?.VITE_API_VERSION === '2' ? '/v2' : '';

  // If VITE_API_URL is set in .env, use it
  const envApiUrl = (import.meta as any).env?.VITE_API_URL;
  if (envApiUrl) {
    return envApiUrl.replace(/\/api\/?$/, '') + '/api' + version;
  }

  // Otherwise, use same origin
  return '/api' + version;
};

const API_BASE_URL = getApiBaseUrl();
console.log("Current API Base URL:", API_BASE_URL, "Version Env:", (import.meta as any).env?.VITE_API_VERSION);

// Helper to get token
const getAuthToken = () => localStorage.getItem('vishipel_token');

class ApiService {
  get baseUrl(): string {
    return API_BASE_URL;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(getAuthToken() ? { 'Authorization': `Bearer ${getAuthToken()}` } : {}),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP error! status: ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Generic methods
  public async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  public async post<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public async put<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  public async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // Participants
  async getParticipants(): Promise<Participant[]> {
    const data = await this.request<Participant[]>('/participants');
    return data;
  }

  async createParticipant(name: string, department: string): Promise<Participant> {
    return this.request<Participant>('/participants', {
      method: 'POST',
      body: JSON.stringify({ name, department }),
    });
  }

  async updateParticipant(id: string, name: string, department: string): Promise<void> {
    await this.request(`/participants/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, department }),
    });
  }

  async deleteParticipant(id: string): Promise<void> {
    await this.request(`/participants/${id}`, {
      method: 'DELETE',
    });
  }

  async deleteAllParticipants(): Promise<void> {
    await this.request('/participants', {
      method: 'DELETE',
    });
  }

  // Winners
  async getWinners(): Promise<Winner[]> {
    const data = await this.request<Winner[]>('/winners');
    return data;
  }

  async createWinners(participantIds: string[], drawConfigId: number): Promise<void> {
    await this.request('/winners', {
      method: 'POST',
      body: JSON.stringify({
        participantIds: participantIds.map(id => parseInt(id)),
        drawConfigId: drawConfigId
      }),
    });
  }

  async deleteAllWinners(): Promise<void> {
    await this.request('/winners', {
      method: 'DELETE',
    });
  }

  // DrawConfigs
  async getDrawConfigs(): Promise<DrawConfig[]> {
    const data = await this.request<DrawConfig[]>('/drawconfigs');
    return data;
  }

  async createDrawConfig(label: string, count: number): Promise<DrawConfig> {
    return this.request<DrawConfig>('/drawconfigs', {
      method: 'POST',
      body: JSON.stringify({ label, count, prizeName: '' }),
    });
  }

  async updateDrawConfig(id: string, label: string, count: number, prizeName?: string): Promise<void> {
    await this.request(`/drawconfigs/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ label, count, prizeName }),
    });
  }


  async deleteDrawConfig(id: string): Promise<void> {
    await this.request(`/drawconfigs/${id}`, {
      method: 'DELETE',
    });
  }

  // Auth
  async login(username: string, password: string): Promise<{ token: string }> {
    return this.request<{ token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }
}

export const apiService = new ApiService();

