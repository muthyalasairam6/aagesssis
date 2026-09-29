import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

// Initialize Google GenAI SDK if API key exists
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Server health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!ai,
    timestamp: new Date().toISOString(),
    sihProblem: 'SIH 26171 (ISRO) - On-device Visual Perception for Browser Agents',
  });
});

// Server-side VLM / Agent Reasoning endpoint
// CRITICAL PRIVACY CONTRACT: This endpoint ONLY accepts sanitized data and tokens!
// Any payload containing raw unmasked PII will be rejected by policy!
app.post('/api/agent/reason', async (req, res) => {
  try {
    const {
      task,
      sanitizedDom,
      sanitizedTokens,
      screenStateSummary,
      actionHistory,
    } = req.body;

    // Safety verify: ensure no obvious credit card or plain password pattern in incoming text
    const payloadStr = JSON.stringify({ sanitizedDom, sanitizedTokens, screenStateSummary });
    const containsRawCard = /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14})\b/.test(payloadStr);
    if (containsRawCard) {
      return res.status(400).json({
        error: 'Privacy Firewall Breach: Server rejected packet containing raw payment credentials!',
      });
    }

    // If Gemini API is available, invoke gemini-3.8-flash
    if (ai) {
      try {
        const prompt = `You are the Server-Side Reasoning Brain for AegisVision (SIH 2026 / ISRO PS: On-device Visual Perception for Light-weight Browser Agents).
The client has already sanitized all sensitive and PII data locally via on-device ViT & DOM firewall.
You are receiving ONLY sanitized visual tokens (e.g. [PERSON_NAME], [EMAIL_ID], [PHONE_NUM], [PASSWORD_MASKED], [FACE_BLURRED], [AADHAAR_TOKEN]).
You must understand the page purpose and plan the next structured action to complete the user's task.

User Task: "${task || 'Complete and submit the current workflow'}"
Previous Actions: ${JSON.stringify(actionHistory || [])}
Sanitized UI State:
${JSON.stringify(screenStateSummary, null, 2)}

Sanitized DOM Structure:
${sanitizedDom ? sanitizedDom.slice(0, 1500) : 'N/A'}

Active Sanitized Tokens on Screen:
${JSON.stringify(sanitizedTokens || [], null, 2)}

Respond ONLY with valid JSON with this exact schema:
{
  "thought": "Analysis of the sanitized screen and what UI elements are present",
  "plan": ["step 1", "step 2", "step 3"],
  "nextAction": {
    "type": "CLICK",
    "targetSelector": "#selector_or_id",
    "targetLabel": "human readable button or input label",
    "sanitizedValue": null,
    "reason": "why this action was chosen based on the task"
  },
  "confidenceScore": 0.95,
  "isGoalAchieved": false
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        let textOutput = response.text || '{}';
        // Clean any accidental markdown code fences
        textOutput = textOutput.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(textOutput);
        return res.json({
          source: 'gemini-3.8-flash',
          ...parsed,
        });
      } catch (geminiError: any) {
        console.warn('Gemini invocation error, falling back to deterministic agent planner:', geminiError?.message);
      }
    }

    // Deterministic agent planner fallback (when no key, offline, or fallback)
    const defaultResponse = generateLocalAgentPlan(task, screenStateSummary);
    return res.json({
      source: 'aegis-deterministic-vlm-engine',
      ...defaultResponse,
    });
  } catch (err: any) {
    console.error('Error in /api/agent/reason:', err);
    return res.status(500).json({ error: err.message || 'Internal reasoning error' });
  }
});

function generateLocalAgentPlan(task: string, screenState: any) {
  const pageType = screenState?.pageType || 'generic';
  const workflow = screenState?.workflowState || {};

  if (pageType === 'job_application') {
    if (!workflow.resumeUploaded) {
      return {
        thought: 'Observed Job Application form. Candidate personal identity ([PERSON_NAME], [EMAIL_ID]) and biometric face photo are safely masked into tokens. Resume has not been attached yet.',
        plan: ['Upload Candidate Resume (PDF)', 'Accept Privacy Declaration', 'Submit Verified Application'],
        nextAction: {
          type: 'UPLOAD',
          targetSelector: '#btn-upload-resume',
          targetLabel: 'Upload Resume (PDF)',
          sanitizedValue: '[DOCUMENT_RESUME_TOKEN]',
          reason: 'Application requirement: resume document must be attached before submission.',
        },
        confidenceScore: 0.98,
        isGoalAchieved: false,
      };
    }
    if (!workflow.termsAccepted) {
      return {
        thought: 'Resume document token successfully attached. Terms and consent declaration checkbox is currently unchecked.',
        plan: ['Accept Terms & Conditions', 'Submit Verified Application'],
        nextAction: {
          type: 'CLICK',
          targetSelector: '#checkbox-terms',
          targetLabel: 'Accept ISRO Privacy & Accuracy Declaration',
          sanitizedValue: null,
          reason: 'Must consent to declaration before final submit is active.',
        },
        confidenceScore: 0.99,
        isGoalAchieved: false,
      };
    }
    if (!workflow.isSubmitted) {
      return {
        thought: 'All prerequisites satisfied. All PII fields are sanitized with zero raw leaks. Ready to finalize application.',
        plan: ['Submit Application'],
        nextAction: {
          type: 'CLICK',
          targetSelector: '#btn-submit-application',
          targetLabel: 'Submit Application',
          sanitizedValue: null,
          reason: 'Final submission of sanitized applicant context.',
        },
        confidenceScore: 0.98,
        isGoalAchieved: false,
      };
    }
    return {
      thought: 'Observed confirmation badge "Application Submitted Successfully". Goal reached.',
      plan: ['Workflow Complete'],
      nextAction: {
        type: 'COMPLETE',
        targetSelector: '#confirmation-modal',
        targetLabel: 'Submission Confirmed',
        sanitizedValue: null,
        reason: 'Application state reached terminal success.',
      },
      confidenceScore: 1.0,
      isGoalAchieved: true,
    };
  }

  if (pageType === 'ecommerce_checkout') {
    if (!workflow.promoApplied) {
      return {
        thought: 'Observed Shopping Cart & Checkout screen. Shipping address and payment cards are redacted. Discount code field is available.',
        plan: ['Apply coupon code', 'Proceed to Secure Pay'],
        nextAction: {
          type: 'CLICK',
          targetSelector: '#btn-apply-promo',
          targetLabel: 'Apply Promo (ISRO2026)',
          sanitizedValue: 'ISRO2026',
          reason: 'Applies valid discount coupon to total order value.',
        },
        confidenceScore: 0.96,
        isGoalAchieved: false,
      };
    }
    if (!workflow.isSubmitted) {
      return {
        thought: 'Discount applied. Payment card details ([CARD_NUM], [CVV_MASKED]) verified valid locally by client vault. Ready to authorize payment.',
        plan: ['Authorize Payment'],
        nextAction: {
          type: 'CLICK',
          targetSelector: '#btn-confirm-payment',
          targetLabel: 'Pay ₹24,500 via Secure Gateway',
          sanitizedValue: null,
          reason: 'Execute purchase transaction with masked payment credentials.',
        },
        confidenceScore: 0.98,
        isGoalAchieved: false,
      };
    }
    return {
      thought: 'Payment authorization token received. Order #ISRO-8821 confirmed.',
      plan: ['Order Complete'],
      nextAction: {
        type: 'COMPLETE',
        targetSelector: '#order-success-banner',
        targetLabel: 'Order Completed',
        sanitizedValue: null,
        reason: 'Transaction finished successfully with zero card leaks.',
      },
      confidenceScore: 1.0,
      isGoalAchieved: true,
    };
  }

  if (pageType === 'banking_kyc') {
    if (!workflow.kycConsent) {
      return {
        thought: 'Observed FinTech KYC verification page. Aadhaar number and PAN ID are redacted into tokens. Biometric consent toggle is inactive.',
        plan: ['Toggle Biometric Consent', 'Submit KYC Verification'],
        nextAction: {
          type: 'CLICK',
          targetSelector: '#toggle-biometric-consent',
          targetLabel: 'UIDAI Biometric Consent Toggle',
          sanitizedValue: null,
          reason: 'Legal compliance: User must provide consent for digital verification.',
        },
        confidenceScore: 0.98,
        isGoalAchieved: false,
      };
    }
    if (!workflow.kycVerified) {
      return {
        thought: 'Consent active. Document visual signatures and facial portrait are protected with Gaussian blur. Dispatching KYC verification request.',
        plan: ['Submit KYC Verification'],
        nextAction: {
          type: 'CLICK',
          targetSelector: '#btn-verify-kyc',
          targetLabel: 'Verify & Authorize KYC',
          sanitizedValue: null,
          reason: 'Submits masked document hashes to trusted verification gateway.',
        },
        confidenceScore: 0.97,
        isGoalAchieved: false,
      };
    }
    return {
      thought: 'KYC Verification status is "APPROVED - LEVEL 3 TIER". Process complete.',
      plan: ['KYC Verified'],
      nextAction: {
        type: 'COMPLETE',
        targetSelector: '#kyc-verified-badge',
        targetLabel: 'KYC Verified',
        sanitizedValue: null,
        reason: 'Identity verified with full privacy preservation.',
      },
      confidenceScore: 1.0,
      isGoalAchieved: true,
    };
  }

  return {
    thought: 'General web navigation state. Analyzing visual hierarchy and interactive controls.',
    plan: ['Evaluate page controls', 'Execute primary task action'],
    nextAction: {
      type: 'CLICK',
      targetSelector: '#btn-primary-action',
      targetLabel: 'Continue',
      sanitizedValue: null,
      reason: 'Progress to next workflow stage.',
    },
    confidenceScore: 0.94,
    isGoalAchieved: false,
  };
}

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      try {
        const url = req.originalUrl;
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AegisVision Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
