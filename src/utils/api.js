// API utilities for SessionBase
import { authenticatedFetch } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_ENDPOINT_URL || 'https://api.sessionbase.ai';

/**
 * Submit email for teams feature updates
 * This endpoint doesn't require authentication
 */
export async function submitTeamsEmail(email) {
  const response = await fetch(`${API_BASE_URL}/teams/email-signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to submit email');
  }

  return response.json();
}

/**
 * Discover sessions - works for both authenticated and unauthenticated users
 * Maps to GET /discover endpoint
 */
export async function discoverSessions(params = {}) {
  const { 
    sortBy = 'popular',
    search = '',
    nextToken = null,
    limit = 20
  } = params;
  
  const queryParams = new URLSearchParams({
    sortBy,
    limit: limit.toString()
  });
  
  if (search) {
    queryParams.append('search', search);
  }
  
  if (nextToken) {
    queryParams.append('lastEvaluatedKey', nextToken);
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
    nextToken = null,
    limit = 20
  } = params;
  
  const queryParams = new URLSearchParams({
    limit: limit.toString()
  });
  
  if (nextToken) {
    queryParams.append('lastEvaluatedKey', nextToken);
  }
  
  const url = `${API_BASE_URL}/sessions?${queryParams}`;
  
  const response = await authenticatedFetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to get user sessions: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Get public user profile data - maps to GET /users/{id}
 * No authentication required
 */
export async function getUserProfile(userId) {
  const url = `${API_BASE_URL}/users/${userId}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get user profile: ${response.status}`);
  }
  
  return response.json();
}