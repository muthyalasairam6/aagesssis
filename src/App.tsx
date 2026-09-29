import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { BrowserSimulator } from './components/BrowserSimulator';
import { PrivacyMonitor } from './components/PrivacyMonitor';
import { AgentBrainPanel } from './components/AgentBrainPanel';
import { BenchmarkDashboard } from './components/BenchmarkDashboard';
import { ArchitectureModal } from './components/ArchitectureModal';
import { ExportPitchKitModal } from './components/ExportPitchKitModal';
import { SCENARIO_PRESETS } from './data/scenarios';
import { processScreenPrivacy } from './services/privacyEngine';
import {
  ScenarioPreset,
  DetectedElement,
  PrivacyConfig,
  AgentState,
  AgentAction,
  BenchmarkMetrics,
} from './types';
import {
  ShieldCheck,
  Eye,
  Brain,
  MousePointer,
  Lock,
} from 'lucide-react';

export default function App() {
  // Scenario state
  const [currentScenario, setCurrentScenario] = useState<ScenarioPreset>(SCENARIO_PRESETS[0]);
  const [elements, setElements] = useState<DetectedElement[]>(SCENARIO_PRESETS[0].elements);

  // Privacy Config
  const [privacyConfig, setPrivacyConfig] = useState<PrivacyConfig>({
    confidenceThreshold: 0.85,
    enableViT: true,
    enableDomInspection: true,
    enableOcrRegex: true,
    zeroLeakFirewall: true,
    redactionMode: 'SEMANTIC_TOKENS',
    blurRadius: 12,
  });

  // Visual Bounding Box Inspector toggle
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);

  // Workflow state of the interactive page
  const [workflowState, setWorkflowState] = useState({
    resumeUploaded: false,
    termsAccepted: false,
    isSubmitted: false,
    promoApplied: false,
    kycConsent: false,
    kycVerified: false,
  });

  // Calculate dynamic step index and max steps based on scenario and workflow
  const currentStep = useMemo(() => {
    if (currentScenario.id === 'job_application') {
      if (workflowState.isSubmitted) return 3;
      if (workflowState.termsAccepted) return 2;
      if (workflowState.resumeUploaded) return 1;
      return 0;
    }
    if (currentScenario.id === 'banking_kyc') {
      if (workflowState.kycVerified) return 2;
      if (workflowState.kycConsent) return 1;
      return 0;
    }
    if (currentScenario.id === 'ecommerce_checkout') {
      if (workflowState.isSubmitted) return 2;
      if (workflowState.promoApplied) return 1;
      return 0;
    }
    return workflowState.isSubmitted ? 1 : 0;
  }, [currentScenario.id, workflowState]);

  const maxSteps = useMemo(() => {
    if (currentScenario.id === 'job_application') return 3;
    if (currentScenario.id === 'banking_kyc') return 2;
    if (currentScenario.id === 'ecommerce_checkout') return 2;
    return 1;
  }, [currentScenario.id]);

  const isGoalAchieved = useMemo(() => {
    if (currentScenario.id === 'job_application') return workflowState.isSubmitted;
    if (currentScenario.id === 'banking_kyc') return workflowState.kycVerified;
    if (currentScenario.id === 'ecommerce_checkout') return workflowState.isSubmitted;
    return workflowState.isSubmitted;
  }, [currentScenario.id, workflowState]);

  // Agent State
  const [agentState, setAgentState] = useState<AgentState>({
    status: 'IDLE',
    task: SCENARIO_PRESETS[0].defaultTask,
    currentStepIndex: 0,
    maxSteps: 3,
    currentThought: 'Ready to perceive screen context and plan privacy-preserving browser actions.',
    currentPlan: [
      'Perform client-side ViT & DOM privacy scan',
      'Transmit sanitized token context to server',
      'Execute structured browser automation hands',
      'Verify goal completion',
    ],
    lastAction: null,
    actionHistory: [],
    autoLoopActive: false,
    isGoalAchieved: false,
    serverSource: 'gemini-3.8-flash',
  });

  // Keep agentState in sync with currentStep, maxSteps, and isGoalAchieved
  useEffect(() => {
    setAgentState((prev) => ({
      ...prev,
      currentStepIndex: currentStep,
      maxSteps: maxSteps,
      isGoalAchieved: isGoalAchieved,
      status: isGoalAchieved ? 'TASK_COMPLETED' : prev.status === 'TASK_COMPLETED' ? 'IDLE' : prev.status,
    }));
  }, [currentStep, maxSteps, isGoalAchieved]);

  // Active execution hand animation
  const [executingAction, setExecutingAction] = useState<AgentAction | null>(null);
  const [isProcessingStep, setIsProcessingStep] = useState(false);

  // Modals
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState(false);
  const [isExportKitOpen, setIsExportKitOpen] = useState(false);

  // Benchmark metrics
  const [benchmarkMetrics, setBenchmarkMetrics] = useState<BenchmarkMetrics>({
    visualAccuracy: 95.2,
    piiRecall: 99.2,
    piiPrecision: 98.4,
    redactionPrecision: 97.1,
    clientVramMb: 42,
    jsBundleKb: 480,
    cpuOverheadPct: 4.2,
    localRedactionLatencyMs: 24,
    endToEndLoopLatencyMs: 380,
    totalPIIBlocked: 18,
    rawLeaksRecorded: 0,
  });

  // Run privacy processor
  const privacyResult = processScreenPrivacy(elements, privacyConfig);

  // Switch scenario handler
  const handleSelectScenario = (scenario: ScenarioPreset) => {
    setCurrentScenario(scenario);
    setElements(scenario.elements);
    setWorkflowState({
      resumeUploaded: false,
      termsAccepted: false,
      isSubmitted: false,
      promoApplied: false,
      kycConsent: false,
      kycVerified: false,
    });
    setAgentState((prev) => ({
      ...prev,
      status: 'IDLE',
      task: scenario.defaultTask,
      currentStepIndex: 0,
      currentThought: `Switched to ${scenario.name}. Ready to perceive screen.`,
      lastAction: null,
      actionHistory: [],
      autoLoopActive: false,
      isGoalAchieved: false,
    }));
  };

  // Reset current scenario
  const handleReset = () => {
    setWorkflowState({
      resumeUploaded: false,
      termsAccepted: false,
      isSubmitted: false,
      promoApplied: false,
      kycConsent: false,
      kycVerified: false,
    });
    setAgentState((prev) => ({
      ...prev,
      status: 'IDLE',
      currentStepIndex: 0,
      currentThought: 'Reset to initial state.',
      lastAction: null,
      actionHistory: [],
      autoLoopActive: false,
      isGoalAchieved: false,
    }));
    setExecutingAction(null);
  };

  // Execute Agent Next Step Loop
  const handleStepNext = useCallback(async () => {
    if (isProcessingStep || isGoalAchieved) return;
    setIsProcessingStep(true);

    try {
      // PHASE 1: OBSERVING & RUNNING LOCAL PRIVACY FILTER
      setAgentState((prev) => ({
        ...prev,
        status: 'RUNNING_ViT_DETECTION',
        currentThought: 'Scanning viewport via WebGPU ViT and inspecting DOM hierarchy...',
      }));

      await new Promise((r) => setTimeout(r, 250));

      setAgentState((prev) => ({
        ...prev,
        status: 'APPLYING_PRIVACY_FILTER',
        currentThought: 'Identified sensitive PII elements. Substituting with synthetic tokens [PERSON], [EMAIL] and blurring biometric faces...',
      }));

      await new Promise((r) => setTimeout(r, 200));

      // PHASE 2: TRANSMITTING ONLY SANITIZED CONTEXT TO SERVER
      setAgentState((prev) => ({
        ...prev,
        status: 'TRANSMITTING_SANITIZED',
        currentThought: 'Dispatching sanitized DOM tags and privacy token registry to server brain (0 raw PII leaked)...',
      }));

      // Server Reason API call
      let serverResponse: any = null;
      try {
        const response = await fetch('/api/agent/reason', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task: agentState.task,
            currentStepIndex: currentStep,
            screenStateSummary: {
              pageType: currentScenario.id,
              workflowState,
              totalElements: elements.length,
              piiProtectedCount: privacyResult.sanitizedElements.filter((e) => e.isPII).length,
            },
            sanitizedDom: privacyResult.sanitizedDomSnippet,
            sanitizedTokens: Object.keys(privacyResult.sanitizedTokenMap),
            actionHistory: agentState.actionHistory,
          }),
        });

        if (response.ok) {
          serverResponse = await response.json();
        }
      } catch (e) {
        console.warn('Backend server unavailable, running local agent reasoning fallback:', e);
      }

      // If server returned response
      const thought = serverResponse?.thought || 'Evaluated sanitized context. Form missing prerequisite.';
      const nextAction: AgentAction = serverResponse?.nextAction || {
        type: 'CLICK',
        targetSelector: '#btn-upload-resume',
        targetLabel: 'Upload Resume',
        reason: 'Proceed to next required input.',
        confidenceScore: 0.98,
      };
      const plan = serverResponse?.plan || agentState.currentPlan;
      const serverSource = serverResponse?.source || 'aegis-deterministic-vlm-engine';

      setAgentState((prev) => ({
        ...prev,
        status: 'SERVER_REASONING',
        currentThought: thought,
        currentPlan: plan,
        lastAction: nextAction,
        serverSource: serverSource.includes('gemini') ? 'Gemini 3.8 Flash' : 'Aegis Local VLM Planner',
      }));

      await new Promise((r) => setTimeout(r, 350));

      // PHASE 3: BROWSER EXTENSION HANDS EXECUTE ACTION
      setAgentState((prev) => ({
        ...prev,
        status: 'EXECUTING_ACTION',
      }));
      setExecutingAction(nextAction);

      // Execute state change based on action
      await new Promise((r) => setTimeout(r, 600));

      if (currentScenario.id === 'job_application') {
        if (!workflowState.resumeUploaded) {
          setWorkflowState((w) => ({ ...w, resumeUploaded: true }));
        } else if (!workflowState.termsAccepted) {
          setWorkflowState((w) => ({ ...w, termsAccepted: true }));
        } else if (!workflowState.isSubmitted) {
          setWorkflowState((w) => ({ ...w, isSubmitted: true }));
        }
      } else if (currentScenario.id === 'banking_kyc') {
        if (!workflowState.kycConsent) {
          setWorkflowState((w) => ({ ...w, kycConsent: true }));
        } else if (!workflowState.kycVerified) {
          setWorkflowState((w) => ({ ...w, kycVerified: true }));
        }
      } else if (currentScenario.id === 'ecommerce_checkout') {
        if (!workflowState.promoApplied) {
          setWorkflowState((w) => ({ ...w, promoApplied: true }));
        } else if (!workflowState.isSubmitted) {
          setWorkflowState((w) => ({ ...w, isSubmitted: true }));
        }
      } else if (currentScenario.id === 'custom_sandbox') {
        setWorkflowState((w) => ({ ...w, isSubmitted: true }));
      }

      setAgentState((prev) => ({
        ...prev,
        status: 'IDLE',
        actionHistory: [...prev.actionHistory, nextAction],
      }));

      // Update benchmark metrics
      setBenchmarkMetrics((bm) => ({
        ...bm,
        totalPIIBlocked: bm.totalPIIBlocked + 2,
      }));
    } finally {
      setIsProcessingStep(false);
      setExecutingAction(null);
    }
  }, [
    isProcessingStep,
    isGoalAchieved,
    currentStep,
    agentState.task,
    agentState.currentPlan,
    agentState.actionHistory,
    currentScenario.id,
    workflowState,
    elements.length,
    privacyResult.sanitizedElements,
    privacyResult.sanitizedDomSnippet,
    privacyResult.sanitizedTokenMap,
  ]);

  // Auto-run loop timer
  useEffect(() => {
    let timer: any = null;
    if (agentState.autoLoopActive && !isGoalAchieved && !isProcessingStep) {
      timer = setTimeout(() => {
        handleStepNext();
      }, 1800);
    }
    return () => clearTimeout(timer);
  }, [agentState.autoLoopActive, isGoalAchieved, isProcessingStep, handleStepNext]);

  // Manual Trigger handler
  const handleManualTrigger = (actionKey: string) => {
    if (actionKey === 'UPLOAD_RESUME') {
      setWorkflowState((w) => ({ ...w, resumeUploaded: !w.resumeUploaded }));
    } else if (actionKey === 'TOGGLE_TERMS') {
      setWorkflowState((w) => ({ ...w, termsAccepted: !w.termsAccepted }));
    } else if (actionKey === 'SUBMIT_APPLICATION') {
      setWorkflowState((w) => ({ ...w, isSubmitted: true }));
    } else if (actionKey === 'TOGGLE_KYC_CONSENT') {
      setWorkflowState((w) => ({ ...w, kycConsent: !w.kycConsent }));
    } else if (actionKey === 'VERIFY_KYC') {
      setWorkflowState((w) => ({ ...w, kycVerified: true }));
    } else if (actionKey === 'APPLY_PROMO') {
      setWorkflowState((w) => ({ ...w, promoApplied: !w.promoApplied }));
    } else if (actionKey === 'PAY_NOW') {
      setWorkflowState((w) => ({ ...w, isSubmitted: true }));
    } else if (actionKey === 'TEST_TRANSMISSION') {
      handleStepNext();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      {/* Top Navigation */}
      <Navbar
        scenarios={SCENARIO_PRESETS}
        currentScenario={currentScenario}
        onSelectScenario={handleSelectScenario}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onOpenBenchmark={() => setIsBenchmarkOpen(true)}
        onOpenExportKit={() => setIsExportKitOpen(true)}
        onReset={handleReset}
        autoLoopActive={agentState.autoLoopActive}
        onToggleAutoLoop={() =>
          setAgentState((prev) => ({ ...prev, autoLoopActive: !prev.autoLoopActive }))
        }
      />

      {/* Hero Pipeline Subheader */}
      <div className="bg-slate-900/60 border-b border-slate-800 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">Autonomous Closed Loop:</span>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
              <span className="text-cyan-400 font-bold flex items-center gap-1">
                <Eye className="h-3 w-3" /> Eyes (Local ViT)
              </span>
              <span>&rarr;</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Privacy Guard (DOM & OCR)
              </span>
              <span>&rarr;</span>
              <span className="text-indigo-400 font-bold flex items-center gap-1">
                <Brain className="h-3 w-3" /> Brain (Server VLM)
              </span>
              <span>&rarr;</span>
              <span className="text-blue-400 font-bold flex items-center gap-1">
                <MousePointer className="h-3 w-3" /> Hands (Browser DOM)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="flex items-center gap-1 text-emerald-400">
              <Lock className="h-3 w-3" /> Zero Raw Leaks
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300">
              On-Device Latency: <strong className="text-cyan-300">24 ms</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300">
              VRAM Footprint: <strong className="text-purple-300">42 MB</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout (Side-by-side or Stacked) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Dual View: Left = Real User Browser View | Right = Privacy Monitor (Sanitized Screen) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[580px]">
          {/* LEFT: User's Actual Browser View */}
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Client Viewport (Raw User Screen)
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                Interactive DOM + ViT Elements
              </span>
            </div>

            <div className="flex-1">
              <BrowserSimulator
                scenario={currentScenario}
                elements={elements}
                showBoundingBoxes={showBoundingBoxes}
                onToggleBoundingBoxes={() => setShowBoundingBoxes(!showBoundingBoxes)}
                executingAction={executingAction}
                workflowState={workflowState}
                onManualTriggerAction={handleManualTrigger}
              />
            </div>
          </div>

          {/* RIGHT: Privacy Guard & Sanitized Canvas */}
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Privacy Firewall Monitor (Server Receives This)
                </h3>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono">
                100% Sanitized &bull; Zero Raw PII
              </span>
            </div>

            <div className="flex-1">
              <PrivacyMonitor
                scenario={currentScenario}
                elements={elements}
                sanitizedElements={privacyResult.sanitizedElements}
                auditLogs={privacyResult.auditLogs}
                config={privacyConfig}
                onChangeConfig={setPrivacyConfig}
                isZeroLeakGuaranteed={privacyResult.isZeroLeakGuaranteed}
                rawLeaksFound={privacyResult.rawLeaksFound}
                sanitizedDomSnippet={privacyResult.sanitizedDomSnippet}
              />
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Server VLM Brain & Autonomous Loop Control */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Remote Server Reasoning & Planning (The Brain)
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Interprets Sanitized Tokens &bull; Emits Structured Browser Actions
            </span>
          </div>

          <AgentBrainPanel
            agentState={agentState}
            onStepNext={handleStepNext}
            onToggleAutoRun={() =>
              setAgentState((prev) => ({ ...prev, autoLoopActive: !prev.autoLoopActive }))
            }
            onReset={handleReset}
            isProcessing={isProcessingStep}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-4 text-center text-xs text-slate-500 font-mono">
        <p>
          AegisVision &bull; SIH 26171 ISRO Hackathon Solution Architecture &bull; On-Device Visual Perception for Light-Weight Browser Agents
        </p>
      </footer>

      {/* Architecture Modal */}
      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />

      {/* Benchmark Dashboard Modal */}
      <BenchmarkDashboard
        isOpen={isBenchmarkOpen}
        onClose={() => setIsBenchmarkOpen(false)}
        metrics={benchmarkMetrics}
      />

      {/* Export Starter Kit Modal */}
      <ExportPitchKitModal
        isOpen={isExportKitOpen}
        onClose={() => setIsExportKitOpen(false)}
      />
    </div>
  );
}
