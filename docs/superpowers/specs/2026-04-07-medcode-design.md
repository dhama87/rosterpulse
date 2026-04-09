# MedCode — Medical Coding & Billing Platform

## Overview

MedCode is a web application that allows users to search for medical billing codes by typing in symptoms, conditions, or procedures. It serves multiple user types — from medical billing professionals to healthcare providers to general users — with an interface that is fast, accurate, and accessible regardless of coding experience.

Beyond code lookup, MedCode provides the billing context coders need: modifiers, crosswalks, CCI bundling edits, fee schedules, denial code references, documentation requirements, and interactive tools like an E/M level calculator.

## Architecture

**Approach: Monolith with extractable service layer (Next.js)**

A single Next.js application handles the frontend and API routes. Business logic lives in a framework-agnostic service layer that can be extracted into a standalone API server when a mobile app is needed.

```
Next.js App
├── Frontend (React + Tailwind CSS)
│   ├── Search-centered home page
│   ├── Results dashboard with filters/sidebar
│   ├── Code detail view (with full billing context)
│   ├── Guided flow wizard
│   ├── E/M calculator
│   ├── CARC/RARC denial code reference
│   ├── Code update tracker
│   └── Modifier decision tree
├── API Routes (thin layer)
│   ├── /api/search
│   ├── /api/codes/[id]
│   ├── /api/guided
│   ├── /api/em-calculator
│   └── /api/denials
└── Service Layer (extractable)
    ├── CodeService interface
    ├── MockCodeService (MVP)
    ├── SearchEngine (fuzzy matching)
    ├── GuidedFlow (decision tree)
    ├── EMCalculator (MDM logic)
    └── SequencingEngine (code-first/use-additional rules)
```

API routes are thin — they validate input and delegate to the service layer. The service layer is framework-agnostic and defines a clean interface (`CodeService`) that can be implemented against mock data (MVP) or real APIs (later).

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Data (MVP):** Bundled JSON mock data (public-domain code systems only)
- **Data (future):** NLM API (ICD-10), CMS APIs (HCPCS, fee schedules, CCI edits)
- **AI (future):** Claude API with BAA

## Code System Licensing & Attribution

Every page displaying code data must cite the authoritative source. Code systems have different licensing requirements:

### Public Domain (free to use — no license required)

| Code System | Owner | Source |
|---|---|---|
| ICD-10-CM/PCS | WHO / CMS | cms.gov/medicare/coding-billing |
| HCPCS Level II | CMS | cms.gov/medicare/coding-billing/hcpcs-release-code-sets |
| CCI/NCCI Edits | CMS | cms.gov/medicare/coding-billing/national-correct-coding-initiative-edits |
| Medicare Fee Schedule (MPFS) | CMS | cms.gov/medicare/payment/physician-fee-schedule |
| Place of Service Codes | CMS | cms.gov/medicare/coding-billing/place-of-service-codes |
| MS-DRG | CMS | cms.gov/medicare/payment/prospective-payment-systems |
| NDC Codes | FDA | fda.gov/drugs/drug-approvals-and-databases/national-drug-code-directory |
| CARC/RARC Codes | X12 / CMS | x12.org/codes |

### License Required

| Code System | Owner | License | Notes |
|---|---|---|---|
| **CPT** | **AMA** | **Paid license required** | Cannot display CPT descriptions without AMA license |
| **Revenue Codes** | **NUBC** | **License required** | UB-04 revenue code descriptions |

### MVP Strategy

Launch with **public-domain code systems only** (ICD-10, HCPCS, CCI edits, fee schedules, POS, CARC/RARC). Add CPT after obtaining AMA license in Phase 2.

### Required Attribution

Every page displaying code data must include a footer citation:

> "ICD-10-CM codes maintained by CMS (cms.gov). HCPCS codes maintained by CMS. Fee schedule data from the Medicare Physician Fee Schedule. CARC/RARC codes from X12 (x12.org)."

When CPT is added (Phase 2+):

> "CPT® copyright [year] American Medical Association. All rights reserved."

## Core Features

### Tier 1 — Code Lookup & Navigation

#### 1. Quick Search

