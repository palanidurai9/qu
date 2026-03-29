import React, { useState } from 'react';
import { UploadCloud, CheckCircle, Zap } from 'lucide-react';
import { uploadDataset, trainQuantum, trainClassical } from '../services/api';

const UploadForm = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file first.");
      return;
    }
    setLoading(true);
    try {
      const data = await uploadDataset(file);
      onUploadSuccess(data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
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
        <div className="relative border-2 border-dashed border-[#45a29e] rounded-lg p-6 hover:bg-[#66fcf1]/5 transition-colors cursor-pointer">
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

        {error && <div className="text-red-400 text-sm mt-2">{error}</div>}

        <button 
          type="submit" 
          disabled={!file || loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0b0c10]"></span>
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
