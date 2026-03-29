import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const uploadDataset = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(`${API_BASE_URL}/upload-dataset`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const trainQuantum = async (datasetId, features, target) => {
  const response = await axios.post(`${API_BASE_URL}/train-quantum`, {
    dataset_id: datasetId,
    features,
    target,
  });
  return response.data;
};

export const trainClassical = async (datasetId, features, target) => {
  const response = await axios.post(`${API_BASE_URL}/train-classical`, {
    dataset_id: datasetId,
    features,
    target,
  });
  return response.data;
};
