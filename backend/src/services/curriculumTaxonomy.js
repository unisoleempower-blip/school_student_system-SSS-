// ============================================================================
// HAPS-AI SCHOLAR ASSISTANT: MASTER CURRICULUM TAXONOMY
// Granular breakdown: Subject -> Chapter -> Topic / Subtopic
// Covering:
//   - Senior Biology (Botany & Zoology: Class 11 & Class 12) -> NEET UG & Boards
//   - Senior Physics (Class 11 & Class 12) -> JEE Main / NEET / Boards
//   - Senior Chemistry (Physical, Inorganic, Organic) -> JEE Main / NEET / Boards
//   - Senior Mathematics (Calculus, Algebra, Coordinate, Vectors) -> JEE Main & Boards
//   - Class 10 Foundation Science (Physics, Chemistry, Biology) -> CBSE & HP Board
//   - Class 10 Foundation Mathematics -> CBSE & HP Board
// ============================================================================

const CURRICULUM_TAXONOMY = {
  // ==========================================================================
  // 1. BIOLOGY (Class 11 & Class 12) - NEET UG & Board Specialization
  // ==========================================================================
  'BIOLOGY': {
    subjectName: 'Biology',
    stream: 'MEDICAL',
    grades: ['11', '12'],
    targetExams: ['NEET_UG', 'CBSE_CLASS_12', 'HP_BOARD_CLASS_12'],
    chapters: [
      // --- CLASS 11 BIOLOGY ---
      {
        id: 'bio_11_ch01',
        grade: '11',
        discipline: 'BOTANY',
        unit: 'Diversity in the Living World',
        chapterNumber: 1,
        chapterName: 'The Living World',
        topics: [
          { id: 'bio_11_ch01_t1', topicName: 'Characteristics of Living Organisms', ncertSection: '1.1', highYield: false },
          { id: 'bio_11_ch01_t2', topicName: 'Binomial Nomenclature & Taxonomy', ncertSection: '1.2', highYield: true },
          { id: 'bio_11_ch01_t3', topicName: 'Taxonomical Categories & Hierarchy', ncertSection: '1.3', highYield: true },
          { id: 'bio_11_ch01_t4', topicName: 'Taxonomical Aids (Herbarium, Botanical Gardens)', ncertSection: '1.4', highYield: false }
        ]
      },
      {
        id: 'bio_11_ch02',
        grade: '11',
        discipline: 'BOTANY',
        unit: 'Diversity in the Living World',
        chapterNumber: 2,
        chapterName: 'Biological Classification',
        topics: [
          { id: 'bio_11_ch02_t1', topicName: 'Five Kingdom Classification Criteria', ncertSection: '2.1', highYield: true },
          { id: 'bio_11_ch02_t2', topicName: 'Kingdom Monera (Archaebacteria & Eubacteria)', ncertSection: '2.2', highYield: true },
          { id: 'bio_11_ch02_t3', topicName: 'Kingdom Protista (Chrysophytes, Dinoflagellates, Euglenoids)', ncertSection: '2.3', highYield: true },
          { id: 'bio_11_ch02_t4', topicName: 'Kingdom Fungi (Phycomycetes, Ascomycetes, Basidiomycetes)', ncertSection: '2.4', highYield: true },
          { id: 'bio_11_ch02_t5', topicName: 'Viruses, Viroids, Prions and Lichens', ncertSection: '2.6', highYield: true }
        ]
      },
      {
        id: 'bio_11_ch03',
        grade: '11',
        discipline: 'BOTANY',
        unit: 'Diversity in the Living World',
        chapterNumber: 3,
        chapterName: 'Plant Kingdom',
        topics: [
          { id: 'bio_11_ch03_t1', topicName: 'Algae (Chlorophyceae, Phaeophyceae, Rhodophyceae)', ncertSection: '3.1', highYield: true },
          { id: 'bio_11_ch03_t2', topicName: 'Bryophytes (Liverworts & Mosses)', ncertSection: '3.2', highYield: true },
          { id: 'bio_11_ch03_t3', topicName: 'Pteridophytes (Homosporous & Heterosporous)', ncertSection: '3.3', highYield: true },
          { id: 'bio_11_ch03_t4', topicName: 'Gymnosperms (Pinus, Cycas, Mycorrhiza)', ncertSection: '3.4', highYield: true },
          { id: 'bio_11_ch03_t5', topicName: 'Plant Life Cycles and Alternation of Generations', ncertSection: '3.6', highYield: false }
        ]
      },
      {
        id: 'bio_11_ch04',
        grade: '11',
        discipline: 'ZOOLOGY',
        unit: 'Diversity in the Living World',
        chapterNumber: 4,
        chapterName: 'Animal Kingdom',
        topics: [
          { id: 'bio_11_ch04_t1', topicName: 'Basis of Classification (Symmetry, Coelom, Segmentation)', ncertSection: '4.1', highYield: true },
          { id: 'bio_11_ch04_t2', topicName: 'Non-Chordates: Porifera to Platyhelminthes & Annelida', ncertSection: '4.2.1', highYield: true },
          { id: 'bio_11_ch04_t3', topicName: 'Arthropoda, Mollusca, Echinodermata & Hemichordata', ncertSection: '4.2.7', highYield: true },
          { id: 'bio_11_ch04_t4', topicName: 'Chordata: Urochordata, Cephalochordata, Vertebrata', ncertSection: '4.2.11', highYield: true },
          { id: 'bio_11_ch04_t5', topicName: 'Classes of Vertebrates (Chondrichthyes, Osteichthyes, Amphibia, Reptilia, Aves, Mammalia)', ncertSection: '4.2.11.2', highYield: true }
        ]
      },
      {
        id: 'bio_11_ch08',
        grade: '11',
        discipline: 'BOTANY',
        unit: 'Cell Structure and Function',
        chapterNumber: 8,
        chapterName: 'Cell: The Unit of Life',
        topics: [
          { id: 'bio_11_ch08_t1', topicName: 'Cell Theory & Overview of Cell', ncertSection: '8.1', highYield: false },
          { id: 'bio_11_ch08_t2', topicName: 'Prokaryotic Cell (Plasmids, Mesosomes, Cell Envelope)', ncertSection: '8.4', highYield: true },
          { id: 'bio_11_ch08_t3', topicName: 'Plasma Membrane (Fluid Mosaic Model)', ncertSection: '8.5.1', highYield: true },
          { id: 'bio_11_ch08_t4', topicName: 'Endomembrane System (ER, Golgi, Lysosomes, Vacuoles)', ncertSection: '8.5.3', highYield: true },
          { id: 'bio_11_ch08_t5', topicName: 'Mitochondria & Chloroplasts (Endosymbiotic Origin)', ncertSection: '8.5.4', highYield: true },
          { id: 'bio_11_ch08_t6', topicName: 'Nucleus, Chromatin & Chromosome Morphology', ncertSection: '8.5.8', highYield: true }
        ]
      },
      {
        id: 'bio_11_ch09',
        grade: '11',
        discipline: 'ZOOLOGY',
        unit: 'Cell Structure and Function',
        chapterNumber: 9,
        chapterName: 'Biomolecules',
        topics: [
          { id: 'bio_11_ch09_t1', topicName: 'Primary & Secondary Metabolites', ncertSection: '9.3', highYield: true },
          { id: 'bio_11_ch09_t2', topicName: 'Proteins & Amino Acids (Structure & Peptide Bond)', ncertSection: '9.4', highYield: true },
          { id: 'bio_11_ch09_t3', topicName: 'Carbohydrates & Lipids (Fatty Acids & Phospholipids)', ncertSection: '9.2', highYield: true },
          { id: 'bio_11_ch09_t4', topicName: 'Nucleic Acids (B-DNA Structure & Nitrogenous Bases)', ncertSection: '9.6', highYield: true },
          { id: 'bio_11_ch09_t5', topicName: 'Enzymes: Mechanism, Km, Inhibition & Nomenclature', ncertSection: '9.12', highYield: true }
        ]
      },
      {
        id: 'bio_11_ch10',
        grade: '11',
        discipline: 'BOTANY',
        unit: 'Cell Structure and Function',
        chapterNumber: 10,
        chapterName: 'Cell Cycle and Cell Division',
        topics: [
          { id: 'bio_11_ch10_t1', topicName: 'Interphase (G1, S, G2 phases & G0 quiescent stage)', ncertSection: '10.1', highYield: true },
          { id: 'bio_11_ch10_t2', topicName: 'M-Phase (Prophase, Metaphase, Anaphase, Telophase)', ncertSection: '10.2', highYield: true },
          { id: 'bio_11_ch10_t3', topicName: 'Cytokinesis in Plant vs Animal Cells', ncertSection: '10.2.5', highYield: false },
          { id: 'bio_11_ch10_t4', topicName: 'Meiosis I (Prophase I: Leptotene, Zygotene, Pachytene, Diplotene, Diakinesis)', ncertSection: '10.4.1', highYield: true },
          { id: 'bio_11_ch10_t5', topicName: 'Meiosis II & Significance of Recombination', ncertSection: '10.4.2', highYield: true }
        ]
      },
      {
        id: 'bio_11_ch11',
        grade: '11',
        discipline: 'BOTANY',
        unit: 'Plant Physiology',
        chapterNumber: 11,
        chapterName: 'Photosynthesis in Higher Plants',
        topics: [
          { id: 'bio_11_ch11_t1', topicName: 'Pigments in Photosynthesis & Absorption Spectra', ncertSection: '11.3', highYield: true },
          { id: 'bio_11_ch11_t2', topicName: 'Light Reaction, Photosystems (PS I & PS II), Z-Scheme', ncertSection: '11.4', highYield: true },
          { id: 'bio_11_ch11_t3', topicName: 'Chemiosmotic Hypothesis of ATP Synthesis', ncertSection: '11.6', highYield: true },
          { id: 'bio_11_ch11_t4', topicName: 'Calvin Cycle (C3 Pathway: Carboxylation, Reduction, Regeneration)', ncertSection: '11.7', highYield: true },
          { id: 'bio_11_ch11_t5', topicName: 'C4 Pathway (Kranz Anatomy & PEPcase)', ncertSection: '11.8', highYield: true },
          { id: 'bio_11_ch11_t6', topicName: 'Photorespiration & Factors Affecting Photosynthesis', ncertSection: '11.9', highYield: true }
        ]
      },
      {
        id: 'bio_11_ch16',
        grade: '11',
        discipline: 'ZOOLOGY',
        unit: 'Human Physiology',
        chapterNumber: 16,
        chapterName: 'Excretory Products and their Elimination',
        topics: [
          { id: 'bio_11_ch16_t1', topicName: 'Ammonotelism, Ureotelism, Uricotelism', ncertSection: '16.1', highYield: true },
          { id: 'bio_11_ch16_t2', topicName: 'Human Excretory System & Nephron Histology', ncertSection: '16.2', highYield: true },
          { id: 'bio_11_ch16_t3', topicName: 'Urine Formation: Ultrafiltration, Reabsorption, Secretion', ncertSection: '16.3', highYield: true },
          { id: 'bio_11_ch16_t4', topicName: 'Counter-Current Mechanism (Loop of Henle & Vasa Recta)', ncertSection: '16.5', highYield: true },
          { id: 'bio_11_ch16_t5', topicName: 'Renal Regulation (RAAS Pathway, ADH & ANF)', ncertSection: '16.6', highYield: true }
        ]
      },

      // --- CLASS 12 BIOLOGY ---
      {
        id: 'bio_12_ch01',
        grade: '12',
        discipline: 'BOTANY',
        unit: 'Reproduction',
        chapterNumber: 1,
        chapterName: 'Sexual Reproduction in Flowering Plants',
        topics: [
          { id: 'bio_12_ch01_t1', topicName: 'Microsporogenesis & Pollen Grain Structure', ncertSection: '1.2.1', highYield: true },
          { id: 'bio_12_ch01_t2', topicName: 'Megasporogenesis & Embryo Sac (7-celled, 8-nucleate)', ncertSection: '1.2.2', highYield: true },
          { id: 'bio_12_ch01_t3', topicName: 'Pollination: Autogamy, Geitonogamy, Xenogamy & Agents', ncertSection: '1.2.3', highYield: true },
          { id: 'bio_12_ch01_t4', topicName: 'Outbreeding Devices & Pollen-Pistil Interaction', ncertSection: '1.2.4', highYield: true },
          { id: 'bio_12_ch01_t5', topicName: 'Double Fertilization & Endosperm Development', ncertSection: '1.3', highYield: true },
          { id: 'bio_12_ch01_t6', topicName: 'Apomixis and Polyembryony', ncertSection: '1.5', highYield: true }
        ]
      },
      {
        id: 'bio_12_ch02',
        grade: '12',
        discipline: 'ZOOLOGY',
        unit: 'Reproduction',
        chapterNumber: 2,
        chapterName: 'Human Reproduction',
        topics: [
          { id: 'bio_12_ch02_t1', topicName: 'Male Reproductive System (Testes, Seminiferous Tubules)', ncertSection: '2.1', highYield: true },
          { id: 'bio_12_ch02_t2', topicName: 'Female Reproductive System (Ovaries, Fallopian Tubes, Uterus)', ncertSection: '2.2', highYield: true },
          { id: 'bio_12_ch02_t3', topicName: 'Gametogenesis (Spermatogenesis vs Oogenesis)', ncertSection: '2.3', highYield: true },
          { id: 'bio_12_ch02_t4', topicName: 'Menstrual Cycle & Hormonal Control (FSH, LH, Estrogen, Progesterone)', ncertSection: '2.4', highYield: true },
          { id: 'bio_12_ch02_t5', topicName: 'Fertilization, Cleavage, Blastocyst & Implantation', ncertSection: '2.5', highYield: true },
          { id: 'bio_12_ch02_t6', topicName: 'Pregnancy, Placenta & Parturition (Oxytocin Reflex)', ncertSection: '2.6', highYield: true }
        ]
      },
      {
        id: 'bio_12_ch04',
        grade: '12',
        discipline: 'BOTANY',
        unit: 'Genetics and Evolution',
        chapterNumber: 4,
        chapterName: 'Principles of Inheritance and Variation',
        topics: [
          { id: 'bio_12_ch04_t1', topicName: 'Mendels Laws of Inheritance (Dominance & Segregation)', ncertSection: '4.1', highYield: true },
          { id: 'bio_12_ch04_t2', topicName: 'Incomplete Dominance, Codominance, Multiple Allelism (ABO Blood)', ncertSection: '4.2.2', highYield: true },
          { id: 'bio_12_ch04_t3', topicName: 'Dihybrid Cross & Law of Independent Assortment', ncertSection: '4.3', highYield: true },
          { id: 'bio_12_ch04_t4', topicName: 'Chromosomal Theory of Inheritance (Sutton & Boveri)', ncertSection: '4.4', highYield: true },
          { id: 'bio_12_ch04_t5', topicName: 'Linkage and Recombination (Thomas Hunt Morgan & Drosophila)', ncertSection: '4.5', highYield: true },
          { id: 'bio_12_ch04_t6', topicName: 'Sex Determination (Human, Drosophila, Honey Bee)', ncertSection: '4.6', highYield: true },
          { id: 'bio_12_ch04_t7', topicName: 'Mendelian Disorders (Haemophilia, Sickle-Cell, Phenylketonuria, Thalassemia)', ncertSection: '4.8.2', highYield: true },
          { id: 'bio_12_ch04_t8', topicName: 'Chromosomal Disorders (Down, Klinefelter, Turner Syndromes)', ncertSection: '4.8.3', highYield: true }
        ]
      },
      {
        id: 'bio_12_ch05',
        grade: '12',
        discipline: 'BOTANY',
        unit: 'Genetics and Evolution',
        chapterNumber: 5,
        chapterName: 'Molecular Basis of Inheritance',
        topics: [
          { id: 'bio_12_ch05_t1', topicName: 'The DNA Double Helix & Packaging of DNA (Nucleosome)', ncertSection: '5.1', highYield: true },
          { id: 'bio_12_ch05_t2', topicName: 'Transforming Principle (Griffith, Avery-MacLeod-McCarty, Hershey-Chase)', ncertSection: '5.2', highYield: true },
          { id: 'bio_12_ch05_t3', topicName: 'Replication: Semi-Conservative Mode (Meselson & Stahl) & Enzymes', ncertSection: '5.4', highYield: true },
          { id: 'bio_12_ch05_t4', topicName: 'Transcription (Promoter, RNA Polymerase, Post-transcriptional Modifications)', ncertSection: '5.5', highYield: true },
          { id: 'bio_12_ch05_t5', topicName: 'Genetic Code (Universal, Degenerate, Non-overlapping) & tRNA Adapter', ncertSection: '5.6', highYield: true },
          { id: 'bio_12_ch05_t6', topicName: 'Translation (Ribosome, Initiation, Elongation, Termination)', ncertSection: '5.7', highYield: true },
          { id: 'bio_12_ch05_t7', topicName: 'Regulation of Gene Expression (Lac Operon)', ncertSection: '5.8', highYield: true },
          { id: 'bio_12_ch05_t8', topicName: 'Human Genome Project (HGP) & DNA Fingerprinting (VNTRs)', ncertSection: '5.9', highYield: true }
        ]
      },
      {
        id: 'bio_12_ch09',
        grade: '12',
        discipline: 'BOTANY',
        unit: 'Biotechnology',
        chapterNumber: 9,
        chapterName: 'Biotechnology: Principles and Processes',
        topics: [
          { id: 'bio_12_ch09_t1', topicName: 'Tools of Recombinant DNA Technology (Restriction Endonucleases, Ligases)', ncertSection: '9.2', highYield: true },
          { id: 'bio_12_ch09_t2', topicName: 'Cloning Vectors (pBR322: ori, rop, Selectable Markers, ampR, tetR)', ncertSection: '9.2.2', highYield: true },
          { id: 'bio_12_ch09_t3', topicName: 'Competent Host Transformation & Gene Guns', ncertSection: '9.2.3', highYield: true },
          { id: 'bio_12_ch09_t4', topicName: 'Polymerase Chain Reaction (PCR: Denaturation, Annealing, Extension)', ncertSection: '9.3.3', highYield: true },
          { id: 'bio_12_ch09_t5', topicName: 'Bioreactors & Downstream Processing', ncertSection: '9.3.5', highYield: true }
        ]
      }
    ]
  },

  // ==========================================================================
  // 2. SENIOR PHYSICS (Class 11 & Class 12) - JEE Main / Advanced / Boards
  // ==========================================================================
  'PHYSICS': {
    subjectName: 'Physics',
    stream: 'COMMON_SENIOR',
    grades: ['11', '12'],
    targetExams: ['JEE_MAIN', 'JEE_ADVANCED', 'NEET_UG', 'CBSE_CLASS_12'],
    chapters: [
      {
        id: 'phy_11_ch05',
        grade: '11',
        unit: 'Mechanics',
        chapterNumber: 5,
        chapterName: 'Work, Energy and Power',
        topics: [
          { id: 'phy_11_ch05_t1', topicName: 'Work Done by Constant & Variable Forces', ncertSection: '5.2', highYield: true },
          { id: 'phy_11_ch05_t2', topicName: 'Work-Energy Theorem & Kinetic Energy', ncertSection: '5.3', highYield: true },
          { id: 'phy_11_ch05_t3', topicName: 'Conservative Forces & Potential Energy (Spring & Gravity)', ncertSection: '5.7', highYield: true },
          { id: 'phy_11_ch05_t4', topicName: 'Conservation of Mechanical Energy', ncertSection: '5.8', highYield: true },
          { id: 'phy_11_ch05_t5', topicName: 'Collisions in 1D & 2D (Elastic & Inelastic)', ncertSection: '5.12', highYield: true }
        ]
      },
      {
        id: 'phy_11_ch06',
        grade: '11',
        unit: 'Mechanics',
        chapterNumber: 6,
        chapterName: 'System of Particles and Rotational Motion',
        topics: [
          { id: 'phy_11_ch06_t1', topicName: 'Center of Mass & Velocity of COM', ncertSection: '6.1', highYield: true },
          { id: 'phy_11_ch06_t2', topicName: 'Linear Momentum & Torque (Cross Product)', ncertSection: '6.4', highYield: true },
          { id: 'phy_11_ch06_t3', topicName: 'Angular Momentum & Conservation of Angular Momentum', ncertSection: '6.6', highYield: true },
          { id: 'phy_11_ch06_t4', topicName: 'Moment of Inertia (Parallel & Perpendicular Axes Theorems)', ncertSection: '6.8', highYield: true },
          { id: 'phy_11_ch06_t5', topicName: 'Kinematics & Dynamics of Pure Rolling Motion', ncertSection: '6.11', highYield: true }
        ]
      },
      {
        id: 'phy_12_ch01',
        grade: '12',
        unit: 'Electrodynamics',
        chapterNumber: 1,
        chapterName: 'Electric Charges and Fields',
        topics: [
          { id: 'phy_12_ch01_t1', topicName: 'Coulomb Law in Vector Form & Superposition', ncertSection: '1.6', highYield: true },
          { id: 'phy_12_ch01_t2', topicName: 'Electric Field & Field Lines', ncertSection: '1.8', highYield: true },
          { id: 'phy_12_ch01_t3', topicName: 'Electric Dipole (Axial, Equatorial & Torque in Field)', ncertSection: '1.10', highYield: true },
          { id: 'phy_12_ch01_t4', topicName: 'Electric Flux & Gauss Law', ncertSection: '1.14', highYield: true },
          { id: 'phy_12_ch01_t5', topicName: 'Applications of Gauss Law (Wire, Sheet, Shell)', ncertSection: '1.15', highYield: true }
        ]
      },
      {
        id: 'phy_12_ch09',
        grade: '12',
        unit: 'Optics',
        chapterNumber: 9,
        chapterName: 'Ray Optics and Optical Instruments',
        topics: [
          { id: 'phy_12_ch09_t1', topicName: 'Reflection by Spherical Mirrors (Mirror Formula & Magnification)', ncertSection: '9.2', highYield: true },
          { id: 'phy_12_ch09_t2', topicName: 'Refraction & Total Internal Reflection (Optical Fibres)', ncertSection: '9.3', highYield: true },
          { id: 'phy_12_ch09_t3', topicName: 'Refraction at Spherical Surfaces & Lens Makers Formula', ncertSection: '9.5', highYield: true },
          { id: 'phy_12_ch09_t4', topicName: 'Combination of Thin Lenses & Power', ncertSection: '9.5.4', highYield: true },
          { id: 'phy_12_ch09_t5', topicName: 'Refraction through a Prism (Dispersion & Deviation)', ncertSection: '9.6', highYield: true },
          { id: 'phy_12_ch09_t6', topicName: 'Optical Instruments (Microscope & Astronomical Telescope)', ncertSection: '9.8', highYield: true }
        ]
      }
    ]
  },

  // ==========================================================================
  // 3. SENIOR CHEMISTRY (Class 11 & Class 12) - Physical, Inorganic, Organic
  // ==========================================================================
  'CHEMISTRY': {
    subjectName: 'Chemistry',
    stream: 'COMMON_SENIOR',
    grades: ['11', '12'],
    targetExams: ['JEE_MAIN', 'NEET_UG', 'CBSE_CLASS_12'],
    chapters: [
      {
        id: 'chem_12_ch03',
        grade: '12',
        branch: 'PHYSICAL',
        unit: 'Physical Chemistry',
        chapterNumber: 3,
        chapterName: 'Electrochemistry',
        topics: [
          { id: 'chem_12_ch03_t1', topicName: 'Electrochemical Cells & Daniell Cell', ncertSection: '3.1', highYield: true },
          { id: 'chem_12_ch03_t2', topicName: 'Nernst Equation & Equilibrium Constant Calculation', ncertSection: '3.3', highYield: true },
          { id: 'chem_12_ch03_t3', topicName: 'Gibbs Free Energy & Cell Potential Relationship', ncertSection: '3.3.2', highYield: true },
          { id: 'chem_12_ch03_t4', topicName: 'Conductance, Molar Conductivity & Kohlrauschs Law', ncertSection: '3.4', highYield: true },
          { id: 'chem_12_ch03_t5', topicName: 'Faradays Laws of Electrolysis & Batteries', ncertSection: '3.5', highYield: true }
        ]
      },
      {
        id: 'chem_12_ch08',
        grade: '12',
        branch: 'ORGANIC',
        unit: 'Organic Chemistry',
        chapterNumber: 8,
        chapterName: 'Aldehydes, Ketones and Carboxylic Acids',
        topics: [
          { id: 'chem_12_ch08_t1', topicName: 'Nomenclature and Carbonyl Structure', ncertSection: '8.1', highYield: false },
          { id: 'chem_12_ch08_t2', topicName: 'Preparation of Aldehydes (Rosenmund, Stephen, Etard)', ncertSection: '8.2', highYield: true },
          { id: 'chem_12_ch08_t3', topicName: 'Nucleophilic Addition Reactions (HCN, NaHSO3, Grignard)', ncertSection: '8.4.1', highYield: true },
          { id: 'chem_12_ch08_t4', topicName: 'Aldol Condensation & Cannizzaro Reaction', ncertSection: '8.4.4', highYield: true },
          { id: 'chem_12_ch08_t5', topicName: 'Carboxylic Acids Acidity & HVZ Reaction', ncertSection: '8.6', highYield: true }
        ]
      }
    ]
  },

  // ==========================================================================
  // 4. SENIOR MATHEMATICS (Class 12 Complete 13 Chapters) - Non-Medical & CBSE / JEE Stream
  // As per Latest Rationalised NCERT Textbook (Part I & Part II) & CBSE Curriculum
  // ==========================================================================
  'MATHEMATICS': {
    subjectName: 'Class 12 Mathematics',
    stream: 'NON_MEDICAL',
    grades: ['12'],
    targetExams: ['CBSE_CLASS_12', 'JEE_MAIN', 'JEE_ADVANCED', 'HP_BOARD_CLASS_12'],
    units: [
      { unitNumber: 'I', unitName: 'Relations and Functions', weightageMarks: 8, chapters: [1, 2] },
      { unitNumber: 'II', unitName: 'Algebra', weightageMarks: 10, chapters: [3, 4] },
      { unitNumber: 'III', unitName: 'Calculus', weightageMarks: 35, chapters: [5, 6, 7, 8, 9] },
      { unitNumber: 'IV', unitName: 'Vectors and Three-Dimensional Geometry', weightageMarks: 14, chapters: [10, 11] },
      { unitNumber: 'V', unitName: 'Linear Programming', weightageMarks: 5, chapters: [12] },
      { unitNumber: 'VI', unitName: 'Probability', weightageMarks: 8, chapters: [13] }
    ],
    boardHighYieldSummary: {
      examBoard: 'CBSE / HPBOSE Class 12 Mathematics (80 Marks Theory)',
      fiveMarkGuarantees: [
        {
          rank: 1,
          topic: 'Matrix Inversion Method',
          detail: 'Solve 3 linear equations using X = A⁻¹B with |A| ≠ 0, adj(A), and cofactor calculations.',
          chapter: 'Chapter 4: Determinants'
        },
        {
          rank: 2,
          topic: 'Shortest Distance Between Skew Lines',
          detail: 'Vector/Cartesian distance d = |((a₂ - a₁) · (b₁ × b₂)) / |b₁ × b₂||, with standard direction ratios.',
          chapter: 'Chapter 11: Three-Dimensional Geometry'
        },
        {
          rank: 3,
          topic: 'Linear Programming (Corner Point Method)',
          detail: 'Feasible region plotting, corner points identification, bounded/unbounded maximum/minimum proof.',
          chapter: 'Chapter 12: Linear Programming'
        },
        {
          rank: 4,
          topic: 'Maxima/Minima Geometric Optimization',
          detail: 'Applied word problems: cylinder inscribed in sphere, minimum surface area for given volume with second derivative test proof.',
          chapter: 'Chapter 6: Applications of Derivatives'
        }
      ],
      caseStudyFourMark: [
        {
          topic: 'Applications of Derivatives (AOD)',
          detail: 'Real-world cost, revenue, or geometric volume optimization scenarios with 3 sub-questions.',
          chapter: 'Chapter 6: Applications of Derivatives'
        },
        {
          topic: 'Bayes\' Theorem & Total Probability',
          detail: 'Industrial manufacturing defects, medical testing reliability, or truth/lie statement probabilities.',
          chapter: 'Chapter 13: Probability'
        },
        {
          topic: 'Relations and Functions',
          detail: 'Real-world equivalence relation modeling or bijective domain/codomain conditions.',
          chapter: 'Chapter 1: Relations and Functions'
        }
      ],
      threeMarkHeavyweights: [
        {
          topic: 'Definite Integrals using King Property (P₄)',
          detail: '∫₀ᵃ f(x)dx = ∫₀ᵃ f(a-x)dx and modulus integrals ∫ₐᵇ |f(x)|dx using P₂.',
          chapter: 'Chapter 7: Integrals'
        },
        {
          topic: 'Linear Differential Equations (LDE)',
          detail: 'dy/dx + Py = Q or dx/dy + P₁x = Q₁ with integrating factor IF = e^∫Pdx.',
          chapter: 'Chapter 9: Differential Equations'
        },
        {
          topic: 'Area Under Simple Curves (AOI)',
          detail: 'Area between parabola and line, or ellipse/circle with labeled graph sketch.',
          chapter: 'Chapter 8: Applications of Integrals'
        },
        {
          topic: 'Proving Equivalence Relations',
          detail: 'Proof of reflexivity, symmetry, and transitivity on pairs of integers ((a, b), (c, d)) ∈ R.',
          chapter: 'Chapter 1: Relations and Functions'
        }
      ]
    },
    chapters: [
      // --- UNIT I: RELATIONS AND FUNCTIONS (8 MARKS) ---
      {
        id: 'math_12_ch01',
        grade: '12',
        discipline: 'RELATIONS & FUNCTIONS',
        unit: 'Relations and Functions (Unit I - 8M)',
        chapterNumber: 1,
        chapterName: 'Relations and Functions',
        boardExamFocus: {
          highYield: 'Proving equivalence relations on pairs of integers like ((a, b), (c, d)) ∈ R ⇔ ad(b+c) = bc(a+d) or a+d = b+c.',
          standardTrap: 'Writing equivalence classes correctly without omitting elements.',
          questionType: '3-mark proofs on Equivalence Relations or 2/3-mark questions testing injectivity/surjectivity with restricted domains.'
        },
        topics: [
          {
            id: 'math_12_ch01_t1',
            topicName: 'Types of Relations',
            ncertSection: '1.1',
            highYield: true,
            subtopics: [
              'Cartesian Product A × B and relation as subset R ⊆ A × A',
              'Empty Relation and Universal Relation',
              'Reflexivity: (a, a) ∈ R for every a ∈ A',
              'Symmetry: (a, b) ∈ R ⇒ (b, a) ∈ R for all a, b ∈ A',
              'Transitivity: (a, b) ∈ R and (b, c) ∈ R ⇒ (a, c) ∈ R for all a, b, c ∈ A',
              'Counter-example mechanics for non-equivalence',
              'Equivalence Relations & Equivalence Classes [a]'
            ]
          },
          {
            id: 'math_12_ch01_t2',
            topicName: 'Types of Functions',
            ncertSection: '1.2',
            highYield: true,
            subtopics: [
              'Injective Functions (One-to-One): f(x₁) = f(x₂) ⇒ x₁ = x₂',
              'Horizontal line test for injectivity',
              'Proving non-injectivity using explicit counter-examples',
              'Surjective Functions (Onto): Range(f) = Codomain(f)',
              'Bijective Functions (simultaneously One-to-One and Onto)',
              'Domain/Codomain dependence (N→N, Z→Z, R→R)'
            ]
          }
        ]
      },
      {
        id: 'math_12_ch02',
        grade: '12',
        discipline: 'INVERSE TRIGONOMETRY',
        unit: 'Relations and Functions (Unit I - 8M)',
        chapterNumber: 2,
        chapterName: 'Inverse Trigonometric Functions',
        boardExamFocus: {
          highYield: '1-mark and 2-mark evaluation problems involving angles outside the principal branch (e.g., cos⁻¹(cos 13π/6)).',
          standardTrap: 'Direct cancellation sin⁻¹(sin x) = x without checking if x lies in the principal interval [-π/2, π/2].',
          questionType: '1/2-mark MCQs and short answer questions on principal values and compositions.'
        },
        topics: [
          {
            id: 'math_12_ch02_t1',
            topicName: 'Restricted Domains and Invertibility',
            ncertSection: '2.1',
            highYield: true,
            subtopics: [
              'Why trigonometric functions require domain truncation for bijection',
              'sin⁻¹x: Domain [-1, 1], Principal Value Branch [-π/2, π/2]',
              'cos⁻¹x: Domain [-1, 1], Principal Value Branch [0, π]',
              'tan⁻¹x: Domain R, Principal Value Branch (-π/2, π/2)',
              'cot⁻¹x: Domain R, Principal Value Branch (0, π)',
              'sec⁻¹x: Domain R - (-1, 1), Principal Value Branch [0, π] - {π/2}',
              'cosec⁻¹x: Domain R - (-1, 1), Principal Value Branch [-π/2, π/2] - {0}'
            ]
          },
          {
            id: 'math_12_ch02_t2',
            topicName: 'Principal Value Evaluation',
            ncertSection: '2.2',
            highYield: true,
            subtopics: [
              'Direct evaluation of principal angles (e.g. sin⁻¹(1/2), cos⁻¹(-1/2))',
              'Negative arguments: sin⁻¹(-x) = -sin⁻¹x, tan⁻¹(-x) = -tan⁻¹x, cosec⁻¹(-x) = -cosec⁻¹x',
              'Negative arguments: cos⁻¹(-x) = π - cos⁻¹x, cot⁻¹(-x) = π - cot⁻¹x, sec⁻¹(-x) = π - sec⁻¹x',
              'Composition outside principal branch: sin⁻¹(sin θ) and cos⁻¹(cos θ)',
              'Reduction via reference angles into the allowed principal window'
            ]
          }
        ]
      },

      // --- UNIT II: ALGEBRA (10 MARKS) ---
      {
        id: 'math_12_ch03',
        grade: '12',
        discipline: 'MATRICES',
        unit: 'Algebra (Unit II - 10M)',
        chapterNumber: 3,
        chapterName: 'Matrices',
        boardExamFocus: {
          highYield: 'Expressing a given 3×3 matrix as the sum of a symmetric and a skew-symmetric matrix (3-mark question).',
          standardTrap: 'Reversal rule in transpose: forgetting that (AB)ᵀ = BᵀAᵀ (not AᵀBᵀ).',
          questionType: '3-mark decomposition theorem and matrix polynomial evaluation A² - 5A + 7I = O.'
        },
        topics: [
          {
            id: 'math_12_ch03_t1',
            topicName: 'Basic Algebra of Matrices',
            ncertSection: '3.1',
            highYield: false,
            subtopics: [
              'Order of matrix (m × n) and compact notation A = [aij]',
              'Matrix Types: Row, column, square, diagonal, scalar, identity, zero',
              'Equality of matrices and solving for unknown variables',
              'Matrix addition and scalar multiplication properties'
            ]
          },
          {
            id: 'math_12_ch03_t2',
            topicName: 'Matrix Multiplication',
            ncertSection: '3.2',
            highYield: true,
            subtopics: [
              'Compatibility condition: columns of A = rows of B',
              'Row-by-column multiplication mechanics',
              'Non-commutativity: AB ≠ BA in general',
              'Zero divisors: AB = O does not imply A = O or B = O',
              'Matrix polynomials: f(A) = A² - 5A + 7I = O and finding A⁻¹'
            ]
          },
          {
            id: 'math_12_ch03_t3',
            topicName: 'Transpose and Symmetry',
            ncertSection: '3.3',
            highYield: true,
            subtopics: [
              'Properties of transpose: (Aᵀ)ᵀ = A, (kA)ᵀ = kAᵀ, (A+B)ᵀ = Aᵀ+Bᵀ, (AB)ᵀ = BᵀAᵀ',
              'Symmetric matrix: Aᵀ = A (aij = aji)',
              'Skew-symmetric matrix: Aᵀ = -A (aii = 0, principal diagonal zero)',
              'Decomposition Theorem: A = 1/2(A + Aᵀ) + 1/2(A - Aᵀ)'
            ]
          }
        ]
      },
      {
        id: 'math_12_ch04',
        grade: '12',
        discipline: 'DETERMINANTS',
        unit: 'Algebra (Unit II - 10M)',
        chapterNumber: 4,
        chapterName: 'Determinants',
        boardExamFocus: {
          highYield: 'Solving a system of 3 linear equations using X = A⁻¹B (Guaranteed 5-mark question).',
          standardTrap: 'Using |adj A| = |A|^(n-1) and |kA| = k^n |A| in 1-mark MCQs without verifying order n.',
          questionType: 'Guaranteed 5-mark matrix inversion method; 1-mark MCQ determinant identities.'
        },
        topics: [
          {
            id: 'math_12_ch04_t1',
            topicName: 'Expansion & Minors/Cofactors',
            ncertSection: '4.1',
            highYield: false,
            subtopics: [
              'Evaluation of determinants of Order 1, 2, and 3',
              'Minors (Mij) and Cofactors (Aij = (-1)^(i+j) Mij)',
              'Cofactor expansion identities along rows and columns'
            ]
          },
          {
            id: 'math_12_ch04_t2',
            topicName: 'Adjoint and Inverse of a Matrix',
            ncertSection: '4.2',
            highYield: true,
            subtopics: [
              'Definition of Adjoint: adj(A) = [Aij]ᵀ',
              'Fundamental theorem: A · adj(A) = adj(A) · A = |A| I',
              'Singular (|A| = 0) and non-singular (|A| ≠ 0) matrices',
              'Formal inverse formula: A⁻¹ = (1/|A|) adj(A)',
              'Determinant identities: |adj A| = |A|^(n-1), |A · adj A| = |A|^n'
            ]
          },
          {
            id: 'math_12_ch04_t3',
            topicName: 'Applications of Determinants & Matrices',
            ncertSection: '4.3',
            highYield: true,
            subtopics: [
              'Area of a triangle using determinants and collinearity condition (Δ = 0)',
              'Solving linear systems by Matrix Method: AX = B ⇒ X = A⁻¹B (5-Mark guaranteed)',
              'Criteria for consistency: unique solution, no solution, infinitely many'
            ]
          }
        ]
      },

      // --- UNIT III: CALCULUS (35 MARKS) ---
      {
        id: 'math_12_ch05',
        grade: '12',
        discipline: 'CALCULUS',
        unit: 'Calculus (Unit III - 35M)',
        chapterNumber: 5,
        chapterName: 'Continuity and Differentiability',
        boardExamFocus: {
          highYield: 'Finding constants a and b for a continuous function (3 marks); Logarithmic differentiation involving y = x^(sin x) + (sin x)^x (4/5 marks); Proving y₂ differential identities like (1 - x²)y₂ - xy₁ + m²y = 0.',
          standardTrap: 'In second derivative of parametric forms, forgetting to multiply by dt/dx at the final step.',
          questionType: '3-mark continuity proofs, 4/5-mark logarithmic or second-order parametric derivatives.'
        },
        topics: [
          {
            id: 'math_12_ch05_t1',
            topicName: 'Continuity',
            ncertSection: '5.1',
            highYield: true,
            subtopics: [
              'Condition at a point: lim(x→c⁻) f(x) = lim(x→c⁺) f(x) = f(c)',
              'Checking continuity on piecewise functions and absolute values',
              'Finding unknown constants (k, a, b) when f(x) is continuous everywhere',
              'Algebra of continuous functions'
            ]
          },
          {
            id: 'math_12_ch05_t2',
            topicName: 'Differentiability Mechanics',
            ncertSection: '5.2',
            highYield: true,
            subtopics: [
              'Left-Hand Derivative (LHD) and Right-Hand Derivative (RHD) at x = c',
              'Fundamental theorem: Differentiability implies continuity, converse is not true'
            ]
          },
          {
            id: 'math_12_ch05_t3',
            topicName: 'Differentiation Techniques',
            ncertSection: '5.3',
            highYield: true,
            subtopics: [
              'Chain rule for composite expressions f(g(h(x)))',
              'Implicit differentiation for mixed x and y terms',
              'Inverse trigonometric differentiation with trigonometric substitutions',
              'Logarithmic differentiation: [u(x)]^[v(x)] and product/quotient simplification',
              'Parametric differentiation: dy/dx = (dy/dt) / (dx/dt)',
              'Second-order derivatives: d²y/dx² = d/dt(dy/dx) · dt/dx (parametric trap)',
              'Proving differential identity equations involving y, y₁, y₂'
            ]
          }
        ]
      },
      {
        id: 'math_12_ch06',
        grade: '12',
        discipline: 'CALCULUS',
        unit: 'Calculus (Unit III - 35M)',
        chapterNumber: 6,
        chapterName: 'Applications of Derivatives (AOD)',
        boardExamFocus: {
          highYield: 'Applied geometric optimization word problems (frequently chosen for 4-mark Case-Based questions or 5-mark long answers).',
          standardTrap: 'Must explicitly show the second derivative test (f\'\'(x) < 0 for max or f\'\'(x) > 0 for min) to secure method marks.',
          questionType: '4-mark Case Study or 5-mark Applied Optimization word problem.'
        },
        topics: [
          {
            id: 'math_12_ch06_t1',
            topicName: 'Rate of Change of Quantities',
            ncertSection: '6.1',
            highYield: true,
            subtopics: [
              'Instantaneous rate of change dy/dx',
              'Related rates problems: Spherical balloons, leaking conical tanks, sliding ladders',
              'Marginal cost and marginal revenue interpretations'
            ]
          },
          {
            id: 'math_12_ch06_t2',
            topicName: 'Increasing and Decreasing Functions',
            ncertSection: '6.2',
            highYield: true,
            subtopics: [
              'Strictly increasing (f\'(x) > 0) and strictly decreasing (f\'(x) < 0)',
              'Partitioning real line into sub-intervals using critical numbers',
              'Step-by-step sign testing of f\'(x) on sub-intervals'
            ]
          },
          {
            id: 'math_12_ch06_t3',
            topicName: 'Maxima and Minima',
            ncertSection: '6.3',
            highYield: true,
            subtopics: [
              'Critical points where f\'(x) = 0 or f\'(x) fails to exist',
              'First Derivative Test (sign change across critical point)',
              'Second Derivative Test: f\'\'(c) < 0 ⇒ Local Max, f\'\'(c) > 0 ⇒ Local Min',
              'Absolute maxima and minima on closed intervals [a, b]',
              'Applied geometric optimization word problems (inscribed cylinders, minimum surface area)'
            ]
          }
        ]
      },
      {
        id: 'math_12_ch07',
        grade: '12',
        discipline: 'CALCULUS',
        unit: 'Calculus (Unit III - 35M)',
        chapterNumber: 7,
        chapterName: 'Integrals',
        boardExamFocus: {
          highYield: 'Proofs and evaluations using King Property P₄ (e.g., ∫₀^(π/2) (√sin x)/(√sin x + √cos x) dx or ∫₀^π (x sin x)/(1 + cos²x) dx); Modulus integrals using P₂ (∫ₐᵇ |f(x)|dx).',
          standardTrap: 'Forgetting to change integration limits during t-substitution in definite integrals.',
          questionType: 'Guaranteed 3/5-mark Definite Integral property proofs and Partial Fractions.'
        },
        topics: [
          {
            id: 'math_12_ch07_t1',
            topicName: 'Indefinite Integration: Algebraic Methods',
            ncertSection: '7.1',
            highYield: true,
            subtopics: [
              'Direct anti-derivative formulas and linearity properties',
              'Integration by substitution (t-substitution): ∫f(g(x))g\'(x)dx, ∫(f\'/f)dx = ln|f| + C',
              'Trigonometric power reduction identities: sin²x, cos³x, sin(mx)cos(nx)'
            ]
          },
          {
            id: 'math_12_ch07_t2',
            topicName: 'Special Integrals & Partial Fractions',
            ncertSection: '7.2',
            highYield: true,
            subtopics: [
              'Nine special integral formulas: 1/(x²±a²), 1/(a²-x²), 1/√(x²±a²), 1/√(a²-x²)',
              'Completing the square on quadratic denominators',
              'Linear-over-quadratic forms: px + q = A d/dx(denom) + B',
              'Partial fractions: Proper vs improper, linear, repeated, and non-factorizable factors'
            ]
          },
          {
            id: 'math_12_ch07_t3',
            topicName: 'Integration by Parts & Definite Integrals',
            ncertSection: '7.3',
            highYield: true,
            subtopics: [
              'Integration by parts formula and ILATE priority ordering',
              'Special exponential identity: ∫e^x [f(x) + f\'(x)] dx = e^x f(x) + C',
              'Fundamental Theorem of Calculus and concurrent limit transformation',
              'The 7 Core Definite Properties P0 through P7',
              'King Property P4: ∫₀ᵃ f(x)dx = ∫₀ᵃ f(a-x)dx and P3: ∫ₐᵇ f(x)dx = ∫ₐᵇ f(a+b-x)dx',
              'Even/Odd property P7 and modulus splitting property P2'
            ]
          }
        ]
      },
      {
        id: 'math_12_ch08',
        grade: '12',
        discipline: 'CALCULUS',
        unit: 'Calculus (Unit III - 35M)',
        chapterNumber: 8,
        chapterName: 'Applications of Integrals (AOI)',
        boardExamFocus: {
          highYield: 'Area of region bounded by an ellipse/circle, or region bounded by a parabola and a line (e.g., y² = 4ax and y = mx).',
          standardTrap: 'Rough sketch is mandatory; board examiners deduct 1 full mark if the area is evaluated without a labeled graph.',
          questionType: '3-mark or 5-mark area computation with rough graph drawing.'
        },
        topics: [
          {
            id: 'math_12_ch08_t1',
            topicName: 'Area Under Simple Curves',
            ncertSection: '8.1',
            highYield: true,
            subtopics: [
              'Vertical slicing strips (Area = ∫ y dx) and horizontal strips (Area = ∫ x dy)',
              'Standard curve geometries: Circles x² + y² = r², parabolas y² = 4ax, x² = 4ay',
              'Ellipses x²/a² + y²/b² = 1 (deriving area πab using ∫√(a² - x²) dx)'
            ]
          },
          {
            id: 'math_12_ch08_t2',
            topicName: 'Bounded Region Integrals',
            ncertSection: '8.2',
            highYield: true,
            subtopics: [
              'Finding intersection points by solving simultaneous curve equations',
              'Mandatory rough sketch, vertices labeling, and shading target region',
              'Partitioning compound regions with vertical drop lines'
            ]
          }
        ]
      },
      {
        id: 'math_12_ch09',
        grade: '12',
        discipline: 'CALCULUS',
        unit: 'Calculus (Unit III - 35M)',
        chapterNumber: 9,
        chapterName: 'Differential Equations',
        boardExamFocus: {
          highYield: 'Linear Differential Equations (LDE: dy/dx + Py = Q) and Homogeneous Equations with particular boundary values (x = x₀, y = y₀).',
          standardTrap: 'Writing degree as defined when derivatives are trapped inside transcendental functions (e.g., d²y/dx² + sin(dy/dx) = 0 ⇒ degree undefined).',
          questionType: '3-mark or 5-mark general/particular solution of LDE or Homogeneous form.'
        },
        topics: [
          {
            id: 'math_12_ch09_t1',
            topicName: 'Classification',
            ncertSection: '9.1',
            highYield: false,
            subtopics: [
              'Order: Highest order derivative present in equation',
              'Degree: Highest power of highest order derivative (polynomial in derivatives)',
              'Recognizing undefined degree cases: sin(y\'), e^(y\'), ln(y\')'
            ]
          },
          {
            id: 'math_12_ch09_t2',
            topicName: 'Formation and Solution Types',
            ncertSection: '9.2',
            highYield: false,
            subtopics: [
              'General Solution (arbitrary constants equal to order)',
              'Particular Solution (zero arbitrary constants, boundary values)'
            ]
          },
          {
            id: 'math_12_ch09_t3',
            topicName: 'Solution of First Order, First Degree Equations',
            ncertSection: '9.3',
            highYield: true,
            subtopics: [
              'Type 1: Variable Separable f(y)dy = g(x)dx',
              'Type 2: Homogeneous Equations y = vx ⇒ dy/dx = v + x dv/dx',
              'Type 3: Linear Differential Equations (LDE) dy/dx + Py = Q, IF = e^∫Pdx',
              'Type 3: LDE dx/dy + P₁x = Q₁, IF = e^∫P₁dy'
            ]
          }
        ]
      },

      // --- UNIT IV: VECTORS AND THREE-DIMENSIONAL GEOMETRY (14 MARKS) ---
      {
        id: 'math_12_ch10',
        grade: '12',
        discipline: 'VECTORS & 3D',
        unit: 'Vectors and Three-Dimensional Geometry (Unit IV - 14M)',
        chapterNumber: 10,
        chapterName: 'Vector Algebra',
        boardExamFocus: {
          highYield: 'Finding a unit vector perpendicular to two given vectors; Finding the projection of a on b; Evaluating |a + b + c| given a + b + c = 0.',
          standardTrap: 'Omitting the factor of 1/2 when finding parallelogram area given its diagonals vs its adjacent sides.',
          questionType: '2-mark projection/dot-product, 3-mark perpendicular unit vectors or norm expansion.'
        },
        topics: [
          {
            id: 'math_12_ch10_t1',
            topicName: 'Vector Basics and Algebra',
            ncertSection: '10.1',
            highYield: false,
            subtopics: [
              'Position vector r = xi + yj + zk and magnitude |r| = √(x² + y² + z²)',
              'Unit vector â = a / |a|',
              'Direction Cosines (l, m, n) and Direction Ratios (a, b, c): l² + m² + n² = 1',
              'Collinearity condition: b = λa or a₁/a₂ = b₁/b₂ = c₁/c₂',
              'Section Formula for internal and external division'
            ]
          },
          {
            id: 'math_12_ch10_t2',
            topicName: 'Dot Product (Scalar Product)',
            ncertSection: '10.2',
            highYield: true,
            subtopics: [
              'Definition: a · b = |a||b| cos θ',
              'Orthogonality test: a ⊥ b ⇔ a · b = 0',
              'Projection of vector a on vector b: (a · b) / |b|',
              'Expansion of norms: |a ± b|² = |a|² + |b|² ± 2(a · b)'
            ]
          },
          {
            id: 'math_12_ch10_t3',
            topicName: 'Cross Product (Vector Product)',
            ncertSection: '10.3',
            highYield: true,
            subtopics: [
              'Definition: a × b = |a||b| sin θ n̂',
              'Evaluation via 3×3 determinant expansion',
              'Collinearity test: a ∥ b ⇔ a × b = 0',
              'Unit vector perpendicular to both a and b: ±(a × b) / |a × b|',
              'Area of triangle: 1/2 |a × b|; Area of parallelogram with sides: |a × b|',
              'Area of parallelogram with diagonals: 1/2 |d₁ × d₂|'
            ]
          }
        ]
      },
      {
        id: 'math_12_ch11',
        grade: '12',
        discipline: 'VECTORS & 3D',
        unit: 'Vectors and Three-Dimensional Geometry (Unit IV - 14M)',
        chapterNumber: 11,
        chapterName: 'Three-Dimensional Geometry (3D)',
        boardExamFocus: {
          highYield: 'Shortest distance between skew lines d = |((a₂ - a₁) · (b₁ × b₂)) / |b₁ × b₂|| (Almost every year in the 3-mark or 5-mark pool).',
          standardTrap: 'Not standardizing line equations before pulling directional ratios (e.g., transforming (1-x)/2 into (x-1)/(-2)).',
          questionType: 'Guaranteed 3-mark or 5-mark Shortest Distance between Skew / Parallel Lines.'
        },
        topics: [
          {
            id: 'math_12_ch11_t1',
            topicName: 'Direction Cosines and Lines in Space',
            ncertSection: '11.1',
            highYield: true,
            subtopics: [
              'Vector equation of line through point a parallel to vector b: r = a + λb',
              'Cartesian equation of line: (x - x₁)/a = (y - y₁)/b = (z - z₁)/c',
              'Line passing through two points: r = a + λ(b - a)',
              'Cartesian form through two points: (x - x₁)/(x₂ - x₁) = (y - y₁)/(y₂ - y₁) = (z - z₁)/(z₂ - z₁)',
              'Standardizing non-standard line forms like (1-x)/2'
            ]
          },
          {
            id: 'math_12_ch11_t2',
            topicName: 'Shortest Distance Between Lines',
            ncertSection: '11.2',
            highYield: true,
            subtopics: [
              'Skew lines definition and shortest distance: d = |((a₂ - a₁) · (b₁ × b₂)) / |b₁ × b₂||',
              'Condition for intersection of two lines: (a₂ - a₁) · (b₁ × b₂) = 0',
              'Parallel lines shortest distance: d = |(b × (a₂ - a₁)) / |b||'
            ]
          }
        ]
      },

      // --- UNIT V: LINEAR PROGRAMMING (5 MARKS) ---
      {
        id: 'math_12_ch12',
        grade: '12',
        discipline: 'LINEAR PROGRAMMING',
        unit: 'Linear Programming (Unit V - 5M)',
        chapterNumber: 12,
        chapterName: 'Linear Programming (LPP)',
        boardExamFocus: {
          highYield: 'Solving a bounded LPP to maximize/minimize Z graphically using the Corner Point Method (Guaranteed 5-mark question).',
          standardTrap: 'Shading the incorrect half-plane by failing to test with (0,0); omitting axis labels, scale, and vertex evaluation table.',
          questionType: 'Guaranteed 5-mark Graphical Corner Point Optimization problem.'
        },
        topics: [
          {
            id: 'math_12_ch12_t1',
            topicName: 'Formulation and Geometry',
            ncertSection: '12.1',
            highYield: false,
            subtopics: [
              'Objective function Z = ax + by, decision variables x, y ≥ 0, constraints',
              'Plotting linear boundary equations and testing half-planes with (0, 0)',
              'Identifying the Feasible Region as intersection of half-planes'
            ]
          },
          {
            id: 'math_12_ch12_t2',
            topicName: 'Corner Point Method',
            ncertSection: '12.2',
            highYield: true,
            subtopics: [
              'Calculating coordinates of all corner points / vertices',
              'Bounded region: Evaluating Z at all corner points for max/min (5-Mark guaranteed)',
              'Unbounded region: Testing open half-plane ax + by > M or < m'
            ]
          }
        ]
      },

      // --- UNIT VI: PROBABILITY (8 MARKS) ---
      {
        id: 'math_12_ch13',
        grade: '12',
        discipline: 'PROBABILITY',
        unit: 'Probability (Unit VI - 8M)',
        chapterNumber: 13,
        chapterName: 'Probability',
        boardExamFocus: {
          highYield: 'Bayes\' Theorem word problems (frequently in 4-mark Case Studies or 5-mark sections); Finding the probability distribution and mean of a random variable (3 marks).',
          standardTrap: 'Confusing P(E₁|A) with P(A|E₁) in word problem statements.',
          questionType: '4-mark Case Study on Bayes\' Theorem or 3-mark Probability Distribution & Mean.'
        },
        topics: [
          {
            id: 'math_12_ch13_t1',
            topicName: 'Conditional Probability & Multiplication Rule',
            ncertSection: '13.1',
            highYield: true,
            subtopics: [
              'Conditional probability formula: P(A|B) = P(A ∩ B) / P(B)',
              'Multiplication rule: P(A ∩ B) = P(B) · P(A|B)',
              'Independent events test: P(A ∩ B) = P(A) · P(B)',
              'Pairwise independence vs mutual independence'
            ]
          },
          {
            id: 'math_12_ch13_t2',
            topicName: 'Partition of Sample Space & Total Probability',
            ncertSection: '13.2',
            highYield: true,
            subtopics: [
              'Conditions for sample space partition: Disjoint and exhaustive',
              'Theorem of Total Probability: P(A) = Σ P(Ei) · P(A|Ei)'
            ]
          },
          {
            id: 'math_12_ch13_t3',
            topicName: 'Bayes\' Theorem',
            ncertSection: '13.3',
            highYield: true,
            subtopics: [
              'Bayes\' formula: P(Ek|A) = (P(Ek)P(A|Ek)) / (Σ P(Ei)P(A|Ei))',
              'Cause-and-effect reversal problems (machine defects, medical diagnostic tests, truth/lie)'
            ]
          },
          {
            id: 'math_12_ch13_t4',
            topicName: 'Random Variables and Probability Distributions',
            ncertSection: '13.4',
            highYield: true,
            subtopics: [
              'Discrete random variable definition',
              'Constructing probability distribution tables: pi ≥ 0 and Σ pi = 1',
              'Mean / Expected Value calculation: E(X) = μ = Σ xi pi'
            ]
          }
        ]
      }
    ]
  },

  // ==========================================================================
  // 5. CLASS 10 SCIENCE (Chemistry, Biology, Physics, Environment) - Complete 13 Chapters
  // As per Latest Rationalised NCERT Textbook & CBSE / HPBOSE Curriculum
  // ==========================================================================
  'CLASS10_SCIENCE': {
    subjectName: 'Class 10 Science',
    stream: 'FOUNDATION',
    grades: ['10'],
    targetExams: ['CBSE_CLASS_10', 'HP_BOARD_CLASS_10'],
    units: [
      { unitNumber: 'I', unitName: 'Chemical Substances – Nature and Behaviour', weightageMarks: 25, chapters: [1, 2, 3, 4] },
      { unitNumber: 'II', unitName: 'World of Living', weightageMarks: 25, chapters: [5, 6, 7, 8] },
      { unitNumber: 'III', unitName: 'Natural Phenomena', weightageMarks: 12, chapters: [9, 10] },
      { unitNumber: 'IV', unitName: 'Effects of Current', weightageMarks: 13, chapters: [11, 12] },
      { unitNumber: 'V', unitName: 'Natural Resources', weightageMarks: 5, chapters: [13] }
    ],
    chapters: [
      // --- UNIT I: CHEMICAL SUBSTANCES – NATURE AND BEHAVIOUR (25 MARKS) ---
      {
        id: 'c10_sci_ch01',
        grade: '10',
        discipline: 'CHEMISTRY',
        unit: 'Chemical Substances – Nature and Behaviour (Unit I - 25M)',
        chapterNumber: 1,
        chapterName: 'Chemical Reactions and Equations',
        topics: [
          {
            id: 'c10_sci_ch01_t1',
            topicName: 'Chemical Reactions and Chemical Equations',
            ncertSection: '1.1',
            highYield: true,
            subtopics: [
              'What is a chemical reaction?',
              'Writing a chemical equation',
              'Balanced chemical equations',
              'Implications of a balanced chemical equation'
            ]
          },
          {
            id: 'c10_sci_ch01_t2',
            topicName: 'Types of Chemical Reactions',
            ncertSection: '1.2',
            highYield: true,
            subtopics: [
              'Combination reaction',
              'Decomposition reaction',
              'Displacement reaction',
              'Double displacement reaction',
              'Precipitation reaction',
              'Endothermic and exothermic reactions'
            ]
          },
          {
            id: 'c10_sci_ch01_t3',
            topicName: 'Oxidation, Reduction, Corrosion and Rancidity',
            ncertSection: '1.3',
            highYield: true,
            subtopics: [
              'Oxidation',
              'Reduction',
              'Corrosion',
              'Rancidity'
            ]
          }
        ]
      },
      {
        id: 'c10_sci_ch02',
        grade: '10',
        discipline: 'CHEMISTRY',
        unit: 'Chemical Substances – Nature and Behaviour (Unit I - 25M)',
        chapterNumber: 2,
        chapterName: 'Acids, Bases and Salts',
        topics: [
          {
            id: 'c10_sci_ch02_t1',
            topicName: 'Acids, Bases and Indicators',
            ncertSection: '2.1',
            highYield: true,
            subtopics: [
              'Definitions of acids and bases (in terms of H+ and OH- ions)',
              'Indicators (natural and synthetic)',
              'General properties of acids and bases',
              'Examples and uses of acids and bases'
            ]
          },
          {
            id: 'c10_sci_ch02_t2',
            topicName: 'Reactions of Acids and Bases',
            ncertSection: '2.2',
            highYield: true,
            subtopics: [
              'Reaction of acids and bases with metals',
              'Reaction of acids with metal carbonates and hydrogen carbonates',
              'Neutralisation reaction',
              'Reaction of metallic oxides with acids',
              'Reaction of non-metallic oxides with bases'
            ]
          },
          {
            id: 'c10_sci_ch02_t3',
            topicName: 'Acids, Bases in Water and Ion Formation',
            ncertSection: '2.3',
            highYield: true,
            subtopics: [
              'What happens when an acid or base is mixed with water?',
              'Importance of pH in everyday life',
              'pH scale (concept without logarithm)'
            ]
          },
          {
            id: 'c10_sci_ch02_t4',
            topicName: 'Salts and Their Importance',
            ncertSection: '2.4',
            highYield: true,
            subtopics: [
              'Family of salts',
              'pH of salts',
              'Chemicals from common salt',
              'Sodium hydroxide',
              'Bleaching powder',
              'Baking soda',
              'Washing soda',
              'Plaster of Paris'
            ]
          }
        ]
      },
      {
        id: 'c10_sci_ch03',
        grade: '10',
        discipline: 'CHEMISTRY',
        unit: 'Chemical Substances – Nature and Behaviour (Unit I - 25M)',
        chapterNumber: 3,
        chapterName: 'Metals and Non-metals',
        topics: [
          {
            id: 'c10_sci_ch03_t1',
            topicName: 'Physical Properties of Metals and Non-metals',
            ncertSection: '3.1',
            highYield: false,
            subtopics: [
              'Physical properties of metals',
              'Physical properties of non-metals',
              'Exceptions and comparison'
            ]
          },
          {
            id: 'c10_sci_ch03_t2',
            topicName: 'Chemical Properties of Metals',
            ncertSection: '3.2',
            highYield: true,
            subtopics: [
              'Reaction of metals with air / oxygen',
              'Reaction of metals with water',
              'Reaction of metals with acids',
              'Reaction of metals with solutions of other metal salts',
              'Reactivity series'
            ]
          },
          {
            id: 'c10_sci_ch03_t3',
            topicName: 'How do Metals and Non-metals React?',
            ncertSection: '3.3',
            highYield: true,
            subtopics: [
              'Properties of ionic compounds',
              'Formation of ionic compounds'
            ]
          },
          {
            id: 'c10_sci_ch03_t4',
            topicName: 'Occurrence of Metals & Corrosion',
            ncertSection: '3.4',
            highYield: true,
            subtopics: [
              'Extraction of metals',
              'Enrichment of ores',
              'Extracting metals low / middle / high in the reactivity series',
              'Refining of metals',
              'Corrosion and its prevention'
            ]
          }
        ]
      },
      {
        id: 'c10_sci_ch04',
        grade: '10',
        discipline: 'CHEMISTRY',
        unit: 'Chemical Substances – Nature and Behaviour (Unit I - 25M)',
        chapterNumber: 4,
        chapterName: 'Carbon and its Compounds',
        topics: [
          {
            id: 'c10_sci_ch04_t1',
            topicName: 'Carbon: Basic Features and Bonding',
            ncertSection: '4.1',
            highYield: true,
            subtopics: [
              'Bonding in carbon – the covalent bond',
              'Versatile nature of carbon',
              'Saturated and unsaturated carbon compounds'
            ]
          },
          {
            id: 'c10_sci_ch04_t2',
            topicName: 'Chains, Branches and Rings',
            ncertSection: '4.2',
            highYield: true,
            subtopics: [
              'Homologous series',
              'Nomenclature of carbon compounds',
              'Functional groups'
            ]
          },
          {
            id: 'c10_sci_ch04_t3',
            topicName: 'Chemical Properties of Carbon Compounds',
            ncertSection: '4.3',
            highYield: true,
            subtopics: [
              'Combustion',
              'Oxidation',
              'Addition reaction',
              'Substitution reaction'
            ]
          },
          {
            id: 'c10_sci_ch04_t4',
            topicName: 'Important Carbon Compounds',
            ncertSection: '4.4',
            highYield: true,
            subtopics: [
              'Ethanol (properties and uses)',
              'Ethanoic acid (properties and uses)',
              'Soaps and detergents'
            ]
          }
        ]
      },

      // --- UNIT II: WORLD OF LIVING (25 MARKS) ---
      {
        id: 'c10_sci_ch05',
        grade: '10',
        discipline: 'BIOLOGY',
        unit: 'World of Living (Unit II - 25M)',
        chapterNumber: 5,
        chapterName: 'Life Processes',
        topics: [
          {
            id: 'c10_sci_ch05_t1',
            topicName: 'What are Life Processes?',
            ncertSection: '5.1',
            highYield: false,
            subtopics: [
              'Basic concept of life processes'
            ]
          },
          {
            id: 'c10_sci_ch05_t2',
            topicName: 'Nutrition',
            ncertSection: '5.2',
            highYield: true,
            subtopics: [
              'Autotrophic nutrition',
              'Heterotrophic nutrition',
              'How do organisms obtain their nutrition?',
              'Nutrition in human beings (digestive system)'
            ]
          },
          {
            id: 'c10_sci_ch05_t3',
            topicName: 'Respiration',
            ncertSection: '5.3',
            highYield: true,
            subtopics: [
              'Aerobic and anaerobic respiration',
              'Respiration in plants',
              'Respiration in animals / human respiratory system'
            ]
          },
          {
            id: 'c10_sci_ch05_t4',
            topicName: 'Transportation',
            ncertSection: '5.4',
            highYield: true,
            subtopics: [
              'Transportation in human beings (circulatory system)',
              'Transportation in plants (xylem and phloem)'
            ]
          },
          {
            id: 'c10_sci_ch05_t5',
            topicName: 'Excretion',
            ncertSection: '5.5',
            highYield: true,
            subtopics: [
              'Excretion in human beings (nephron structure & urine formation)',
              'Excretion in plants'
            ]
          }
        ]
      },
      {
        id: 'c10_sci_ch06',
        grade: '10',
        discipline: 'BIOLOGY',
        unit: 'World of Living (Unit II - 25M)',
        chapterNumber: 6,
        chapterName: 'Control and Coordination',
        topics: [
          {
            id: 'c10_sci_ch06_t1',
            topicName: 'Animals – Nervous System',
            ncertSection: '6.1',
            highYield: true,
            subtopics: [
              'What happens in reflex actions?',
              'Human brain',
              'How are these tissues protected?',
              'How does the nervous tissue cause action?'
            ]
          },
          {
            id: 'c10_sci_ch06_t2',
            topicName: 'Coordination in Plants',
            ncertSection: '6.2',
            highYield: true,
            subtopics: [
              'Immediate response to stimulus',
              'Movement due to growth (tropic movements)',
              'Plant hormones (Auxins, Gibberellins, Cytokinins, Abscisic acid)'
            ]
          },
          {
            id: 'c10_sci_ch06_t3',
            topicName: 'Hormones in Animals',
            ncertSection: '6.3',
            highYield: true,
            subtopics: [
              'Endocrine glands and hormones (Pituitary, Thyroid, Adrenal, Pancreas, Gonads)',
              'Feedback mechanism'
            ]
          }
        ]
      },
      {
        id: 'c10_sci_ch07',
        grade: '10',
        discipline: 'BIOLOGY',
        unit: 'World of Living (Unit II - 25M)',
        chapterNumber: 7,
        chapterName: 'How do Organisms Reproduce?',
        topics: [
          {
            id: 'c10_sci_ch07_t1',
            topicName: 'Do Organisms Create Exact Copies of Themselves?',
            ncertSection: '7.1',
            highYield: true,
            subtopics: [
              'The importance of variation'
            ]
          },
          {
            id: 'c10_sci_ch07_t2',
            topicName: 'Modes of Reproduction Used by Single Organisms',
            ncertSection: '7.2',
            highYield: true,
            subtopics: [
              'Fission',
              'Fragmentation',
              'Regeneration',
              'Budding',
              'Vegetative propagation',
              'Spore formation'
            ]
          },
          {
            id: 'c10_sci_ch07_t3',
            topicName: 'Sexual Reproduction',
            ncertSection: '7.3',
            highYield: true,
            subtopics: [
              'Why the sexual mode of reproduction?',
              'Sexual reproduction in flowering plants',
              'Reproduction in human beings',
              'Male reproductive system',
              'Female reproductive system',
              'Reproductive health'
            ]
          }
        ]
      },
      {
        id: 'c10_sci_ch08',
        grade: '10',
        discipline: 'BIOLOGY',
        unit: 'World of Living (Unit II - 25M)',
        chapterNumber: 8,
        chapterName: 'Heredity',
        topics: [
          {
            id: 'c10_sci_ch08_t1',
            topicName: 'Accumulation of Variation During Reproduction',
            ncertSection: '8.1',
            highYield: false,
            subtopics: [
              'Variation and heredity'
            ]
          },
          {
            id: 'c10_sci_ch08_t2',
            topicName: 'Heredity',
            ncertSection: '8.2',
            highYield: true,
            subtopics: [
              'Inherited traits',
              'Rules for the inheritance of traits – Mendel’s contributions (Monohybrid & Dihybrid cross)',
              'How do these traits get expressed?',
              'Sex determination'
            ]
          }
        ]
      },

      // --- UNIT III: NATURAL PHENOMENA (12 MARKS) ---
      {
        id: 'c10_sci_ch09',
        grade: '10',
        discipline: 'PHYSICS',
        unit: 'Natural Phenomena (Unit III - 12M)',
        chapterNumber: 9,
        chapterName: 'Light – Reflection and Refraction',
        topics: [
          {
            id: 'c10_sci_ch09_t1',
            topicName: 'Reflection of Light',
            ncertSection: '9.1',
            highYield: true,
            subtopics: [
              'Laws of reflection of light',
              'Spherical mirrors',
              'Image formation by spherical mirrors',
              'Representation of images formed by spherical mirrors using ray diagrams',
              'Mirror formula and magnification'
            ]
          },
          {
            id: 'c10_sci_ch09_t2',
            topicName: 'Refraction of Light',
            ncertSection: '9.2',
            highYield: true,
            subtopics: [
              'Refraction through a rectangular glass slab',
              'The refractive index',
              'Refraction by spherical lenses',
              'Image formation by lenses',
              'Sign convention for spherical lenses',
              'Lens formula and magnification',
              'Power of a lens'
            ]
          }
        ]
      },
      {
        id: 'c10_sci_ch10',
        grade: '10',
        discipline: 'PHYSICS',
        unit: 'Natural Phenomena (Unit III - 12M)',
        chapterNumber: 10,
        chapterName: 'The Human Eye and the Colourful World',
        topics: [
          {
            id: 'c10_sci_ch10_t1',
            topicName: 'The Human Eye',
            ncertSection: '10.1',
            highYield: true,
            subtopics: [
              'Structure and working of the human eye',
              'Power of accommodation',
              'Defects of vision and their correction',
              'Myopia (near-sightedness)',
              'Hypermetropia (far-sightedness)',
              'Presbyopia'
            ]
          },
          {
            id: 'c10_sci_ch10_t2',
            topicName: 'Refraction of Light Through a Prism',
            ncertSection: '10.2',
            highYield: true,
            subtopics: [
              'Dispersion of white light by a glass prism',
              'Atmospheric refraction',
              'Scattering of light',
              'Tyndall effect',
              'Applications (why is the sky blue, colour of the sun at sunrise/sunset – as applicable)'
            ]
          }
        ]
      },

      // --- UNIT IV: EFFECTS OF CURRENT (13 MARKS) ---
      {
        id: 'c10_sci_ch11',
        grade: '10',
        discipline: 'PHYSICS',
        unit: 'Effects of Current (Unit IV - 13M)',
        chapterNumber: 11,
        chapterName: 'Electricity',
        topics: [
          {
            id: 'c10_sci_ch11_t1',
            topicName: 'Electric Current and Circuit',
            ncertSection: '11.1',
            highYield: true,
            subtopics: [
              'Electric current',
              'Electric circuit',
              'Electric potential and potential difference',
              'Circuit diagram'
            ]
          },
          {
            id: 'c10_sci_ch11_t2',
            topicName: 'Ohm’s Law',
            ncertSection: '11.2',
            highYield: true,
            subtopics: [
              'Factors on which the resistance of a conductor depends',
              'Resistance of a system of resistors',
              'Series combination of resistors',
              'Parallel combination of resistors'
            ]
          },
          {
            id: 'c10_sci_ch11_t3',
            topicName: 'Heating Effect of Electric Current',
            ncertSection: '11.3',
            highYield: true,
            subtopics: [
              'Joule’s law of heating',
              'Practical applications of heating effect of electric current',
              'Electric power'
            ]
          }
        ]
      },
      {
        id: 'c10_sci_ch12',
        grade: '10',
        discipline: 'PHYSICS',
        unit: 'Effects of Current (Unit IV - 13M)',
        chapterNumber: 12,
        chapterName: 'Magnetic Effects of Electric Current',
        topics: [
          {
            id: 'c10_sci_ch12_t1',
            topicName: 'Magnetic Field and Field Lines',
            ncertSection: '12.1',
            highYield: true,
            subtopics: [
              'Magnetic field and magnetic field lines',
              'Magnetic field due to a current-carrying conductor',
              'Right-hand thumb rule',
              'Magnetic field due to a current through a circular loop',
              'Magnetic field due to a current in a solenoid'
            ]
          },
          {
            id: 'c10_sci_ch12_t2',
            topicName: 'Force on a Current-carrying Conductor in a Magnetic Field',
            ncertSection: '12.2',
            highYield: true,
            subtopics: [
              'Fleming’s left-hand rule',
              'Electric motor'
            ]
          },
          {
            id: 'c10_sci_ch12_t3',
            topicName: 'Electromagnetic Induction',
            ncertSection: '12.3',
            highYield: true,
            subtopics: [
              'Electromagnetic induction',
              'Fleming’s right-hand rule',
              'Electric generator',
              'Domestic electric circuits'
            ]
          }
        ]
      },

      // --- UNIT V: NATURAL RESOURCES (5 MARKS) ---
      {
        id: 'c10_sci_ch13',
        grade: '10',
        discipline: 'ENVIRONMENT',
        unit: 'Natural Resources (Unit V - 5M)',
        chapterNumber: 13,
        chapterName: 'Our Environment',
        topics: [
          {
            id: 'c10_sci_ch13_t1',
            topicName: 'Ecosystem – What are its Components?',
            ncertSection: '13.1',
            highYield: true,
            subtopics: [
              'Ecosystem and its components',
              'Producers, consumers and decomposers',
              'Food chains and food webs',
              'Trophic levels'
            ]
          },
          {
            id: 'c10_sci_ch13_t2',
            topicName: 'How do We Affect Our Environment?',
            ncertSection: '13.2',
            highYield: true,
            subtopics: [
              'Ozone layer and how it is getting depleted',
              'Managing the garbage we produce',
              'Biodegradable and non-biodegradable substances'
            ]
          }
        ]
      }
    ]
  },

  // ==========================================================================
  // 6. CLASS 10 MATHEMATICS - Foundation
  // ==========================================================================
  // ==========================================================================
  // 6. CLASS 10 MATHEMATICS - Complete 14 Chapters
  // As per Latest Rationalised NCERT Textbook & CBSE / HPBOSE Curriculum
  // ==========================================================================
  'CLASS10_MATHEMATICS': {
    subjectName: 'Class 10 Mathematics',
    stream: 'FOUNDATION',
    grades: ['10'],
    targetExams: ['CBSE_CLASS_10', 'HP_BOARD_CLASS_10'],
    units: [
      { unitNumber: 'I', unitName: 'Number Systems', weightageMarks: 6, chapters: [1] },
      { unitNumber: 'II', unitName: 'Algebra', weightageMarks: 20, chapters: [2, 3, 4, 5] },
      { unitNumber: 'III', unitName: 'Coordinate Geometry', weightageMarks: 6, chapters: [7] },
      { unitNumber: 'IV', unitName: 'Geometry', weightageMarks: 15, chapters: [6, 10] },
      { unitNumber: 'V', unitName: 'Trigonometry', weightageMarks: 12, chapters: [8, 9] },
      { unitNumber: 'VI', unitName: 'Mensuration', weightageMarks: 10, chapters: [11, 12] },
      { unitNumber: 'VII', unitName: 'Statistics & Probability', weightageMarks: 11, chapters: [13, 14] }
    ],
    chapters: [
      // --- UNIT I: NUMBER SYSTEMS (6 MARKS) ---
      {
        id: 'c10_math_ch01',
        grade: '10',
        discipline: 'NUMBER SYSTEMS',
        unit: 'Number Systems (Unit I - 6M)',
        chapterNumber: 1,
        chapterName: 'Real Numbers',
        topics: [
          {
            id: 'c10_math_ch01_t1',
            topicName: 'Introduction',
            ncertSection: '1.1',
            highYield: false,
            subtopics: [
              'Review of natural numbers, whole numbers, integers, rational numbers',
              'Introduction to real numbers'
            ]
          },
          {
            id: 'c10_math_ch01_t2',
            topicName: 'The Fundamental Theorem of Arithmetic',
            ncertSection: '1.2',
            highYield: true,
            subtopics: [
              'Statement of the Fundamental Theorem of Arithmetic',
              'Unique prime factorisation of natural numbers',
              'Applications: Finding HCF using prime factorisation',
              'Applications: Finding LCM using prime factorisation',
              'Relation: HCF × LCM = Product of two numbers'
            ]
          },
          {
            id: 'c10_math_ch01_t3',
            topicName: 'Revisiting Irrational Numbers',
            ncertSection: '1.3',
            highYield: true,
            subtopics: [
              'Definition of irrational numbers',
              'Proofs of irrationality of √2, √3, √5',
              'Applications of irrational numbers'
            ]
          }
        ]
      },

      // --- UNIT II: ALGEBRA (20 MARKS) ---
      {
        id: 'c10_math_ch02',
        grade: '10',
        discipline: 'ALGEBRA',
        unit: 'Algebra (Unit II - 20M)',
        chapterNumber: 2,
        chapterName: 'Polynomials',
        topics: [
          {
            id: 'c10_math_ch02_t1',
            topicName: 'Introduction',
            ncertSection: '2.1',
            highYield: false,
            subtopics: [
              'Definition of a polynomial',
              'Degree of a polynomial',
              'Types: linear, quadratic, cubic polynomials'
            ]
          },
          {
            id: 'c10_math_ch02_t2',
            topicName: 'Geometrical Meaning of the Zeroes of a Polynomial',
            ncertSection: '2.2',
            highYield: true,
            subtopics: [
              'Zeroes of a polynomial (roots)',
              'Graphical representation: intersection with x-axis',
              'Number of zeroes of a polynomial'
            ]
          },
          {
            id: 'c10_math_ch02_t3',
            topicName: 'Relationship between Zeroes and Coefficients of a Polynomial',
            ncertSection: '2.3',
            highYield: true,
            subtopics: [
              'For a quadratic polynomial ax² + bx + c: Sum of zeroes = –b/a',
              'For a quadratic polynomial ax² + bx + c: Product of zeroes = c/a',
              'Finding a quadratic polynomial given its zeroes',
              'Verification of the relationship'
            ]
          }
        ]
      },
      {
        id: 'c10_math_ch03',
        grade: '10',
        discipline: 'ALGEBRA',
        unit: 'Algebra (Unit II - 20M)',
        chapterNumber: 3,
        chapterName: 'Pair of Linear Equations in Two Variables',
        topics: [
          {
            id: 'c10_math_ch03_t1',
            topicName: 'Introduction',
            ncertSection: '3.1',
            highYield: false,
            subtopics: [
              'General form: a₁x + b₁y + c₁ = 0 and a₂x + b₂y + c₂ = 0',
              'Solution of a pair of linear equations'
            ]
          },
          {
            id: 'c10_math_ch03_t2',
            topicName: 'Graphical Method of Solution',
            ncertSection: '3.2',
            highYield: true,
            subtopics: [
              'Plotting the two lines on the Cartesian plane',
              'Unique solution (intersecting lines: a1/a2 != b1/b2)',
              'No solution (parallel lines: a1/a2 = b1/b2 != c1/c2)',
              'Infinitely many solutions (coincident lines: a1/a2 = b1/b2 = c1/c2)',
              'Consistency / inconsistency of the system'
            ]
          },
          {
            id: 'c10_math_ch03_t3',
            topicName: 'Algebraic Methods of Solving a Pair of Linear Equations',
            ncertSection: '3.3',
            highYield: true,
            subtopics: [
              '3.3.1 Substitution Method (Steps of substitution, solving for one variable)',
              '3.3.2 Elimination Method (Making coefficients equal, adding/subtracting equations)'
            ]
          },
          {
            id: 'c10_math_ch03_t4',
            topicName: 'Situational / Word Problems',
            ncertSection: '3.4',
            highYield: true,
            subtopics: [
              'Forming equations from real-life situations (ages, digits, speed-distance)',
              'Solving and interpreting the solution'
            ]
          }
        ]
      },
      {
        id: 'c10_math_ch04',
        grade: '10',
        discipline: 'ALGEBRA',
        unit: 'Algebra (Unit II - 20M)',
        chapterNumber: 4,
        chapterName: 'Quadratic Equations',
        topics: [
          {
            id: 'c10_math_ch04_t1',
            topicName: 'Introduction',
            ncertSection: '4.1',
            highYield: false,
            subtopics: [
              'Standard form: ax² + bx + c = 0 (a ≠ 0)',
              'Quadratic equation vs quadratic polynomial'
            ]
          },
          {
            id: 'c10_math_ch04_t2',
            topicName: 'Quadratic Equations',
            ncertSection: '4.2',
            highYield: true,
            subtopics: [
              'Identifying quadratic equations',
              'Roots of a quadratic equation'
            ]
          },
          {
            id: 'c10_math_ch04_t3',
            topicName: 'Solution of a Quadratic Equation by Factorisation',
            ncertSection: '4.3',
            highYield: true,
            subtopics: [
              'Factorisation method (splitting the middle term)',
              'Solving by equating each linear factor to zero'
            ]
          },
          {
            id: 'c10_math_ch04_t4',
            topicName: 'Nature of Roots',
            ncertSection: '4.4',
            highYield: true,
            subtopics: [
              'Quadratic formula: x = (-b ± √(b² - 4ac)) / (2a)',
              'Discriminant (D = b² – 4ac)',
              'D > 0 → two distinct real roots',
              'D = 0 → two equal real roots',
              'D < 0 → no real roots',
              'Situational problems leading to quadratic equations'
            ]
          }
        ]
      },
      {
        id: 'c10_math_ch05',
        grade: '10',
        discipline: 'ALGEBRA',
        unit: 'Algebra (Unit II - 20M)',
        chapterNumber: 5,
        chapterName: 'Arithmetic Progressions',
        topics: [
          {
            id: 'c10_math_ch05_t1',
            topicName: 'Introduction',
            ncertSection: '5.1',
            highYield: false,
            subtopics: [
              'Motivation for studying sequences',
              'Examples of arithmetic progressions in daily life'
            ]
          },
          {
            id: 'c10_math_ch05_t2',
            topicName: 'Arithmetic Progressions',
            ncertSection: '5.2',
            highYield: true,
            subtopics: [
              'Definition of an Arithmetic Progression (AP)',
              'Common difference (d)',
              'General form of an AP: a, a+d, a+2d...'
            ]
          },
          {
            id: 'c10_math_ch05_t3',
            topicName: 'nth Term of an AP',
            ncertSection: '5.3',
            highYield: true,
            subtopics: [
              'Formula: an = a + (n – 1)d',
              'Finding any term of an AP',
              'Finding the number of terms'
            ]
          },
          {
            id: 'c10_math_ch05_t4',
            topicName: 'Sum of First n Terms of an AP',
            ncertSection: '5.4',
            highYield: true,
            subtopics: [
              'Formula: Sn = n/2 [2a + (n – 1)d]',
              'Alternative form: Sn = n/2 (a + l)',
              'Applications in solving daily-life problems'
            ]
          }
        ]
      },

      // --- UNIT IV: GEOMETRY (15 MARKS) ---
      {
        id: 'c10_math_ch06',
        grade: '10',
        discipline: 'GEOMETRY',
        unit: 'Geometry (Unit IV - 15M)',
        chapterNumber: 6,
        chapterName: 'Triangles',
        topics: [
          {
            id: 'c10_math_ch06_t1',
            topicName: 'Introduction',
            ncertSection: '6.1',
            highYield: false,
            subtopics: [
              'Review of congruence of triangles',
              'Introduction to similar figures'
            ]
          },
          {
            id: 'c10_math_ch06_t2',
            topicName: 'Similar Figures',
            ncertSection: '6.2',
            highYield: false,
            subtopics: [
              'Definition of similar figures',
              'Difference between congruence and similarity'
            ]
          },
          {
            id: 'c10_math_ch06_t3',
            topicName: 'Similarity of Triangles',
            ncertSection: '6.3',
            highYield: true,
            subtopics: [
              'Definition of similar triangles',
              'Basic Proportionality Theorem (Thales’ Theorem) – Statement and Proof',
              'Converse of Basic Proportionality Theorem (Statement only)'
            ]
          },
          {
            id: 'c10_math_ch06_t4',
            topicName: 'Criteria for Similarity of Triangles',
            ncertSection: '6.4',
            highYield: true,
            subtopics: [
              'AA (Angle-Angle) similarity criterion',
              'SSS (Side-Side-Side) similarity criterion',
              'SAS (Side-Angle-Side) similarity criterion',
              'Applications of similarity criteria'
            ]
          }
        ]
      },

      // --- UNIT III: COORDINATE GEOMETRY (6 MARKS) ---
      {
        id: 'c10_math_ch07',
        grade: '10',
        discipline: 'COORDINATE GEOMETRY',
        unit: 'Coordinate Geometry (Unit III - 6M)',
        chapterNumber: 7,
        chapterName: 'Coordinate Geometry',
        topics: [
          {
            id: 'c10_math_ch07_t1',
            topicName: 'Introduction',
            ncertSection: '7.1',
            highYield: false,
            subtopics: [
              'Review of Cartesian plane and coordinates',
              'Plotting points'
            ]
          },
          {
            id: 'c10_math_ch07_t2',
            topicName: 'Distance Formula',
            ncertSection: '7.2',
            highYield: true,
            subtopics: [
              'Derivation of distance formula',
              'Distance between two points: d = √((x₂ - x₁)² + (y₂ - y₁)²)',
              'Applications: verifying collinearity, finding length of sides of polygons'
            ]
          },
          {
            id: 'c10_math_ch07_t3',
            topicName: 'Section Formula',
            ncertSection: '7.3',
            highYield: true,
            subtopics: [
              'Section formula for internal division: ((m₁x₂ + m₂x₁)/(m₁ + m₂), (m₁y₂ + m₂y₁)/(m₁ + m₂))',
              'Coordinates of a point dividing a line segment in the ratio m : n',
              'Mid-point formula (special case: ((x₁+x₂)/2, (y₁+y₂)/2))',
              'Applications (centroid, ratio finding, collinearity)'
            ]
          }
        ]
      },

      // --- UNIT V: TRIGONOMETRY (12 MARKS) ---
      {
        id: 'c10_math_ch08',
        grade: '10',
        discipline: 'TRIGONOMETRY',
        unit: 'Trigonometry (Unit V - 12M)',
        chapterNumber: 8,
        chapterName: 'Introduction to Trigonometry',
        topics: [
          {
            id: 'c10_math_ch08_t1',
            topicName: 'Introduction',
            ncertSection: '8.1',
            highYield: true,
            subtopics: [
              'Trigonometric ratios of an acute angle in a right-angled triangle',
              'Definition of sin θ, cos θ, tan θ, cosec θ, sec θ, cot θ',
              'Proof that the ratios are well-defined',
              'Trigonometric ratios of 0° and 90° (motivation)'
            ]
          },
          {
            id: 'c10_math_ch08_t2',
            topicName: 'Trigonometric Ratios of Some Specific Angles',
            ncertSection: '8.2',
            highYield: true,
            subtopics: [
              'Values of trigonometric ratios for 30°, 45°, 60°',
              'Standard angles table (0°, 30°, 45°, 60°, 90°)'
            ]
          },
          {
            id: 'c10_math_ch08_t3',
            topicName: 'Trigonometric Ratios of Complementary Angles',
            ncertSection: '8.3',
            highYield: true,
            subtopics: [
              'sin (90° – A) = cos A',
              'cos (90° – A) = sin A',
              'tan (90° – A) = cot A',
              'cosec (90° – A) = sec A',
              'sec (90° – A) = cosec A',
              'cot (90° – A) = tan A'
            ]
          },
          {
            id: 'c10_math_ch08_t4',
            topicName: 'Trigonometric Identities',
            ncertSection: '8.4',
            highYield: true,
            subtopics: [
              'Proof of sin²A + cos²A = 1',
              'Derived identity: 1 + tan²A = sec²A',
              'Derived identity: 1 + cot²A = cosec²A',
              'Applications of identities in trigonometric proofs'
            ]
          }
        ]
      },
      {
        id: 'c10_math_ch09',
        grade: '10',
        discipline: 'TRIGONOMETRY',
        unit: 'Trigonometry (Unit V - 12M)',
        chapterNumber: 9,
        chapterName: 'Some Applications of Trigonometry',
        topics: [
          {
            id: 'c10_math_ch09_t1',
            topicName: 'Heights and Distances',
            ncertSection: '9.1',
            highYield: true,
            subtopics: [
              'Angle of elevation',
              'Angle of depression',
              'Simple problems involving heights and distances',
              'Problems restricted to angles 30°, 45°, 60°',
              'Problems involving not more than two right triangles'
            ]
          }
        ]
      },

      // --- UNIT IV: GEOMETRY (CIRCLES - 15M CONT.) ---
      {
        id: 'c10_math_ch10',
        grade: '10',
        discipline: 'GEOMETRY',
        unit: 'Geometry (Unit IV - 15M)',
        chapterNumber: 10,
        chapterName: 'Circles',
        topics: [
          {
            id: 'c10_math_ch10_t1',
            topicName: 'Introduction',
            ncertSection: '10.1',
            highYield: false,
            subtopics: [
              'Review of circle and related terms',
              'Tangent to a circle'
            ]
          },
          {
            id: 'c10_math_ch10_t2',
            topicName: 'Tangent to a Circle',
            ncertSection: '10.2',
            highYield: true,
            subtopics: [
              'Definition of a tangent',
              'Theorem: The tangent at any point of a circle is perpendicular to the radius through the point of contact (Proof)',
              'Number of tangents from a point on the circle'
            ]
          },
          {
            id: 'c10_math_ch10_t3',
            topicName: 'Number of Tangents from a Point on a Circle',
            ncertSection: '10.3',
            highYield: true,
            subtopics: [
              'Theorem: The lengths of tangents drawn from an external point to a circle are equal (Proof)',
              'Applications of the tangent theorems'
            ]
          }
        ]
      },

      // --- UNIT VI: MENSURATION (10 MARKS) ---
      {
        id: 'c10_math_ch11',
        grade: '10',
        discipline: 'MENSURATION',
        unit: 'Mensuration (Unit VI - 10M)',
        chapterNumber: 11,
        chapterName: 'Areas Related to Circles',
        topics: [
          {
            id: 'c10_math_ch11_t1',
            topicName: 'Perimeter and Area of a Circle – A Review',
            ncertSection: '11.1',
            highYield: false,
            subtopics: [
              'Circumference and area formulae (2πr, πr²)'
            ]
          },
          {
            id: 'c10_math_ch11_t2',
            topicName: 'Areas of Sector and Segment of a Circle',
            ncertSection: '11.2',
            highYield: true,
            subtopics: [
              'Area of a sector: (θ/360) × πr²',
              'Area of a segment: Area of sector - Area of triangle',
              'Problems restricted to central angles 60°, 90°, 120°',
              'Problems on areas and perimeter of plane figures involving sectors and segments'
            ]
          }
        ]
      },
      {
        id: 'c10_math_ch12',
        grade: '10',
        discipline: 'MENSURATION',
        unit: 'Mensuration (Unit VI - 10M)',
        chapterNumber: 12,
        chapterName: 'Surface Areas and Volumes',
        topics: [
          {
            id: 'c10_math_ch12_t1',
            topicName: 'Introduction',
            ncertSection: '12.1',
            highYield: false,
            subtopics: [
              'Surface areas and volumes of basic solids (review)'
            ]
          },
          {
            id: 'c10_math_ch12_t2',
            topicName: 'Surface Area of a Combination of Solids',
            ncertSection: '12.2',
            highYield: true,
            subtopics: [
              'Combination of any two of: cube, cuboid, sphere, hemisphere, right circular cylinder, right circular cone',
              'Finding total surface area of combined solids'
            ]
          },
          {
            id: 'c10_math_ch12_t3',
            topicName: 'Volume of a Combination of Solids',
            ncertSection: '12.3',
            highYield: true,
            subtopics: [
              'Volume of combination of two solids',
              'Conversion of one solid into another',
              'Application problems'
            ]
          }
        ]
      },

      // --- UNIT VII: STATISTICS & PROBABILITY (11 MARKS) ---
      {
        id: 'c10_math_ch13',
        grade: '10',
        discipline: 'STATISTICS',
        unit: 'Statistics & Probability (Unit VII - 11M)',
        chapterNumber: 13,
        chapterName: 'Statistics',
        topics: [
          {
            id: 'c10_math_ch13_t1',
            topicName: 'Introduction',
            ncertSection: '13.1',
            highYield: false,
            subtopics: [
              'Review of mean, median, mode of ungrouped data'
            ]
          },
          {
            id: 'c10_math_ch13_t2',
            topicName: 'Mean of Grouped Data',
            ncertSection: '13.2',
            highYield: true,
            subtopics: [
              'Direct method: x̄ = Σ(fi·xi) / Σfi',
              'Assumed mean method: x̄ = a + Σ(fi·di) / Σfi',
              'Step-deviation method: x̄ = a + (Σ(fi·ui) / Σfi) × h'
            ]
          },
          {
            id: 'c10_math_ch13_t3',
            topicName: 'Mode of Grouped Data',
            ncertSection: '13.3',
            highYield: true,
            subtopics: [
              'Formula for mode: l + ((f₁ - f₀) / (2f₁ - f₀ - f₂)) × h',
              'Modal class identification'
            ]
          },
          {
            id: 'c10_math_ch13_t4',
            topicName: 'Median of Grouped Data',
            ncertSection: '13.4',
            highYield: true,
            subtopics: [
              'Cumulative frequency (less than type)',
              'Formula for median: l + (((n/2) - cf) / f) × h',
              'Median class identification',
              'Empirical relationship: 3 Median = Mode + 2 Mean',
              'Note: Bimodal situations to be avoided'
            ]
          }
        ]
      },
      {
        id: 'c10_math_ch14',
        grade: '10',
        discipline: 'PROBABILITY',
        unit: 'Statistics & Probability (Unit VII - 11M)',
        chapterNumber: 14,
        chapterName: 'Probability',
        topics: [
          {
            id: 'c10_math_ch14_t1',
            topicName: 'Probability – A Theoretical Approach',
            ncertSection: '14.1',
            highYield: true,
            subtopics: [
              'Classical definition of probability',
              'Probability of an event P(E) = Number of favourable outcomes / Total number of outcomes',
              'Simple problems on finding the probability of an event',
              'Experiments with equally likely outcomes (coins, dice, pack of 52 cards)',
              'Connection with probability concepts from Class 9'
            ]
          }
        ]
      }
    ]
  }
};

/**
 * Helper function to retrieve all chapters & topics for a subject
 */
function getSubjectTaxonomy(subjectKey) {
  const normKey = (subjectKey || 'BIOLOGY').toUpperCase().replace(/\s+/g, '_');
  return CURRICULUM_TAXONOMY[normKey] || CURRICULUM_TAXONOMY['BIOLOGY'];
}

/**
 * Helper function to list all supported subjects
 */
function listAvailableSubjects() {
  return Object.keys(CURRICULUM_TAXONOMY).map(key => ({
    key,
    name: CURRICULUM_TAXONOMY[key].subjectName,
    stream: CURRICULUM_TAXONOMY[key].stream,
    grades: CURRICULUM_TAXONOMY[key].grades,
    totalChapters: CURRICULUM_TAXONOMY[key].chapters.length,
    targetExams: CURRICULUM_TAXONOMY[key].targetExams
  }));
}

module.exports = {
  CURRICULUM_TAXONOMY,
  getSubjectTaxonomy,
  listAvailableSubjects
};