Users type a term (e.g., "chest pain") into a search bar. Fuzzy matching returns a ranked list of codes, each showing: code, description, category, and code system. Results are filterable by code system, specialty, and category.

#### 2. Guided Flow

Step-by-step wizard that narrows down the right code through clinical questions. Built from a decision tree following the code hierarchy (chapters → sections → categories → codes). Ends with a specific code recommendation and explanation. Activated via "Help Me Find a Code" button.

#### 3. Code Detail View (with full billing context)

Clicking any code shows a comprehensive detail page with:

- **Description** — full code description with includes/excludes notes
- **Code sequencing rules** — "code first," "use additional code," etiology/manifestation pairing guidance
- **7th character & laterality helper** — interactive picker for ICD-10 codes requiring a 7th character (initial/subsequent/sequela) and laterality (left/right/bilateral)
- **Applicable modifiers** — common modifiers for the code with usage rules (HCPCS modifiers for MVP; CPT modifiers after licensing)
- **CCI bundling alerts** — NCCI column 1/2 pairs and mutually exclusive codes that would cause denials
- **Fee schedule data** — Medicare MPFS with RVUs, conversion factor, facility vs non-facility rates
- **Crosswalks** — ICD-10 ↔ procedure code mapping showing which diagnoses support which procedures
- **Medical necessity** — LCD/NCD coverage verification
- **Documentation requirements** — MDM levels, time-based billing rules, history/exam documentation guidance
- **Place of service codes** — applicable POS codes for the service
- **Payer-specific rules** — Medicare vs Medicaid vs commercial payer variations (timely filing, prior auth, frequency limits, telehealth policy)
- **Common denial reasons** — top CARC/RARC codes associated with this code and how to avoid them
- **Related codes** — similar codes for comparison (e.g., E/M level ladder)
- **Age/sex edits** — flag if code is restricted by patient age or sex

#### 4. E/M Level Calculator

Interactive worksheet where coders input MDM elements and the calculator recommends the correct E/M level:

- **Input:** Number/complexity of problems addressed, amount/complexity of data reviewed, risk of complications
- **Output:** Recommended E/M code with explanation of why that level was selected
- **Time-based option:** Enter total time for time-based code selection
- **Source:** Based on 2021+ AMA/CMS E/M guidelines

#### 5. 7th Character & Laterality Helper

ICD-10 codes often require a 7th character and laterality specification. This interactive picker:

- Shows available 7th character options (A = initial encounter, D = subsequent, S = sequela, plus code-specific characters like fracture healing status)
- Shows laterality options (right, left, bilateral, unspecified)
- Prevents submission of truncated/invalid codes
- Explains when each option applies

#### 6. Code Sequencing Rules

Built into the code detail view:

- **"Code first"** instructions — which code must be sequenced first
- **"Use additional code"** instructions — what additional codes are required
- **Etiology/manifestation pairs** — links the underlying disease to its manifestation
- **"Code also"** notes — related conditions that should be coded together

### Tier 2 — Billing & Compliance Tools

#### 7. Modifiers Reference & Decision Tree

Full modifier reference with:

- Complete list of HCPCS modifiers (MVP) and CPT modifiers (after licensing)
- Usage rules and common errors
- **Interactive modifier decision tree** — guided questions like "Was a separate E/M performed on the same day as a procedure?" → recommends -25
- Examples of correct vs incorrect modifier usage

#### 8. CCI Edits / Bundling Checker

- Search any two codes to check if they can be billed together
- Column 1/Column 2 code pairs with effective dates
- Mutually exclusive code pairs
- Modifier indicators (0 = never override, 1 = modifier allowed, 9 = N/A)
- Source: CMS NCCI edit files, updated quarterly

#### 9. Fee Schedule Lookup

- Medicare Physician Fee Schedule (MPFS) lookup by code
- Work RVU, practice expense RVU, malpractice RVU
- Conversion factor and geographic GPCI adjustments
- Facility vs non-facility rates
- Source: CMS MPFS files, updated annually

#### 10. CARC/RARC Denial Code Reference

Searchable reference for understanding claim denials:

