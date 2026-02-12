// src/ui/OperationOverlay.ts

/**
 * OperationOverlay: Floating educational overlay that describes the currently
 * selected vector operation. Positioned in the upper-left of the 3D viewport.
 * Uses color-coded references to v₁, v₂, and result for easy readability.
 */

export interface OperationColors {
  v1: string;
  v2: string;
  result: string;
}

interface OperationDescription {
  title: string;
  formula: string;
  description: string;
  useCases: string;
  resultType: string;
}

/** Color-wrap helper: wraps text in a span with the given hex color */
function c(text: string, color: string): string {
  return `<span style="color:${color};font-weight:600">${text}</span>`;
}

/** Build the HTML descriptions using the supplied palette */
function buildDescriptions(colors: OperationColors): Record<number, OperationDescription> {
  const { v1, v2, result } = colors;

  return {
    // None
    0: {
      title: '',
      formula: '',
      description: '',
      useCases: '',
      resultType: '',
    },
    // Addition
    1: {
      title: 'Vector Addition',
      formula: `${c('v₁', v1)} + ${c('v₂', v2)} = ${c('result', result)}`,
      description:
        `Adds each component of ${c('v₁', v1)} to the corresponding component of ${c('v₂', v2)}. ` +
        `Geometrically, place ${c('v₂', v2)} at the tip of ${c('v₁', v1)} — the ${c('result', result)} ` +
        `points from the origin to the new tip (parallelogram rule).`,
      useCases: 'Combining forces, displacements, or velocities. Net movement of an object under multiple influences.',
      resultType: `Vector → ${c('[x, y, z]', result)}`,
    },
    // Cross Product
    2: {
      title: 'Cross Product',
      formula: `${c('v₁', v1)} × ${c('v₂', v2)} = ${c('result', result)}`,
      description:
        `Produces a ${c('result', result)} vector perpendicular to both ${c('v₁', v1)} and ${c('v₂', v2)}. ` +
        `Its magnitude equals the area of the parallelogram spanned by the two input vectors. ` +
        `Direction follows the right-hand rule.`,
      useCases: 'Computing surface normals, torque, angular momentum, and determining if two vectors are parallel.',
      resultType: `Vector → ${c('[x, y, z]', result)}`,
    },
    // Dot Product
    3: {
      title: 'Dot Product',
      formula: `${c('v₁', v1)} · ${c('v₂', v2)} = ${c('scalar', result)}`,
      description:
        `Multiplies corresponding components of ${c('v₁', v1)} and ${c('v₂', v2)}, then sums them. ` +
        `Equivalently: ‖${c('v₁', v1)}‖ ‖${c('v₂', v2)}‖ cos θ, where θ is the angle between them. ` +
        `The ${c('result', result)} arrow shows this scalar along the Y axis.`,
      useCases: 'Measuring alignment between vectors, projecting one vector onto another, lighting calculations (Lambert cosine).',
      resultType: `Scalar → ${c('single value', result)}`,
    },
  };
}

export interface OperationOverlay {
  setOperation(op: number): void;
}

export function createOperationOverlay(colors: OperationColors): OperationOverlay {
  const descriptions = buildDescriptions(colors);

  // Root element
  const el = document.createElement('div');
  el.id = 'operation-overlay';

  // Title
  const titleEl = document.createElement('div');
  titleEl.className = 'op-overlay-title';
  el.appendChild(titleEl);

  // Formula
  const formulaEl = document.createElement('div');
  formulaEl.className = 'op-overlay-formula';
  el.appendChild(formulaEl);

  // Description
  const descEl = document.createElement('div');
  descEl.className = 'op-overlay-desc';
  el.appendChild(descEl);

  // Use cases
  const useEl = document.createElement('div');
  useEl.className = 'op-overlay-uses';
  el.appendChild(useEl);

  // Result type
  const typeEl = document.createElement('div');
  typeEl.className = 'op-overlay-type';
  el.appendChild(typeEl);

  document.body.appendChild(el);

  function update(op: number) {
    const info = descriptions[op];
    if (!info || op === 0) {
      el.classList.remove('visible');
      return;
    }

    titleEl.textContent = info.title;
    formulaEl.innerHTML = info.formula;
    descEl.innerHTML = info.description;
    useEl.innerHTML = `<strong>Used for:</strong> ${info.useCases}`;
    typeEl.innerHTML = `<strong>Returns:</strong> ${info.resultType}`;

    el.classList.add('visible');
  }

  return { setOperation: update };
}
