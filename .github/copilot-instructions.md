# Linear Algebra Visualizer - AI Coding Agent Guide

## Project Overview
ThreeJS-based 3D linear algebra visualization tool. Displays vectors in 3D space with interactive drag-to-modify UI. Users manipulate vector components via a side panel or by dragging arrows directly in the 3D viewport.

## Architectural Principles

### DRY & Modularity
- **Single Responsibility**: Each module handles one concern (e.g., `VectorArrow` renders arrows, `AxisVisualizer` manages axes and grids)
- **Composable Design**: Visuals extend `THREE.Group`; easily combine and swap without coupling
- **Reusable Interfaces**: Use TypeScript interfaces (`VectorControl`, `ThreeEnv`, `VectorEntry`) to decouple components and enable refactoring
- **No Duplication**: Shared logic extracted to dedicated modules; changes propagate automatically

### Functional Programming & Pure Functions
- **Pure Functions**: Helper utilities have no side effects; they compute and return results (e.g., `normalize()`, `clamp()`)
- **Immutability**: Avoid mutating input vectors; clone before modifying: `v.clone().multiplyScalar(s)`
- **Composition**: Wire components via callbacks and interfaces, not direct coupling
- **Example**: Settings callbacks compose multiple updates into a single coherent action

### Separation of Concerns
- **Visuals** (`src/visuals/`): Render primitives; geometry, materials, positioning only; no business logic
- **UI** (`src/ui/`): Input/display layer; form controls, data binding; wires to scene via typed interfaces
- **Interactions** (`src/interactions/`): Raycasting, drag handling; isolated from visuals and UI logic
- **Core** (`src/core/`): Low-level Three.js setup; reusable by any module
- **Main** (`src/main.ts`): Orchestration layer; wires modules together with clear data flow

### Clear Comments
- **Module-Level**: Concise JSDoc describing *what* the module does and *why*
- **Function Comments**: Clarify intent for non-obvious logic; parameter and return types
- **Inline Comments**: Explain *why* a choice was made, not *what* the code does
- **Avoid Over-Commenting**: Self-explanatory code (good variable names, clear structure) needs no comment

## Architecture & Data Flow

### Three-Layer Structure
1. **Core (`src/core/ThreeEnv.ts`)**: Initializes Three.js scene, renderer, camera, and OrbitControls. Returns `ThreeEnv` interface with `renderer`, `scene`, `camera`, `controls`.
2. **Visuals (`src/visuals/`)**: `VectorArrow` (extends `THREE.Group`) wraps `THREE.ArrowHelper`. `AxisVisualizer` creates grid + RGB axes.
3. **UI & Interactions (`src/ui/`, `src/interactions/`)**: Side panel for vector input. Raycaster-based picking and drag-to-plane interaction.

### Vector Update Pipeline
- **UI → 3D**: User changes input field → `onVectorChanged` callback → `VectorArrow.setFromVector()` updates visual
- **3D → UI**: User drags arrow on z=0 plane → raycaster hit → callback → `SidePanel` updates displays both
- **Sync Point**: `main.ts` orchestrates `VectorEntry` pairs linking `VectorArrow` objects to UI controls

### Key Constraint
Vectors are restricted to **z=0 plane** (XY plane) for drag interaction. See [VectorInteractionController.ts](src/interactions/VectorInteractionController.ts#L20) `dragPlane`.

## Build & Development Workflow

### Commands
- `npm run dev`: Start Vite dev server (TypeScript hot-reload)
- `npm run build`: Compile TypeScript → bundle with Vite
- `npm run preview`: Serve production build locally

### Configuration
- **TypeScript**: ES2022 target, strict mode enabled, `allowImportingTsExtensions` for bundler module resolution
- **Vite**: Handles Three.js imports (e.g., `OrbitControls` from `three/examples/jsm/`)

### Common Issues
- Build fails if TypeScript compilation errors exist (strict mode catches unused vars/params)
- Import Three.js modules from `three/examples/jsm/` path for tree-shaking

## Code Patterns & Conventions

### Vector Representation
- **THREE.Vector3**: Primary type for positions/directions
- **VectorArrow.setFromVector()**: Updates both direction and magnitude. Handles zero-vector edge case (defaults to `[1,0,0]`)
- **Example**: `v1Arrow.setFromVector(new THREE.Vector3(2, 3, 0))`

### UI Control Pattern
`SidePanel.addVectorControl()` returns `VectorControl` interface:
```typescript
interface VectorControl {
  setVector(x, y, z): void;           // Programmatic update
  onVectorChanged(handler): void;     // Listen to user input
  setActive(boolean): void;           // Visual highlight
}
```
Always use this interface for UI bindings, not direct DOM access.

### Interaction Registration
[VectorInteractionController.ts](src/interactions/VectorInteractionController.ts) manages picking + dragging:
- Pass `VectorEntry[]` array with `{ id, arrow }` objects
- Raycaster picks against arrow meshes; converts screen coords to world coords on z=0 plane
- Callback signature: `onVectorChanged(id: number, v: THREE.Vector3)`

### Scene Management
- Always add visuals to `scene` in `main.ts`
- Use `THREE.Group` subclasses (e.g., `VectorArrow`, `AxisVisualizer`) for composable objects
- Resize handler in `ThreeEnv` keeps renderer/camera in sync with window

## Integration Points & Dependencies

### Three.js Modules
- `THREE.WebGLRenderer`, `THREE.Scene`, `THREE.Camera`: Core rendering
- `THREE.ArrowHelper`: Visual primitive for vectors
- `THREE.Raycaster`: Ray-casting for picking arrows
- `OrbitControls` from `three/examples/jsm/controls/`: Camera orbit navigation

### External State Management
- None (plain object state in `main.ts`). Add state management if adding undo/history or complex interactions.

### Type Safety
Use exported interfaces (`ThreeEnv`, `VectorControl`, `VectorEntry`) rather than inferring types. Enables refactoring without cascading changes.

## Extending the Codebase

### Adding a New Visual
1. Create class extending `THREE.Group` in `src/visuals/`
2. Use Three.js primitives (Geometry + Material) with clear, documented setup
3. Add public methods for updates: `setProperty(value)`, `setVisible(boolean)`, etc.
4. Export typed interface if used externally; no assumptions about internals
5. Add to scene in `main.ts` and wire callbacks
6. Keep geometry/material updates pure: accept parameters, return new state

### Adding UI Controls
1. Add control factory method to `SidePanel` returning a typed control interface
2. Build HTML structure separately from event wiring for clarity
3. Update CSS in `src/style.css` for layout and responsiveness
4. Wire callbacks in `main.ts` to update visual state; keep UI layer independent
5. Use pure callbacks: receive input, compute result, update visuals

### Modifying Interaction
Edit [VectorInteractionController.ts](src/interactions/VectorInteractionController.ts):
- Change `dragPlane` orientation or constraints; isolate plane logic in a named variable
- Modify raycaster objects list to add new draggable visuals
- Keep callback signatures consistent; add overloads rather than breaking changes
- Extract complex raycasting logic to helper functions for testability

### Guidelines for Changes
- **Before adding code**: Ask if logic duplicates elsewhere. Extract to shared utility if yes
- **New callbacks**: Use arrow functions; maintain consistent handler signatures
- **Geometry updates**: Dispose old, create new; update positions/rotations in one step
- **Settings**: Add slider or checkbox to settings panel; wire to visual update method
- **Testing changes**: Build and verify with `npm run dev`; check for TypeScript errors before commit
