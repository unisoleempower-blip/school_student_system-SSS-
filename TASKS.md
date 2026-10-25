# HAPS-AI SCHOLAR ASSISTANT: MASTER ENGINEERING TASKS & LEARNING LOG 🚀

This document tracks all engineering deliverables for the **HAPS-AI Scholar Assistant** platform for Him Academy Public School. To support deep technical learning, **every task concludes with a dedicated 5-point architectural breakdown** detailing the tech stack choices, trade-offs, and production engineering rationale.

---

## 📌 Implementation Checklist & Status Tracker

| Task ID | Phase / Module | Description | Status |
| :--- | :--- | :--- | :---: |
| **TASK-01** | **Core Architecture & Schema** | Relational PostgreSQL schema for dual-role (Teachers, Students), LaTeX questions, telemetry, handwritten evaluations, and weekly smart reports. | 🟢 Ready |
| **TASK-02** | **Event Bus & Telemetry Pipeline** | Apache Kafka event streaming pipeline for sub-second question timers, attempt counts, and real-time concept diagnostics. | 🟢 Ready |
| **TASK-03** | **AI LaTeX Question Generator** | Prompt engineering & LaTeX rendering engine for HP Board, CBSE, JEE, NEET, and Olympiads (Bloom's Taxonomy). | 🟢 Ready |
| **TASK-04** | **Sub-Second Telemetry & Diagnostic Engine** | Real-time tracking of time spent per question, hesitation index, and classification into Mastered / Recap Needed / Weak. | 🟢 Ready |
| **TASK-05** | **Handwritten Sheet Evaluation Engine** | OCR & Multi-modal Vision AI pipeline to evaluate physical answer sheets, step-by-step scoring, and LaTeX annotations. | 🟢 Ready |
| **TASK-06** | **Weekly Dual-Action Smart Report Card** | Automated weekly report generator creating distinct actionable steps for School Teachers (Hostel study) and Parents at home. | 🟢 Ready |
| **TASK-07** | **Dual-Portal Interactive Web Application** | Production-grade frontend with Teacher Co-pilot, Student Adaptive Interface (3 Learning Modes), KaTeX math, and analytics radar. | 🟢 Ready |
| **TASK-08** | **Containerization & Kubernetes Orchestration** | Docker Compose for local staging and Kubernetes (K8s) manifests for staging and production deployments. | 🟢 Ready |
| **TASK-09** | **CI/CD Automation & Vercel Deployment Tool** | Automated GitHub Actions CI/CD workflows, Docker build verification, and 1-click Vercel automated deployment tool. | 🟢 Ready |

---

## 🏗️ Detailed Task Specifications & Learning Breakdowns

---

### TASK-01: Core Architecture & Relational PostgreSQL Schema
**Objective**: Build a high-performance, strictly normalized, and ACID-compliant relational schema capable of handling granular student telemetry, hierarchical question banks with LaTeX strings, handwritten submission metadata, and weekly smart reports.

**Core Deliverables**:
1. `database/schema.sql`: Tables for `users`, `classes`, `subjects`, `topics`, `subtopics`, `questions`, `assessments`, `student_question_telemetry`, `handwritten_submissions`, `concept_mastery`, and `weekly_smart_reports`.
2. Support for PostgreSQL JSONB columns for flexible AI rubrics, step-by-step marking criteria, and raw Kafka event payloads.
3. Indexed queries for fast sub-second aggregations on `student_id` and `concept_id`.

#### 💡 5 Technical Learning Points (Tech Stack & Architectural Rationale):
1. **Why PostgreSQL instead of MongoDB?**: Academic assessment data is inherently relational (Students $\to$ Batches $\to$ Tests $\to$ Questions $\to$ Subtopics $\to$ Telemetry). PostgreSQL gives us ACID guarantees, foreign-key integrity, and transactional security so test scores and marks are never corrupted.
2. **PostgreSQL JSONB for Hybrid Schemas**: While core entities are relational, AI-generated marking rubrics, question hints, and handwritten bounding boxes vary by subject. PostgreSQL's binary JSON (`JSONB`) allows schema-less flexibility with GIN indexing for fast querying.
3. **Array Data Types (`TEXT[]`)**: Questions frequently have multiple tags (e.g. `{"CBSE", "Class-11", "Rotational-Motion", "JEE-Main"}`). PostgreSQL natively supports array columns with containment operators (`@>`), eliminating unnecessary join tables for simple tagging.
4. **Composite Indexes for Telemetry Optimization**: A student generates hundreds of telemetry rows per test. Composite indexing on `(student_id, question_id, created_at)` ensures the diagnostic engine queries are executed in single-digit milliseconds.
5. **Auditing & Safeguards**: PostgreSQL triggers and `TIMESTAMPTZ` columns guarantee immutable audit trails. In school examinations, having tamper-proof submission timestamps is legally and academically critical.

---

### TASK-02: Event Bus & Kafka Streaming Telemetry Pipeline
**Objective**: Decouple high-frequency student interactions (e.g., question timer ticks, option toggles, hint requests) from the primary database using Apache Kafka event streaming.

**Core Deliverables**:
1. `backend/src/kafka/producer.js`: High-throughput Kafka producer publishing telemetry events (`telemetry.question-timer`, `telemetry.attempt-submit`, `telemetry.handwritten-scan`).
2. `backend/src/kafka/consumer.js`: Consumer group processing events asynchronously to update concept mastery scores and trigger alerts.
3. Fault-tolerant KRaft mode (Kafka without ZooKeeper) for reduced operational overhead in containerized environments.

#### 💡 5 Technical Learning Points (Tech Stack & Architectural Rationale):
1. **Why Apache Kafka instead of direct HTTP Database Writes?**: When 500 students take an exam simultaneously, each student sends timer ticks and telemetry every few seconds. Direct database writes would exhaust connection pools and lock tables. Kafka acts as a shock absorber, ingesting millions of events per second with zero lag.
2. **Event-Driven Architecture (EDA)**: Producers only emit what happened (e.g., `QuestionTimerTicked`, `OptionChanged`). Multiple downstream consumers (Analytics, Notification, Report Card Worker) can listen to the same topic without modifying the API gateway.
3. **Partitioning Key Strategy**: By partitioning topics using `student_id` as the key, Kafka guarantees strict order of events for any individual student while processing thousands of students concurrently across multiple partitions.
4. **KRaft Mode (ZooKeeper Removal)**: Modern Kafka (v3.3+) replaces the legacy ZooKeeper quorum with internal Raft consensus. This cuts Docker memory footprint by half and simplifies Kubernetes deployment.
5. **Backpressure & Reliability**: If the AI evaluation service or database temporarily slows down, Kafka stores events safely on disk with configurable retention, ensuring zero student telemetry data is ever lost.

---

### TASK-03: AI LaTeX Question Generator & Pedagogical Engine
**Objective**: Build an AI co-pilot that generates curriculum-compliant questions formatted in pristine LaTeX for CBSE, HP Board, JEE Main/Advanced, NEET, and Olympiads across Grades 6 to 12.

**Core Deliverables**:
1. Clean LaTeX mathematical formatting using `$...$` for inline math and `$$...$$` for display equations.
2. Differentiation by Board/Exam:
   - **CBSE/HP Board**: Subjective, derivation-based, step-by-step marking rubrics.
   - **JEE/NEET**: Single-choice, multi-choice, numerical with distractor rationale (why wrong choices are enticing).
   - **Olympiad**: Non-routine multi-step reasoning with progressive hints.
3. Interactive KaTeX rendering on the web portal with zero layout shifts.

#### 💡 5 Technical Learning Points (Tech Stack & Architectural Rationale):
1. **Why LaTeX for Academic Questions?**: Plain text cannot accurately represent complex calculus ($\int_0^\infty e^{-x^2} dx$), chemical reaction kinetics, or physics vectors ($\vec{F} = m \frac{d\vec{v}}{dt}$). LaTeX is the international standard for academic publishing, ensuring zero typographical ambiguity.
2. **KaTeX vs. MathJax on the Frontend**: We selected KaTeX because it renders math synchronously and up to 100x faster than MathJax, requiring no external font downloads or DOM re-rendering flashes during timed exams.
3. **Few-Shot Prompt Engineering with Strict Schemas**: Rather than letting the LLM respond in free-form markdown, we enforce strict JSON response schemas containing `question_latex`, `options_latex`, `solution_latex`, `bloom_level`, and `distractor_analysis`.
4. **Distractor Error Analysis for Competitive Prep**: In JEE/NEET, wrong answers are deliberately crafted to catch common mathematical oversights (e.g. forgetting a factor of $\frac{1}{2}$ or sign reversal). Our AI explicitly labels each distractor's diagnostic reason.
5. **Human-in-the-Loop Validation**: AI questions are staged in a draft queue where HAPS subject teachers can edit LaTeX, modify marks, or approve questions with a single click before they appear on student test papers.

---

### TASK-04: Sub-Second Telemetry & Diagnostic Matrix
**Objective**: Calculate deep diagnostic metrics from raw student telemetry and categorize each subtopic into **Mastered**, **Needs Recap**, or **Critical Weakness**.

**Core Deliverables**:
1. Tracking metrics:
   - `time_spent_seconds` vs. `benchmark_time_seconds`
   - `attempt_status` (Correct, Incorrect, Partial, Unattempted)
   - `hesitation_time` (Dwell time before first interaction)
   - `hint_escalation_level`
2. Mastery scoring algorithm:
   $$M_c = 0.6 \times \text{Accuracy} + 0.3 \times \text{Speed Index} - 0.1 \times \text{Hint Penalty}$$
3. Teacher Real-time Heatmap showing which students are struggling on which specific physics/chemistry/math concepts.

#### 💡 5 Technical Learning Points (Tech Stack & Architectural Rationale):
1. **Time-to-Solve as a Quality Dimension**: A student who solves a physics question in 45 seconds understands the concept differently than a student who takes 8 minutes, even if both get it right. Telemetry catches hidden struggles before terminal exam failure.
2. **Speed Index Normalization**: We calculate the Speed Index using standard deviation relative to peer cohort performance: $\min\left(1.0, \frac{\text{Benchmark Time}}{\text{Time Spent}}\right)$. This prevents penalizing deep thinkers on complex Olympiad problems.
3. **Real-time WebSockets vs. Polling**: For live teacher monitoring in the classroom, we utilize WebSocket event streams (`ws://`) rather than HTTP polling, reducing server overhead and enabling instant visual heatmaps.
4. **Three-Tier Classification (Mastered / Recap / Weak)**: Binary pass/fail metrics hide nuance. The three-tier model gives teachers actionable triage: "Recap" means a quick 5-minute refresher, while "Weak" requires 1-on-1 pedagogical intervention.
5. **Decoupled Stream Processing**: Raw telemetry ticks are stored in Redis time-series caches and aggregated periodically into PostgreSQL by background worker threads to keep database transactions lightning fast.

---

### TASK-05: Handwritten Sheet Evaluation Engine
**Objective**: Create a multi-modal pipeline capable of ingesting scanned handwritten physical test papers, performing step-wise scoring against marking schemes, and producing annotated LaTeX corrections.

**Core Deliverables**:
1. OCR & Vision AI prompt pipeline parsing physical student writing into structured steps.
2. Step-by-step rubric matching:
   - Formula stated: $+0.5$ marks
   - Substitution with correct units: $+1.0$ marks
   - Final numerical accuracy: $+0.5$ marks
3. Side-by-side visual grading interface with teacher override capabilities.

#### 💡 5 Technical Learning Points (Tech Stack & Architectural Rationale):
1. **Why Multi-Modal Vision LLMs for Handwritten Evaluation?**: Traditional OCR engines (like Tesseract) fail completely on messy student handwriting, strike-throughs, and freehand mathematical formulas. Multi-modal models (like Gemini 1.5 Pro) understand spatial context, diagrams, and semantic intent.
2. **Bounding Box Coordinate Mapping**: By generating normalized coordinates `[ymin, xmin, ymax, xmax]` for each evaluated step, the UI overlays visual green/red highlight boxes directly onto the scanned paper for the teacher to inspect.
3. **Rubric-Driven Discretion**: The evaluator is fed the school's exact marking breakdown before grading. It doesn't give arbitrary subjective grades; it audits each written line against pre-approved criteria.
4. **Error Type Categorization**: The engine classifies errors into three precise buckets: *Conceptual Mistake* (wrong formula applied), *Calculation Slips* (algebraic error in step 3), or *Formatting/Unit Omission* (forgot to write $\text{m/s}^2$).
5. **Teacher Accountability**: The AI output is treated as a draft grading sheet. The school teacher retains 1-click override power, ensuring academic authority remains strictly with the educator.

---

### TASK-06: Weekly Dual-Action Smart Report Card
**Objective**: Synthesize an entire week of telemetry, homework, and quiz data into an executive-level diagnostic report delivering customized, actionable steps for both School Teachers (hostel prep) and Parents (home review).

**Core Deliverables**:
1. Automated weekly aggregation cron job.
2. Dual-Action Recommendation Engine:
   - **School / Teacher Action Items**: Evening study assignments, 1-on-1 derivation reviews, remedial worksheet references.
   - **Parent Action Items**: Non-judgmental guided questions, Feynman technique checks, weekend study environment guidance.
3. Clean printable PDF and web dashboard view.

#### 💡 5 Technical Learning Points (Tech Stack & Architectural Rationale):
1. **Solving the "Passive Report Card" Problem**: Traditional school reports say "Needs Improvement in Physics" without telling anyone what to do. Our dual-action engine provides concrete, 15-minute actionable playbooks tailored to the student's exact error patterns.
2. **Context-Aware School vs. Home Roles**: In residential boarding schools like HAPS, teachers supervise evening prep from 7:00 PM to 9:00 PM and need targeted problem sets. Parents need reassuring, non-technical ways to support their child during weekend phone calls or visits.
3. **Cron Scheduling with Distributed Locking**: Scheduled batch jobs running across multiple server replicas can accidentally trigger duplicate reports. Using distributed locking (e.g. via Redis or Postgres advisory locks) ensures each report is generated exactly once.
4. **Natural Language Generation (NLG) with Guardrails**: Reports are generated using templated few-shot prompting to guarantee encouraging, constructive, and educationally sound language, avoiding discouraging labels or unvalidated rank predictions.
5. **Data Minimization & Compliance**: Reports only expose aggregated diagnostic data relevant to academic improvement, fully respecting student privacy and HAPS data governance policies.

---

### TASK-07: Dual-Portal Interactive Web Application
**Objective**: Build a high-performance, modern, glassmorphic web application supporting seamless switching between Teacher Co-Pilot and Student Adaptive Learning modes.

**Core Deliverables**:
1. **Teacher Side**:
   - AI LaTeX Question Generator with instant preview.
   - Real-time student telemetry monitor with concept breakdown.
   - Handwritten answer sheet evaluation review station.
   - Weekly Smart Report Card generator.
2. **Student Side**:
   - Mode switcher: CBSE Excellence, JEE/NEET Speed, Olympiad Reasoning.
   - Socratic AI tutor with progressive hints.
   - Timed quiz interface with active telemetry capture.
3. Dark/Light modern glassmorphic UI using standard CSS variables and KaTeX.

#### 💡 5 Technical Learning Points (Tech Stack & Architectural Rationale):
1. **Zero-Dependency Vanilla CSS & Modern ES6**: By utilizing native CSS custom properties, flexbox/grid, and ES6 modules without bulky UI libraries, the entire application loads instantly on low-bandwidth school Wi-Fi and mobile devices.
2. **Sub-100ms UI Latency**: In competitive exam prep (JEE/NEET), every millisecond counts. Lightweight DOM updates and client-side timer telemetry avoid UI stutter during high-speed problem solving.
3. **Role-Based State Isolation**: Teacher tools and Student assessments use distinct UI controllers with separate security tokens, preventing accidental privilege escalation or leaked answer keys.
4. **Progressive Hint Revelation Architecture**: The student UI hides solutions by default and enforces a mandatory pause between hints (Socratic tutoring), ensuring students actively attempt solutions rather than copying answers.
5. **Mobile-First Responsive Layout**: Both day-scholars on mobile phones and hostel teachers on desktop computers receive an optimized layout with accessible touch targets and readable mathematical equations.

---

### TASK-08: Containerization & Kubernetes (K8s) Orchestration
**Objective**: Package the entire system into production-grade Docker containers and author Kubernetes manifests for Staging and Production deployments.

**Core Deliverables**:
1. `docker-compose.yml`: Local multi-container development & staging stack with PostgreSQL, Kafka/KRaft, Backend API, and Web UI.
2. `k8s/`: Base manifests and Staging/Production overlays with ConfigMaps, Secrets, Ingress, and Horizontal Pod Autoscalers (HPA).
3. Production environment isolation with distinct database credentials and resource limits.

#### 💡 5 Technical Learning Points (Tech Stack & Architectural Rationale):
1. **Docker Multi-Stage Builds**: Multi-stage Dockerfiles compile assets in a heavy build stage and copy only minified artifacts to a hardened Alpine Linux runtime image, drastically reducing attack surface and container size.
2. **Kubernetes for Traffic Spikes**: School testing produces massive traffic spikes at 9:00 AM when tests begin. Kubernetes Horizontal Pod Autoscaler (HPA) automatically scales pods from 2 to 10 based on CPU/Memory metrics.
3. **Environment Parity (Staging vs. Production)**: By maintaining matching K8s base configurations with Kustomize overlays, staging identically mirrors production, catching deployment bugs before they impact real school classrooms.
4. **Health Checks (`livenessProbe` & `readinessProbe`)**: K8s probes ensure traffic is never routed to a container that is still booting or experiencing database connectivity loss, guaranteeing high availability.
5. **Secrets Management**: Sensitive credentials (database passwords, Gemini API keys, JWT secrets) are stored in Kubernetes Secrets and injected as environment variables, never hardcoded in source control.

---

### TASK-09: CI/CD Automation & Vercel Deployment Tool
**Objective**: Build automated GitHub Actions CI/CD pipelines and a 1-click Vercel automated deployment tool for zero-downtime, continuous testing, container verification, and web deployment.

**Core Deliverables**:
1. `.github/workflows/ci-cd.yml`: Full integration test suite, Docker container build verification, and Kubernetes Kustomize linting.
2. `.github/workflows/vercel-deploy.yml`: Automated CD pipeline deploying preview builds on pull requests and production releases on `main` merge.
3. `vercel.json` & `scripts/deploy_vercel.sh`: 1-click automated deployment script for Vercel CLI.

#### 💡 5 Technical Learning Points (Tech Stack & Architectural Rationale):
1. **Why GitHub Actions for Academic Platforms?**: Native integration with git pull requests allows academic software changes (marking schemes, LaTeX parsers) to be tested automatically before merging, preventing regression bugs in live exams.
2. **Shift-Left Testing Paradigm**: Running `scripts/test_evaluator.js` and Docker build validation on every commit catches syntax errors, broken container images, and bad dependencies before reaching staging or production.
3. **Automated Preview Environments via Vercel**: Vercel deploys an isolated preview URL for every pull request, allowing teachers and academic coordinators to test new question rendering or UI changes without affecting the production school portal.
4. **Global Edge CDN for School Latency**: Vercel serves static assets (KaTeX fonts, CSS stylesheets, UI JavaScript) from edge caches located close to Himachal Pradesh and Indian users, guaranteeing sub-50ms page load speeds even on rural or mobile school networks.
5. **Kustomize Validation in CI**: Running `kubectl kustomize` inside GitHub Actions verifies that all Kubernetes YAMLs, environment variables, and patches are syntactically and structurally sound before applying them to cloud clusters.

