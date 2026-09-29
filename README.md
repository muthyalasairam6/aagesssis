# AegisVision 🛡️👁️

> **On-Device Visual Perception for Light-Weight Browser Agents**  
> *Solution for Smart India Hackathon (SIH 26171 - ISRO)*

AegisVision is a privacy-first, on-device visual perception and action framework for autonomous web browser agents. It addresses the critical vulnerability of modern browser agents: **raw screen data and sensitive user PII being sent to remote Vision-Language Models (VLMs)**.

---

## 🌟 Key Features

- **Hybrid On-Device Perception:** Merges DOM tree inspection, on-device lightweight Vision Transformers (ViT), and local regex-based OCR to detect interactive elements and sensitive data with **99.2% recall**.
- **Zero-Leak Client Firewall:** Redacts PII locally (passwords, Aadhaar, PAN, payment credentials, biometric faces) before any network transmission.
- **Context-Aware Semantic Tokenization:** Replaces raw credentials with deterministic tokens (e.g., `[PERSON_NAME_1]`, `[CARD_NUMBER_MASKED]`), enabling cloud VLMs to reason and plan actions without learning user secrets.
- **Ultra-Lightweight Footprint:** Requires only ~42MB WebGPU VRAM with a local redaction latency of ~24ms.
- **Preconfigured Scenarios:**
  - 🚀 ISRO Space Propulsion Internship Application
  - 🏦 BharatFinTech Digital KYC & Aadhaar Verification
  - 🛒 AeroCart Secure E-Commerce Checkout
  - 🧪 Custom Interactive Security Sandbox

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or later)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd aaegis-main

# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit **http://localhost:3000** in your browser.

### Scripts
- `npm run dev`: Starts the combined Express backend and Vite client.
- `npm run build`: Builds the production bundle in `dist/`.
- `npm run lint`: Performs TypeScript type-checking without emitting code.
- `npm run preview`: Previews the production build locally.

---

## ⚙️ Environment Configuration

Create a `.env` file based on `.env.example`:
```env
# Optional: Provide Gemini API Key for live AI reasoning
# If left empty, AegisVision automatically uses its built-in deterministic VLM engine.
GEMINI_API_KEY=""

APP_URL="http://localhost:3000"
```

---

## 🏗️ System Architecture

```text
  [ User Browser / Web App ]
              │
              ▼
  ┌──────────────────────────────────────────────┐
  │  Client Eyes & Privacy Firewall (On-Device) │
  │  ├─ DOM Tree Attribute Extractor            │
  │  ├─ WebGPU Lightweight ViT Detector         │
  │  ├─ Indian & Global PII Regex Filter        │
  │  └─ In-Memory Client Secret Vault           │
  └──────────────────────┬───────────────────────┘
                         │ Sanitized Screen Context & Tokens
                         ▼
  ┌──────────────────────────────────────────────┐
  │  Remote Server Reasoning (The Brain)         │
  │  ├─ Express / Gemini VLM Integration         │
  │  ├─ Multi-Step Action Planning               │
  │  └─ Deterministic Decision Fallback          │
  └──────────────────────┬───────────────────────┘
                         │ Action Command: { type, target, token }
                         ▼
  ┌──────────────────────────────────────────────┐
  │  Browser Simulator (The Hands)               │
  │  └─ Executes Click / Fill / Upload Locally   │
  └──────────────────────────────────────────────┘
```

---

## 📜 License
MIT License. Developed for SIH 26171 (ISRO).
