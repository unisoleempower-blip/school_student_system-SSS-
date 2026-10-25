-- ============================================================================
-- HAPS-AI SCHOLAR ASSISTANT: SUBJECT-WISE QUESTION BANK SCHEMA
-- Hierarchical Architecture for:
--  - Class 10 Foundation (Mathematics, Science)
--  - Class 11 & 12 Non-Medical (Physics, Chemistry, Mathematics -> JEE Main / Adv / Boards)
--  - Class 11 & 12 Medical (Physics, Chemistry, Biology -> NEET / Boards)
-- ============================================================================

-- Enum for Streams
CREATE TYPE academic_stream AS ENUM ('FOUNDATION', 'NON_MEDICAL', 'MEDICAL', 'COMMON_SENIOR');

-- Enum for Subject Names
CREATE TYPE subject_category AS ENUM (
    'CLASS10_MATHEMATICS',
    'CLASS10_SCIENCE',
    'SENIOR_PHYSICS',
    'SENIOR_CHEMISTRY',
    'SENIOR_MATHEMATICS',
    'SENIOR_BIOLOGY'
);

-- Enum for Exam Types
CREATE TYPE target_exam_type AS ENUM (
    'CBSE_CLASS_10',
    'HP_BOARD_CLASS_10',
    'CBSE_CLASS_12',
    'HP_BOARD_CLASS_12',
    'JEE_MAIN',
    'JEE_ADVANCED',
    'NEET_UG',
    'NTSE_OLYMPIAD'
);

-- Enum for Question Formats
CREATE TYPE question_format_type AS ENUM (
    'MCQ_SINGLE',
    'MCQ_MULTIPLE',
    'NUMERICAL_INTEGER',
    'NUMERICAL_DECIMAL',
    'ASSERTION_REASON',
    'CASE_BASED',
    'VERY_SHORT_ANSWER',
    'SHORT_ANSWER',
    'LONG_DERIVATION'
);

-- ============================================================================
-- 1. CLASS 10 MATHEMATICS QUESTION BANK
-- ============================================================================
CREATE TABLE IF NOT EXISTS bank_class10_mathematics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade VARCHAR(10) DEFAULT '10',
    stream academic_stream DEFAULT 'FOUNDATION',
    chapter_number INT NOT NULL,
    chapter_name VARCHAR(150) NOT NULL,
    topic VARCHAR(150) NOT NULL,
    subtopic VARCHAR(200),
    
    -- NCERT Mapping & Curricular Reference
    ncert_page_reference VARCHAR(100),
    ncert_exercise_q VARCHAR(100),
    curriculum_board target_exam_type DEFAULT 'CBSE_CLASS_10',
    pyq_appearance VARCHAR(255), -- e.g. "CBSE 2024 Standard (Set 30/1/1), HPBOSE 2022"
    historical_frequency INT DEFAULT 1, -- frequency of similar question in past 10 years
    exam_section VARCHAR(20) DEFAULT 'SECTION_A', -- SECTION_A, B, C, D, E (Case-based)
    
    -- Content & Mathematics
    question_format question_format_type NOT NULL DEFAULT 'MCQ_SINGLE',
    difficulty VARCHAR(20) DEFAULT 'MEDIUM', -- EASY, MEDIUM, HARD
    bloom_level VARCHAR(30) DEFAULT 'APPLICATION',
    marks_weightage NUMERIC(3, 1) DEFAULT 1.0,
    benchmark_time_seconds INT DEFAULT 90,
    
    question_latex TEXT NOT NULL,
    options_latex JSONB DEFAULT '[]'::jsonb, -- [{ "key": "A", "latex": "...", "is_correct": true, "distractor_trap": "..." }]
    correct_answer_latex TEXT NOT NULL,
    solution_latex TEXT NOT NULL,
    step_rubric JSONB DEFAULT '[]'::jsonb, -- [{ "step": 1, "description": "...", "marks": 1.0 }]
    socratic_hints JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. CLASS 10 SCIENCE QUESTION BANK (Physics, Chemistry, Biology)
