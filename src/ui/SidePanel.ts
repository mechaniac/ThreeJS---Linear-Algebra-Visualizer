// src/ui/SidePanel.ts
export interface VectorControl {
  root: HTMLElement;
  setVector(x: number, y: number, z: number): void;
  onVectorChanged(handler: (x: number, y: number, z: number) => void): void;
  setActive(active: boolean): void;
}

export interface SidePanel {
  addVectorControl(label: string, colorHex: string): VectorControl;
}

export function createSidePanel(titleText: string): SidePanel {
  // container fixed to the right
  const container = document.createElement('div');
  container.id = 'ui-container';

  // the sliding panel
  const uiPanel = document.createElement('div');
  uiPanel.id = 'ui-panel';

  // toggle button lives OUTSIDE the panel, but inside container
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'ui-toggle';
  toggleBtn.textContent = '⮜';
  toggleBtn.onclick = () => {
    const collapsed = container.classList.toggle('collapsed');
    toggleBtn.textContent = collapsed ? '⮞' : '⮜';
  };

  const title = document.createElement('h2');
  title.id = 'ui-title';
  title.textContent = titleText;

  const content = document.createElement('div');

  uiPanel.appendChild(title);
  uiPanel.appendChild(content);

  container.appendChild(uiPanel);
  container.appendChild(toggleBtn);
  document.body.appendChild(container);

  function createVectorControl(label: string, colorHex: string): VectorControl {
    const block = document.createElement('div');
    block.className = 'vector-block';
    block.style.borderLeftColor = colorHex;

    const titleRow = document.createElement('p');
    titleRow.className = 'vector-title';
    titleRow.innerHTML = `<span style="color:${colorHex}">${label}</span>`;

    const row = document.createElement('div');
    row.className = 'vector-inputs';

    const openBracket = document.createElement('span');
    openBracket.textContent = '[ ';

    const closeBracket = document.createElement('span');
    closeBracket.textContent = ' ]';

    const makeInput = () => {
      const inp = document.createElement('input');
      inp.type = 'number';
      inp.step = '0.1';
      return inp;
    };

    const inputX = makeInput();
    const inputY = makeInput();
    const inputZ = makeInput();

    row.appendChild(openBracket);
    row.appendChild(inputX);
    row.appendChild(inputY);
    row.appendChild(inputZ);
    row.appendChild(closeBracket);

    block.appendChild(titleRow);
    block.appendChild(row);
    content.appendChild(block);

    let changeHandler: ((x: number, y: number, z: number) => void) | null = null;
    let internalUpdate = false;

    function readAndEmit() {
      if (!changeHandler || internalUpdate) return;
      const x = parseFloat(inputX.value) || 0;
      const y = parseFloat(inputY.value) || 0;
      const z = parseFloat(inputZ.value) || 0;
      changeHandler(x, y, z);
    }

    const hook = (el: HTMLInputElement) => {
      el.addEventListener('change', readAndEmit);
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') readAndEmit();
      });
      // don’t let clicks on inputs bubble up and accidentally change active selection
      el.addEventListener('click', (e) => e.stopPropagation());
    };

    hook(inputX);
    hook(inputY);
    hook(inputZ);

    return {
      root: block,
      setVector(x, y, z) {
        internalUpdate = true;
        inputX.value = x.toFixed(2);
        inputY.value = y.toFixed(2);
        inputZ.value = z.toFixed(2);
        internalUpdate = false;
      },
      onVectorChanged(handler) {
        changeHandler = handler;
      },
      setActive(active) {
        block.classList.toggle('active-vector', active);
      },
    };
  }

  return {
    addVectorControl: createVectorControl,
  };
}
