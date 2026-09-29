import React from 'react';
import {
  Brain,
  Cpu,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Check,
} from 'lucide-react';
import { AgentState, AgentAction } from '../types';

interface AgentBrainPanelProps {
  agentState: AgentState;
  onStepNext: () => void;
  onToggleAutoRun: () => void;
  onReset: () => void;
  isProcessing: boolean;
}

export const AgentBrainPanel: React.FC<AgentBrainPanelProps> = ({
  agentState,
  onStepNext,
  onToggleAutoRun,
  onReset,
  isProcessing,
}) => {
  const getStatusColor = (status: AgentState['status']) => {
    switch (status) {
      case 'SERVER_REASONING':
        return 'text-amber-400 bg-amber-950/80 border-amber-800';
      case 'EXECUTING_ACTION':
        return 'text-blue-400 bg-blue-950/80 border-blue-800';
      case 'TASK_COMPLETED':
        return 'text-emerald-400 bg-emerald-950/80 border-emerald-800';
      case 'APPLYING_PRIVACY_FILTER':
        return 'text-cyan-400 bg-cyan-950/80 border-cyan-800';
      default:
        return 'text-slate-400 bg-slate-900 border-slate-800';
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col h-full">
      {/* Top Header */}
      <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center">
            <Brain className="h-3.5 w-3.5 text-indigo-400" />
          </div>
          <div>
            <span className="font-bold text-slate-200">Server VLM Agent Brain</span>
            <span className="text-[10px] text-slate-500 ml-1.5 hidden sm:inline">
              Model: {agentState.serverSource}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider border ${getStatusColor(
              agentState.status
            )} flex items-center gap-1.5`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
            {agentState.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Task & Controls Bar */}
      <div className="p-4 bg-slate-950/40 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
              Goal / Task:
            </span>
            <span className="text-xs text-slate-300 font-medium truncate max-w-md">
              "{agentState.task}"
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Step {agentState.currentStepIndex + 1} of {agentState.maxSteps}</span>
            <span>•</span>
            <span className="text-emerald-400 font-mono">
              Privacy Context: 100% Sanitized
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            disabled={isProcessing || agentState.isGoalAchieved}
            onClick={onStepNext}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isProcessing || agentState.isGoalAchieved
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
            }`}
          >
            <SkipForward className="h-3.5 w-3.5" />
            <span>Step Next</span>
          </button>

          <button
            onClick={onToggleAutoRun}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              agentState.autoLoopActive
                ? 'bg-amber-600 text-white animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            {agentState.autoLoopActive ? (
              <>
                <Pause className="h-3.5 w-3.5" />
                <span>Pause Auto</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Auto Loop</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Thought & Plan Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* Agent Thought Box */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>VLM Chain of Thought</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Server Observation</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {agentState.currentThought || 'Analyzing sanitized screen context...'}
          </p>
        </div>

        {/* Structured Next Action Card */}
        {agentState.lastAction && (
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-slate-900 border border-indigo-900/60 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowRight className="h-3.5 w-3.5 text-cyan-400" />
                <span>Next Structured Action to Dispatch</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/80">
                Confidence: {(agentState.lastAction.confidenceScore * 100).toFixed(0)}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Command Type:</span>
                <span className="font-mono font-bold text-white px-2 py-0.5 rounded bg-blue-600/80 inline-block mt-0.5">
                  {agentState.lastAction.type}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block">Target Selector:</span>
                <span className="font-mono text-cyan-300 font-medium">
                  {agentState.lastAction.targetSelector}
                </span>
              </div>
            </div>

            <div className="mt-2 text-xs">
              <span className="text-[10px] text-slate-400 block">Target Label / Element:</span>
              <span className="text-slate-200 font-semibold">{agentState.lastAction.targetLabel}</span>
            </div>

            <div className="mt-2 text-xs bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Agent Justification:</span>
              <p className="text-slate-300 text-[11px] mt-0.5">{agentState.lastAction.reason}</p>
            </div>
          </div>
        )}

        {/* Multi-step Plan */}
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Execution Plan Checklist
          </span>
          <div className="space-y-1.5">
            {agentState.currentPlan.map((planItem, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-lg text-xs flex items-center gap-2 border transition-all ${
                  idx < agentState.currentStepIndex
                    ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-300'
                    : idx === agentState.currentStepIndex
                    ? 'bg-blue-950/40 border-blue-800 text-blue-200 font-semibold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-500'
                }`}
              >
                {idx < agentState.currentStepIndex ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <span className="h-3.5 w-3.5 rounded-full border border-slate-600 flex items-center justify-center text-[9px] font-mono shrink-0">
                    {idx + 1}
                  </span>
                )}
                <span>{planItem}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action History Log */}
        {agentState.actionHistory.length > 0 && (
          <div className="pt-2 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Action Execution History
            </span>
            <div className="space-y-1">
              {agentState.actionHistory.map((act, i) => (
                <div
                  key={i}
                  className="text-[11px] text-slate-400 flex items-center justify-between p-1.5 rounded bg-slate-950/50 font-mono"
                >
                  <span className="text-slate-300">
                    #{i + 1} {act.type} &rarr; {act.targetLabel}
                  </span>
                  <span className="text-emerald-400 text-[10px]">
                    Executed
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