-- ============================================================================
CREATE TABLE IF NOT EXISTS bank_class10_science (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade VARCHAR(10) DEFAULT '10',
    stream academic_stream DEFAULT 'FOUNDATION',
    discipline VARCHAR(50) NOT NULL, -- 'PHYSICS', 'CHEMISTRY', 'BIOLOGY'
    chapter_number INT NOT NULL,
    chapter_name VARCHAR(150) NOT NULL,
    topic VARCHAR(150) NOT NULL,
    subtopic VARCHAR(200),
    
    ncert_page_reference VARCHAR(100),
    ncert_exercise_q VARCHAR(100),
    curriculum_board target_exam_type DEFAULT 'CBSE_CLASS_10',
    pyq_appearance VARCHAR(255),
    historical_frequency INT DEFAULT 1,
    exam_section VARCHAR(20) DEFAULT 'SECTION_A',
    
    question_format question_format_type NOT NULL DEFAULT 'MCQ_SINGLE',
    difficulty VARCHAR(20) DEFAULT 'MEDIUM',
    bloom_level VARCHAR(30) DEFAULT 'UNDERSTAND',
    marks_weightage NUMERIC(3, 1) DEFAULT 1.0,
    benchmark_time_seconds INT DEFAULT 90,
    
    question_latex TEXT NOT NULL,
    options_latex JSONB DEFAULT '[]'::jsonb,
    correct_answer_latex TEXT NOT NULL,
    solution_latex TEXT NOT NULL,
    step_rubric JSONB DEFAULT '[]'::jsonb,
    socratic_hints JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. SENIOR PHYSICS QUESTION BANK (Class 11 & 12: Medical & Non-Medical)
-- ============================================================================
CREATE TABLE IF NOT EXISTS bank_senior_physics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade VARCHAR(10) NOT NULL, -- '11' or '12'
    stream academic_stream DEFAULT 'COMMON_SENIOR', -- Both Med & Non-Med take Physics
    target_exam target_exam_type NOT NULL DEFAULT 'JEE_MAIN', -- 'JEE_MAIN', 'NEET_UG', 'CBSE_CLASS_12', 'HP_BOARD_CLASS_12'
    
    unit_name VARCHAR(150) NOT NULL, -- Mechanics, Electrodynamics, Optics, Modern Physics
    chapter_number INT NOT NULL,
    chapter_name VARCHAR(150) NOT NULL,
    topic VARCHAR(150) NOT NULL,
    subtopic VARCHAR(200),
    
    ncert_page_reference VARCHAR(100),
    pyq_appearance VARCHAR(255), -- e.g. "JEE Main 2024 (27 Jan Shift-1)", "NEET 2023", "CBSE 2023"
    exam_frequency_score INT DEFAULT 3, -- 1 to 5 star rating of how frequently asked
    is_high_yield BOOLEAN DEFAULT FALSE,
    
    question_format question_format_type NOT NULL DEFAULT 'MCQ_SINGLE',
    difficulty VARCHAR(20) DEFAULT 'HARD',
    bloom_level VARCHAR(30) DEFAULT 'ANALYZE',
    marks_weightage NUMERIC(3, 1) DEFAULT 4.0,
    negative_marking NUMERIC(3, 1) DEFAULT -1.0,
    benchmark_time_seconds INT DEFAULT 120,
    
    question_latex TEXT NOT NULL,
    options_latex JSONB DEFAULT '[]'::jsonb,
    correct_answer_latex TEXT NOT NULL,
    solution_latex TEXT NOT NULL,
    step_rubric JSONB DEFAULT '[]'::jsonb,
    socratic_hints JSONB DEFAULT '[]'::jsonb,
    distractor_traps JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. SENIOR CHEMISTRY QUESTION BANK (Class 11 & 12: Medical & Non-Medical)
-- ============================================================================
CREATE TABLE IF NOT EXISTS bank_senior_chemistry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade VARCHAR(10) NOT NULL, -- '11' or '12'
    stream academic_stream DEFAULT 'COMMON_SENIOR',
    target_exam target_exam_type NOT NULL DEFAULT 'JEE_MAIN', -- 'JEE_MAIN', 'NEET_UG', 'CBSE_CLASS_12'
    branch VARCHAR(50) NOT NULL, -- 'PHYSICAL', 'INORGANIC', 'ORGANIC'
    
    chapter_number INT NOT NULL,
    chapter_name VARCHAR(150) NOT NULL,
    topic VARCHAR(150) NOT NULL,
    subtopic VARCHAR(200),
    
    ncert_page_reference VARCHAR(100),
    pyq_appearance VARCHAR(255), -- e.g. "NEET 2024 Q-58", "JEE Main 2023"
    exam_frequency_score INT DEFAULT 3,
    is_high_yield BOOLEAN DEFAULT FALSE,
    
    question_format question_format_type NOT NULL DEFAULT 'MCQ_SINGLE',
    difficulty VARCHAR(20) DEFAULT 'MEDIUM',
    bloom_level VARCHAR(30) DEFAULT 'APPLY',
    marks_weightage NUMERIC(3, 1) DEFAULT 4.0,
    negative_marking NUMERIC(3, 1) DEFAULT -1.0,
    benchmark_time_seconds INT DEFAULT 75,
    
    question_latex TEXT NOT NULL,
    options_latex JSONB DEFAULT '[]'::jsonb,
    correct_answer_latex TEXT NOT NULL,
    solution_latex TEXT NOT NULL,
    step_rubric JSONB DEFAULT '[]'::jsonb,
    socratic_hints JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. SENIOR MATHEMATICS QUESTION BANK (Class 11 & 12: Non-Medical Stream)
-- ============================================================================
CREATE TABLE IF NOT EXISTS bank_senior_mathematics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade VARCHAR(10) NOT NULL, -- '11' or '12'
    stream academic_stream DEFAULT 'NON_MEDICAL',
    target_exam target_exam_type NOT NULL DEFAULT 'JEE_MAIN', -- 'JEE_MAIN', 'JEE_ADVANCED', 'CBSE_CLASS_12', 'HP_BOARD_CLASS_12'
    math_branch VARCHAR(50) NOT NULL, -- 'CALCULUS', 'ALGEBRA', 'COORDINATE_GEOMETRY', 'VECTORS_3D', 'TRIGONOMETRY'
    
    chapter_number INT NOT NULL,
    chapter_name VARCHAR(150) NOT NULL,
    topic VARCHAR(150) NOT NULL,
    subtopic VARCHAR(200),
    
    ncert_page_reference VARCHAR(100),
    pyq_appearance VARCHAR(255), -- e.g. "JEE Main 2024 Shift-2", "CBSE 2023"
    exam_frequency_score INT DEFAULT 4,
    is_high_yield BOOLEAN DEFAULT FALSE,
    
    question_format question_format_type NOT NULL DEFAULT 'MCQ_SINGLE', -- Can be 'NUMERICAL_INTEGER' for Section B
    difficulty VARCHAR(20) DEFAULT 'HARD',
    bloom_level VARCHAR(30) DEFAULT 'EVALUATE',
    marks_weightage NUMERIC(3, 1) DEFAULT 4.0,
    negative_marking NUMERIC(3, 1) DEFAULT -1.0,
    benchmark_time_seconds INT DEFAULT 150,
    
    question_latex TEXT NOT NULL,
    options_latex JSONB DEFAULT '[]'::jsonb,
    correct_answer_latex TEXT NOT NULL,
    solution_latex TEXT NOT NULL,
    step_rubric JSONB DEFAULT '[]'::jsonb,
    socratic_hints JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6. SENIOR BIOLOGY QUESTION BANK (Class 11 & 12: Medical Stream)
-- ============================================================================
CREATE TABLE IF NOT EXISTS bank_senior_biology (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade VARCHAR(10) NOT NULL, -- '11' or '12'
    stream academic_stream DEFAULT 'MEDICAL',
    target_exam target_exam_type NOT NULL DEFAULT 'NEET_UG', -- 'NEET_UG', 'CBSE_CLASS_12', 'HP_BOARD_CLASS_12'
    branch VARCHAR(50) NOT NULL, -- 'BOTANY', 'ZOOLOGY'
    
    unit_name VARCHAR(150) NOT NULL, -- Reproduction, Genetics & Evolution, Human Physiology, Biotechnology, Ecology
    chapter_number INT NOT NULL,
    chapter_name VARCHAR(150) NOT NULL,
    topic VARCHAR(150) NOT NULL,
    subtopic VARCHAR(200),
    
    ncert_page_reference VARCHAR(100), -- Strictly NCERT line citation
    pyq_appearance VARCHAR(255), -- e.g. "NEET UG 2023", "NEET UG 2024", "AIPMT 2015"
    exam_frequency_score INT DEFAULT 5,
    is_high_yield BOOLEAN DEFAULT TRUE,
    
    question_format question_format_type NOT NULL DEFAULT 'MCQ_SINGLE', -- MCQ, ASSERTION_REASON, STATEMENT_1_2
    difficulty VARCHAR(20) DEFAULT 'MEDIUM',
    bloom_level VARCHAR(30) DEFAULT 'UNDERSTAND',
    marks_weightage NUMERIC(3, 1) DEFAULT 4.0,
    negative_marking NUMERIC(3, 1) DEFAULT -1.0,
    benchmark_time_seconds INT DEFAULT 45, -- NEET speed benchmark (45s per biology question)
    
    question_latex TEXT NOT NULL,
    options_latex JSONB DEFAULT '[]'::jsonb,
    correct_answer_latex TEXT NOT NULL,
    solution_latex TEXT NOT NULL,
    step_rubric JSONB DEFAULT '[]'::jsonb,
    socratic_hints JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 7. EXAM PATTERN BLUEPRINT & WEIGHTAGE ARCHIVE
-- Stores historical exam patterns, topic weightages, and section structures
-- ============================================================================
CREATE TABLE IF NOT EXISTS exam_pattern_blueprints (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'JEE_MAIN_NON_MED', 'NEET_UG_MED', 'CBSE_CLASS_10_MATHS'
    exam_name VARCHAR(150) NOT NULL,
    target_grade VARCHAR(10) NOT NULL,
    stream academic_stream NOT NULL,
    total_marks INT NOT NULL,
    duration_minutes INT NOT NULL,
    sections JSONB NOT NULL, -- structure of sections, question counts, marks, negative marking
    chapter_weightages JSONB NOT NULL, -- historical % weightage per chapter
    question_type_distribution JSONB NOT NULL, -- % distribution of MCQ, Numerical, Assertion-Reason, Derivations
    sample_rules JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for sub-second retrieval during quiz generation
CREATE INDEX IF NOT EXISTS idx_c10_math_chap ON bank_class10_mathematics(chapter_number, difficulty);
CREATE INDEX IF NOT EXISTS idx_c10_sci_chap ON bank_class10_science(discipline, chapter_number);
CREATE INDEX IF NOT EXISTS idx_snr_phy_exam ON bank_senior_physics(target_exam, grade, chapter_number);
CREATE INDEX IF NOT EXISTS idx_snr_chem_exam ON bank_senior_chemistry(target_exam, grade, branch);
CREATE INDEX IF NOT EXISTS idx_snr_math_exam ON bank_senior_mathematics(target_exam, grade, math_branch);
CREATE INDEX IF NOT EXISTS idx_snr_bio_exam ON bank_senior_biology(target_exam, grade, branch);
