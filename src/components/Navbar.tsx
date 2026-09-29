import React from 'react';
import { ShieldCheck, Cpu, Play, RotateCcw, FileCode, Award, Layers } from 'lucide-react';
import { ScenarioPreset, ScenarioId } from '../types';

interface NavbarProps {
  scenarios: ScenarioPreset[];
  currentScenario: ScenarioPreset;
  onSelectScenario: (scenario: ScenarioPreset) => void;
  onOpenArchitecture: () => void;
  onOpenBenchmark: () => void;
  onOpenExportKit: () => void;
  onReset: () => void;
  autoLoopActive: boolean;
  onToggleAutoLoop: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  scenarios,
  currentScenario,
  onSelectScenario,
  onOpenArchitecture,
  onOpenBenchmark,
  onOpenExportKit,
  onReset,
  autoLoopActive,
  onToggleAutoLoop,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & ISRO / SIH badge */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                AegisVision
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold tracking-wider uppercase rounded bg-cyan-950 text-cyan-400 border border-cyan-800/80">
                ISRO • SIH 26171
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Privacy-Preserving On-Device Vision Agent
            </p>
          </div>
        </div>

        {/* Scenario Selector Tabs */}
        <div className="hidden md:flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
          {scenarios.map((sc) => (
            <button
              key={sc.id}
              onClick={() => onSelectScenario(sc)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentScenario.id === sc.id
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {sc.name.split(' ')[0]} {sc.name.split(' ')[1] || ''}
            </button>
          ))}
        </div>

        {/* Primary Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onToggleAutoLoop}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all ${
              autoLoopActive
                ? 'bg-amber-600 hover:bg-amber-500 text-white animate-pulse'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/20 shadow-md'
            }`}
          >
            {autoLoopActive ? (
              <>
                <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                Pause Agent Loop
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                Run Agent Loop
              </>
            )}
          </button>

          <button
            onClick={onReset}
            title="Reset simulation state"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/80 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <div className="h-5 w-[1px] bg-slate-700 mx-1 hidden sm:block" />

          {/* Modals & Tools */}
          <button
            onClick={onOpenArchitecture}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors"
          >
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Architecture</span>
          </button>

          <button
            onClick={onOpenBenchmark}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors"
          >
            <Award className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">SIH Benchmark</span>
          </button>

          <button
            onClick={onOpenExportKit}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800/60 transition-colors"
          >
            <FileCode className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Pitch & Code Kit</span>
          </button>
        </div>
      </div>
    </header>
  );
};
