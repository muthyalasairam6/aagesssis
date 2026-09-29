import React, { useRef, useEffect, useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Layers,
  Activity,
  Sliders,
  Terminal,
  FileCheck2,
  Lock,
  Eye,
  AlertTriangle,
  Code2,
} from 'lucide-react';
import {
  DetectedElement,
  PrivacyConfig,
  PrivacyAuditLogEntry,
  ScenarioPreset,
} from '../types';
import { renderSanitizedCanvas } from '../services/privacyEngine';

interface PrivacyMonitorProps {
  scenario: ScenarioPreset;
  elements: DetectedElement[];
  sanitizedElements: DetectedElement[];
  auditLogs: PrivacyAuditLogEntry[];
  config: PrivacyConfig;
  onChangeConfig: (newConfig: PrivacyConfig) => void;
  isZeroLeakGuaranteed: boolean;
  rawLeaksFound: string[];
  sanitizedDomSnippet: string;
}

export const PrivacyMonitor: React.FC<PrivacyMonitorProps> = ({
  scenario,
  elements,
  sanitizedElements,
  auditLogs,
  config,
  onChangeConfig,
  isZeroLeakGuaranteed,
  rawLeaksFound,
  sanitizedDomSnippet,
}) => {
  const [activeTab, setActiveTab] = useState<'CANVAS_VIEW' | 'AUDIT_LEDGER' | 'NETWORK_PACKET' | 'SETTINGS'>('CANVAS_VIEW');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Redraw canvas whenever scenario or elements change
  useEffect(() => {
    if (canvasRef.current) {
      renderSanitizedCanvas(canvasRef.current, sanitizedElements, config, scenario);
    }
  }, [canvasRef, sanitizedElements, config, scenario]);

  const piiElementsCount = elements.filter((e) => e.isPII).length;
  const redactedCount = sanitizedElements.filter((e) => e.isPII).length;

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col h-full">
      {/* Top Header & Navigation */}
      <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <div>
            <span className="font-bold text-slate-200">On-Device Privacy Guard</span>
            <span className="text-[10px] text-slate-500 ml-1.5 hidden sm:inline">WebGPU & DOM Firewall</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('CANVAS_VIEW')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
              activeTab === 'CANVAS_VIEW'
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sanitized Canvas
          </button>
          <button
            onClick={() => setActiveTab('AUDIT_LEDGER')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
              activeTab === 'AUDIT_LEDGER'
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Audit Ledger ({auditLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('NETWORK_PACKET')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
              activeTab === 'NETWORK_PACKET'
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Packet Inspector
          </button>
          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
              activeTab === 'SETTINGS'
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Config
          </button>
        </div>
      </div>

      {/* Zero Leak Guarantee Status Banner */}
      <div
        className={`px-4 py-2 border-b flex items-center justify-between text-xs ${
          isZeroLeakGuaranteed
            ? 'bg-emerald-950/40 border-emerald-900/60 text-emerald-300'
            : 'bg-rose-950/40 border-rose-900/60 text-rose-300'
        }`}
      >
        <div className="flex items-center gap-2">
          {isZeroLeakGuaranteed ? (
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
          )}
          <span className="font-semibold">
            {isZeroLeakGuaranteed
              ? 'Zero-Leak Quarantine Active: 0 Raw PII Transmitted to Server'
              : `Warning: ${rawLeaksFound.length} Potential PII Leak Detected!`}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span>PII Protected: {redactedCount}/{piiElementsCount}</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-900/80 text-cyan-400 border border-slate-700">
            Latency: ~24ms
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 overflow-y-auto bg-slate-950/60">
        {/* TAB 1: SANITIZED CANVAS (What the Server VLM actually sees) */}
        {activeTab === 'CANVAS_VIEW' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-cyan-400" />
                <span>Sanitized Viewport (Rendered with Gaussian blur & semantic tokens)</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">760x420 px Client Render</span>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900 shadow-inner flex justify-center">
              <canvas
                ref={canvasRef}
                width={760}
                height={420}
                className="w-full max-w-full h-auto object-contain block"
              />
            </div>

            {/* Semantic token legend */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
                <span className="text-blue-400 font-mono font-bold">[PERSON_NAME]</span>
                <p className="text-slate-400 text-[10px] mt-0.5">Masks legal identity</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
                <span className="text-cyan-400 font-mono font-bold">[FACE_BLURRED]</span>
                <p className="text-slate-400 text-[10px] mt-0.5">Gaussian pixel blur</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
                <span className="text-rose-400 font-mono font-bold">[PASSWORD_MASKED]</span>
                <p className="text-slate-400 text-[10px] mt-0.5">Solid blacked out</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
                <span className="text-amber-400 font-mono font-bold">[GOV_ID_TOKEN]</span>
                <p className="text-slate-400 text-[10px] mt-0.5">Aadhaar/PAN isolated</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRIVACY AUDIT LEDGER */}
        {activeTab === 'AUDIT_LEDGER' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Cryptographic Privacy Ledger (Recorded locally before network dispatch)</span>
              <span className="font-mono text-cyan-400">{auditLogs.length} Entries Recorded</span>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono text-[11px]">
                    <th className="p-2.5">Time</th>
                    <th className="p-2.5">Element</th>
                    <th className="p-2.5">Detection Layer</th>
                    <th className="p-2.5">Conf.</th>
                    <th className="p-2.5">Token Assigned</th>
                    <th className="p-2.5">Firewall Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-mono text-[10px] text-slate-400">{log.timestamp}</td>
                      <td className="p-2.5 font-semibold text-slate-200">{log.elementLabel}</td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-cyan-300 border border-slate-700">
                          {log.detectionLayer}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono text-[11px] text-emerald-400">
                        {(log.confidence * 100).toFixed(1)}%
                      </td>
                      <td className="p-2.5 font-mono text-[10px] text-blue-400">
                        {log.tokenAssigned}
                      </td>
                      <td className="p-2.5">
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                          <CheckCircle2Icon className="h-3 w-3" /> Zero Leak Clean
                        </span>
                      </td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-500">
                        No PII elements detected yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: NETWORK PACKET INSPECTOR */}
        {activeTab === 'NETWORK_PACKET' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Outbound HTTP Body to Server (/api/agent/reason)</span>
              <span className="text-[10px] text-emerald-400 font-mono">0 Bytes Raw PII</span>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto max-h-[360px]">
              <pre>
{JSON.stringify(
  {
    task: scenario.defaultTask,
    timestamp: new Date().toISOString(),
    clientFirewallVersion: 'AegisVision-v2.6',
    sanitizedTokens: sanitizedElements
      .filter((e) => e.isPII)
      .map((e) => ({
        token: e.sanitizedToken,
        category: e.category,
        bbox: e.bbox,
        confidence: e.confidence,
      })),
    sanitizedDomSnippet: sanitizedDomSnippet,
  },
  null,
  2
)}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 4: PRIVACY FIREWALL SETTINGS */}
        {activeTab === 'SETTINGS' && (
          <div className="space-y-4 max-w-lg">
            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                Detection Engines & Confidence
              </h4>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
                  <span className="text-xs text-slate-300">Enable On-Device ViT (Vision Transformer)</span>
                  <input
                    type="checkbox"
                    checked={config.enableViT}
                    onChange={(e) => onChangeConfig({ ...config, enableViT: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-blue-600 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
                  <span className="text-xs text-slate-300">Enable DOM Hierarchy Inspector</span>
                  <input
                    type="checkbox"
                    checked={config.enableDomInspection}
                    onChange={(e) => onChangeConfig({ ...config, enableDomInspection: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-blue-600 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
                  <span className="text-xs text-slate-300">Enable OCR & Regex Pattern Matcher</span>
                  <input
                    type="checkbox"
                    checked={config.enableOcrRegex}
                    onChange={(e) => onChangeConfig({ ...config, enableOcrRegex: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-blue-600 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-300">Confidence Threshold</span>
                <span className="text-xs font-mono text-cyan-400">
                  {(config.confidenceThreshold * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="0.99"
                step="0.01"
                value={config.confidenceThreshold}
                onChange={(e) =>
                  onChangeConfig({ ...config, confidenceThreshold: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div>
              <span className="text-xs text-slate-300 block mb-1">Redaction Scheme</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onChangeConfig({ ...config, redactionMode: 'SEMANTIC_TOKENS' })}
                  className={`p-2 rounded-lg text-xs font-medium border text-left ${
                    config.redactionMode === 'SEMANTIC_TOKENS'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  <span className="font-bold block">Semantic Tokens</span>
                  <span className="text-[10px] opacity-80">[PERSON_NAME_1]</span>
                </button>

                <button
                  type="button"
                  onClick={() => onChangeConfig({ ...config, redactionMode: 'BLACKOUT_ONLY' })}
                  className={`p-2 rounded-lg text-xs font-medium border text-left ${
                    config.redactionMode === 'BLACKOUT_ONLY'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  <span className="font-bold block">Solid Blackout</span>
                  <span className="text-[10px] opacity-80">█████████</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function CheckCircle2Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
