/**
 * API client wrapper for consistent API calls
 */

import axios from 'axios';

export const apiClient = {
  async get<T = any>(url: string): Promise<T> {
    try {
      const response = await axios.get<T>(url);
      return response.data;
    } catch (error) {
      console.error('API GET error:', error);
      throw error;
    }
  },

  async post<T = any>(url: string, data?: any): Promise<T> {
    try {
      const response = await axios.post<T>(url, data);
      return response.data;
    } catch (error) {
      console.error('API POST error:', error);
      throw error;
    }
  },

  async put<T = any>(url: string, data?: any): Promise<T> {
    try {
      const response = await axios.put<T>(url, data);
      return response.data;
    } catch (error) {
      console.error('API PUT error:', error);
      throw error;
    }
  },

  async delete<T = any>(url: string): Promise<T> {
    try {
      const response = await axios.delete<T>(url);
      return response.data;
    } catch (error) {
      console.error('API DELETE error:', error);
      throw error;
    }
  }
};

export { apiClient as default };