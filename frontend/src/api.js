import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const API = axios.create({
    baseURL: API_BASE_URL,
});

let isRefreshing = false;
let requestQueue = [];

const processQueue = (error, token = null) => {
  requestQueue.forEach((promise) => {
    if (token) {
      promise.resolve(token);
    } else {
      promise.reject(error);
    }
  });
  requestQueue = [];
};

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

API.interceptors.response.use(
  (response) => response, 
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {

        return new Promise((resolve, reject) => {
          requestQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return API(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('Kein Refresh-Token verfügbar.');
        }

        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/refresh-token`,
          { token: refreshToken }
        );

        const newAccessToken = refreshResponse.data.accessToken;

        localStorage.setItem('accessToken', newAccessToken);

        processQueue(null, newAccessToken);

        isRefreshing = false;

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return API(originalRequest);
      } catch (refreshError) {
        console.error('Fehler beim Erneuern des Tokens:', refreshError);

        processQueue(refreshError, null);

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login'; 
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const validateAccessToken = async () => {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    throw new Error('Kein Refresh-Token verfügbar. Benutzer muss sich erneut anmelden.');
  }

  try {
    if (!accessToken) {
      console.warn('Kein Access-Token vorhanden. Versuche, ein neues zu erhalten...');
      const refreshResponse = await API.post('/refresh-token', { token: refreshToken });
      const { accessToken: newAccessToken, userId } = refreshResponse.data;
      localStorage.setItem('accessToken', newAccessToken);
      return { userId, token: newAccessToken };
    }
    const response = await API.get('/validate-token', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return { userId: response.data.user_id, token: accessToken };
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.warn('Access-Token abgelaufen. Versuche, ein neues zu erhalten...');
      const refreshResponse = await API.post('/refresh-token', { token: refreshToken });
      const { accessToken: newAccessToken, userId } = refreshResponse.data;
      localStorage.setItem('accessToken', newAccessToken);
      return { userId, token: newAccessToken };
    }
    console.error('Fehler bei der Token-Validierung:', error);
    throw new Error('Authentifizierungsfehler.');
  }
};

API.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (
        error.response && 
        error.response.status === 403 &&
        error.response.data?.error === 'not-verified'
      ) {
        window.location.href = '/notVerified';
      }
      return Promise.reject(error);
    }
  );

export default API;

export const loginUser = async (credentials) => {
    try {
        const response = await API.post('/login', credentials);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { error: 'Netzwerkfehler' };
    }
};

export const registerUser = async (userData) => {
    try {
        const response = await API.post('/register', userData);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { error: 'Netzwerkfehler' };
    }
};

export const saveSession = async (sessionData) => {
    try {
        const response = await API.post('/sessions', sessionData);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { error: 'Netzwerkfehler' };
    }
};

export const resendVerification = async (email) => {
    try {
      const resp = await API.post('/resendVerification', { email });
      return resp.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'Netzwerkfehler' };
    }
  };
  