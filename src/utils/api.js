// API utilities for SessionBase
import { authenticatedFetch } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_ENDPOINT_URL || 'https://api.sessionbase.ai';

/**
 * Discover sessions - works for both authenticated and unauthenticated users
 * Maps to GET /discover endpoint
 */
export async function discoverSessions(params = {}) {
  const { 
    sortBy = 'popular',
    search = '',
    page = 1,
    limit = 20
  } = params;
  
  const queryParams = new URLSearchParams({
    sortBy,
    page: page.toString(),
    limit: limit.toString()
  });
  
  if (search) {
    queryParams.append('search', search);
  }
  
  const url = `${API_BASE_URL}/discover?${queryParams}`;
  
  // Use authenticated fetch to get user-specific data if logged in
  // But endpoint should work for unauthenticated users too
  const response = await authenticatedFetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to discover sessions: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Get user's own sessions - maps to GET /sessions
 * Requires authentication
 */
export async function getUserSessions(params = {}) {
  const { 
    page = 1,
    limit = 20
  } = params;
  
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  });
  
  const url = `${API_BASE_URL}/sessions?${queryParams}`;
  
  const response = await authenticatedFetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to get user sessions: ${response.status}`);
  }
  
  return response.json();
}