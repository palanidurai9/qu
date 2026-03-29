import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

const Visualization = ({ quantumRes, classicalRes }) => {
  if (!quantumRes && !classicalRes) return null;

  const getMetricData = () => {
    const data = [];
    if (quantumRes) data.push({ name: 'Quantum VQC', Accuracy: quantumRes.accuracy * 100, Time: quantumRes.training_time_seconds });
    if (classicalRes) data.push({ name: 'Classical LR', Accuracy: classicalRes.accuracy * 100, Time: classicalRes.training_time_seconds });
    return data;
  };

  const getLossData = () => {
    if (!quantumRes || !quantumRes.loss_history) return [];
    return quantumRes.loss_history.map((val, idx) => ({ iter: idx + 1, loss: val }));
  };

  return (
    <div className="space-y-8 mt-8 fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Metric Comparison */}
        <div className="glass-card p-6">
          <h3 className="text-xl text-[#66fcf1] border-b border-[#45a29e]/30 pb-3 mb-6 font-semibold">Model Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getMetricData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2833" />
                <XAxis dataKey="name" stroke="#c5c6c7" />
                <YAxis stroke="#c5c6c7" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0b0c10', borderColor: '#45a29e', color: '#c5c6c7' }}
                  itemStyle={{ color: '#66fcf1' }}
                />
                <Legend />
                <Bar dataKey="Accuracy" fill="#66fcf1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Time" fill="#45a29e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quantum Loss Curve */}
        {quantumRes && quantumRes.loss_history && quantumRes.loss_history.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="text-xl text-[#66fcf1] border-b border-[#45a29e]/30 pb-3 mb-6 font-semibold">VQC Objective Optimization</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getLossData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2833" />
                  <XAxis dataKey="iter" stroke="#c5c6c7" />
                  <YAxis stroke="#c5c6c7" domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0b0c10', borderColor: '#45a29e', color: '#c5c6c7' }}
                  />
                  <Line type="monotone" dataKey="loss" stroke="#66fcf1" strokeWidth={3} dot={{ r: 3, fill: '#0b0c10', stroke: '#66fcf1' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>
      
      {/* Raw Data Results */}
      <div className="glass-card p-6 overflow-x-auto text-sm bg-gradient-to-tr from-[#0b0c10] to-[#1f2833]/50">
        <h3 className="text-xl text-[#66fcf1] border-b border-[#45a29e]/30 pb-3 mb-4 font-semibold">Summary Breakdown</h3>
        <table className="w-full text-left table-auto">
          <thead>
            <tr className="text-[#45a29e] border-b border-[#1f2833]">
              <th className="py-2 px-4">Model</th>
              <th className="py-2 px-4">Accuracy</th>
              <th className="py-2 px-4">Train Time (s)</th>
              <th className="py-2 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {quantumRes && (
              <tr className="border-b border-[#1f2833] hover:bg-[#1f2833]/30 transition-colors">
                <td className="py-3 px-4 text-[#66fcf1]">{quantumRes.model}</td>
                <td className="py-3 px-4">{(quantumRes.accuracy * 100).toFixed(2)}%</td>
                <td className="py-3 px-4">{quantumRes.training_time_seconds.toFixed(2)}</td>
                <td className="py-3 px-4 text-green-400">{quantumRes.message}</td>
              </tr>
            )}
            {classicalRes && (
              <tr className="hover:bg-[#1f2833]/30 transition-colors">
                <td className="py-3 px-4 text-[#45a29e]">{classicalRes.model}</td>
                <td className="py-3 px-4">{(classicalRes.accuracy * 100).toFixed(2)}%</td>
                <td className="py-3 px-4">{classicalRes.training_time_seconds.toFixed(2)}</td>
                <td className="py-3 px-4 text-green-400">{classicalRes.message}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Visualization;
