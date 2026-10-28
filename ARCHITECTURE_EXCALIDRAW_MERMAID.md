# HAPS-AI Scholar Assistant - Complete Architecture Diagrams for Excalidraw

This document contains production-grade Mermaid diagram code tailored for direct import into **Excalidraw** (`Insert` -> `Mermaid` or paste).

It covers the complete system architecture, data flow, pedagogical engines, multi-LLM orchestration, and release deployment pipeline for project handover.

---

## How to Import into Excalidraw

1. Open [Excalidraw](https://excalidraw.com).
2. Click the three horizontal dots `...` (More Tools) in the toolbar.
3. Select **Mermaid to Excalidraw** (or press the Mermaid shortcut).
4. Copy and paste any of the diagram blocks below into the text box and click **Insert**.

---

## Diagram 1: Master End-to-End System Architecture

This master diagram details the six horizontal architectural tiers: Frontend Presentation, API Gateway, Pedagogical Intelligence Core, Dual-Engine LLM Services, Data & Streaming Persistence, and Release Gates.

```mermaid
flowchart TD
    %% TIER 1: PRESENTATION LAYER
    subgraph Tier1 ["1. Client & Presentation Layer (KaTeX + Chart.js)"]
        direction TB
        UI_Student["Student Portal\n- Diagnostic Assessment Engine\n- Instant Formula Practice\n- Interactive Socratic Hints\n- KaTeX Dynamic LaTeX Rendering"]
        UI_Teacher["Teacher Portal\n- Test Builder & Chapter Taxonomy\n- Question Bank Solution Studio\n- Class Performance Dashboard\n- Student Drilldown Smart Cards"]
        UI_Admin["HOD & Academic Admin\n- Departmental Faculty Directory\n- Senior Secondary Subject Isolation\n- Curriculum Governance Matrix"]
    end

    %% TIER 2: GATEWAY & ROUTING LAYER
    subgraph Tier2 ["2. API Gateway & Routing Layer (Express 4.19 / Vercel Serverless)"]
        direction TB
        GW_Router["Central API Router (/api)\n- CORS & Security Headers\n- Rate Limiting & Validation"]
        GW_Auth["Teacher Faculty Auth\n- Phone Lookup (9816010001-11)\n- Subject Key Binding\n- Role Scoping (STUDENT/TEACHER)"]
        GW_Iso["Senior Secondary Isolation Guard\n- Class 10: Math & Science\n- Class 11/12: Physics/Chem/Bio\n- Prevents Cross-Subject Pollution"]
    end

    %% TIER 3: PEDAGOGICAL CORE ENGINES
    subgraph Tier3 ["3. Pedagogical Core Engines (Business Logic)"]
        direction TB
        ENG_Taxonomy["Curriculum Taxonomy Engine\n- 14 Class 10 Math Chapters\n- Senior Secondary Boards\n- CBSE & HP Board Standards"]
        ENG_QB["Question Bank & Solution Studio\n- 438 Class 10 Math Questions\n- 310 Board PYQs (2020-2024)\n- 68 NCERT Exercises\n- Step-by-Step Derivations & Rubrics"]
        ENG_Eval["Diagnostic Evaluation Engine\n- Automated MCQ & Short Answer Grading\n- Mistake Classification Engine\n- Conceptual vs Formula vs Calculation"]
        ENG_Analytics["Class Analytics & Telemetry Engine\n- Pacing Benchmark (90s / Question)\n- Class Average, Highest & Lowest KPIs\n- Pedagogical Action Plan: Recap vs Reteach\n- 8-Student Class Roster & Matrix"]
        ENG_Remedial["Remedial & Flash Quiz Generator\n- 1-Click Class Quiz Assignment\n- Micro-Remedial Targeting\n- Distractor Trap Guidance"]
    end

    %% TIER 4: DUAL-ENGINE MULTI-LLM LAYER
    subgraph Tier4 ["4. Dual-Engine Multi-LLM Layer"]
        direction TB
        LLM_Router["LLM Orchestrator & Fallback Router"]
        LLM_Groq["Groq LPU Engine\n- Models: gpt-oss-120b, qwen3.8-27b\n- Sub-second (~300-800ms) Generation\n- Structured JSON & Step Rubrics"]
        LLM_Gemini["Google Gemini Flash Engine\n- Multimodal Vision & Diagram Parser\n- Complex Math Proof Derivations\n- Socratic Hint Expansion"]
        LLM_Offline["Deterministic Offline Fallback\n- 438 Pre-compiled NCERT/PYQ Bank\n- Zero External Dependency Guard"]
    end

    %% TIER 5: PERSISTENCE & STREAMING LAYER
    subgraph Tier5 ["5. Persistence & Event Streaming Layer"]
        direction TB
        DB_Postgres["PostgreSQL 16 Relational Store\n- Users & Enrolled Rosters\n- Assessments & Question Metadata\n- Student Submissions & Telemetry Logs\n- Schema & Seed Scripts in /database"]
        DB_InMemory["High-Speed In-Memory Store\n- Seeded Assessments & Class Submissions\n- Zero-Configuration Offline Dev Mode\n- Fast CI/CD Verification Engine"]
        BUS_Kafka["Apache Kafka (KRaft Mode)\n- Topics: student.attempts, telemetry.pacing\n- Real-time Diagnostic Stream\n- Zero Zookeeper Overhead"]
    end

    %% TIER 6: STAGING-TO-PRODUCTION GATE
    subgraph Tier6 ["6. Two-Tier Release Gate Architecture"]
        direction TB
        PIPE_Staging["Staging / Preview Environment\n- Branch: staging\n- Preview URL via Vercel CLI\n- SSO Deployment Protection"]
        PIPE_Gate["13-Point Automated Gate (verify_staging.js)\n- API Health, Telemetry, LaTeX Engine\n- Subject Isolation & Phone Auth\n- Class 10 438-Question Bank Integrity"]
        PIPE_Prod["Production Environment\n- Branch: main\n- Public URL: haps-ai-scholar-assistant.vercel.app\n- High Availability Edge Network"]
    end

    %% RELATIONSHIPS & FLOWS
    UI_Student -->|REST / WebSockets| GW_Router
    UI_Teacher -->|REST / WebSockets| GW_Router
    UI_Admin -->|Faculty Controls| GW_Router

    GW_Router --> GW_Auth
    GW_Router --> GW_Iso
    GW_Auth --> GW_Iso

    GW_Iso --> ENG_Taxonomy
    GW_Iso --> ENG_QB
    GW_Iso --> ENG_Eval
    GW_Iso --> ENG_Analytics
    GW_Iso --> ENG_Remedial

    ENG_QB --> LLM_Router
    ENG_Eval --> LLM_Router
    ENG_Remedial --> LLM_Router

    LLM_Router -->|Primary High-Speed| LLM_Groq
    LLM_Router -->|Vision & Deep Proofs| LLM_Gemini
    LLM_Router -->|Failover / Rate Limit| LLM_Offline

    ENG_Eval --> DB_Postgres
    ENG_Eval --> DB_InMemory
    ENG_Analytics --> DB_Postgres
    ENG_Analytics --> DB_InMemory
    ENG_Eval -->|Publish Attempt Events| BUS_Kafka
    BUS_Kafka -->|Stream Aggregation| ENG_Analytics

    PIPE_Staging --> PIPE_Gate
    PIPE_Gate -->|100% Passed Gate Approval| PIPE_Prod
    PIPE_Prod -.->|Sync Git| PIPE_Staging
```

---

## Diagram 2: Teacher Question Bank & Step Solution Studio Lifecycle

This diagram demonstrates how a faculty member interacts with chapter filters, selects CBSE PYQs or NCERT questions, and generates intuitive step-by-step solutions or assigns flash quizzes.

```mermaid
flowchart TD
    StartTeacher["Teacher Logs in with Mobile Number\n(e.g., Mrs. Meenakshi Sharma - 9816010003)"] --> AuthSuccess["System Authenticates Subject Scope:\nCLASS10_MATHEMATICS (10-Science-A)"]
    
    AuthSuccess --> OpenQBTab["Open Question Bank Tab (#tabQuestionBank)"]
    
    OpenQBTab --> FetchBank["GET /api/questions/class10-math-bank\nLoads 438 Curated Questions"]
    
    FetchBank --> FilterUI["Question Bank Studio Interface"]
    
    FilterUI --> SelectChapter["Filter by Chapter (1 to 14)\n- Ch 1: Real Numbers (49 Qs)\n- Ch 2: Polynomials (32 Qs)\n- Ch 3: Linear Equations (30 Qs)\n- Ch 4: Quadratic Equations (33 Qs)\n- Ch 5 to 14: AP, Triangles, Stats, etc."]
    
    FilterUI --> SelectSource["Filter by Question Source\n- CBSE Board PYQ (310 Qs)\n- NCERT Textbook (68 Qs)\n- CBSE Sample Pattern (60 Qs)"]
    
    FilterUI --> SelectDifficulty["Filter by Difficulty\n- EASY (1 Mark)\n- MEDIUM (2-3 Marks)\n- HARD (4-5 Marks)"]

    SelectChapter --> FilteredList["Render Filtered Question Cards\nwith KaTeX Mathematical Expressions"]
    SelectSource --> FilteredList
    SelectDifficulty --> FilteredList

    FilteredList --> ActionStudio["Teacher Clicks: View Step Solution Studio"]
    FilteredList --> ActionAssign["Teacher Clicks: Assign Flash Quiz to Class"]
    FilteredList --> ActionMaster["Teacher Clicks: Open Chapter Solution Sheet Handout"]

    ActionStudio --> ModalStudio["Modal: Step Solution Studio Popup\n- Core Formula & Theorem Principle\n- Intuitive Step-by-Step Derivation\n- Verified Final Answer\n- CBSE Official Step Marking Rubric\n- Socratic Guided Prompts for Class"]
    
    ActionMaster --> ModalHandout["Modal: Full Chapter Handout\n- Printable Clean LaTeX Layout\n- Department of Mathematics Header\n- Complete Classroom Solutions Sheet"]
    
    ActionAssign --> PostQuiz["POST /api/curriculum/generate-test\nCreates Single-Question Assessment"]
    PostQuiz --> QuizReady["Assessment Instant Ready for Class Attempt"]
```

---

## Diagram 3: Assessment Evaluation & Class Progress Dashboard Engine

This diagram outlines how student submissions are collected, evaluated against pacing benchmarks and error taxonomies, and rendered live on the Class Progress Dashboard.

```mermaid
flowchart TD
    StudentSubmits["Student Completes Assessment in Portal\n(Answers, Option Selections, Time per Question)"] --> PostSubmit["POST /api/assessments/:id/submit\nPayload received by Evaluator Router"]
    
    PostSubmit --> EvaluatorEngine["Evaluator Core Engine"]
    
    subgraph ScoringProcess ["Scoring & Diagnostic Classification"]
        EvaluatorEngine --> CheckCorrectness{"Is Answer Option Correct?"}
        CheckCorrectness -->|Yes| MarkCorrect["Score +4 Marks\nMistake Type: NONE\nPacing: Fast / Optimal"]
        CheckCorrectness -->|No| ClassifyMistake["Score 0 Marks\nClassify Dominant Error:"]
        
        ClassifyMistake --> MistakeConceptual["CONCEPTUAL\n(Theorem or boundary condition misunderstood)"]
        ClassifyMistake --> MistakeFormula["FORMULA_BASED\n(Wrong formula chosen or identity inverted)"]
        ClassifyMistake --> MistakeCalc["CALCULATION\n(Arithmetic slip or sign convention error)"]
        ClassifyMistake --> MistakeSign["SIGN_CONVENTION\n(Sign inverted during transposition)"]
    end

    MarkCorrect --> RecordTelemetry["Record Time Spent vs 90s Benchmark"]
    MistakeConceptual --> RecordTelemetry
    MistakeFormula --> RecordTelemetry
    MistakeCalc --> RecordTelemetry
    MistakeSign --> RecordTelemetry

    RecordTelemetry --> SaveSubmission["Save Record to In-Memory & Postgres Store"]
    SaveSubmission --> EmitKafka["Emit Event: student.assessment.evaluated"]

    EmitKafka --> TeacherDashboard["Teacher Opens Class Progress Dashboard\nGET /api/analytics/class-dashboard?subjectKey=..."]

    subgraph DashboardMetrics ["Dashboard Live Analytics Output"]
        TeacherDashboard --> KPICards["KPI Summary Cards:\n- Class Average Score & Percentage\n- Highest Score (Topper Identification)\n- Lowest Score (Remedial Focus)\n- Average Solving Velocity (m:s vs 90s/Q)"]
        
        TeacherDashboard --> FourCharts["Chart.js Visual Analytics (Single Safe Render):\n1. Horizontal Bar: Solved Correctly vs Errors\n2. Doughnut: Score Bracket Distribution (Distinction, Pass, Remedial)\n3. Bar: Question Pacing vs Standard 90s Benchmark\n4. Doughnut: Common Mistake Categories Breakdown"]
        
        TeacherDashboard --> Highlights["Question Highlights:\n- Most Attempted Question\n- Most Failed Question & Stumble Category\n- Pacing Time Lag Hotspot Alert"]
        
        TeacherDashboard --> ActionPlan["Pedagogical Action Directives:\n- Quick Recap Topics (50% to 75% accuracy)\n- Teach Once Again Directives (<50% accuracy)"]
        
        TeacherDashboard --> QuestionMatrix["Question Matrix Table:\n- Q1 to QN topic, attempt %, accuracy %, time, dominant mistake, status"]
        
        TeacherDashboard --> StudentRoster["Student Performance Roster Table:\n- Roll Number, Name, Score, Total Time, Wrong Count, Smart Card Link"]
    end

    StudentRoster --> DrilldownModal["Teacher Clicks: View Smart Card\nOpens Individual Student Drilldown Modal\nTime Breakdown + Targeted Remedial Notes"]
```

---

## Diagram 4: Two-Tier Staging-to-Production Release Gate Pipeline

This diagram explains the safety gate mechanism ensuring that code is never pushed directly to production without passing local diagnostic suites and the 13 automated staging verification checks.

```mermaid
flowchart TD
    Developer["Developer / Agent Introduces Feature or Bugfix"] --> CommitStaging["Commit & Push to 'staging' Branch"]
    
    CommitStaging --> RunPipeline["Execute: ./scripts/promote_to_production.sh"]
    
    subgraph Stage1 ["Stage 1: Local Pre-Flight Diagnostic Suite"]
        RunPipeline --> Test1["test_evaluator.js (Core Evaluator & Scoring)"]
        Test1 --> Test2["test_subject_remedial_pipeline.js (Remedial Actions)"]
        Test2 --> Test3["test_teacher_auth_and_class_management.js (Faculty Auth)"]
        Test3 --> Test4["test_class10_sync_and_banks.js (Class 10 14 Chapters)"]
        Test4 --> Test5["test_question_bank_solution_studio.js (Solution Studio)"]
        Test5 --> Test6["test_class_progress_dashboard.js (45 Analytics Tests)"]
    end

    Test6 --> LocalCheck{"All Local Tests Passed?"}
    LocalCheck -->|No| BlockLocal["ABORT: Local Diagnostic Failed\nWorking tree preserved for debugging"]
    LocalCheck -->|Yes| DeployStaging["Stage 2: Deploy to Vercel Staging Environment\n(npx vercel deploy --yes)"]

    DeployStaging --> PreviewUrl["Generate Staging Preview URL\n(e.g., haps-ai-scholar-assistant-qcwwl1vne.vercel.app)"]

    subgraph Stage3 ["Stage 3: Automated Staging Verification Suite (13 Checks)"]
        PreviewUrl --> Warmup["Warming Up Preview Serverless Functions"]
        Warmup --> Check1["1. API Health Gateway (/api/health)"]
        Check1 --> Check2["2. Assessments Catalog (/api/assessments)"]
        Check2 --> Check3["3. Question Retrieval with LaTeX Formulas"]
        Check3 --> Check4["4. Class Telemetry & Pedagogical Action Plan"]
        Check4 --> Check5["5. Exam Pattern Blueprint Intelligence"]
        Check5 --> Check6["6. Live Test Submission Flow"]
        Check6 --> Check7["7. Remedial Formula Verification API"]
        Check7 --> Check8["8. Frontend App Shell & Modals (/index.html)"]
        Check8 --> Check9["9. Teacher Faculty Directory (/api/curriculum/faculty)"]
        Check9 --> Check10["10. Strict Subject Isolation Guard"]
        Check10 --> Check11["11. Teacher Mobile & Expertise Auth"]
        Check11 --> Check12["12. Biology Isolated Medical Students"]
        Check12 --> Check13["13. Class 10 Math 14-Chapter 438-Bank Integrity"]
    end

    Check13 --> StagingCheck{"100% of 13 Checks Passed?"}
    StagingCheck -->|No| BlockProd["STAGING GATE BLOCKED!\nExit with code > 0\nProduction strictly UNTOUCHED"]
    StagingCheck -->|Yes| Stage4["Stage 4: Promote and Deploy to Vercel Production\n(npx vercel deploy --prod --yes)"]

    Stage4 --> AliasProd["Alias to Live URL: haps-ai-scholar-assistant.vercel.app"]
    AliasProd --> MergeGit["Fast-Forward Merge 'staging' into 'main'\nPush updated 'main' to GitHub Origin"]
    MergeGit --> HealthPing["Final Production Health Validation Ping"]
    HealthPing --> SuccessHandover["PRODUCTION RELEASE COMPLETE & VERIFIED"]
```

---

## Diagram 5: Senior Secondary Subject Isolation Data Boundary

This diagram illustrates how data boundaries and teacher scopes are strictly isolated between Class 10 Foundation and Class 11/12 Senior Secondary Medical and Non-Medical streams.

```mermaid
flowchart TD
    TeacherLogin["Teacher Authentication Header / Query Parameter\n(teacherSubjectKey or faculty mobile lookup)"] --> BoundaryGuard{"Subject Isolation Boundary Guard"}
    
    BoundaryGuard -->|CLASS10_MATHEMATICS| ScopeClass10Math["Scope: Class 10 Mathematics (Mrs. Meenakshi Sharma)\n- Class Roster: 10-Science-A\n- Syllabus: 14 NCERT Chapters\n- Bank: 438 Class 10 Math Questions\n- JEE/NEET Stream Tabs: HIDDEN"]
    
    BoundaryGuard -->|CLASS10_SCIENCE| ScopeClass10Sci["Scope: Class 10 Science (Er. Rakesh Thakur)\n- Class Roster: 10-Science-A\n- Syllabus: Physics, Chem, Bio Foundation\n- JEE/NEET Stream Tabs: HIDDEN"]
    
    BoundaryGuard -->|PHYSICS| Scope1112Phy["Scope: Senior Physics (+1 & +2) (Dr. Vikram Sharma)\n- Stream: 11-NonMed / 12-NonMed\n- Target Exam: JEE Main & Advanced\n- Roster: Non-Medical Students Only (Aryan, Rohit Negi, etc.)\n- Biology Curriculum: ISOLATED"]
    
    BoundaryGuard -->|BIOLOGY| Scope1112Bio["Scope: Medical Biology (+1 & +2) (Dr. Ananya Mukherjee)\n- Stream: 11-Med / 12-Med\n- Target Exam: NEET-UG\n- Roster: Medical Students Only (Riya, Ayush, Deepak, Kriti)\n- Engineering Mathematics: ISOLATED"]
    
    BoundaryGuard -->|CHEMISTRY| Scope1112Chem["Scope: Senior Chemistry (+1 & +2) (Dr. Suresh Kumar)\n- Stream: Common Medical & Non-Medical\n- Organic, Inorganic, Physical Chemistry"]

    ScopeClass10Math --> ResponseFilter["Strict JSON Filter: Class Roster & Available Assessments List"]
    ScopeClass10Sci --> ResponseFilter
    Scope1112Phy --> ResponseFilter
    Scope1112Bio --> ResponseFilter
    Scope1112Chem --> ResponseFilter
    
    ResponseFilter --> CleanDashboard["Safe, Clean, Unpolluted Faculty Portal View"]
```

---

## Summary of Key File Locations for Handover

| Architectural Component | File Path | Key Responsibilities |
| :--- | :--- | :--- |
| **Frontend Controller** | [frontend/js/app.js](file:///Users/ajaymokta2002/.gemini/antigravity-ide/scratch/haps-ai-scholar-assistant/frontend/js/app.js) | UI state, KaTeX rendering, Solution Studio modal, Chart.js analytics |
| **Frontend Structure** | [frontend/index.html](file:///Users/ajaymokta2002/.gemini/antigravity-ide/scratch/haps-ai-scholar-assistant/frontend/index.html) | Modern glassmorphic DOM layout, KPI cards, tables, modal containers |
| **Database & In-Memory Store** | [backend/src/config/database.js](file:///Users/ajaymokta2002/.gemini/antigravity-ide/scratch/haps-ai-scholar-assistant/backend/src/config/database.js) | Dual PostgreSQL/in-memory store, seeded rosters, Class 10 math assessments |
| **Class Analytics API** | [backend/src/routes/analytics.js](file:///Users/ajaymokta2002/.gemini/antigravity-ide/scratch/haps-ai-scholar-assistant/backend/src/routes/analytics.js) | Velocity calculations, error taxonomies, recap vs reteach action plans |
| **Curriculum & Test Builder API**| [backend/src/routes/curriculum.js](file:///Users/ajaymokta2002/.gemini/antigravity-ide/scratch/haps-ai-scholar-assistant/backend/src/routes/curriculum.js) | Faculty lookup, class rosters, test generation, attempt simulation |
| **Class 10 Math Bank (438 Qs)** | [backend/src/services/class10MathQuestionBank.js](file:///Users/ajaymokta2002/.gemini/antigravity-ide/scratch/haps-ai-scholar-assistant/backend/src/services/class10MathQuestionBank.js) | 14 chapters, 310 PYQs, 68 NCERT exercises, step rubrics |
| **Automated Verification Suite** | [scripts/verify_staging.js](file:///Users/ajaymokta2002/.gemini/antigravity-ide/scratch/haps-ai-scholar-assistant/scripts/verify_staging.js) | 13-point staging gate automated test runner |
| **Promotion Shell Pipeline** | [scripts/promote_to_production.sh](file:///Users/ajaymokta2002/.gemini/antigravity-ide/scratch/haps-ai-scholar-assistant/scripts/promote_to_production.sh) | Zero-downtime staging-to-production promotion and git sync pipeline |
