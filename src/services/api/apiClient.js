import { API_CONFIG } from './config';

/**
 * Core API Client
 * Handles standard fetch logic, headers, error handling, and JSON parsing.
 */
class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async fetch(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      // Check if response is empty
      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error(`[ApiClient] Failed to fetch ${endpoint}:`, error);
      throw error;
    }
  }

  get(endpoint, params = {}) {
    const urlParams = new URLSearchParams(params).toString();
    const query = urlParams ? `?${urlParams}` : '';
    return this.fetch(`${endpoint}${query}`, { method: 'GET' });
  }

  post(endpoint, data) {
    return this.fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  patch(endpoint, data) {
    return this.fetch(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint) {
    return this.fetch(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_CONFIG.BASE_URL);
