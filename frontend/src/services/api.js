import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://qml.onrender.com/api';
const BACKEND_ROOT = API_BASE_URL.replace(/\/api$/, '');

// Standard client – 3-minute timeout for quantum training runs
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 180000,
});

/**
 * Ping the backend root to pre-warm it from Render's cold-sleep.
 * Render free tier can take up to 60 seconds to boot.
 * Returns true if the backend is alive.
 */
export const pingBackend = async () => {
  try {
    const response = await axios.get(BACKEND_ROOT + '/', { timeout: 70000 });
    return response.status === 200;
  } catch {
    return false;
  }
};

export const uploadDataset = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post('/upload-dataset', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const trainQuantum = async (datasetId, features, target) => {
  const response = await apiClient.post('/train-quantum', {
    dataset_id: datasetId,
    features,
    target,
  });
  return response.data;
};

export const trainClassical = async (datasetId, features, target) => {
  const response = await apiClient.post('/train-classical', {
    dataset_id: datasetId,
    features,
    target,
  });
  return response.data;
};
