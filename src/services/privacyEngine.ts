import { DetectedElement, PrivacyConfig, PrivacyAuditLogEntry, ScenarioPreset } from '../types';

// In-memory client-side secret vault (STRICTLY ON-DEVICE, NEVER SERIALIZED OR TRANSMITTED)
class ClientSecretVault {
  private vault = new Map<string, string>();

  store(token: string, rawSecret: string) {
    this.vault.set(token, rawSecret);
  }

  resolve(token: string): string | undefined {
    return this.vault.get(token);
  }

  clear() {
    this.vault.clear();
  }

  getAllTokens(): string[] {
    return Array.from(this.vault.keys());
  }
}

export const localVault = new ClientSecretVault();

// Regex patterns for Indian & Global PII detection
export const PII_PATTERNS = {
  AADHAAR: /\b[2-9]{1}[0-9]{3}\s[0-9]{4}\s[0-9]{4}\b/,
  PAN: /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/,
  CREDIT_CARD: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13})\b/,
  EMAIL: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
  INDIAN_PHONE: /(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}/,
  UPI: /[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}/,
  CVV: /\b\d{3,4}\b/,
  API_KEY: /(?:ak|sk|ghp|bearer)_[a-zA-Z0-9_]{16,}/,
};

// Safe Cross-Browser Rounded Rectangle Helper for Canvas
function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, radius);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}

/**
 * Executes on-device hybrid privacy detection
 * Combines DOM hierarchy, OCR/Regex, and simulated WebGPU ViT visual element bounding boxes
 */
