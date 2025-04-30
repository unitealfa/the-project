// front/src/utils/api.ts
export async function apiFetch(
    endpoint: string,
    options: RequestInit = {}
  ) {
    const token   = localStorage.getItem('token') || ''
    const baseUrl = import.meta.env.VITE_API_URL
  
    /* merge headers --------------------------------------------------- */
    const headers = {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    }
  
    /* call ------------------------------------------------------------ */
    const res = await fetch(`${baseUrl}${endpoint}`, { ...options, headers })
  
    /* gestion 401 globale -------------------------------------------- */
    if (res.status === 401) {
      localStorage.clear()
      window.location.href = '/'       // on renvoie au login
      throw new Error('Session expirée')
    }
  
    return res
  }
  