- **CARC (Claim Adjustment Reason Codes)** — why the payer adjusted the claim
- **RARC (Remittance Advice Remark Codes)** — additional explanation
- **Group Codes** — CO (contractual), PR (patient responsibility), OA (other adjustment), PI (payer initiated)
- Each code includes: description, common causes, resolution steps, frequency indicator
- Filterable by type (CARC/RARC/Group) and searchable by description
- Source: X12 and CMS code lists

#### 11. Code Update Tracker

Track annual and quarterly code changes:

- **ICD-10** updates (effective October 1 each year)
- **HCPCS** updates (quarterly)
- **CPT** updates (effective January 1 — after licensing)
- Each update shows: new codes, revised codes, deleted codes with replacement mappings
- Summary statistics (count of changes per update cycle)
- Source: CMS and AMA release files

#### 12. Medical Necessity Verification

- LCD (Local Coverage Determination) and NCD (National Coverage Determination) reference
- Check if a diagnosis supports a procedure for Medicare coverage
- MAC (Medicare Administrative Contractor) regional variations
- Source: CMS Medicare Coverage Database

### Common Features (All Tiers)

- **Favorites & code sets** — save frequently used codes and code combinations to localStorage (e.g., "Diabetes wellness visit" = E11.9 + 99214 + 83036). No server storage.
- **Copy code to clipboard** — one-click copy for any code
- **Recent searches** — shown on home page (localStorage only)
- **Source citations** — every data point attributed to its authoritative source
- **Browse by specialty** — 12 medical specialties: Cardiology, Neurology, Orthopedics, Gastroenterology, Pulmonology, Endocrinology, Dermatology, Ophthalmology, Oncology, Psychiatry, Urology, ENT

## UI Layout

**Hybrid: Search-centered home → Dashboard results**

- **Home page:** Centered search bar with filter pills (ICD-10, HCPCS, Modifiers, CARC/RARC), "Guided Code Finder" button. Feature cards for all 12 tools. Specialty browse grid. Additional code systems row (POS, Revenue, DRG, NDC).
- **Results page:** Search bar in nav. Filter sidebar (code system, specialty, category). Ranked results with code, description, system badge, copy button.
- **Code detail page:** Full billing context — two-column layout with main content (description, sequencing, modifiers, CCI alerts, documentation, payer rules) and sidebar (fee schedule, POS, related codes, common denials, revenue codes).
- **E/M calculator page:** Interactive form with MDM element inputs and real-time level recommendation.
- **Denial codes page:** Searchable table with code, type, description, resolution steps, frequency indicator. Filterable by CARC/RARC/Group.
- **Code updates page:** Summary cards (new/revised/deleted counts) and chronological update feed with system filter.
- **Guided flow page:** Step-by-step wizard with progress bar, body-system selection, and narrowing questions.
- **Modifier decision tree page:** Interactive Q&A flow that recommends the correct modifier.

Mobile-responsive via Tailwind utilities.

## Data Model

### Medical Code

```typescript
interface MedicalCode {
  code: string;
  system: CodeSystem;
  description: string;
  category: string;
  specialty: string;
  keywords: string[];
  details: {
    includes?: string[];
    excludes1?: string[];     // "excludes 1" — mutually exclusive
    excludes2?: string[];     // "excludes 2" — not included here, code separately
    relatedCodes?: string[];
    codeFirst?: string;       // sequencing instruction
    useAdditionalCode?: string;
    codeAlso?: string;
    seventhCharacters?: SeventhCharOption[];
    laterality?: LateralityOption[];
    ageRestriction?: { min?: number; max?: number };
    sexRestriction?: "M" | "F";
  };
  billing: {
    modifiers?: ModifierReference[];
    cciEdits?: CCIEdit[];
    feeSchedule?: FeeData;
    placeOfService?: POSCode[];
    commonDenials?: DenialReference[];
    medicalNecessity?: NecessityInfo;
    documentationReqs?: string[];
    payerRules?: PayerRule[];
  };
  source: {
    system: string;           // "CMS", "AMA", "X12"
    url: string;              // authoritative source URL
    lastUpdated: string;      // ISO date
  };
}
```

### Supporting Types

