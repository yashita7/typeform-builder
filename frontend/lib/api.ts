/**
 * API utility for making requests to the backend.
 * Centralizes the API URL and common fetch logic.
 */

// Backend API base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Add /api prefix since all backend routes are under /api
const API_PREFIX = '/api';

/**
 * Generic fetch wrapper with error handling.
 * Throws an error if the response is not ok.
 */
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  // Construct full URL with /api prefix
  const url = `${API_BASE_URL}${API_PREFIX}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} ${errorText}`);
  }

  return response.json();
}

export const api = {
  /**
   * GET request
   */
  get: <T>(endpoint: string) => apiFetch<T>(endpoint, { method: 'GET' }),

  /**
   * POST request
   */
  post: <T>(endpoint: string, data: unknown) =>
    apiFetch<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * PATCH request
   */
  patch: <T>(endpoint: string, data: unknown) =>
    apiFetch<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  /**
   * DELETE request
   */
  delete: <T>(endpoint: string) =>
    apiFetch<T>(endpoint, { method: 'DELETE' }),
};
