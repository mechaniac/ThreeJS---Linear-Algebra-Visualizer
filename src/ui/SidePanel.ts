// src/ui/SidePanel.ts

/**
 * VectorControl: UI bindings for a single vector with scalar multiplier.
 * Handles input vector (X,Y,Z), scalar multiplier, and displays scaled result.
 */
export interface VectorControl {
  root: HTMLElement;
  setVector(x: number, y: number, z: number): void;
  onVectorChanged(handler: (x: number, y: number, z: number) => void): void;
  setScalar(value: number): void;
  onScalarChanged(handler: (value: number) => void): void;
  setActive(active: boolean): void;
}

export interface OperationControl {
  root: HTMLElement;
  setOperation(op: number): void;
  onOperationChanged(handler: (op: number) => void): void;
  setResult(x: number, y: number, z: number): void;
}

export interface SidePanel {
  addVectorControl(label: string, colorHex: string): VectorControl;
  addOperationPanel?: () => OperationControl;
  // add settings panel at bottom returning controls
  addSettingsPanel?: (settingsTitle?: string) => {
    setValues(values: { axisThickness?: number; vectorThickness?: number; axisTransparency?: number; resultThickness?: number; verticalGridEnabled?: boolean; locatorSize?: number }): void;
    onAxisThicknessChanged(cb: (v: number) => void): void;
    onVectorThicknessChanged(cb: (v: number) => void): void;
    onAxisTransparencyChanged(cb: (v: number) => void): void;
    onResultThicknessChanged(cb: (v: number) => void): void;
    onVerticalGridToggled(cb: (enabled: boolean) => void): void;
    onLocatorSizeChanged(cb: (v: number) => void): void;
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

    // Scalar control: slider and numeric input (0-10, default 1)
    const scalarRow = document.createElement('div');
    scalarRow.className = 'scalar-row';
    const scalarLabel = document.createElement('label');
    scalarLabel.textContent = 'Scalar:';
    const scalarSlider = document.createElement('input');
    scalarSlider.type = 'range';
    scalarSlider.min = '0';
    scalarSlider.max = '10';
    scalarSlider.step = '0.1';
    scalarSlider.value = '1';
    scalarSlider.className = 'scalar-slider';
    const scalarInput = document.createElement('input');
    scalarInput.type = 'number';
    scalarInput.min = '0';
    scalarInput.max = '10';
    scalarInput.step = '0.1';
    scalarInput.value = '1';
    scalarInput.className = 'scalar-input';
    scalarRow.appendChild(scalarLabel);
    scalarRow.appendChild(scalarSlider);
    scalarRow.appendChild(scalarInput);
    block.appendChild(scalarRow);

    // Result display: shows scaled vector
    const resultRow = document.createElement('div');
    resultRow.className = 'result-row';
    const resultDisplay = document.createElement('span');
    resultDisplay.className = 'result-display';
    resultDisplay.textContent = '[0.00 0.00 0.00]';
    resultRow.appendChild(resultDisplay);
    block.appendChild(resultRow);

    content.appendChild(block);

    let changeHandler: ((x: number, y: number, z: number) => void) | null = null;
    let scalarHandler: ((value: number) => void) | null = null;
    let internalUpdate = false;

    function readAndEmit() {
      if (!changeHandler || internalUpdate) return;
      const x = parseFloat(inputX.value) || 0;
      const y = parseFloat(inputY.value) || 0;
      const z = parseFloat(inputZ.value) || 0;
      changeHandler(x, y, z);
      updateResultDisplay();
    }

    function updateResultDisplay() {
      const x = parseFloat(inputX.value) || 0;
      const y = parseFloat(inputY.value) || 0;
      const z = parseFloat(inputZ.value) || 0;
      const scalar = parseFloat(scalarSlider.value) || 1;
      const rx = (x * scalar).toFixed(2);
      const ry = (y * scalar).toFixed(2);
      const rz = (z * scalar).toFixed(2);
      resultDisplay.textContent = `[${rx} ${ry} ${rz}]`;
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

    // Sync scalar slider <-> input
    scalarSlider.addEventListener('input', () => {
      internalUpdate = true;
      scalarInput.value = scalarSlider.value;
      internalUpdate = false;
      updateResultDisplay();
      if (scalarHandler) scalarHandler(parseFloat(scalarSlider.value));
    });

    scalarInput.addEventListener('change', () => {
      internalUpdate = true;
      scalarSlider.value = scalarInput.value;
      internalUpdate = false;
      updateResultDisplay();
      if (scalarHandler) scalarHandler(parseFloat(scalarInput.value));
    });

    scalarInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        internalUpdate = true;
        scalarSlider.value = scalarInput.value;
        internalUpdate = false;
        updateResultDisplay();
        if (scalarHandler) scalarHandler(parseFloat(scalarInput.value));
      }
    });

    return {
      root: block,
      setVector(x, y, z) {
        internalUpdate = true;
        inputX.value = x.toFixed(2);
        inputY.value = y.toFixed(2);
        inputZ.value = z.toFixed(2);
        internalUpdate = false;
        updateResultDisplay();
      },
      onVectorChanged(handler) {
        changeHandler = handler;
      },
      setScalar(value: number) {
        internalUpdate = true;
        scalarSlider.value = String(value);
        scalarInput.value = String(value);
        internalUpdate = false;
        updateResultDisplay();
      },
      onScalarChanged(handler: (value: number) => void) {
        scalarHandler = handler;
      },
      setActive(active) {
        block.classList.toggle('active-vector', active);
      },
    };
  }

  return {
    addVectorControl: createVectorControl,
    // operation panel helper
    addOperationPanel() {
      const opPanel = document.createElement('div');
      opPanel.id = 'operation-panel';
      opPanel.className = 'operation-panel';

      const h = document.createElement('h3');
      h.textContent = 'Operations';
      opPanel.appendChild(h);

      const opRow = document.createElement('div');
      opRow.className = 'operation-row';
      const opLabel = document.createElement('label');
      opLabel.textContent = 'Function:';
      const opSelect = document.createElement('select');
      opSelect.className = 'operation-select';
      
      const operations = [
        { value: '0', text: 'None' },
        { value: '1', text: 'Addition' },
        { value: '2', text: 'Cross Product' },
        { value: '3', text: 'Dot Product' },
      ];
      
      for (const op of operations) {
        const option = document.createElement('option');
        option.value = op.value;
        option.textContent = op.text;
        opSelect.appendChild(option);
      }
      
      opRow.appendChild(opLabel);
      opRow.appendChild(opSelect);
      opPanel.appendChild(opRow);

      // Result display
      const resultRow = document.createElement('div');
      resultRow.className = 'operation-result-row';
      const resultDisplay = document.createElement('span');
      resultDisplay.className = 'operation-result-display';
      resultDisplay.textContent = '[0.00 0.00 0.00]';
      resultRow.appendChild(resultDisplay);
      resultRow.appendChild(resultDisplay);
      opPanel.appendChild(resultRow);

      content.appendChild(opPanel);

      let opHandler: ((op: number) => void) | null = null;

      return {
        root: opPanel,
        setOperation(op: number) {
          opSelect.value = String(op);
        },
        onOperationChanged(handler: (op: number) => void) {
          opHandler = handler;
          opSelect.addEventListener('change', () => {
            const op = parseInt(opSelect.value) || 0;
            if (opHandler) opHandler(op);
          });
        },
        setResult(x: number, y: number, z: number) {
          const rx = x.toFixed(2);
          const ry = y.toFixed(2);
          const rz = z.toFixed(2);
          resultDisplay.textContent = `[${rx} ${ry} ${rz}]`;
        },
      };
    },
    // settings panel helper (bottom of UI)
    addSettingsPanel(settingsTitle?: string) {
      const settings = document.createElement('div');
      settings.id = 'settings-panel';
      settings.className = 'settings-panel';

      const h = document.createElement('h3');
      h.textContent = settingsTitle || 'Settings';
      settings.appendChild(h);

      const makeSliderRow = (labelText: string, min: string = '0.01', max: string = '0.1', step: string = '0.01') => {
        const row = document.createElement('div');
        row.className = 'settings-row';
        const label = document.createElement('label');
        label.textContent = labelText;
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = min;
        slider.max = max;
        slider.step = step;
        slider.className = 'settings-slider';
        const display = document.createElement('span');
        display.className = 'settings-value-display';
        display.textContent = min;
        slider.addEventListener('input', () => {
          display.textContent = parseFloat(slider.value).toFixed(2);
        });
        row.appendChild(label);
        row.appendChild(slider);
        row.appendChild(display);
        settings.appendChild(row);
        return { slider: slider as HTMLInputElement, display };
      };

      const makeCheckboxRow = (labelText: string) => {
        const row = document.createElement('div');
        row.className = 'settings-row';
        const label = document.createElement('label');
        label.textContent = labelText;
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'settings-checkbox';
        row.appendChild(label);
        row.appendChild(checkbox);
        settings.appendChild(row);
        return checkbox as HTMLInputElement;
      };

      const axisThicknessSlider = makeSliderRow('Axis thickness').slider;
      const vectorThicknessSlider = makeSliderRow('Vector thickness').slider;
      const axisTransparencySlider = makeSliderRow('Axis transparency', '0', '1', '0.01').slider;
      const resultThicknessSlider = makeSliderRow('Result thickness', '0.01', '0.1', '0.01').slider;
      const verticalGridCheckbox = makeCheckboxRow('Show vertical grid');

      // Locator size with expanded range (0.1 to 1.0)
      const locatorSizeRow = document.createElement('div');
      locatorSizeRow.className = 'settings-row';
      const locatorLabel = document.createElement('label');
      locatorLabel.textContent = 'Locator size';
      const locatorSizeSlider = document.createElement('input');
      locatorSizeSlider.type = 'range';
      locatorSizeSlider.min = '0.1';
      locatorSizeSlider.max = '1.0';
      locatorSizeSlider.step = '0.01';
      locatorSizeSlider.className = 'settings-slider';
      const locatorSizeDisplay = document.createElement('span');
      locatorSizeDisplay.className = 'settings-value-display';
      locatorSizeDisplay.textContent = '0.1';
      locatorSizeSlider.addEventListener('input', () => {
        locatorSizeDisplay.textContent = parseFloat(locatorSizeSlider.value).toFixed(2);
      });
      locatorSizeRow.appendChild(locatorLabel);
      locatorSizeRow.appendChild(locatorSizeSlider);
      locatorSizeRow.appendChild(locatorSizeDisplay);
      settings.appendChild(locatorSizeRow);

      // append settings to panel content
      uiPanel.appendChild(settings);

      function onSliderChange(slider: HTMLInputElement, handler: (v: number) => void) {
        slider.addEventListener('input', () => handler(parseFloat(slider.value) || 0.01));
      }

      function onCheckboxChange(checkbox: HTMLInputElement, handler: (v: boolean) => void) {
        checkbox.addEventListener('change', () => handler(checkbox.checked));
      }

      return {
        setValues(values: { axisThickness?: number; vectorThickness?: number; axisTransparency?: number; resultThickness?: number; verticalGridEnabled?: boolean; locatorSize?: number }) {
          if (values.axisThickness !== undefined) axisThicknessSlider.value = String(values.axisThickness);
          if (values.vectorThickness !== undefined) vectorThicknessSlider.value = String(values.vectorThickness);
          if (values.axisTransparency !== undefined) axisTransparencySlider.value = String(values.axisTransparency);
          if (values.resultThickness !== undefined) resultThicknessSlider.value = String(values.resultThickness);
          if (values.locatorSize !== undefined) locatorSizeSlider.value = String(values.locatorSize);
          if (values.verticalGridEnabled !== undefined) verticalGridCheckbox.checked = values.verticalGridEnabled;
        },
        onAxisThicknessChanged(cb: (v: number) => void) { onSliderChange(axisThicknessSlider, cb); },
        onVectorThicknessChanged(cb: (v: number) => void) { onSliderChange(vectorThicknessSlider, cb); },
        onAxisTransparencyChanged(cb: (v: number) => void) { onSliderChange(axisTransparencySlider, cb); },
        onResultThicknessChanged(cb: (v: number) => void) { onSliderChange(resultThicknessSlider, cb); },
        onLocatorSizeChanged(cb: (v: number) => void) { onSliderChange(locatorSizeSlider, cb); },
        onVerticalGridToggled(cb: (enabled: boolean) => void) { onCheckboxChange(verticalGridCheckbox, cb); },
      };
    },
  };
}
