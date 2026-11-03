import { DKMNode } from '../types';
import { MECH_DIAGNOSTIC_QUESTIONS } from './dkmMechQuestions';

export const MECH_CAD_DKM_NODES: DKMNode[] = [
  // 1. Degrees of Freedom in a 2D sketch
  {
    id: 'cad_dof_2d',
    name: 'Degrees of Freedom in a 2D Sketch',
    track: 'Mechanical Engineering (CAD)',
    domain: 'mech',
    category: '2D Parametric Sketching',
    description: 'Analyzing unconstrained translational and rotational degrees of freedom (DOF) in parametric 2D planar sketches.',
    keyConcept: 'In planar 2D sketching, an unconstrained point has 2 translational DOF (X, Y). A line has 4 DOF (two endpoints) or 3 DOF (length, orientation, position). Fully constrained sketches exhibit 0 DOF and render black.',
    typicalTrap: 'Extruding an under-constrained (blue) sketch assuming it is finished (frequency 82%). Unconstrained geometry floats unpredictably when parent dimensions or global assemblies change.',
    codeLanguage: 'python',
    starterCodeSnippet: `# CadQuery Parametric Sketch Validation
import cadquery as cq

# Bug: Sketch lines unanchored to origin (3 free DOF remaining)
result = (
    cq.Workplane("XY")
    .moveTo(10, 10)
    .lineTo(50, 10) # Blue geometry: missing coincident to origin or fixed datum
    .lineTo(50, 40)
    .close()
    .extrude(15.0)  # Premature extrusion of under-constrained profile
)`,
    starterErrorLog: 'CAD Solver Warning [ConstraintEngine]: Profile #1 has 3 unconstrained Degrees of Freedom (Status: Blue). Model lacks deterministic positional stability under parametric revision.',
    prerequisites: [],
    status: 'NOT_ASSESSED',
    mastery: 0.0,
    errorCount: 0,
    solvedCount: 0,
    evidenceLabel: 'Insufficient Evidence',
    diagnosticQuestions: MECH_DIAGNOSTIC_QUESTIONS['cad_dof_2d'],
  },

  // 2. Geometric constraints (coincident, tangent, concentric, symmetric)
  {
    id: 'cad_geometric_constraints',
    name: 'Geometric Constraints (Coincident, Tangent, Concentric, Symmetric)',
    track: 'Mechanical Engineering (CAD)',
    domain: 'mech',
    category: 'Geometric Relationships',
    description: 'Enforcing topological and relational constraints between sketch entities without numeric dimensions.',
    keyConcept: 'Geometric constraints eliminate DOF through geometric relationships: Coincident locks points together; Tangent forces G1 continuous slope; Concentric aligns center points; Symmetric mirrors entities across a designated centerline axis.',
    typicalTrap: 'Applying redundant dimensional constraints where geometric constraints already lock the geometry, causing over-constrained solver conflicts (cad_constraint_error), or relying on manual visual placement.',
    codeLanguage: 'python',
    starterCodeSnippet: `# Applying Non-Redundant Geometric Constraints
import cadquery as cq

# Issue: Tangency omitted between arc and straight guide edge
sketch = (
    cq.Workplane("XY")
    .line(30, 0)
    # Missing tangent constraint: arc joins with discontinuous sharp cusp
    .radiusArc((50, 20), 20)
    .close()
)`,
    starterErrorLog: 'Constraint Engine Warning: Discontinuous C0 vertex detected between Arc_1 and Line_1. Tangent constraint missing; sharp stress riser will form during sweep.',
    prerequisites: ['cad_dof_2d'],
    status: 'NOT_ASSESSED',
    mastery: 0.0,
    errorCount: 0,
    solvedCount: 0,
    evidenceLabel: 'Insufficient Evidence',
    diagnosticQuestions: MECH_DIAGNOSTIC_QUESTIONS['cad_geometric_constraints'],
  },

  // 3. Dimensions and driving parameters
  {
    id: 'cad_driving_parameters',
    name: 'Dimensions and Driving Parameters',
    track: 'Mechanical Engineering (CAD)',
    domain: 'mech',
    category: 'Parametric Modeling',
    description: 'Establishing functional parametric relationships, user parameters, and unit consistency (mm vs cm).',
    keyConcept: 'Driving dimensions control model geometry through user parameters and algebraic equations (e.g. wall_thickness = bore_diameter * 0.12). Driven dimensions are read-only references. ISO/ASME mechanical design standardizes on millimeters (mm).',
    typicalTrap: 'Mixing mm and cm units in parameter tables (e.g. entering 10 without units inside a cm document defaults to 100mm instead of 10mm), creating 10x scale errors.',
    codeLanguage: 'python',
    starterCodeSnippet: `# Parametric Formula with Unit Awareness
bore_d_mm = 50.0  # mm
# Unit Mismatch Trap: adding 2 (cm) to 50 (mm) yields 52mm instead of 70mm
flange_d_mm = bore_d_mm + (2.0 * 10.0) # Corrected unit conversion from cm to mm`,
    starterErrorLog: 'Dimensional Alert: Parameter expression "flange_d = bore_d + 2" mixed dimensionless scalar with length unit [mm]. Physical scale discrepancy detected.',
    prerequisites: ['cad_geometric_constraints'],
    status: 'NOT_ASSESSED',
    mastery: 0.0,
    errorCount: 0,
    solvedCount: 0,
    evidenceLabel: 'Insufficient Evidence',
    diagnosticQuestions: MECH_DIAGNOSTIC_QUESTIONS['cad_driving_parameters'],
  },

  // 4. Extrude/feature operations
  {
    id: 'cad_extrude_operations',
    name: 'Extrude and Feature Operations',
    track: 'Mechanical Engineering (CAD)',
    domain: 'mech',
    category: '3D Feature Generation',
    description: 'Transforming closed 2D profiles into manifold 3D solid bodies via linear extrusion, cuts, and joins.',
    keyConcept: 'Extrusions sweep closed planar 2D profiles along a normal or vector. Self-intersecting boundaries, micro-gaps (<0.001mm), or open profiles fail to form watertight 2-manifold B-rep solid bodies.',
    typicalTrap: 'Attempting to generate a solid extrude from an unclosed sketch loop or overlooking small overlapping line segments, causing kernel boundary evaluation failures.',
    codeLanguage: 'python',
    starterCodeSnippet: `# Closed Manifold 3D Extrusion
import cadquery as cq

# Watertight rectangular block with central extruded cut
body = (
    cq.Workplane("XY")
    .box(100, 60, 20)
    .faces(">Z")
    .workplane()
    .circle(15) # Fully closed circle profile
    .cutThruAll() # Boolean cut operation
)`,
    starterErrorLog: 'Kernel Error [BRepBuilderAPI]: Profile is not closed. Gap of 0.042mm detected between Vertex_7 and Vertex_1. Cannot compute interior volume.',
    prerequisites: ['cad_driving_parameters'],
    status: 'NOT_ASSESSED',
    mastery: 0.0,
    errorCount: 0,
    solvedCount: 0,
    evidenceLabel: 'Insufficient Evidence',
    diagnosticQuestions: MECH_DIAGNOSTIC_QUESTIONS['cad_extrude_operations'],
  },

  // 5. Fillets and chamfers (G1 tangency)
  {
    id: 'cad_fillets_chamfers_g1',
    name: 'Fillets and Chamfers (G1 Tangency)',
    track: 'Mechanical Engineering (CAD)',
    domain: 'mech',
    category: 'Detailing & Stress Concentration',
    description: 'Applying rounds, fillets, and chamfers to mitigate mechanical stress concentrations and establish G1 surface tangency.',
    keyConcept: 'Sharp internal re-entrant corners create theoretical infinite stress concentrations (Kt -> inf). Fillets introduce circular arc transitions with G1 continuous tangent boundaries, distributing structural load and preventing fatigue cracks.',
    typicalTrap: 'Applying cosmetic fillets at the beginning of the CAD tree before major functional extrusions and drafts, leading to frequent topology rebuild errors when upstream geometry shifts.',
    codeLanguage: 'python',
    starterCodeSnippet: `# Stress Relieving Internal Fillet
import cadquery as cq

# Stepped shaft: internal shoulder requires fillet to lower Kt
shaft = (
    cq.Workplane("XY")
    .circle(25).extrude(60) # Main hub
    .faces(">Z").workplane()
    .circle(15).extrude(40) # Stepped shaft
    .edges("|Z and <Z").fillet(3.0) # G1 fillet removes sharp stress riser
)`,
    starterErrorLog: 'FEA Warning: Sharp 90-degree internal corner detected at shoulder transition (radius = 0.0mm). Stress concentration factor Kt > 3.8. Fillet radius >= 2.5mm required.',
    prerequisites: ['cad_extrude_operations'],
    status: 'NOT_ASSESSED',
    mastery: 0.0,
    errorCount: 0,
    solvedCount: 0,
    evidenceLabel: 'Insufficient Evidence',
    diagnosticQuestions: MECH_DIAGNOSTIC_QUESTIONS['cad_fillets_chamfers_g1'],
  },

  // 6. Hub/bore concentricity
  {
    id: 'cad_hub_bore_concentricity',
    name: 'Hub/Bore Concentricity and GD&T',
    track: 'Mechanical Engineering (CAD)',
    domain: 'mech',
    category: 'Assembly & Precision Fits',
    description: 'Enforcing coaxial datum alignment, runout tolerances, and concentricity in rotating machinery shafts and bores.',
    keyConcept: 'Coaxial rotating components demand precise concentricity (GD&T concentricity / total runout) to prevent centrifugal unbalance, excessive bearing dynamic loads, and premature seal wear. In CAD assemblies, cylindrical mate constraints lock coaxial datums.',
    typicalTrap: 'Mating cylindrical faces using point contact or planar coincidence rather than coaxial/concentric constraints, creating eccentric radial runout (cad_tolerance_mismatch).',
    codeLanguage: 'python',
    starterCodeSnippet: `# Concentric Shaft & Bearing Hub Assembly
import cadquery as cq

# Outer Bearing Housing with Coaxial Bore
housing = (
    cq.Workplane("XY")
    .circle(60).extrude(30) # Outer housing hub
    .faces(">Z").workplane()
    .circle(35) # Concentric inner bore (Datum A axis)
    .cutThruAll()
)`,
    starterErrorLog: 'GD&T Assembly Error: Radial eccentricity of 0.28mm detected between Shaft_Axis and Housing_Bore_Datum. Total circular runout exceeds ISO tolerance class IT6.',
    prerequisites: ['cad_geometric_constraints', 'cad_extrude_operations'],
    status: 'NOT_ASSESSED',
    mastery: 0.0,
    errorCount: 0,
    solvedCount: 0,
    evidenceLabel: 'Insufficient Evidence',
    diagnosticQuestions: MECH_DIAGNOSTIC_QUESTIONS['cad_hub_bore_concentricity'],
  },

  // 7. Material, volume and mass properties (density in g/cm3)
  {
    id: 'cad_material_mass_properties',
    name: 'Material, Volume and Mass Properties (Density in g/cm³)',
    track: 'Mechanical Engineering (CAD)',
    domain: 'mech',
    category: 'Materials & Mass Evaluation',
    description: 'Calculating part volume, assigning engineering physical materials, and evaluating mass and center of gravity (CG).',
    keyConcept: 'Mass equals density multiplied by volume (m = rho * V). 1 cm³ = 1000 mm³. Benchmark densities: 6061-T6 Aluminum ~ 2.70 g/cm³, 1018 Mild Steel ~ 7.85 g/cm³, ABS Polymer ~ 1.04 g/cm³, Titanium Ti-6Al-4V ~ 4.43 g/cm³.',
    typicalTrap: 'Confusing volume with mass, or mixing volume unit conversions (e.g. failing to realize that 1,000,000 mm³ = 1,000 cm³ = 1 liter, resulting in 1000x mass evaluation errors).',
    codeLanguage: 'python',
    starterCodeSnippet: `# Physical Mass Calculation in CAD
volume_mm3 = 250000.0 # 250,000 mm^3 = 250.0 cm^3
density_steel_g_cm3 = 7.85 # 1018 Steel

# Unit Conversion: 1 cm^3 = 1000 mm^3
volume_cm3 = volume_mm3 / 1000.0
mass_grams = volume_cm3 * density_steel_g_cm3 # 250 * 7.85 = 1962.5 g = 1.96 kg`,
    starterErrorLog: 'Mass Evaluation Error: Volume was directly multiplied by density without mm^3 to cm^3 unit conversion factor (1000). Calculated component mass is 1000x too high (1962.5 kg instead of 1.96 kg).',
    prerequisites: ['cad_extrude_operations'],
    status: 'NOT_ASSESSED',
    mastery: 0.0,
    errorCount: 0,
    solvedCount: 0,
    evidenceLabel: 'Insufficient Evidence',
    diagnosticQuestions: MECH_DIAGNOSTIC_QUESTIONS['cad_material_mass_properties'],
  },

  // 8. Static stress and Factor of Safety (FOS = yield strength / max stress; target >= 2.0)
  {
    id: 'cad_stress_fos',
    name: 'Static Stress and Factor of Safety (FOS)',
    track: 'Mechanical Engineering (CAD)',
    domain: 'mech',
    category: 'Structural Analysis & FEA',
    description: 'Evaluating Von Mises equivalent stress, structural yield criteria, and Factor of Safety (FOS = yield / max_stress >= 2.0).',
    keyConcept: 'Factor of Safety (FOS) measures structural design margin: FOS = sigma_yield / sigma_max. Engineering design guidelines mandate target FOS >= 2.0 for ductile static mechanical equipment to prevent permanent plastic deformation and account for shock loading.',
    typicalTrap: 'Assuming a low Factor of Safety (e.g., FOS = 1.1 or 1.2) is acceptable in general machinery without considering dynamic shock, fatigue, or stress concentrations, leading to catastrophic field yielding.',
    codeLanguage: 'python',
    starterCodeSnippet: `# Structural Factor of Safety (FOS) Evaluation
yield_strength_mpa = 276.0 # 6061-T6 Aluminum Yield = 276 MPa
max_von_mises_stress_mpa = 120.0 # Peak localized stress from FEA

# Target: FOS >= 2.0 for robust mechanical service
fos = yield_strength_mpa / max_von_mises_stress_mpa # 276 / 120 = 2.30 (SAFE, FOS >= 2.0)`,
    starterErrorLog: 'FEA Compliance Failure: Component minimum Factor of Safety is 1.22 (Peak Von Mises stress = 226 MPa vs Yield = 276 MPa). FOS is below structural design threshold (target FOS >= 2.0). Redesign required.',
    prerequisites: ['cad_material_mass_properties'],
    status: 'NOT_ASSESSED',
    mastery: 0.0,
    errorCount: 0,
    solvedCount: 0,
    evidenceLabel: 'Insufficient Evidence',
    diagnosticQuestions: MECH_DIAGNOSTIC_QUESTIONS['cad_stress_fos'],
  },
];
