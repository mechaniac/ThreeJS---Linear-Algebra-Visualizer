// src/ui/SidePanel.ts
export interface VectorControl {
  root: HTMLElement;
  setVector(x: number, y: number, z: number): void;
  onVectorChanged(handler: (x: number, y: number, z: number) => void): void;
  setActive(active: boolean): void;
}

export interface SidePanel {
  addVectorControl(label: string, colorHex: string): VectorControl;
  // add settings panel at bottom returning controls
  addSettingsPanel?: (settingsTitle?: string) => {
    setValues(values: { axisThickness?: number; axisOpacity?: number; vectorThickness?: number }): void;
    onAxisThicknessChanged(cb: (v: number) => void): void;
    onAxisOpacityChanged(cb: (v: number) => void): void;
    onVectorThicknessChanged(cb: (v: number) => void): void;
  };
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
    // settings panel helper (bottom of UI)
    addSettingsPanel(settingsTitle?: string) {
      const settings = document.createElement('div');
      settings.id = 'settings-panel';
      settings.className = 'settings-panel';

      const h = document.createElement('h3');
      h.textContent = settingsTitle || 'Settings';
      settings.appendChild(h);

      const makeRow = (labelText: string) => {
        const row = document.createElement('div');
        row.className = 'settings-row';
        const label = document.createElement('label');
        label.textContent = labelText;
        const input = document.createElement('input');
        input.type = 'number';
        input.step = '0.01';
        input.className = 'settings-input';
        row.appendChild(label);
        row.appendChild(input);
        settings.appendChild(row);
        return input as HTMLInputElement;
      };

      const axisThicknessInp = makeRow('Axis thickness');
      const axisOpacityInp = makeRow('Axis opacity (0-1)');
      const vectorThicknessInp = makeRow('Vector thickness');

      // append settings to panel content
      uiPanel.appendChild(settings);

      function onChange(input: HTMLInputElement, handler: (v: number) => void) {
        input.addEventListener('change', () => handler(parseFloat(input.value) || 0));
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') handler(parseFloat(input.value) || 0); });
      }

      return {
        setValues(values: { axisThickness?: number; axisOpacity?: number; vectorThickness?: number }) {
          if (values.axisThickness !== undefined) axisThicknessInp.value = String(values.axisThickness);
          if (values.axisOpacity !== undefined) axisOpacityInp.value = String(values.axisOpacity);
          if (values.vectorThickness !== undefined) vectorThicknessInp.value = String(values.vectorThickness);
        },
        onAxisThicknessChanged(cb: (v: number) => void) { onChange(axisThicknessInp, cb); },
        onAxisOpacityChanged(cb: (v: number) => void) { onChange(axisOpacityInp, cb); },
        onVectorThicknessChanged(cb: (v: number) => void) { onChange(vectorThicknessInp, cb); },
      };
    },
  };
}
