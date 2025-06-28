// Base URL for the backend API.
//
// Prefer the value from Vite environment variables when available.
// Fallback to the hostname of the current page to better support LAN access.
export const API_BASE_URL =
  import.meta.env.MODE === 'testpresentation'
    ? `http://${window.location.hostname}:5000`
    : import.meta.env.VITE_API_URL;

// Backwards compatibility: some modules still import API_URL
// Use API_BASE_URL until they are updated
export const API_URL = API_BASE_URL;