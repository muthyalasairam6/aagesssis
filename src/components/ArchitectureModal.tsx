import React from 'react';
import {
  Layers,
  X,
  Shield,
  Eye,
  Brain,
  MousePointer,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  Lock,
  Cpu,
  Server,
  Code,
} from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl text-white">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Layers className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">AegisVision System Architecture</h2>
              <p className="text-xs text-slate-400">
                End-to-End Pipeline: Client Eyes & Privacy Guard &rarr; Server Brain &rarr; Browser Hands
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Interactive Flow Architecture Diagram */}
          <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-6">
            <div className="text-center max-w-xl mx-auto mb-4">
              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest font-semibold">
                ISRO SIH 26171 Target Specification
              </span>
              <h3 className="text-base font-bold text-white mt-1">
                Client Boundary Quarantine & Remote Reasoning Loop
              </h3>
            </div>

            {/* Step 1: User & Browser */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Box 1: CLIENT BOUNDARY */}
              <div className="p-4 rounded-xl bg-blue-950/20 border-2 border-cyan-500/50 relative">
                <div className="absolute -top-3 left-4 px-2 py-0.5 rounded bg-cyan-900 border border-cyan-500 text-[10px] font-bold font-mono text-cyan-300">
                  STEP 1: CLIENT EYES + PRIVACY GUARD
                </div>

                <div className="space-y-3 mt-2">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                    <Eye className="h-4 w-4" />
                    <span>On-Device Visual Perception</span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                    <li><strong className="text-white">WebGPU ViT:</strong> Detects faces, photos, signatures & UI bounding boxes.</li>
                    <li><strong className="text-white">DOM Inspector:</strong> Reads input attributes (`type="password"`, `autocomplete`).</li>
                    <li><strong className="text-white">OCR & Regex Engine:</strong> Aadhaar, PAN, CC, CVV, Phone, Email, UPI.</li>
                  </ul>

                  <div className="pt-2 border-t border-slate-800">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
                      <Shield className="h-3.5 w-3.5" />
                      <span>Privacy Redaction & Tokenizer</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Replaces raw PII with <code className="text-blue-300">[PERSON_1]</code>, <code className="text-cyan-300">[EMAIL_1]</code>, applies Gaussian blur on faces.
                    </p>
                  </div>
                </div>
              </div>

              {/* Box 2: ZERO-LEAK TRANSMISSION */}
              <div className="p-4 rounded-xl bg-slate-900 border-2 border-emerald-500/60 relative flex flex-col justify-between">
                <div className="absolute -top-3 left-4 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500 text-[10px] font-bold font-mono text-emerald-300">
                  STEP 2: ENCRYPTED NETWORK PIPE
                </div>

                <div className="space-y-3 mt-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <Lock className="h-4 w-4" />
                    <span>Zero-Leak Data Payload</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Only anonymized, sanitized visual representations and tokenized DOM tags cross the client machine's network socket:
                  </p>
                  <div className="p-2 rounded bg-slate-950 font-mono text-[10px] text-emerald-300 border border-slate-800">
                    &#123; "tokens": ["[PERSON_1]", "[EMAIL_1]"], "screen_blurred": true, "raw_pii_bytes": 0 &#125;
                  </div>
                  <p className="text-[11px] text-slate-400">
                    The central server receives zero raw credentials or biometric face portraits.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs font-mono text-emerald-400 pt-2 border-t border-slate-800">
                  <CheckCircle2 className="h-4 w-4" /> 0% Raw Leak Quarantine
                </div>
              </div>

              {/* Box 3: SERVER BRAIN & BROWSER HANDS */}
              <div className="p-4 rounded-xl bg-indigo-950/20 border-2 border-indigo-500/50 relative">
                <div className="absolute -top-3 left-4 px-2 py-0.5 rounded bg-indigo-950 border border-indigo-500 text-[10px] font-bold font-mono text-indigo-300">
                  STEP 3 & 4: BRAIN & HANDS
                </div>

                <div className="space-y-3 mt-2">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                    <Brain className="h-4 w-4" />
                    <span>Server VLM Reasoning</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Multi-modal VLM (Gemini 3.8 Flash / open weights) interprets sanitized context and outputs structured actions:
                  </p>
                  <div className="p-2 rounded bg-slate-950 font-mono text-[10px] text-indigo-300 border border-slate-800">
                    &#123; "action": "CLICK", "target": "#btn-upload-resume" &#125;
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs mb-1">
                      <MousePointer className="h-3.5 w-3.5" />
                      <span>Browser Extension Hands</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Executes action in browser DOM, resolves local vault tokens, observes DOM mutation, and repeats the loop!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Loop Arrow */}
            <div className="flex items-center justify-center gap-3 pt-2 text-xs font-mono text-slate-400">
              <span>Observe</span>
              <ArrowRight className="h-4 w-4 text-cyan-400" />
              <span>Sanitize Locally</span>
              <ArrowRight className="h-4 w-4 text-emerald-400" />
              <span>Transmit</span>
              <ArrowRight className="h-4 w-4 text-indigo-400" />
              <span>Reason (Server Brain)</span>
              <ArrowRight className="h-4 w-4 text-blue-400" />
              <span>Execute (Hands)</span>
              <ArrowRight className="h-4 w-4 text-cyan-400" />
              <span>Observe Again</span>
            </div>
          </div>

          {/* Deep Technical Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                Why Hybrid Perception Trumps Pure Vision
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Relying only on computer vision can miss input fields or suffer OCR inaccuracies on small text. By pairing the DOM tree (which explicitly contains attributes like <code className="text-rose-400">&lt;input type="password"&gt;</code>) with on-device ViT object localization, AegisVision achieves <strong>99.2% PII recall</strong> while maintaining a tiny 42MB WebGPU VRAM footprint.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2 flex items-center gap-2">
                <Server className="h-4 w-4" />
                Context-Aware Tokenization vs Blind Blackout
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                If an agent blackouts everything, the server-side VLM cannot tell what the page is for. AegisVision replaces sensitive values with semantic tokens (<code className="text-blue-400">[PERSON_NAME]</code>, <code className="text-cyan-400">[EMAIL_ID]</code>). The central VLM understands the structure of the form and successfully plans the next step without ever learning the user's real identity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
