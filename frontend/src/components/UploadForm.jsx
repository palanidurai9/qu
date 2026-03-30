import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, CheckCircle, Zap, AlertCircle, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { uploadDataset, pingBackend } from '../services/api';

// Backend health states
const HEALTH = {
  UNKNOWN: 'unknown',
  WAKING: 'waking',
  ONLINE: 'online',
  OFFLINE: 'offline',
};

const UploadForm = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [health, setHealth] = useState(HEALTH.UNKNOWN);
  const [wakeSeconds, setWakeSeconds] = useState(0);
  const timerRef = useRef(null);
  const isMounted = useRef(true);

  // Auto-ping the backend on mount to pre-warm it
  useEffect(() => {
    isMounted.current = true;
    wakeUpBackend();
    return () => {
      isMounted.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const wakeUpBackend = async () => {
    if (!isMounted.current) return;
    setHealth(HEALTH.WAKING);
    setWakeSeconds(0);

    // Count up while waiting
    timerRef.current = setInterval(() => {
      if (isMounted.current) setWakeSeconds((s) => s + 1);
    }, 1000);

    try {
      const alive = await pingBackend();
      if (timerRef.current) clearInterval(timerRef.current);
      if (isMounted.current) {
        setHealth(alive ? HEALTH.ONLINE : HEALTH.OFFLINE);
      }
    } catch {
      if (timerRef.current) clearInterval(timerRef.current);
      if (isMounted.current) setHealth(HEALTH.OFFLINE);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.name.endsWith('.csv')) {
      setFile(dropped);
      setError(null);
    } else {
      setError('Please drop a valid .csv file.');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) { setError('Please select a file first.'); return; }

    setLoading(true);
    setError(null);

    // If backend is still waking, wait for ping to complete first
    if (health === HEALTH.WAKING) {
      setError('Backend is still starting up — please wait a moment and try again.');
      setLoading(false);
      return;
    }

    try {
      const data = await uploadDataset(file);
      onUploadSuccess(data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED') {
        setError('Connection timed out. The backend may have restarted — please try again in a few seconds.');
        setHealth(HEALTH.OFFLINE);
      } else {
        setError(detail || err.message || 'Unexpected error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Status pill UI
  const StatusBadge = () => {
    const configs = {
      [HEALTH.UNKNOWN]:  { icon: <Wifi className="w-3 h-3" />, text: 'Checking backend…',    color: 'text-gray-400 border-gray-600 bg-gray-800/40' },
      [HEALTH.WAKING]:   { icon: <RefreshCw className="w-3 h-3 animate-spin" />, text: `Waking backend… ${wakeSeconds}s`, color: 'text-yellow-400 border-yellow-600/50 bg-yellow-900/20' },
      [HEALTH.ONLINE]:   { icon: <Wifi className="w-3 h-3" />, text: 'Backend online ✓',     color: 'text-[#66fcf1] border-[#45a29e]/50 bg-[#66fcf1]/10' },
      [HEALTH.OFFLINE]:  { icon: <WifiOff className="w-3 h-3" />, text: 'Backend offline',   color: 'text-red-400 border-red-600/50 bg-red-900/20' },
    };
    const { icon, text, color } = configs[health];
    return (
      <div className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${color} mb-4`}>
        {icon}
        <span>{text}</span>
      </div>
    );
  };

  return (
    <div className="glass-card p-8 w-full max-w-lg mx-auto text-center transform transition-all duration-300">
      <div className="flex justify-center mb-6">
        <div className="p-4 bg-[#66fcf1]/10 rounded-full border border-[#66fcf1]/30">
          <UploadCloud className="w-12 h-12 text-[#66fcf1]" />
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-2">Upload Dataset</h2>
      <p className="text-sm text-gray-400 mb-4">Max 1000 rows, preferably 2-8 features for QML.</p>

      <StatusBadge />

      {health === HEALTH.WAKING && (
        <p className="text-xs text-yellow-300/70 mb-4 -mt-2">
          Free tier server is waking up — this takes ~30–60s on first visit. You can upload while it warms up.
        </p>
      )}

      {health === HEALTH.OFFLINE && (
        <button
          onClick={wakeUpBackend}
          className="mb-4 text-xs text-[#66fcf1] underline flex items-center gap-1 mx-auto hover:text-white transition-colors"
          id="retry-wake-btn"
        >
          <RefreshCw className="w-3 h-3" /> Retry connection
        </button>
      )}

      <form onSubmit={handleUpload} className="space-y-4">
        <div
          className="relative border-2 border-dashed border-[#45a29e] rounded-lg p-6 hover:bg-[#66fcf1]/5 transition-colors cursor-pointer"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            id="csv-file-input"
          />
          <div className="text-[#c5c6c7]">
            {file ? (
              <div className="flex items-center justify-center space-x-2 text-[#66fcf1]">
                <CheckCircle className="w-5 h-5" />
                <span>{file.name}</span>
              </div>
            ) : (
              <span>Drag & drop or click to select CSV</span>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 text-red-400 text-sm text-left bg-red-400/10 border border-red-400/30 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!file || loading || health === HEALTH.WAKING}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          id="upload-btn"
        >
          {loading ? (
            <>
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0b0c10]"></span>
              <span>Uploading…</span>
            </>
          ) : health === HEALTH.WAKING ? (
            <>
              <RefreshCw className="w-5 h-5 text-[#0b0c10] animate-spin" />
              Backend Waking Up…
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 text-[#0b0c10]" />
              Initialize Quantum State
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default UploadForm;
