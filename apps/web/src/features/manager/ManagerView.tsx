import React, { useState } from 'react';
import {
  Monitor, Sparkles, TrendingUp, AlertTriangle, CheckCircle, Sliders,
  Users, Flame, ArrowUpRight, Zap, RefreshCw, BarChart2
} from 'lucide-react';
import { AIRecommendation, PeakRushLevel } from '@smart-canteen/shared';

interface ManagerViewProps {
  stations: any[];
  workers: any[];
  queueLength: number;
  recommendations: AIRecommendation[];
  onApplyRecommendation: (recId: string) => void;
}

export const ManagerView: React.FC<ManagerViewProps> = ({
  stations,
  workers,
  queueLength,
  recommendations,
  onApplyRecommendation
}) => {
  const [simulationTrafficMultiplier, setSimulationTrafficMultiplier] = useState(1.0);

  // Simulated what-if calculations
  const simQueue = Math.round(queueLength * simulationTrafficMultiplier);
  const simAvgWait = Math.round((5.5 * simulationTrafficMultiplier + (simulationTrafficMultiplier > 1.3 ? 4.0 : 0)) * 10) / 10;
  const simRushLevel: PeakRushLevel = simQueue > 15 ? PeakRushLevel.CRITICAL : (simQueue > 8 ? PeakRushLevel.HIGH : PeakRushLevel.MEDIUM);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Operations & AI Control Center</h1>
            <p className="text-xs text-slate-400">Live Congestion Monitoring, Workload Balancing & Predictive AI Interventions</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-800/80 border border-slate-700 px-3.5 py-1.5 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Queue Congestion</span>
            <span className="text-sm font-bold text-amber-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              {queueLength > 8 ? 'HIGH RUSH' : 'NORMAL (OPTIMAL)'}
            </span>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 px-3.5 py-1.5 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Active Line Chefs</span>
            <span className="text-sm font-bold text-white font-mono">{workers.length} On Duty</span>
          </div>
        </div>
      </div>

      {/* AI Recommendation Center (Sections 42-45) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-500/30 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">AI Real-time Action Recommendations</h2>
              <p className="text-xs text-slate-400">Autonomous operational suggestions based on queue velocity and kitchen load</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
            {recommendations.length} Active Insights
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {recommendations.map(rec => (
            <div
              key={rec.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 rounded-xl p-4 flex flex-col justify-between space-y-3 transition group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    {rec.type.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-400">
                    {Math.round(rec.confidenceScore * 100)}% Confidence
                  </span>
                </div>
                <h3 className="font-bold text-sm text-white group-hover:text-indigo-300 transition">{rec.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{rec.description}</p>
                <div className="mt-2 text-xs font-semibold text-amber-300 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                  ⚡ Impact: {rec.impact}
                </div>
              </div>

              <button
                onClick={() => onApplyRecommendation(rec.id)}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Apply Action</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Station Workloads & Line Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stations Capacity */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Kitchen Workstation Utilization</span>
            </h3>
            <span className="text-xs text-slate-400">Target &lt; 75% load</span>
          </div>

          <div className="space-y-3">
            {stations.map(st => (
              <div key={st._id} className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{st.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{st.activeOrderCount} orders</span>
                    <span className={`font-bold ${st.currentLoad > 75 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {st.currentLoad}%
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      st.currentLoad > 75 ? 'bg-rose-500' : (st.currentLoad > 50 ? 'bg-amber-500' : 'bg-emerald-500')
                    }`}
                    style={{ width: `${Math.min(100, st.currentLoad)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What-If Simulation Sandbox (Section 44) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>"What-If" AI Scenario Simulator</span>
              </h3>
              <span className="text-[11px] font-semibold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                Sandbox Mode
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-3 leading-relaxed">
              Stress-test the canteen queue against upcoming unexpected surges (e.g. all-hands team lunch or rainy day campus influx).
            </p>

            <div className="mt-5 space-y-3">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Simulate Order Volume Multiplier:</span>
                <span className="text-cyan-400 font-mono font-bold">{simulationTrafficMultiplier.toFixed(1)}x ({Math.round((simulationTrafficMultiplier - 1) * 100)}% surge)</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={simulationTrafficMultiplier}
                onChange={(e) => setSimulationTrafficMultiplier(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Simulation Predicted Output */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Simulated Queue</span>
                <span className="text-xl font-bold text-white font-mono">{simQueue} orders</span>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Predicted Wait</span>
                <span className="text-xl font-bold text-amber-400 font-mono">{simAvgWait} min</span>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Risk Level</span>
                <span className={`text-sm font-bold block mt-1 ${simRushLevel === 'CRITICAL' ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {simRushLevel}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400">
            💡 AI Recommendation under this scenario: {simulationTrafficMultiplier > 1.5 ? 'Bring 2 on-call backup cooks into Grill & South Indian counters to maintain 10-minute SLA.' : 'Current 3-station roster is sufficient to maintain standard queue velocities.'}
          </div>
        </div>
      </div>
    </div>
  );
};
