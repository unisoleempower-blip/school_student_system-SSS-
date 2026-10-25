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
  // 4. SENIOR MATHEMATICS (Class 11 & Class 12) - Non-Medical Stream
  // ==========================================================================
  'MATHEMATICS': {
    subjectName: 'Mathematics',
    stream: 'NON_MEDICAL',
    grades: ['11', '12'],
    targetExams: ['JEE_MAIN', 'JEE_ADVANCED', 'CBSE_CLASS_12'],
    chapters: [
      {
        id: 'math_12_ch07',
        grade: '12',
        mathBranch: 'CALCULUS',
        chapterNumber: 7,
        chapterName: 'Integrals',
        topics: [
          { id: 'math_12_ch07_t1', topicName: 'Indefinite Integrals by Substitution', ncertSection: '7.3', highYield: true },
          { id: 'math_12_ch07_t2', topicName: 'Integration by Parts & Partial Fractions', ncertSection: '7.5', highYield: true },
          { id: 'math_12_ch07_t3', topicName: 'Fundamental Theorem of Calculus', ncertSection: '7.7', highYield: true },
          { id: 'math_12_ch07_t4', topicName: 'Properties of Definite Integrals (King Property: f(a+b-x))', ncertSection: '7.8', highYield: true },
          { id: 'math_12_ch07_t5', topicName: 'Even/Odd Properties & Periodic Definite Integrals', ncertSection: '7.8.2', highYield: true }
        ]
      },
      {
        id: 'math_12_ch10',
        grade: '12',
        mathBranch: 'VECTORS_3D',
        chapterNumber: 10,
        chapterName: 'Vector Algebra and 3D Geometry',
        topics: [
          { id: 'math_12_ch10_t1', topicName: 'Dot (Scalar) Product & Projection of Vectors', ncertSection: '10.6', highYield: true },
          { id: 'math_12_ch10_t2', topicName: 'Cross (Vector) Product & Area of Triangles', ncertSection: '10.7', highYield: true },
          { id: 'math_12_ch10_t3', topicName: 'Direction Cosines & Direction Ratios of Lines', ncertSection: '11.2', highYield: true },
          { id: 'math_12_ch10_t4', topicName: 'Shortest Distance Between Two Skew Lines', ncertSection: '11.5', highYield: true },
          { id: 'math_12_ch10_t5', topicName: 'Coplanarity of Lines & Angle between Lines', ncertSection: '11.6', highYield: true }
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
  'CLASS10_MATHEMATICS': {
    subjectName: 'Class 10 Mathematics',
    stream: 'FOUNDATION',
    grades: ['10'],
    targetExams: ['CBSE_CLASS_10', 'HP_BOARD_CLASS_10'],
    chapters: [
      {
        id: 'c10_math_ch01',
        grade: '10',
        chapterNumber: 1,
        chapterName: 'Real Numbers',
        topics: [
          { id: 'c10_math_ch01_t1', topicName: 'Fundamental Theorem of Arithmetic (HCF & LCM)', ncertSection: '1.2', highYield: true },
          { id: 'c10_math_ch01_t2', topicName: 'Revisiting Irrational Numbers (Proofs of sqrt(2), sqrt(3), sqrt(5))', ncertSection: '1.3', highYield: true }
        ]
      },
      {
        id: 'c10_math_ch04',
        grade: '10',
        chapterNumber: 4,
        chapterName: 'Quadratic Equations',
        topics: [
          { id: 'c10_math_ch04_t1', topicName: 'Standard Form of Quadratic Equations', ncertSection: '4.1', highYield: false },
          { id: 'c10_math_ch04_t2', topicName: 'Solution of Quadratic Equations by Factorisation', ncertSection: '4.2', highYield: true },
          { id: 'c10_math_ch04_t3', topicName: 'Nature of Roots & Discriminant (D = b^2 - 4ac)', ncertSection: '4.4', highYield: true }
        ]
      },
      {
        id: 'c10_math_ch08',
        grade: '10',
        chapterNumber: 8,
        chapterName: 'Introduction to Trigonometry',
        topics: [
          { id: 'c10_math_ch08_t1', topicName: 'Trigonometric Ratios of Acute Angles', ncertSection: '8.2', highYield: true },
          { id: 'c10_math_ch08_t2', topicName: 'Trigonometric Ratios of Specific Angles (0, 30, 45, 60, 90)', ncertSection: '8.3', highYield: true },
          { id: 'c10_math_ch08_t3', topicName: 'Trigonometric Identities (sin^2 + cos^2 = 1, 1 + tan^2 = sec^2)', ncertSection: '8.4', highYield: true }
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
