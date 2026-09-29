export type DetectionMethod = 'DOM_INSPECTOR' | 'VISION_ViT' | 'OCR_REGEX' | 'HYBRID_FUSION';
export type RedactionMethod = 'TOKEN_SUBSTITUTION' | 'GAUSSIAN_BLUR' | 'SOLID_BLACKOUT';

export interface BoundingBox {
  x: number; // percentage or pixels
  y: number;
  width: number;
  height: number;
}

export interface DetectedElement {
  id: string;
  fieldKey: string;
  label: string;
  category: 'PII_NAME' | 'PII_EMAIL' | 'PII_PHONE' | 'AUTH_PASSWORD' | 'FINANCIAL_CARD' | 'FINANCIAL_CVV' | 'GOV_AADHAAR' | 'GOV_PAN' | 'FINANCIAL_UPI' | 'BIOMETRIC_FACE' | 'DOC_SIGNATURE' | 'UI_BUTTON' | 'UI_INPUT' | 'UI_CHECKBOX';
  rawValue: string;
  sanitizedToken: string;
  confidence: number;
  bbox: BoundingBox;
  detectionMethod: DetectionMethod;
  redactionMethod: RedactionMethod;
  isPII: boolean;
  domSelector: string;
  description: string;
}

export interface AgentAction {
  type: 'CLICK' | 'FILL' | 'SCROLL' | 'UPLOAD' | 'VERIFY' | 'COMPLETE';
  targetSelector: string;
  targetLabel: string;
  sanitizedValue?: string | null;
  reason: string;
  confidenceScore: number;
  executedAt?: string;
  success?: boolean;
}

export interface AgentState {
  status: 'IDLE' | 'OBSERVING_DOM' | 'RUNNING_ViT_DETECTION' | 'APPLYING_PRIVACY_FILTER' | 'TRANSMITTING_SANITIZED' | 'SERVER_REASONING' | 'EXECUTING_ACTION' | 'TASK_COMPLETED';
  task: string;
  currentStepIndex: number;
  maxSteps: number;
  currentThought: string;
  currentPlan: string[];
  lastAction: AgentAction | null;
  actionHistory: AgentAction[];
  autoLoopActive: boolean;
  isGoalAchieved: boolean;
  serverSource: string;
}

export interface PrivacyConfig {
  confidenceThreshold: number; // e.g. 0.85
  enableViT: boolean;
  enableDomInspection: boolean;
  enableOcrRegex: boolean;
  zeroLeakFirewall: boolean;
  redactionMode: 'SEMANTIC_TOKENS' | 'BLACKOUT_ONLY' | 'MINIMAL_MASK';
  blurRadius: number;
}

export interface PrivacyAuditLogEntry {
  id: string;
  timestamp: string;
  category: string;
  elementLabel: string;
  tokenAssigned: string;
  confidence: number;
  detectionLayer: string;
  leakInspectionResult: 'ZERO_LEAK_CONFIRMED' | 'FLAGGED';
  redactionTimeMs: number;
}

export interface BenchmarkMetrics {
  visualAccuracy: number; // e.g. 95.2%
  piiRecall: number; // 99.4%
  piiPrecision: number; // 98.6%
  redactionPrecision: number; // 97.1%
  clientVramMb: number; // 42 MB
  jsBundleKb: number; // 480 KB
  cpuOverheadPct: number; // 4.5%
  localRedactionLatencyMs: number; // 24 ms
  endToEndLoopLatencyMs: number; // 410 ms
  totalPIIBlocked: number;
  rawLeaksRecorded: number;
}

export type ScenarioId = 'job_application' | 'banking_kyc' | 'ecommerce_checkout' | 'custom_sandbox';

export interface ScenarioPreset {
  id: ScenarioId;
  name: string;
  badge: string;
  category: string;
  description: string;
  defaultTask: string;
  url: string;
  elements: DetectedElement[];
}
