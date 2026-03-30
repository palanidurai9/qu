import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://qml.onrender.com/api';

// Axios instance with longer timeout for quantum computations and cold starts
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes — accounts for Render cold starts + quantum sim time
});

// Wake up the backend (Render free tier cold start helper)
export const pingBackend = async () => {
  try {
    const response = await axios.get(API_BASE_URL.replace('/api', '/'), { timeout: 60000 });
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
