import React, { useState } from 'react';
import UploadForm from './components/UploadForm';
import Visualization from './components/Visualization';
import { trainQuantum, trainClassical } from './services/api';
import { Atom, FlaskConical } from 'lucide-react';

const IS_MOCK = import.meta.env.VITE_MOCK_MODE === 'true';

function App() {
  const [datasetContext, setDatasetContext] = useState(null);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [targetColumn, setTargetColumn] = useState('');
  
  const [qStatus, setQStatus] = useState({ loading: false, result: null, error: null });
  const [cStatus, setCStatus] = useState({ loading: false, result: null, error: null });

  const handleUploadSuccess = (data) => {
    setDatasetContext(data);
    if(data.columns.length > 0){
      setTargetColumn(data.columns[data.columns.length - 1]);
      setSelectedFeatures(data.columns.slice(0, Math.min(4, data.columns.length - 1)));
    }
    // reset 
    setQStatus({ loading: false, result: null, error: null });
    setCStatus({ loading: false, result: null, error: null });
  };

  const handleFeatureToggle = (col) => {
    if(selectedFeatures.includes(col)){
      setSelectedFeatures(selectedFeatures.filter(c => c !== col));
    } else {
      if(selectedFeatures.length < 8) {
        setSelectedFeatures([...selectedFeatures, col]);
      } else {
        alert("Maximum 8 features allowed for quantum simulation performance.");
      }
    }
  };

  const handleTrainQML = async () => {
    setQStatus({ loading: true, result: null, error: null });
    try {
      const res = await trainQuantum(datasetContext.dataset_id, selectedFeatures, targetColumn);
      setQStatus({ loading: false, result: res, error: null });
    } catch (error) {
      setQStatus({ loading: false, result: null, error: error.response?.data?.detail || error.message });
    }
  };

  const handleTrainClassical = async () => {
    setCStatus({ loading: true, result: null, error: null });
    try {
      const res = await trainClassical(datasetContext.dataset_id, selectedFeatures, targetColumn);
      setCStatus({ loading: false, result: res, error: null });
    } catch (error) {
      setCStatus({ loading: false, result: null, error: error.response?.data?.detail || error.message });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Background decorations */}
      <div className="absolute top-[-10rem] left-[-10rem] w-96 h-96 bg-[#45a29e] rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-[-10rem] right-[-10rem] w-96 h-96 bg-[#66fcf1] rounded-full mix-blend-screen filter blur-[128px] opacity-20 -z-10"></div>

      <div className="max-w-6xl mx-auto z-10 relative">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 glass-card rounded-2xl mb-4">
             <Atom className="w-10 h-10 text-[#66fcf1] mr-3 animate-[spin_10s_linear_infinite]" />
             <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#66fcf1] to-white">
               Quantum ML Dashboard
             </h1>
          </div>
          <p className="text-[#c5c6c7] max-w-2xl mx-auto text-lg pt-4 leading-relaxed">
            Harness the power of Variational Quantum Classifiers (VQC) via Qiskit Aer Simulator. Upload your dataset, select features, and compare quantum vs classical performance.
          </p>
          {IS_MOCK && (
            <div className="mt-4 inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/40 text-yellow-300 text-xs px-4 py-1.5 rounded-full">
              <FlaskConical className="w-3.5 h-3.5" />
              Demo Mode — results are simulated, no backend required
            </div>
          )}
        </header>

        {!datasetContext ? (
          <UploadForm onUploadSuccess={handleUploadSuccess} />
        ) : (
          <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
            {/* Configure Section */}
            <div className="glass-card p-6 md:p-8">
              <div className="flex justify-between items-center mb-6 border-b border-[#1f2833] pb-4">
                <h2 className="text-2xl font-bold flex items-center">
                  <span className="w-8 h-8 rounded border border-[#66fcf1]/40 flex justify-center items-center text-[#66fcf1] mr-3 text-sm">✓</span>
                  Configure Training
                </h2>
                <span className="bg-[#1f2833] text-[#45a29e] py-1 px-3 rounded-full text-sm">
                  {datasetContext.total_rows} rows loaded
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Target Variable (Must be binary)</label>
                  <select 
                    value={targetColumn} 
                    onChange={e => setTargetColumn(e.target.value)}
                    className="w-full bg-[#0b0c10] border-2 border-[#1f2833] rounded-lg py-2 px-4 shadow focus:outline-none focus:border-[#45a29e] text-white"
                  >
                    {datasetContext.columns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Features (Select 2-8) - Selected: {selectedFeatures.length}/8
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                    {datasetContext.columns.map(col => {
                      if(col === targetColumn) return null;
                      const isSelected = selectedFeatures.includes(col);
                      return (
                        <button
                          key={col}
                          onClick={() => handleFeatureToggle(col)}
                          className={`px-3 py-1 rounded-full text-sm transition-all shadow-sm ${
                            isSelected 
                              ? 'bg-[#66fcf1]/20 text-[#66fcf1] border border-[#66fcf1]' 
                              : 'bg-[#1f2833] text-[#c5c6c7] border border-transparent hover:border-[#45a29e]/50'
                          }`}
                        >
                          {col}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={handleTrainClassical} 
                  disabled={cStatus.loading || selectedFeatures.length === 0}
                  className="btn-secondary w-full py-3"
                >
                  {cStatus.loading ? 'Training Classical Baseline...' : 'Train Logistic Regression'}
                </button>
                <button 
                  onClick={handleTrainQML} 
                  disabled={qStatus.loading || selectedFeatures.length === 0 || qStatus.result}
                  className="btn-primary w-full py-3"
                >
                  {qStatus.loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Atom className="w-5 h-5 animate-spin" /> Simulating Quantum Circuit...
                    </span>
                  ) : 'Train Quantum VQC'}
                </button>
              </div>

              {qStatus.error && <p className="text-red-400 mt-4 text-center">{qStatus.error}</p>}
              {cStatus.error && <p className="text-red-400 mt-4 text-center">{cStatus.error}</p>}
            </div>

            <Visualization quantumRes={qStatus.result} classicalRes={cStatus.result} />
            
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
