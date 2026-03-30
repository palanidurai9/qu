import React, { useState } from 'react';
import { UploadCloud, CheckCircle, Zap, AlertCircle, Wifi } from 'lucide-react';
import { uploadDataset } from '../services/api';

const UploadForm = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
    setStatusMsg(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.name.endsWith('.csv')) {
      setFile(dropped);
      setError(null);
      setStatusMsg(null);
    } else {
      setError('Please drop a valid .csv file.');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file first.');
      return;
    }
    setLoading(true);
    setError(null);
    setStatusMsg('Connecting to backend… (may take up to 60s on first load)');

    try {
      const data = await uploadDataset(file);
      setStatusMsg(null);
      onUploadSuccess(data);
    } catch (err) {
      setStatusMsg(null);
      const detail = err.response?.data?.detail;
      if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED') {
        setError(
          'Network Error: The backend service is waking up or unreachable. ' +
          'If this is the first request in a while, please wait 30–60 seconds and try again.'
        );
      } else {
        setError(detail || err.message || 'Unexpected error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-8 w-full max-w-lg mx-auto text-center transform transition-all duration-300">
      <div className="flex justify-center mb-6">
        <div className="p-4 bg-[#66fcf1]/10 rounded-full border border-[#66fcf1]/30">
          <UploadCloud className="w-12 h-12 text-[#66fcf1]" />
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-2">Upload Dataset</h2>
      <p className="text-sm text-gray-400 mb-6">Max 1000 rows, preferably 2-8 features for QML.</p>

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

        {/* Status message (loading hint) */}
        {statusMsg && (
          <div className="flex items-start gap-2 text-[#45a29e] text-sm text-left bg-[#45a29e]/10 border border-[#45a29e]/30 rounded-lg p-3">
            <Wifi className="w-4 h-4 mt-0.5 shrink-0 animate-pulse" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="flex items-start gap-2 text-red-400 text-sm text-left bg-red-400/10 border border-red-400/30 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!file || loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
          id="upload-btn"
        >
          {loading ? (
            <>
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0b0c10]"></span>
              <span>Initializing…</span>
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
