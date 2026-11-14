# Research Mind AI 🧠🔬
> **End-to-End, Production-Grade AI-Powered Research & Knowledge Discovery Platform**

[![Stack](https://img.shields.io/badge/Stack-React%2018%20|%20Vite%20|%20Node.js%20|%20Express-0e8ce9)](https://github.com)
[![Database](https://img.shields.io/badge/Database-Supabase%20PostgreSQL%20RLS-3ecf8e)](https://supabase.com)
[![AI Engine](https://img.shields.io/badge/AI-Google%20GenAI%20SDK%20%28Gemini%202.5%29-8b5cf6)](https://ai.google.dev)
[![Validation](https://img.shields.io/badge/Validation-Zod%20Strict%20Schemas-blue)](https://zod.dev)

---

## 1. System Overview & Core Mission
**Research Mind AI** accelerates deep knowledge discovery, document synthesis, and cross-source research with **strict evidence traceability (citations)** to prevent AI hallucinations. Professionals, scientists, and analysts can aggregate papers, notes, transcripts, and articles into domain-isolated workspaces and synthesize complex inquiries with verifiable primary source citations.

---

## 2. Architecture & Technology Stack

| Layer | Technologies | Key Capabilities |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, React Markdown | Interactive Workstation UI, responsive navigation, dynamic markdown citation viewer, live Zod validation. |
| **Backend** | Node.js, Express.js, Helmet, CORS, Express-Rate-Limit | RESTful API, Supabase JWT auth verification, strict 10 req/min query rate limiter. |
| **Database & Auth** | Supabase Cloud PostgreSQL, Supabase Auth, Row Level Security (RLS) | Isolated tenant data, multi-table cascade relationships, automated profile synchronization triggers. |
| **AI Integration** | `@google/genai` (Server-side strictly) | Gemini 2.5 Flash model with structured JSON schemas for automated document summarization and cross-document synthesis. |
| **Validation** | Zod (Client & Server) | Schema enforcement on `WorkspaceSchema`, `DocumentIngestSchema`, and `QuerySchema`. |

---

## 3. Database Schema & Row Level Security (RLS)

The complete SQL migration is located at `supabase/migrations/001_initial_schema.sql`.

### Relational Schema
- `public.profiles`: Extends `auth.users(id)` with auto-sync trigger.
- `public.workspaces`: User-isolated research domains (`Academic`, `Market`, `Legal`, `Corporate`, `Other`).
- `public.documents`: Stores ingested research content, AI-generated executive summaries, and extracted key themes.
- `public.queries`: Stores questions, synthesized markdown answers, and citations array.

### RLS Policies
- `profiles`: `USING (auth.uid() = id)`
- `workspaces`: `USING (auth.uid() = user_id)`
- `documents`: `USING (EXISTS (SELECT 1 FROM workspaces WHERE workspaces.id = documents.workspace_id AND workspaces.user_id = auth.uid()))`
- `queries`: `USING (EXISTS (SELECT 1 FROM workspaces WHERE workspaces.id = queries.workspace_id AND workspaces.user_id = auth.uid()))`

---

## 4. AI Structured Prompts & Schemas

### A. Automated Document Summarization
- **System Instruction**: 
  > *"You are Research Mind AI, an elite research assistant and data synthesis engine. Your goal is to analyze provided context documents and answer user queries with high precision, academic rigor, and absolute factual accuracy. You must synthesize information across multiple sources. You are strictly forbidden from hallucinating outside the provided document context. You MUST cite your sources using the document titles provided in the context."*
- **Schema**:
```json
{
  "type": "object",
  "properties": {
    "summary": { "type": "string", "description": "A 3-4 sentence executive summary" },
    "key_themes": { "type": "array", "items": { "type": "string" } }
  },
  "required": ["summary", "key_themes"]
}
```

### B. Cross-Document Evidence Synthesis
- **Prompt**:
  > *"Using the following array of document contents [Context attached], answer the user's query: {query}. Synthesize the answer, highlight contradictions if any, and provide an array of document IDs used to form the answer."*
- **Schema**:
```json
{
  "type": "object",
  "properties": {
    "synthesized_answer": { "type": "string", "description": "The detailed markdown-formatted answer" },
    "cited_document_ids": { "type": "array", "items": { "type": "string" }, "description": "Array of exact UUIDs of documents cited" }
  },
  "required": ["synthesized_answer", "cited_document_ids"]
}
```

---

## 5. Application Routes

| Path | Description | Access |
| :--- | :--- | :--- |
| `/` | Landing Page with value proposition and domain highlights | Public |
| `/login` | Authentication page (Sign in, Sign up, 1-Click Demo Access) | Public |
| `/dashboard` | Workspace management, domain filters, aggregate metrics | Protected |
| `/workspace/:id` | Main research hub: Ingest documents & browse corpus | Protected |
| `/workspace/:id/ask` | Deep AI synthesis interface with citation inspector | Protected |
| `/workspace/:id/document/:docId` | Document reader, AI summary, and theme inspector | Protected |

---

## 6. Environment Variables Setup

### Frontend (`client/.env`)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:5000/api
```

### Backend (`server/.env`)
```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
CLIENT_URL=http://localhost:5173
```

---

## 7. Quickstart & Execution

### 1. Apply Supabase Database Migration
```bash
# Option A: Run migration script using direct connection string
npm run migrate

# Option B: Run in Supabase Dashboard
# Copy contents of supabase/migrations/001_initial_schema.sql into Supabase SQL Editor and execute.
```

### 2. Launch Development Server
```bash
# Starts both Express API (:5000) and Vite Frontend (:5173) concurrently
npm run dev
```

### 3. Build for Production
```bash
npm run build
npm start
```

