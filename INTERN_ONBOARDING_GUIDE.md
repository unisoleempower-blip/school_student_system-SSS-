# Unisole AI School: Enterprise Engineering Onboarding Guide
**Document Version:** 2.4.0 (Industry & Academic Grade)  
**Target Audience:** Software Engineering Interns, Full-Stack Developers, AI/ML Engineers  
**Project Repository:** `/Users/ajaymokta2002/.gemini/antigravity-ide/scratch/haps-ai-scholar-assistant`  
**Production URL:** [https://haps-ai-scholar-assistant.vercel.app](https://haps-ai-scholar-assistant.vercel.app)  
**Author:** Unisole Skill AI Labs Engineering Pair  

---

## Table of Contents
1. [Project Overview & Domain Context](#1-project-overview--domain-context)
2. [Technology Stack & Architectural Rationale](#2-technology-stack--architectural-rationale)
3. [Backend Low-Level Design (LLD)](#3-backend-low-level-design-lld)
4. [Database Architecture & Complete Table Schemas](#4-database-architecture--complete-table-schemas)
5. [Frontend & Functional Modular Sections](#5-frontend--functional-modular-sections)
6. [Deployment Architecture, Release Gate & Commands](#6-deployment-architecture-release-gate--commands)
7. [Local Laptop Setup with Antigravity IDE](#7-local-laptop-setup-with-antigravity-ide)
8. [Automated Testing & Verification Suite](#8-automated-testing--verification-suite)
9. [Intern Best Practices, Git Workflow & Rules](#9-intern-best-practices-git-workflow--rules)

---

## 1. Project Overview & Domain Context

### 1.1 What is Unisole AI School Scholar Assistant?
Unisole AI School (Scholar Assistant) is an enterprise-grade AI diagnostic, assessment generation, and continuous learning analytics platform designed for modern academic institutions.

The platform caters comprehensively to:
* **Senior Secondary (Class 11 & 12)**: Specializing in high-stakes competitive examinations—**JEE Main & JEE Advanced** (Non-Medical Stream) and **NEET-UG** (Medical Stream), as well as State Board and CBSE Board examinations.
* **Secondary Foundation (Class 10)**: Core focus on CBSE & State Board syllabus mastery in **Mathematics** and **Science**.

### 1.2 The Core Problem Solved
Traditional Learning Management Systems (LMS) only track whether an answer is right or wrong after submission. They fail to capture **cognitive friction** during the test, do not automate the grading of **handwritten physical examination sheets**, and provide generic scores rather than actionable interventions for hostel prep hours vs home study.

Unisole AI School solves this through five pillars:
1. **Sub-Second Student Telemetry**: Tracks hesitation time before first input, option flips (indecision), hint requests, and solving velocity. It classifies errors into *Careless Slip*, *Conceptual Gap*, *Speed Lag*, or *Untouched*.
2. **Handwritten Answer Sheet Vision AI**: Evaluates handwritten student derivations and calculation steps using Google Gemini Vision AI against formal marking rubrics, with teacher audit capabilities.
3. **Cognitive Test Generator**: Generates balanced question papers aligned with Bloom's Taxonomy (*Remember, Understand, Apply, Analyze, Evaluate, Create*), complete with LaTeX math formulas, distractor trap options, and step-by-step scoring keys.
4. **CBSE Class 10 Question Bank & Intuitive Solution Studio**: 438 curated questions across all 14 NCERT chapters, including 310 CBSE Previous Year Questions (PYQs 2020-2024), 68 NCERT exercises, and 60 sample patterns. Includes an interactive Step-by-Step Solution Studio with Concept Keys, Step Progressions, Common Traps, and printable chapter handouts.
5. **Dual-Directive Weekly Smart Reports**: Generates differentiated weekly action plans:
   * **School/Hostel Directives**: 15-minute 1-on-1 prep sessions during evening supervised study hours.
   * **Parent Directives**: Non-academic Socratic prompts (e.g., Feynman technique verbal checks) for weekend home reinforcement.

---

## 2. Technology Stack & Architectural Rationale

| Layer | Technology | Version | Architectural Rationale ("Why This Stack") |
| :--- | :--- | :--- | :--- |
| **Frontend Core** | Vanilla JavaScript (ES6+), HTML5 | Modern Standard | Zero build overhead, zero bundling latency, predictable execution across all low-spec school laptops/Chromebooks. Avoids framework hydration mismatch. |
| **Frontend Styling** | Vanilla CSS3 (Custom Design System) | Native CSS | Tailored HSL color tokens, dark mode/glassmorphism, CSS Grid & Flexbox. No Tailwind compile step; pure native browser rendering performance. |
| **Math Rendering** | KaTeX | `^0.19.1` | Renders complex LaTeX mathematical expressions and chemical formulas 10x-100x faster than MathJax with zero layout thrashing. |
| **Data Visualization** | Chart.js & Canvas API | Modern CDN | High-performance HTML5 canvas rendering for radar charts, speed-accuracy scatter plots, and mastery heatmaps. |
| **Backend Runtime** | Node.js (LTS) | `>=20.0.0` | Non-blocking, asynchronous event loop ideal for high-concurrency telemetry streaming and real-time WebSocket communication. |
| **Backend Framework**| Express.js | `^4.19.2` | Minimalist, unopinionated web routing framework with battle-tested middleware ecosystem (CORS, body parsers, error handlers). |
| **Real-Time Telemetry**| Native WebSockets (`ws`) | `^8.17.1` | Ultra-low latency, bidirectional persistent TCP socket connection for broadcasting live student attempt progress directly to teacher screens. |
| **Message Streaming** | Apache Kafka (KRaft mode) | `7.5.0` / `kafkajs ^2.2.4` | High-throughput distributed event bus for ingesting and processing student question telemetry events without Zookeeper dependency. |
| **Primary Database** | PostgreSQL | `16-alpine` | ACID-compliant relational persistence, native JSONB support for hierarchical rubrics/options, UUID generation (`uuid-ossp`, `pgcrypto`). |
| **Offline Dev DB** | Dual-Mode In-Memory Store | Custom Engine | Allows developers and automated test suites to run instantaneously without requiring a local PostgreSQL instance running. |
| **AI Multi-Modal LLM**| Google Gemini API | Gemini 1.5 Pro / Flash | High-accuracy multi-modal OCR for handwritten answer scripts, structured JSON schema outputs, and high-speed question generation. |
| **Document Export** | `docx` & Custom HTML-to-PDF | `^9.14.0` | Enables teachers to export generated question papers directly to editable Microsoft Word (`.docx`) and printable PDF handouts. |
| **Production Hosting**| Vercel Serverless Gateway | Version 2 | Serverless API route routing (`api/index.js`) combined with edge static CDN caching for frontend assets. |
| **Containerization** | Docker & Docker Compose | Compose v2 | Reproducible multi-stage container builds for PostgreSQL, Kafka broker, backend API, and Nginx frontend. |

---

## 3. Backend Low-Level Design (LLD)

### 3.1 Architecture Overview
The backend follows a layered service-oriented architecture:
```
Client (Browser / PWA)
       │
       ▼
Reverse Proxy / Vercel Edge Gateway
       │
       ├─────────────────────────────────────┐
       ▼                                     ▼
HTTP REST API Routes                  WebSocket Server
(/api/questions, /api/analytics,      (ws://localhost:5050)
 /api/curriculum, /api/telemetry,                    │
 /api/handwritten, /api/reports)                     ▼
       │                               Active Teacher Consoles
       ▼
Service Layer
├── class10MathQuestionBank.js (438 questions, 14 chapters)
├── curriculumTaxonomy.js      (NCERT/CBSE curriculum hierarchy)
├── llmQuestionEngine.js       (Gemini AI Question Generator)
├── geminiVisionService.js     (Multi-modal handwritten OCR)
├── handwrittenEvaluator.js    (Step-by-step scoring engine)
├── remedialAssignmentService.js(Targeted practice generation)
├── docxExportService.js       (Word document builder)
└── smartReportService.js      (Dual-directive generator)
       │
       ├─────────────────────────┐
       ▼                         ▼
Dual-Mode Data Layer        Event Streaming
├── PostgreSQL 16 (Live)    └── Apache Kafka (KRaft)
└── In-Memory Store (Dev)        ├── Producer (telemetry-events)
                                 └── Consumer (analytics-worker)
```

### 3.2 Key Route Handlers & APIs

#### 1. Questions & Solution Studio (`/api/questions`)
* `GET /api/questions/class10-math-bank`: Filters questions by chapter (1-14), source (`CBSE_PYQ`, `NCERT_EXERCISE`, `SAMPLE_PATTERN`), and difficulty (`EASY`, `MEDIUM`, `HARD`). Returns structured steps, concept keys, common traps, and formulas.
* `POST /api/questions/generate`: Invokes the LLM Question Engine to generate customized test papers with Bloom's Taxonomy tags and LaTeX formulas.
* `POST /api/questions/export-docx`: Generates a formatted Microsoft Word (`.docx`) file from selected questions.

#### 2. Curriculum & Remedial Pipeline (`/api/curriculum`)
* `GET /api/curriculum/taxonomy`: Returns the full hierarchical taxonomy (Class -> Stream -> Subject -> Chapter -> Subtopic).
* `POST /api/curriculum/remedial-plan`: Generates a personalized remedial assignment for a student based on their weak subtopics.
* `POST /api/curriculum/simulate-attempts`: Simulates realistic student attempts for testing analytics pipelines without manual exam taking.

#### 3. Telemetry Ingestion (`/api/telemetry`)
* `POST /api/telemetry/submit`: Ingests a student attempt payload. Emits an event to Kafka topic `student-telemetry-events` and broadcasts the update over WebSockets to connected teachers.

#### 4. Analytics & Class Progress Dashboard (`/api/analytics`)
* `GET /api/analytics/class-dashboard`: Fetches the class progress dashboard for an assessment. Handles empty/pending assessment states, student rosters, question matrices, and speed-accuracy distributions.
* `GET /api/analytics/student-drilldown`: Provides detailed telemetry breakdown for an individual student across all attempts.

#### 5. Handwritten Sheet Grading (`/api/handwritten`)
* `POST /api/handwritten/evaluate-sheet`: Accepts an uploaded image or base64 canvas of a student's handwritten answer sheet. Invokes Gemini Vision AI to transcribe steps to LaTeX, matches against the rubric, awards marks per step, and flags algebraic/conceptual errors.

### 3.3 Telemetry Classification Engine
The telemetry engine evaluates every student question attempt using high-resolution metrics:
$$\text{Accuracy} = \frac{\text{Marks Awarded}}{\text{Total Marks}}$$
$$\text{Velocity Ratio} = \frac{\text{Time Spent}}{\text{Benchmark Time}}$$

The engine classifies each attempt into one of five cognitive categories:
1. **FAST_ACCURATE**: $\text{Accuracy} \ge 0.8$ and $\text{Velocity Ratio} \le 1.0$. Concept mastered with high solving fluency.
2. **SLOW_ACCURATE**: $\text{Accuracy} \ge 0.8$ and $\text{Velocity Ratio} > 1.0$. Concept understood, but requires speed drills and formula shortcuts.
3. **FAST_CARELESS_SLIP**: $\text{Accuracy} < 0.8$ and $\text{Velocity Ratio} < 0.6$. Rushed attempt; missed negative signs, calculation units, or distractor traps.
4. **SLOW_MISCONCEPTION**: $\text{Accuracy} < 0.8$ and $\text{Velocity Ratio} \ge 1.0$. Fundamental conceptual flaw; requires 1-on-1 derivation review.
5. **UNTOUCHED**: Attempt skipped or timed out.

---

## 4. Database Architecture & Complete Table Schemas

The production database is PostgreSQL 16 with UUID and crypto extensions enabled. Exactly **12 primary relational tables** form the operational schema.

```
                           +-------------------+
                           |       users       |
                           +---------+---------+
                                     | 1
                                     |
              +----------------------+----------------------+
              | n                                           | n
    +---------v---------+                         +---------v---------+
    |    assessments    |                         |  concept_mastery  |
    +----+---------+----+                         +-------------------+
         | 1       | 1
         |         +-----------------------+
         | n                               | n
+--------v---------------+       +---------v--------------------+
|  assessment_questions  |       |  student_question_telemetry  |
+--------+---------------+       +------------------------------+
         | n                               | n
         | 1                               | 1
+--------v---------+                       |
|    questions     <-----------------------+
+--------+---------+
         | n
         | 1
+--------v---------+
|    subtopics     |
+--------+---------+
         | n
         | 1
+--------v---------+
|      topics      |
+--------+---------+
         | n
         | 1
+--------v---------+
|     subjects     |
+--------+---------+
         | n
         | 1
+--------v---------+
|     classes      |
+------------------+
```

### Table 1: `users`
Stores student, teacher, parent, and institutional administrator accounts.
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('TEACHER', 'STUDENT', 'PARENT', 'DIRECTOR', 'ADMIN')),
    roll_number VARCHAR(50) UNIQUE,
    grade VARCHAR(10),             -- '10', '11', '12'
    section VARCHAR(10),           -- 'Science-A', '12-NonMed', '12-Med'
    board VARCHAR(20) DEFAULT 'CBSE' CHECK (board IN ('CBSE', 'HP_BOARD', 'JEE_NEET', 'OLYMPIAD')),
    target_exam VARCHAR(50),       -- 'JEE_ADVANCED', 'NEET_UG', 'CBSE_BOARDS', 'HP_BOARDS'
    parent_contact VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

### Table 2: `classes`
Institutional academic cohorts and grade levels.
```sql
CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    grade_name VARCHAR(20) NOT NULL, -- 'Class X', 'Class XI', 'Class XII'
    stream VARCHAR(50) DEFAULT 'Science', -- 'Non-Medical (PCM)', 'Medical (PCB)', 'Secondary Foundation'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

### Table 3: `subjects`
Academic disciplines mapped to classes.
```sql
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(80) NOT NULL, -- 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'Science'
    code VARCHAR(20) UNIQUE NOT NULL,
    class_id INT REFERENCES classes(id) ON DELETE CASCADE
);
```

### Table 4: `topics`
Chapters and major curriculum units within a subject.
```sql
CREATE TABLE topics (
    id SERIAL PRIMARY KEY,
    subject_id INT REFERENCES subjects(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL, -- 'Real Numbers', 'Polynomials', 'Rotational Motion'
    code VARCHAR(50) NOT NULL
);
```

### Table 5: `subtopics`
Atomic granular learning objectives with benchmark solving speeds.
```sql
CREATE TABLE subtopics (
    id SERIAL PRIMARY KEY,
    topic_id INT REFERENCES topics(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL, -- 'Fundamental Theorem of Arithmetic', 'Moment of Inertia'
    code VARCHAR(50) NOT NULL,
    expected_benchmark_seconds INT DEFAULT 120
);
```

### Table 6: `questions`
Curated and AI-generated question bank with LaTeX formulas and Socratic hints.
```sql
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subtopic_id INT REFERENCES subtopics(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    curriculum_board VARCHAR(30) NOT NULL CHECK (curriculum_board IN ('CBSE', 'HP_BOARD', 'JEE_MAIN', 'JEE_ADVANCED', 'NEET', 'OLYMPIAD')),
    grade VARCHAR(10) NOT NULL,
    question_type VARCHAR(30) NOT NULL CHECK (question_type IN ('MCQ_SINGLE', 'MCQ_MULTIPLE', 'NUMERICAL', 'SUBJECTIVE_DERIVATION', 'ASSERTION_REASON')),
    bloom_level VARCHAR(30) DEFAULT 'APPLICATION' CHECK (bloom_level IN ('REMEMBER', 'UNDERSTAND', 'APPLICATION', 'ANALYZE', 'EVALUATE', 'CREATE')),
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD', 'OLYMPIAD_LEVEL')),
    question_latex TEXT NOT NULL,
    options_latex JSONB,        -- Array: [ { "key": "A", "latex": "$...$", "is_correct": true, "distractor_trap": "..." } ]
    correct_answer_latex TEXT NOT NULL,
    solution_latex TEXT NOT NULL,
    socratic_hints JSONB DEFAULT '[]'::JSONB,
    marking_rubric JSONB,       -- Step-by-step scoring rubric for subjective questions
    benchmark_time_seconds INT DEFAULT 120,
    is_ai_generated BOOLEAN DEFAULT FALSE,
    is_teacher_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

### Table 7: `assessments`
Scheduled quizzes, tests, and homework diagnostic sets.
```sql
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    curriculum_board VARCHAR(30) NOT NULL,
    grade VARCHAR(10) NOT NULL,
    section VARCHAR(20) NOT NULL,
    total_marks NUMERIC(5, 2) NOT NULL,
    duration_minutes INT NOT NULL,
    learning_mode VARCHAR(30) DEFAULT 'JEE_NEET' CHECK (learning_mode IN ('CBSE_EXCELLENCE', 'JEE_NEET', 'OLYMPIAD_ADVANCED')),
    is_published BOOLEAN DEFAULT FALSE,
    scheduled_start TIMESTAMPTZ,
    scheduled_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

### Table 8: `assessment_questions`
Join table mapping questions to assessments with custom marks and sequence order.
```sql
CREATE TABLE assessment_questions (
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    question_order INT NOT NULL,
    marks NUMERIC(4, 2) NOT NULL,
    negative_marks NUMERIC(4, 2) DEFAULT 0.00,
    PRIMARY KEY (assessment_id, question_id)
);
```

### Table 9: `student_question_telemetry`
Sub-second event stream records for student attempts.
```sql
CREATE TABLE student_question_telemetry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    attempt_status VARCHAR(20) NOT NULL CHECK (attempt_status IN ('CORRECT', 'INCORRECT', 'PARTIAL', 'UNATTEMPTED', 'MARKED_FOR_REVIEW')),
    time_spent_seconds INT NOT NULL,
    hesitation_seconds INT DEFAULT 0,
    option_flips_count INT DEFAULT 0,
    hints_requested_count INT DEFAULT 0,
    selected_option VARCHAR(10),
    student_response_latex TEXT,
    marks_awarded NUMERIC(4, 2) DEFAULT 0.00,
    telemetry_category VARCHAR(30) CHECK (telemetry_category IN ('FAST_ACCURATE', 'SLOW_ACCURATE', 'FAST_CARELESS_SLIP', 'SLOW_MISCONCEPTION', 'UNTOUCHED')),
    event_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

### Table 10: `concept_mastery`
Aggregated mastery matrix per student per subtopic.
```sql
CREATE TABLE concept_mastery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subtopic_id INT REFERENCES subtopics(id) ON DELETE CASCADE,
    mastery_status VARCHAR(30) NOT NULL CHECK (mastery_status IN ('MASTERED', 'NEEDS_RECAP', 'CRITICAL_WEAKNESS')),
    mastery_score NUMERIC(5, 2) NOT NULL, -- 0.00 to 100.00
    accuracy_percentage NUMERIC(5, 2) NOT NULL,
    total_attempts INT DEFAULT 0,
    average_time_spent_seconds INT DEFAULT 0,
    last_evaluated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_id, subtopic_id)
);
```

### Table 11: `handwritten_evaluations`
OCR transcriptions and step-by-step scoring of scanned physical answer sheets.
```sql
CREATE TABLE handwritten_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    sheet_image_url TEXT NOT NULL,
    ocr_transcription_latex TEXT,
    step_evaluations JSONB NOT NULL,
    total_marks_awarded NUMERIC(4, 2) NOT NULL,
    max_marks NUMERIC(4, 2) NOT NULL,
    error_type VARCHAR(40) CHECK (error_type IN ('NONE', 'CONCEPTUAL_GAP', 'ALGEBRAIC_SLIP', 'UNIT_OMISSION', 'INCOMPLETE_STEPS')),
    ai_confidence_score NUMERIC(4, 2) DEFAULT 0.95,
    teacher_verified BOOLEAN DEFAULT FALSE,
    teacher_adjusted_marks NUMERIC(4, 2),
    teacher_comments TEXT,
    evaluated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

### Table 12: `weekly_smart_reports`
Weekly institutional scorecards containing dual-action directives.
```sql
CREATE TABLE weekly_smart_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    overall_score_percentage NUMERIC(5, 2) NOT NULL,
    total_study_hours NUMERIC(4, 1) NOT NULL,
    questions_attempted INT NOT NULL,
    average_velocity_seconds INT NOT NULL,
    mastered_concepts JSONB NOT NULL,
    recap_concepts JSONB NOT NULL,
    weak_concepts JSONB NOT NULL,
    school_hostel_actions JSONB NOT NULL,
    parent_actions JSONB NOT NULL,
    report_pdf_url TEXT,
    generated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. Frontend & Functional Modular Sections

The frontend is organized as a Single Page Application (SPA) with seamless tab switching, stateful drawer navigation, and zero page reloads.

### Section 1: Create Tests & Quizzes (`tabGenerator`)
* **Purpose**: Allows teachers to configure and generate customized diagnostic tests in seconds.
* **Key Features**: Multi-chapter selection chips, Bloom's Taxonomy sliders, difficulty distribution, target board selector (CBSE, HP Board, JEE, NEET), dynamic KaTeX math preview, Word (`.docx`) export, and direct classroom assignment.

### Section 2: Question Bank & PYQs (`tabQuestionBank`)
* **Purpose**: Comprehensive CBSE Class 10 & Senior Secondary repository.
* **Key Features**:
  * 438 questions spanning all 14 Class 10 NCERT Mathematics chapters.
  * Filters: Source (`CBSE_PYQ 2020-2024`, `NCERT_EXERCISE`, `SAMPLE_PATTERN`) and Difficulty (`EASY`, `MEDIUM`, `HARD`).
  * **Intuitive Step Solution Studio**: Interactive modal with Concept Keys, Step Progressions, Traps/Common Errors, and printable chapter handouts.

### Section 3: Class Progress Dashboard (`tabClassAnalytics`)
* **Purpose**: Real-time cockpit for teachers during and after class assessments.
* **Key Features**:
  * Dynamic Class & Subject badge (e.g., `Class 10-Science-A • Mathematics`).
  * 4 KPI cards: Class Average Score, Velocity Index, Completion Rate, and Critical Weakness alerts.
  * Question Matrix Heatmap: Colors each question cell by class accuracy.
  * Student Performance Roster Table: Renders all enrolled students with live status (`Pending Attempt` vs `Completed`), scores, and drill-down buttons.
  * Simulation Engine: "Simulate Real Attempts" button to test analytics with synthetic cohort data.

### Section 4: Students & Smart Cards (`tabStudents`)
* **Purpose**: Deep-dive individual student profiling.
* **Key Features**: Mastery radar charts, time velocity graphs, attempt history, and error classification breakdown (Careless Slips vs Conceptual Gaps).

### Section 5: Weekly Smart Report (`tabSmartReports`)
* **Purpose**: Institutional report card generator with dual directives.
* **Key Features**: Generates structured reports separating Evening Hostel Study Actions (for wardens and teachers) from Home Reinforcement Actions (for parents). Includes one-click PDF generation and WhatsApp dispatch.

### Section 6: Scan Paper Sheets (`tabHandwritten`)
* **Purpose**: AI grading of physical paper answer sheets.
* **Key Features**: Drag-and-drop answer sheet image upload, live OCR transcription, step-by-step scoring against rubrics, and teacher mark adjustment slider.

### Section 7: Student Assessment Arena (`#studentAssessmentView`)
* **Purpose**: Full-screen timed quiz interface for students.
* **Key Features**: KaTeX formula display, timer countdown, progressive Socratic hints, and sub-second telemetry collection on option clicks and keystrokes.

---

## 6. Deployment Architecture, Release Gate & Commands

The project uses a strict, automated **13-Check Staging Release Gate** before any code touches the production domain.

```
Local Code Edit (staging branch)
               │
               ▼
Pre-flight Local Unit Tests (test_evaluator.js, test_class_progress_dashboard.js, etc.)
               │
               ▼
Deploy to Vercel Staging / Preview Environment
               │
               ▼
Automated Staging Gate Verification (scripts/verify_staging.js)
├── 1. Gateway Health Status
├── 2. School Profile & Curriculum Integrity
├── 3. Class 10 Math Bank Payload (438 questions, 14 chapters)
├── 4. Chapter Filtering & Question Schema
├── 5. Solution Studio Step Progression
├── 6. Test Generation Pipeline (Bloom's Taxonomy)
├── 7. Class Progress Dashboard (Class 10 Math)
├── 8. Zero-Submissions Resilience (Pending Roster)
├── 9. Attempt Simulation API
├── 10. Student Drilldown Telemetry
├── 11. Senior Physics Assessment
├── 12. Medical Biology Assessment
└── 13. Static Frontend Assets & KaTeX Bundles
               │
        ┌──────┴──────┐
     Passed         Failed
        │             │
        ▼             ▼
Promote to Prod    BLOCK DEPLOYMENT!
(vercel --prod)    (Exit with error code,
        │           Production untouched)
        ▼
Sync Git staging -> main
```

### Deployment Commands

#### 1. Promote to Production (Automated Gate)
Runs pre-flight tests, deploys to preview, executes the 13 verification checks, and promotes to production:
```bash
npm run promote:production
```
*Direct script invocation:*
```bash
./scripts/promote_to_production.sh
```

#### 2. Manual Staging Preview Deployment
```bash
npm run deploy:staging
```

#### 3. Run Staging Verification Against Any Live URL
```bash
node scripts/verify_staging.js "https://haps-ai-scholar-assistant-<hash>.vercel.app"
```

#### 4. Run Multi-Stage Docker Build
To test the Docker containerization locally:
```bash
# Build both backend and frontend images
docker compose build

# Start the full stack (PostgreSQL + Kafka + Backend + Frontend)
docker compose up -d

# View real-time logs
docker compose logs -f backend

# Stop the stack
docker compose down
```

---

## 7. Local Laptop Setup with Antigravity IDE

Follow this step-by-step guide to configure and run the project on your development machine using the Google Antigravity IDE.

### Step 1: System Prerequisites
Ensure your workstation has the following installed:
* **Node.js**: Version 20.0.0 or higher (`node -v`)
* **npm**: Version 10.0.0 or higher (`npm -v`)
* **Git**: Version 2.40+ (`git --version`)
* **Docker Desktop**: Optional for container runs (`docker --version`)

### Step 2: Clone and Workspace Location
When working in Antigravity, projects reside in the scratch workspace:
```bash
cd /Users/ajaymokta2002/.gemini/antigravity-ide/scratch/haps-ai-scholar-assistant
```

### Step 3: Install Node Dependencies
```bash
npm install
```

### Step 4: Configure Environment Variables
Verify or create the `backend/.env` file:
```bash
cat << 'EOF' > backend/.env
NODE_ENV=development
PORT=5050
FRONTEND_PORT=3008
DATABASE_URL=postgres://haps_admin:haps_secure_password_2026@localhost:5432/haps_scholar_db
KAFKA_BROKERS=localhost:9092
JWT_SECRET=haps_super_secret_jwt_key_2026_him_academy
GEMINI_API_KEY=mock_key_for_offline_eval
EOF
```
*(Note: If PostgreSQL or Kafka are not running locally, the backend automatically switches to its in-memory database with pre-seeded Class 10 Math, Class 10 Science, Senior Physics, and Medical Biology data).*

### Step 5: Start the Development Servers
In Antigravity IDE, run the backend and frontend as persistent background tasks:

**Start Backend Gateway (Port 5050):**
```bash
node backend/src/server.js
```

**Start Frontend Server (Port 3008):**
```bash
node scripts/frontend_server.js
```

**Verify local health:**
```bash
curl -s http://localhost:5050/api/health
```

### Step 6: Antigravity IDE Workflows
* **Persistent Terminals**: Use persistent terminal IDs to keep development servers alive between commands.
* **Slash Commands**:
  * `/plan`: Formulate a step-by-step architectural plan before touching core services.
  * `/goal`: Initiate long-running end-to-end task flows.
  * `/grill-me`: Clarify complex specifications through interactive design interviews.
* **Browser Subagent**: Antigravity's browser subagent can open `http://localhost:3008`, click buttons, simulate student logins, and verify visual rendering.

---

## 8. Automated Testing & Verification Suite

Before committing code, interns must run the automated test suite. All tests must pass with 0 failures.

### Test Commands
```bash
# 1. Class Progress Dashboard & 0-Submission Resilience (45 assertions)
node scripts/test_class_progress_dashboard.js

# 2. CBSE Class 10 Math Question Bank & Solution Studio (30 assertions)
node scripts/test_question_bank_solution_studio.js

# 3. Class 10 Sync & PYQ Bank Validation (22 assertions)
node scripts/test_class10_sync_and_banks.js

# 4. Teacher Authentication & Senior Subject Isolation (35 assertions)
node scripts/test_teacher_auth_and_class_management.js

# 5. Core Evaluator & Telemetry Categorization (24 assertions)
node scripts/test_evaluator.js

# 6. Subject-Specific Remedial Assignment Pipeline (28 assertions)
node scripts/test_subject_remedial_pipeline.js
```

### Master Regression Run
To run all test suites sequentially:
```bash
npm test && \
node scripts/test_subject_remedial_pipeline.js && \
node scripts/test_teacher_auth_and_class_management.js && \
node scripts/test_class10_sync_and_banks.js && \
node scripts/test_question_bank_solution_studio.js && \
node scripts/test_class_progress_dashboard.js
```

---

## 9. Intern Best Practices, Git Workflow & Rules

### 9.1 Core Engineering Commitments
1. **Zero Emojis Policy**: Do not include emojis in code, comments, log messages, commit messages, or user-facing documentation. Adhere strictly to clean, professional ASCII and UTF-8 formatting.
2. **Clickable Links**: All file and symbol references in project documentation must use GitHub-style markdown links with the `file://` scheme.
3. **Senior Secondary Subject Isolation**: Faculty profiles are strictly partitioned by department. Physics teachers (`fac_phy_01`) must not see or alter Biology assessments (`fac_bio_01`), and Class 10 Foundation teachers (`fac_c10_math_01`, `fac_c10_sci_01`) operate under their respective domains.
4. **Defensive Programming**: Never assume nested API fields exist. Always use optional chaining (e.g., `data?.assessment?.id`) and provide explicit fallbacks for empty states.
5. **No Placeholders**: Never ship `// TODO: implement later` or placeholder images. Every feature must be fully functional and test-backed.

### 9.2 Git Branching & Pull Request Workflow
1. Create a feature branch off `staging`:
   ```bash
   git checkout staging
   git pull origin staging
   git checkout -b feature/your-feature-name
   ```
2. Implement changes, following modular boundaries.
3. Run the complete local test suite.
4. Commit with descriptive semantic commit messages:
   ```bash
   git commit -m "feat(question-bank): add chapter 14 probability PYQs and traps"
   ```
5. Merge into `staging` and execute the release gate:
   ```bash
   git checkout staging
   git merge feature/your-feature-name
   npm run promote:production
   ```
6. The promotion script automatically validates staging and synchronizes `main`.

---
*End of Onboarding Manual. For technical questions or architecture reviews, consult your Antigravity Pair Programmer or Senior Systems Architect.*
