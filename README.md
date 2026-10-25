# HAPS-AI SCHOLAR ASSISTANT 🎓
### Next-Generation AI Academic Diagnosis, Telemetry & Assessment Platform
**Prepared for:** Him Academy Public School (HAPS), Vikas Nagar, Hamirpur, Himachal Pradesh  
**Prepared by:** UNISOLE Skill AI Labs  
**Curriculum Scope:** Classes VI – XII | HP Board, CBSE Board, JEE, NEET, Olympiads  

[![Vercel Production Deployment](https://img.shields.io/badge/Vercel-Live%20Website-success?logo=vercel&style=for-the-badge)](https://haps-ai-scholar-assistant.vercel.app)
[![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-Passing-brightgreen?logo=github-actions&style=for-the-badge)](https://github.com/unisoleempower-blip/school_student_system-SSS-/actions)

🌐 **Live Production Website**: [https://haps-ai-scholar-assistant.vercel.app](https://haps-ai-scholar-assistant.vercel.app)  
🚀 **Live API Gateway Health**: [https://haps-ai-scholar-assistant.vercel.app/api/health](https://haps-ai-scholar-assistant.vercel.app/api/health)

---

## 🌟 Executive Summary & Vision

**HAPS-AI Scholar Assistant** is an enterprise-grade AI academic copilot and learning diagnostics engine designed specifically for the rigorous residential and day-boarding environment of **Him Academy Public School (HAPS), Hamirpur**.

Traditional schooling faces a fundamental bottleneck: *one teacher, one pace, many learning speeds*, especially when students are preparing simultaneously for **CBSE/HP Board exams** (which demand rigorous derivations and step-by-step writing) and **JEE/NEET** (which demand rapid multi-concept elimination, precision, and speed). 

HAPS-AI Scholar Assistant solves this with an end-to-end closed loop:
1. **Teacher Co-Pilot & LaTeX Question Generator**: Generates clean, rigorously vetted LaTeX math and science questions aligned with NCERT, HPBOSE, JEE Main/Advanced, and NEET blueprints.
2. **Sub-Second Student Telemetry Engine**: Tracks micro-level student telemetry (time spent per question, hesitation index, attempt count, distractor traps).
3. **Concept Diagnostic Matrix**: Maps performance directly to specific micro-competencies, classifying topics into **Mastered**, **Needs Recap**, and **Critical Weakness**.
4. **AI Handwritten Sheet Evaluation Pipeline**: Scans physical student answer scripts, performs step-by-step OCR and Vision AI rubric evaluation, awards partial marks, and pinpoints conceptual gaps.
5. **Weekly Dual-Action Smart Report Card**: Automatically generates actionable, distinct recommendations for both **School/Hostel Faculty** (residential evening self-study) and **Parents** at home.
6. **Enterprise Architecture**: Built on PostgreSQL, Apache Kafka streaming telemetry, Docker containers, and Kubernetes (K8s) orchestration with strict Staging and Production isolation.

---

## 🏛️ System Architecture

```mermaid
graph TD
    subgraph Client Layer
        T[Teacher Portal - Web/Desktop]
        S[Student Portal - Adaptive Engine]
        P[Parent & Director Intelligence Dashboard]
    end

    subgraph API & Gateway Layer
        Ingress[Kubernetes Nginx Ingress Controller]
        Auth[JWT Role-Based Access Control]
        API[HAPS Core Backend Gateway - Node.js/Express]
    end

    subgraph Event Telemetry Stream
        Kafka[Apache Kafka Event Bus]
        TTopic[Topic: telemetry.question-timer]
        ATopic[Topic: telemetry.assessment-submit]
        HTopic[Topic: telemetry.handwritten-scan]
        RTopic[Topic: reports.weekly-trigger]
    end

    subgraph Worker & AI Microservices
        AnalyticsWorker[Concept Mastery & Diagnostic Engine]
        VisionWorker[Handwritten Sheet OCR & Rubric Evaluator]
        ReportWorker[Smart Report & Dual-Action Recommender]
        GeminiAI[Gemini 1.5/Flash AI LaTeX & Socratic Copilot]
    end

    subgraph Storage Layer
        PG[(PostgreSQL Primary: Relational Core)]
        S3[(Object Store: Handwritten Answer Sheets & PDFs)]
        Redis[(Redis Cache: Active Question Telemetry Timers)]
    end

    Client Layer --> Ingress
    Ingress --> Auth
    Auth --> API
    API --> PG
    API --> Redis
    API --> Kafka

    Kafka --> TTopic & ATopic & HTopic & RTopic
    TTopic --> AnalyticsWorker
    ATopic --> AnalyticsWorker
    HTopic --> VisionWorker
    RTopic --> ReportWorker

    AnalyticsWorker --> PG
    VisionWorker --> GeminiAI
    VisionWorker --> PG
    ReportWorker --> GeminiAI
    ReportWorker --> PG
```

---

## 🎯 3 Adaptive Learning Modes

| Learning Mode | Core Pedagogical Focus | Engine Behavior & Safeguards |
| :--- | :--- | :--- |
| **1. CBSE & HP Board Excellence** | Step-by-step derivations, structured definitions, diagrammatic representations, NCERT alignment. | Evaluates answers against teacher-approved rubrics with step-wise marks (e.g. formula = $0.5$ mark, calculation = $1$ mark, unit = $0.5$ mark). |
| **2. JEE / NEET Preparation** | Multi-concept application, speed optimization, calculation shortcuts, negative mark avoidance. | Timed MCQs with countdown telemetry, distractor analysis (explaining why option B is a common trap), formula hints before solutions. |
| **3. Olympiad & Advanced** | Non-routine reasoning, mathematical proofs, edge-case analysis. | Progressive hints (level 1-3), requires students to articulate their hypotheses before revealing hints. |

---

## 🔬 Sub-Second Telemetry & Diagnostic Engine

When a student attempts a quiz or homework sheet, the system doesn't merely store `is_correct: boolean`. It streams event messages to Kafka:
- `time_spent_seconds`: Real-time seconds spent actively focused on the question.
- `dwell_time_before_first_input`: Hesitation time before starting calculation.
- `option_flip_count`: How many times the student toggled between choices before finalizing.
- `hint_requested_count`: Whether hints were requested and at what stage.

### Mathematical Mastery Classification Formula:
$$\text{Mastery Score } (M_c) = w_1 \cdot \text{Accuracy} + w_2 \cdot \left(1 - \frac{\text{Time Spent}}{\text{Expected Benchmark Time}}\right) - w_3 \cdot \text{Hint Penalty}$$

* **Mastered ($\ge 80\%$)**: Student solved accurately within benchmark time.
* **Needs Recap ($50\% - 79\%$)**: Correct answer but abnormal time taken, or minor numerical slippage.
* **Critical Weakness ($< 50\%$)**: Fundamental misconception, wrong distractor choice, or repeated hint escalations.

---

## 📝 Handwritten Sheet Evaluation Pipeline

For school tests, unit tests, and terminal examinations, physical pen-and-paper answer sheets remain essential. HAPS-AI provides a comprehensive digitizer and evaluator:
1. **Document Ingestion**: Mobile scan or batch flatbed scanner upload ($300\text{ DPI}$ PDF/PNG).
2. **Segmentation**: Answers are split into designated question grids using computer vision bounding boxes.
3. **Handwriting Transcription (HTR)**: Mathematical symbols ($\int, \sum, \vec{E}, \sqrt{x}$), chemical equations, and English/Hindi handwriting are converted to LaTeX format.
4. **Rubric Comparison Engine**: Compares student step breakdown against master marking scheme:
   - Identifies missing intermediate steps.
   - Detects formula misapplications.
   - Distinguishes between conceptual errors vs. algebraic calculation mistakes.
5. **Teacher Verification UI**: Teachers see the student's raw handwriting side-by-side with AI marks and suggested feedback, maintaining 100% human oversight.

---

## 📊 Weekly Dual-Action Smart Report Card

Every Saturday evening, our background Kafka worker aggregates the weekly student telemetry and generates an insightful report with dual-track directives:

### Sample Report Excerpt (Class XI Science - Physics):
```
Student: Aryan Sharma | Roll No: 11-S-24 | Target: JEE Main + CBSE Board
Weekly Score: 78% | Total Study Time: 14.2 Hours | Velocity: 1.8 mins/question

DIAGNOSTIC HIGHLIGHTS:
- Rotational Motion (Moment of Inertia): MASTERED (92% accuracy, fast speed)
- Work, Energy & Power (Work-Energy Theorem): NEEDS RECAP (Takes 4.2 min/q; algebra slips)
- Simple Harmonic Motion (Damped Oscillations): CRITICAL WEAKNESS (28% accuracy)

ACTIONS FOR SCHOOL / TEACHER (Evening Hostel Study):
1. In the 7:00 PM - 8:30 PM residential prep, conduct a 15-minute 1-on-1 derivation session on SHM differential equations.
2. Assign Worksheet #SHM-04 (5 targeted numericals with restoring force friction).

ACTIONS FOR PARENTS (Weekend Review):
1. Encourage Aryan to explain the principle of Damped Oscillations to you for 5 minutes (Feynman technique).
2. Ensure 45 minutes of distraction-free practice on Sunday morning for the assigned targeted recap quiz.
```

---

## 🛠️ Technology Stack Breakdown

| Layer | Technology | Justification & Production Benefit |
| :--- | :--- | :--- |
| **Database** | **PostgreSQL 16** | ACID compliance, JSONB for flexible question metadata/rubrics, robust array types for LaTeX formulas, and strong indexing for fast reporting. |
| **Event Bus** | **Apache Kafka (KRaft)** | Handles real-time question timer telemetry ticks, decoupled batch report generation, and asynchronous handwritten image processing without blocking API threads. |
| **Multi-LLM Engine** | **Groq LPU & Google Gemini** | Dual-engine architecture: Groq LPU (`openai/gpt-oss-120b`, `qwen/qwen3.8-27b`) for sub-second (~300-800ms) generation + Gemini Flash for vision and math reasoning, with automatic failover to NCERT bank. |
| **NCERT PYQ Bank** | **Class 10 CBSE & HPBOSE Bank** | Curated board questions (2020–2024) mapped to NCERT chapters, sections, and page references with step-wise rubrics. |
| **Containerization** | **Docker & Multi-Stage Builds** | Standardized, deterministic environments across macOS, Linux, and Windows; minimal production image footprints. |
| **Orchestration** | **Kubernetes (K8s)** | Zero-downtime rolling updates, Horizontal Pod Autoscaling (HPA) during peak school exam hours, and isolated Staging vs Production namespaces. |
| **Backend API** | **Node.js 20 LTS / Express** | High concurrency event I/O, native JSON handling, fast integration with Kafka streams, and seamless WebSocket telemetry. |
| **Frontend UI** | **Vanilla CSS3 + ES6 Modules + KaTeX** | Ultra-responsive, zero bloat, high-performance math rendering with KaTeX, modern glassmorphic theme designed for students and teachers. |

---

## 🚀 Getting Started

### Prerequisites
- Node.js $\ge 20.0$
- Docker Engine $\ge 24.0$ & Docker Compose v2 (optional for local Kafka/Postgres)
- LLM API Keys (Groq Cloud & Google Gemini)

### 1. Environment Configuration
Create `backend/.env` using the provided template:
```bash
cp backend/.env.example backend/.env
```
Add your keys in `backend/.env`:
```env
PORT=5050
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
```

### 2. Running Locally
```bash
# Start Backend Gateway (Port 5050)
cd backend && npm start

# Start Frontend (Port 3008)
cd ../frontend && npx serve -l 3008
```

- **Interactive Web Portal**: `http://localhost:3008`
- **Backend Health & Telemetry API**: `http://localhost:5050/api/health`
- **LLM Provider Diagnostics**: `http://localhost:5050/api/questions/providers`
- **Class 10 NCERT PYQ Bank**: `http://localhost:5050/api/questions/class10-pyq`

---

## 🛡️ Data Safeguards & HAPS Governance
1. **Zero External Data Leakage**: Student names and roll numbers can be pseudonymized with UUID tokens before passing to LLM APIs.
2. **Teacher Veto Power**: No AI-generated question or automated mark goes into official school grade books without teacher verification.
3. **No Opaque AI Blackboxes**: All scores, mastery levels, and report comments are backed by transparent telemetry logs.

