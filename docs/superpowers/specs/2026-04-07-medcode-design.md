# MedCode — Medical Coding Lookup App

## Overview

MedCode is a web application that allows users to search for medical billing codes (ICD-10 and CPT) by typing in symptoms, conditions, or procedures. It serves multiple user types — from medical billing professionals to healthcare providers to general users — with an interface that is fast, accurate, and accessible regardless of coding experience.

## Architecture

**Approach: Monolith with extractable service layer (Next.js)**

A single Next.js application handles the frontend and API routes. Business logic lives in a framework-agnostic service layer that can be extracted into a standalone API server when a mobile app is needed.

```
Next.js App
├── Frontend (React + Tailwind CSS)
│   ├── Search-centered home page
│   ├── Results dashboard with filters/sidebar
│   ├── Code detail view
│   └── Guided flow wizard
├── API Routes (thin layer)
│   ├── /api/search
│   ├── /api/codes/[id]
│   └── /api/guided
└── Service Layer (extractable)
    ├── CodeService interface
    ├── MockCodeService (MVP)
    ├── SearchEngine (fuzzy matching)
    └── GuidedFlow (decision tree)
```

API routes are thin — they validate input and delegate to the service layer. The service layer is framework-agnostic and defines a clean interface (`CodeService`) that can be implemented against mock data (MVP) or real APIs (later).

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Data (MVP):** Bundled JSON mock data
- **Data (future):** NLM API (ICD-10), CMS API (CPT)
- **AI (future):** Claude API with BAA

## Core Features

### 1. Quick Search

Users type a term (e.g., "chest pain") into a search bar. Fuzzy matching returns a ranked list of codes, each showing: code, description, category, and code system (ICD-10 or CPT). Results are filterable by code system.

### 2. Guided Flow

A step-by-step wizard that narrows down the right code through questions. Built from a decision tree that follows the code hierarchy (chapters → sections → categories → codes). Ends with a specific code recommendation and explanation. Activated via a "Help Me Find a Code" button or when the system detects a vague query.

### 3. AI-Powered Lookup (Phase 2+)

Natural language input (e.g., "patient came in with a 3-day headache and nausea") interpreted by Claude API. Returns matching codes with confidence levels. Designed with no-PHI guardrails — input disclaimer, no data persistence. Behind a feature flag.

### Common Features

- Click any code to see full details (description, includes/excludes, related codes)
- Copy code to clipboard with one click
- Recent searches on home page (localStorage only, no server storage)

## UI Layout

**Hybrid: Search-centered home → Dashboard results**

- **Home page:** Clean, centered search bar with filter buttons (ICD-10, CPT) and a "Help Me Find a Code" button. Recent searches displayed below.
- **Results page:** Search bar moves to top. Filter sidebar on the left (code system, category). Ranked results list in the main content area. Each result is a clickable card with code, description, and category.
- **Code detail page:** Full information about a single code — description, includes/excludes, related codes, copy button.
- **Guided flow page:** Step-by-step wizard with a question, multiple-choice options, and a progress indicator.

Mobile-responsive via Tailwind utilities.

## Data Model

### Medical Code

```typescript
interface MedicalCode {
  code: string;
  system: "ICD-10" | "CPT";
  description: string;
  category: string;
  keywords: string[];
  details: {
    includes?: string[];
    excludes?: string[];
    relatedCodes?: string[];
  };
}
```

### Guided Flow Node

```typescript
interface GuidedNode {
  id: string;
  question: string;
  options: {
    label: string;
    nextNodeId?: string;
    resultCodes?: string[];
  }[];
}
```

### Service Interface

```typescript
interface CodeService {
  search(query: string, filters?: SearchFilters): MedicalCode[];
  getByCode(code: string): MedicalCode | null;
  getCategories(system: CodeSystem): Category[];
  getGuidedFlowStart(): GuidedNode;
  getGuidedFlowNext(nodeId: string): GuidedNode;
}
```

## Mock Data (MVP)

- ~200 common ICD-10 codes covering frequently billed diagnoses
- ~100 common CPT codes covering common office visits, labs, imaging
- Organized by category for the guided flow decision tree
- Bundled as JSON files in `src/data/`

When ready to go live, implement the same `CodeService` interface against NLM/CMS APIs — no frontend changes needed.

## Project Structure

```
med/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── results/page.tsx
│   │   ├── code/[id]/page.tsx
│   │   ├── guided/page.tsx
│   │   └── api/
│   │       ├── search/route.ts
│   │       ├── codes/[id]/route.ts
│   │       └── guided/route.ts
│   ├── services/
│   │   ├── codeService.ts
│   │   ├── mockCodeService.ts
│   │   ├── searchEngine.ts
│   │   └── guidedFlow.ts
│   ├── data/
│   │   ├── icd10.json
│   │   ├── cpt.json
│   │   └── guidedFlowTree.json
│   ├── components/
│   │   ├── SearchBar.tsx
│   │   ├── CodeCard.tsx
│   │   ├── CodeDetail.tsx
│   │   ├── FilterSidebar.tsx
│   │   ├── GuidedStep.tsx
│   │   └── RecentSearches.tsx
│   └── types/
│       └── index.ts
├── package.json
├── tsconfig.json
├── next.config.js
└── tailwind.config.ts
```

## Compliance & Security

### Design Principle

The app never stores or transmits PHI. It is a reference tool, not a patient record system. This keeps the compliance surface area small.

### MVP (No PHI)

- No user accounts, no data persistence on the server
- Search history in localStorage only (never leaves the browser)
- Mock data — no external API calls with user input
- HTTPS enforced in production
- No analytics or tracking that could capture search terms

### Phase 2: Real APIs

- External API calls proxied through server-side routes (API keys never exposed to client)
- No logging of user search queries on the server
- Rate limiting on API routes

### Phase 3: AI Integration

- BAA with Anthropic before sending any potentially sensitive input
- Input disclaimer: "Do not enter patient names or identifying information"
- No persistence of AI queries or responses server-side
- Audit logging (what was requested, not the content) for SOC 2

### Phase 4: Authentication

- SOC 2 Type II controls: encrypted data at rest/in transit, access controls, audit logs
- Auth provider with HIPAA support (e.g., Auth0 with BAA)
- Role-based access for premium features

## Phased Rollout

1. **MVP:** Mock data + quick search + guided flow + hybrid UI
2. **Phase 2:** Real NLM/CMS API integration
3. **Phase 3:** Claude API with BAA for AI-powered lookup
4. **Phase 4:** User accounts, auth, roles

## Target Users

- Medical billing professionals / coders
- Healthcare providers (doctors, nurses)
- Patients / general public understanding their bills
- The UI must be accessible to non-experts while powerful for professionals