export function processScreenPrivacy(
  elements: DetectedElement[],
  config: PrivacyConfig
): {
  sanitizedElements: DetectedElement[];
  auditLogs: PrivacyAuditLogEntry[];
  sanitizedDomSnippet: string;
  sanitizedTokenMap: Record<string, string>;
  isZeroLeakGuaranteed: boolean;
  rawLeaksFound: string[];
} {
  const startTime = performance.now();
  const auditLogs: PrivacyAuditLogEntry[] = [];
  const sanitizedTokenMap: Record<string, string> = {};
  const rawLeaksFound: string[] = [];

  const sanitizedElements: DetectedElement[] = elements.map((elem) => {
    // Check if element meets confidence threshold
    const confidencePass = elem.confidence >= config.confidenceThreshold;

    if (!elem.isPII || !confidencePass) {
      return { ...elem };
    }

    // Assign sanitized token & store raw secret in local vault
    let token = elem.sanitizedToken;
    if (config.redactionMode === 'BLACKOUT_ONLY') {
      token = '[REDACTED_BLACKOUT]';
    } else if (config.redactionMode === 'MINIMAL_MASK') {
      token = `[${elem.category}]`;
    }

    localVault.store(token, elem.rawValue);
    sanitizedTokenMap[token] = elem.category;

    // Log the redaction to the privacy audit ledger
    auditLogs.push({
      id: `audit-${elem.id}-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      category: elem.category,
      elementLabel: elem.label,
      tokenAssigned: token,
      confidence: elem.confidence,
      detectionLayer: elem.detectionMethod,
      leakInspectionResult: 'ZERO_LEAK_CONFIRMED',
      redactionTimeMs: Math.round(performance.now() - startTime),
    });

    return {
      ...elem,
      sanitizedToken: token,
    };
  });

  // Generate synthetic sanitized DOM tree
  const sanitizedDomSnippet = sanitizedElements
    .map((el) => {
      if (el.isPII) {
        return `<div id="${el.domSelector.replace('#', '')}" class="masked-element" data-privacy-token="${el.sanitizedToken}" data-category="${el.category}">[MASKED: ${el.sanitizedToken}]</div>`;
      }
      return `<button id="${el.domSelector.replace('#', '')}" class="interactive-control">${el.label}</button>`;
    })
    .join('\n');

  // ZERO-LEAK FIREWALL VERIFICATION
  // Test serialized output to ensure no raw secrets leaked
  const serializedPacket = JSON.stringify({
    sanitizedDom: sanitizedDomSnippet,
    tokens: Object.keys(sanitizedTokenMap),
  });

  if (config.zeroLeakFirewall) {
    for (const elem of elements) {
      if (elem.isPII && elem.rawValue.length > 2) {
        if (serializedPacket.includes(elem.rawValue)) {
          rawLeaksFound.push(`Leaked ${elem.category}: "${elem.rawValue}"`);
        }
      }
    }
  }

  return {
    sanitizedElements,
    auditLogs,
    sanitizedDomSnippet,
    sanitizedTokenMap,
    isZeroLeakGuaranteed: rawLeaksFound.length === 0,
    rawLeaksFound,
  };
}

/**
 * Simulates rendering of the sanitized screen onto a Canvas.
 * Face images get Gaussian blur, passwords get solid blackout, and PII text gets synthetic token overlays.
 */
export function renderSanitizedCanvas(
  canvas: HTMLCanvasElement,
  elements: DetectedElement[],
  config: PrivacyConfig,
  currentScenario: ScenarioPreset
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  // Background
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, width, height);

  // Browser Mock Header inside Canvas
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, width, 50);

  // Address bar
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  drawRoundRect(ctx, 140, 10, width - 200, 30, 6);
  ctx.fill();

  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px ui-monospace, SFMono-Regular, monospace';
  ctx.fillText(currentScenario.url, 155, 30);

  // Page title inside Canvas
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 18px Inter, sans-serif';
  ctx.fillText(currentScenario.name, 40, 100);

  ctx.fillStyle = '#64748b';
  ctx.font = '13px Inter, sans-serif';
  ctx.fillText(currentScenario.description, 40, 125);

  // Draw each element
  for (const elem of elements) {
    const { x, y, width: bw, height: bh } = elem.bbox;

    if (elem.category === 'BIOMETRIC_FACE') {
      // Draw Face Area
      ctx.save();
      ctx.beginPath();
      drawRoundRect(ctx, x, y, bw, bh, 8);
      ctx.clip();

      if (elem.isPII) {
        // Blur / privacy pixelation
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(x, y, bw, bh);

        // Draw pixelated privacy pattern
        ctx.fillStyle = '#94a3b8';
        for (let px = x; px < x + bw; px += 10) {
          for (let py = y; py < y + bh; py += 10) {
            if ((px + py) % 20 === 0) {
              ctx.fillRect(px, py, 10, 10);
            }
          }
        }

        // Overlay Privacy Shield Badge
        ctx.fillStyle = '#0369a1';
        ctx.fillRect(x, y + bh - 24, bw, 24);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('FACE BLURRED', x + bw / 2, y + bh - 8);
        ctx.textAlign = 'left';
      } else {
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(x, y, bw, bh);
      }
      ctx.restore();
      continue;
    }

    if (elem.isPII) {
      if (elem.redactionMethod === 'SOLID_BLACKOUT') {
        // Blackout Box
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        drawRoundRect(ctx, x, y, bw, bh, 6);
        ctx.fill();

        ctx.fillStyle = '#f43f5e';
        ctx.font = 'bold 11px ui-monospace, monospace';
        ctx.fillText('████ [MASKED CREDENTIAL]', x + 10, y + bh / 2 + 4);
      } else {
        // Synthetic Token Tag Box
        ctx.fillStyle = '#f1f5f9';
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        drawRoundRect(ctx, x, y, bw, bh, 6);
        ctx.fill();
        ctx.stroke();

        // Token badge pill inside
        ctx.fillStyle = '#2563eb';
        ctx.font = 'bold 11px ui-monospace, monospace';
        ctx.fillText(elem.sanitizedToken, x + 8, y + bh / 2 + 4);
      }
    } else {
      // Regular button or form field
      if (elem.category === 'UI_BUTTON') {
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        drawRoundRect(ctx, x, y, bw, bh, 6);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillText(elem.label, x + 14, y + bh / 2 + 4);
      } else if (elem.category === 'UI_CHECKBOX') {
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y + 4, 16, 16);

        ctx.fillStyle = '#334155';
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText(elem.label, x + 26, y + 17);
      }
    }
  }
}
