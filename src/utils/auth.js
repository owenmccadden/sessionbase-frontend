// Authentication utilities for GitHub OAuth integration

const API_BASE_URL = process.env.NEXT_PUBLIC_ENDPOINT_URL || 'https://api.sessionbase.ai';

/**
 * Check if user is authenticated by verifying JWT token
 */
export function isAuthenticated() {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('auth_token');
  if (!token) return false;
  
  try {
    // Basic JWT validation - check if token is expired
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    return payload.exp > currentTime;
  } catch (error) {
    console.error('Invalid token format:', error);
    return false;
  }
}

/**
 * Get the current auth token
 */
export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

/**
 * Get user info from JWT token
 */
export function getUserInfo() {
  if (typeof window === 'undefined') return null;
  
  const token = getAuthToken();
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.sub,
      username: payload.username,
      avatarUrl: payload.avatar_url,
      exp: payload.exp
    };
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
}

/**
 * Store auth token
 */
export function setAuthToken(token) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
}

/**
 * Remove auth token (logout)
 */
export function removeAuthToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
}

/**
 * Initiate GitHub OAuth flow
 */
export function loginWithGitHub() {
  window.location.href = `${API_BASE_URL}/auth/github`;
}

/**
 * Initiate Google OAuth flow
 */
export function loginWithGoogle() {
  window.location.href = `${API_BASE_URL}/auth/google`;
}

/**
 * Logout user
 */
export function logout() {
  removeAuthToken();
  // Optionally redirect to home page
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
}

/**
 * Make authenticated API request
 */
export async function authenticatedFetch(url, options = {}) {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Create a new session
 */
export async function createSession(data, isPrivate = false) {
  const url = `${API_BASE_URL}/sessions`;
  
  const response = await authenticatedFetch(url, {
    method: 'POST',
    body: JSON.stringify({
      data,
      isPrivate
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }
  
  return response.json();
}

/**
 * Get a session by ID
 */
export async function getSession(sessionId) {
  const url = `${API_BASE_URL}/sessions/${sessionId}`;
  
  const response = await authenticatedFetch(url);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }
  
  return response.json();
}

/**
 * Create a share link for a private session
 */
export async function createShareLink(sessionId, expires = '30d') {
  const url = `${API_BASE_URL}/sessions/${sessionId}/share?expires=${expires}`;
  
  const response = await authenticatedFetch(url, {
    method: 'POST'
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }
  
  return response.json();
}

/**
 * Get a shared session by token
 */
export async function getSharedSession(shareToken) {
  const url = `${API_BASE_URL}/shared/${shareToken}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }
  
  return response.json();
}