```typescript
type CodeSystem = "ICD-10" | "HCPCS" | "CPT";

interface SearchFilters {
  system?: CodeSystem;
  category?: string;
  specialty?: string;
}

interface Category {
  id: string;
  name: string;
  system: CodeSystem;
  codeCount: number;
}

interface SeventhCharOption {
  character: string;
  description: string;          // e.g., "A — Initial encounter"
}

interface LateralityOption {
  digit: string;
  description: string;          // e.g., "1 — Right", "2 — Left"
}

interface ModifierReference {
  code: string;                 // e.g., "-25", "-59"
  description: string;
  usageGuidance: string;
  system: "HCPCS" | "CPT";
}

interface CCIEdit {
  column1Code: string;
  column2Code: string;
  modifierIndicator: "0" | "1" | "9";
  effectiveDate: string;
  deletionDate?: string;
}

interface FeeData {
  year: number;
  nonFacilityRate: number;
  facilityRate: number;
  workRVU: number;
  practiceExpenseRVU: number;
  malpracticeRVU: number;
  totalRVU: number;
  conversionFactor: number;
}

interface POSCode {
  code: string;
  description: string;          // e.g., "11 — Office"
}

interface DenialReference {
  code: string;                 // e.g., "CO-97"
  type: "CARC" | "RARC" | "Group";
  description: string;
  resolution: string;
  frequency: "high" | "medium" | "low";
}

interface PayerRule {
  payer: string;                // "Medicare", "Medicaid", "BCBS", etc.
  timelyFiling: string;
  priorAuth: string;
  frequencyLimit?: string;
  telehealth?: string;
  notes?: string;
}

interface NecessityInfo {
  covered: boolean;
  lcdId?: string;
  ncdId?: string;
  notes: string;
}
```

### E/M Calculator Types

```typescript
interface EMCalculatorInput {
  mode: "mdm" | "time";
  // MDM-based
  problemCount?: "minimal" | "limited" | "multiple" | "extensive";
  dataComplexity?: "minimal" | "limited" | "moderate" | "extensive";
  riskLevel?: "minimal" | "low" | "moderate" | "high";
  // Time-based
  totalMinutes?: number;
  patientType?: "new" | "established";
}

interface EMCalculatorResult {
  recommendedCode: string;
  level: number;
  explanation: string;
  mdmLevel: string;
  timeRange?: string;
  documentationTips: string[];
}
```

### Guided Flow Node

```typescript
interface GuidedNode {
  id: string;
  question: string;
  options: {
    label: string;
    description?: string;
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
  calculateEMLevel(input: EMCalculatorInput): EMCalculatorResult;
  checkCCIEdits(code1: string, code2: string): CCIEdit | null;
  searchDenialCodes(query: string, type?: string): DenialReference[];
  getCodeUpdates(system?: CodeSystem): CodeUpdate[];
  getFavorites(): SavedCodeSet[];           // reads from localStorage
  saveFavorite(codeSet: SavedCodeSet): void; // writes to localStorage
}
```

## Mock Data (MVP)

- ~200 common ICD-10 codes covering frequently billed diagnoses
- ~100 common HCPCS codes covering supplies, drugs, ambulance, DME
- ~50 common modifiers (HCPCS modifiers only — CPT modifiers require AMA license)
- ~50 common CARC/RARC denial codes with resolution guidance
- CCI edit pairs for the included codes
- Fee schedule data for included procedure codes
- Place of Service code reference (full list — public domain)
- E/M calculator logic (based on 2021+ CMS guidelines)
- Guided flow decision trees organized by specialty/body system
- All data sourced from CMS and X12 public datasets

**No CPT data in MVP.** CPT descriptions require an AMA license. The UI will include a placeholder for CPT with a note explaining the licensing requirement. CPT will be added in Phase 2 after licensing.

Bundled as JSON files in `src/data/`.

## Project Structure

