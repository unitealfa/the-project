// Base URL for the backend API.
//
// Prefer the value from Vite environment variables when available.
// Fallback to the hostname of the current page to better support LAN access.
export const API_URL =
  import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;