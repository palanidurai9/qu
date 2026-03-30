import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://qml.onrender.com/api';
const BACKEND_ROOT = API_BASE_URL.replace(/\/api$/, '');

// Set VITE_MOCK_MODE=true in .env.local to use dummy results without a backend
const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true';

// Standard client – 3-minute timeout for quantum training runs
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 180000,
});

// ─── Mock helpers ────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const mockUpload = async (file) => {
  await sleep(600);
  // Parse column names from the first line of the CSV
  const text = await file.text();
  const firstLine = text.split('\n')[0];
  const columns = firstLine.split(',').map((c) => c.trim().replace(/"/g, ''));
  const totalRows = text.split('\n').filter((l) => l.trim()).length - 1;
  const datasetId = `mock_ds_${Date.now()}`;
  return { dataset_id: datasetId, columns, total_rows: Math.min(totalRows, 1000) };
};

const mockTrainQuantum = async () => {
  await sleep(2200); // simulate quantum computation delay
  const loss = [];
  let v = 0.72;
  for (let i = 0; i < 30; i++) {
    v = v - Math.random() * 0.015 + Math.random() * 0.005;
    loss.push(parseFloat(v.toFixed(4)));
  }
  return {
    model: 'Quantum VQC (Aer Simulator)',
    accuracy: parseFloat((0.78 + Math.random() * 0.12).toFixed(4)),
    training_time_seconds: parseFloat((8 + Math.random() * 6).toFixed(2)),
    loss_history: loss,
    confusion_matrix: [[38, 6], [5, 51]],
    message: 'Quantum training completed via Simulator. [DEMO MODE]',
  };
};

const mockTrainClassical = async () => {
  await sleep(400);
  return {
    model: 'Classical Logistic Regression',
    accuracy: parseFloat((0.74 + Math.random() * 0.10).toFixed(4)),
    training_time_seconds: parseFloat((0.03 + Math.random() * 0.07).toFixed(4)),
    loss_history: [parseFloat((0.38 + Math.random() * 0.12).toFixed(4))],
    confusion_matrix: [[36, 8], [7, 49]],
    message: 'Classical training completed. [DEMO MODE]',
  };
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Ping the backend root to pre-warm Render's cold-sleep.
 * Returns true if alive. In mock mode always returns true immediately.
 */
export const pingBackend = async () => {
  if (MOCK_MODE) return true;
  try {
    const response = await axios.get(BACKEND_ROOT + '/', { timeout: 70000 });
    return response.status === 200;
  } catch {
    return false;
  }
};

export const uploadDataset = async (file) => {
  if (MOCK_MODE) return mockUpload(file);
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post('/upload-dataset', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const trainQuantum = async (datasetId, features, target) => {
  if (MOCK_MODE) return mockTrainQuantum();
  const response = await apiClient.post('/train-quantum', {
    dataset_id: datasetId,
    features,
    target,
  });
  return response.data;
};

export const trainClassical = async (datasetId, features, target) => {
  if (MOCK_MODE) return mockTrainClassical();
  const response = await apiClient.post('/train-classical', {
    dataset_id: datasetId,
    features,
    target,
  });
  return response.data;
};