```
med/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Home — search + feature cards + specialties
│   │   ├── results/page.tsx            # Search results dashboard
│   │   ├── code/[id]/page.tsx          # Code detail with full billing context
│   │   ├── guided/page.tsx             # Guided flow wizard
│   │   ├── em-calculator/page.tsx      # E/M level calculator
│   │   ├── denials/page.tsx            # CARC/RARC reference
│   │   ├── updates/page.tsx            # Code update tracker
│   │   ├── modifiers/page.tsx          # Modifier reference + decision tree
│   │   ├── cci-edits/page.tsx          # CCI bundling checker
│   │   ├── fee-schedule/page.tsx       # Fee schedule lookup
│   │   └── api/
│   │       ├── search/route.ts
│   │       ├── codes/[id]/route.ts
│   │       ├── guided/route.ts
│   │       ├── em-calculator/route.ts
│   │       └── denials/route.ts
│   ├── services/
│   │   ├── codeService.ts              # CodeService interface
│   │   ├── mockCodeService.ts          # Mock implementation
│   │   ├── searchEngine.ts             # Fuzzy search logic
│   │   ├── guidedFlow.ts               # Decision tree engine
│   │   ├── emCalculator.ts             # E/M level calculation logic
│   │   ├── sequencingEngine.ts         # Code-first/use-additional rules
│   │   └── cciChecker.ts              # CCI edit lookup
│   ├── data/
│   │   ├── icd10.json                  # ICD-10-CM codes (public domain)
│   │   ├── hcpcs.json                  # HCPCS Level II codes (public domain)
│   │   ├── modifiers.json              # HCPCS modifiers (public domain)
│   │   ├── cciEdits.json               # NCCI edit pairs (public domain)
│   │   ├── feeSchedule.json            # Medicare MPFS data (public domain)
│   │   ├── placeOfService.json         # POS codes (public domain)
│   │   ├── carcRarc.json               # Denial codes (public domain)
│   │   ├── codeUpdates.json            # Recent code changes
│   │   ├── guidedFlowTree.json         # Decision trees
│   │   └── emGuidelines.json           # E/M calculation rules
│   ├── components/
│   │   ├── SearchBar.tsx
│   │   ├── CodeCard.tsx
│   │   ├── CodeDetail.tsx
│   │   ├── BillingContext.tsx           # Modifiers, CCI, fees, payer rules
│   │   ├── FilterSidebar.tsx
│   │   ├── GuidedStep.tsx
│   │   ├── EMCalculatorForm.tsx
│   │   ├── SeventhCharPicker.tsx
│   │   ├── LateralityPicker.tsx
│   │   ├── ModifierDecisionTree.tsx
│   │   ├── DenialCodeTable.tsx
│   │   ├── CodeUpdateFeed.tsx
│   │   ├── FavoritesManager.tsx
│   │   ├── RecentSearches.tsx
│   │   ├── SpecialtyGrid.tsx
│   │   ├── SourceCitation.tsx          # Reusable attribution footer
│   │   └── FeatureCards.tsx
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

### Data Licensing Compliance

- MVP uses only public-domain code systems (ICD-10, HCPCS, CCI, MPFS, POS, CARC/RARC)
- CPT descriptions require AMA license — not included until license is obtained
- Revenue code descriptions require NUBC license — not included until license is obtained
- All data pages include source citations with links to authoritative sources
- Attribution footer on every page per licensing requirements

### MVP (No PHI)

- No user accounts, no data persistence on the server
- Search history and favorites in localStorage only (never leaves the browser)
- Mock data — no external API calls with user input
- HTTPS enforced in production
- No analytics or tracking that could capture search terms

### Phase 2: Real APIs + CPT License

- Obtain AMA CPT license before displaying CPT descriptions
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

1. **MVP:** Public-domain codes (ICD-10, HCPCS) + quick search + guided flow + E/M calculator + 7th character helper + code sequencing + modifiers (HCPCS) + CCI edits + fee schedules + CARC/RARC denial codes + code update tracker + favorites + hybrid UI with source citations
2. **Phase 2:** AMA CPT license + CPT codes + real CMS API integration + CPT modifiers + NUBC revenue code license
3. **Phase 3:** Claude API with BAA for AI-powered natural language lookup
4. **Phase 4:** User accounts, auth, roles, saved preferences on server

## Target Users

- Medical billing professionals / coders at clinics and hospitals
- Healthcare providers (doctors, nurses) looking up codes quickly
- Patients / general public understanding their bills
- The UI must be accessible to non-experts while powerful for professionals
