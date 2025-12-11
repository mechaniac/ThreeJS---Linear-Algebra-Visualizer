// src/ui/SidePanel.ts
export interface SidePanel {
  setVector(x: number, y: number, z: number): void;
  onVectorChanged(handler: (x: number, y: number, z: number) => void): void;
}

export function createSidePanel(titleText: string): SidePanel {
  const uiPanel = document.createElement('div');
  uiPanel.id = 'ui-panel';

  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'ui-toggle';
  toggleBtn.textContent = '⮜';
  toggleBtn.onclick = () => {
    const collapsed = uiPanel.classList.toggle('collapsed');
    toggleBtn.textContent = collapsed ? '⮞' : '⮜';
  };

  const title = document.createElement('h2');
  title.id = 'ui-title';
  title.textContent = titleText;

  const row = document.createElement('div');
  row.id = 'vector-label';

  const openBracket = document.createElement('span');
  openBracket.textContent = '[ ';

  const closeBracket = document.createElement('span');
  closeBracket.textContent = ' ]';

  const makeInput = () => {
    const inp = document.createElement('input');
    inp.type = 'number';
    inp.step = '0.1';
    inp.style.width = '60px';
    inp.style.marginRight = '4px';
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

  uiPanel.appendChild(toggleBtn);
  uiPanel.appendChild(title);
  uiPanel.appendChild(row);
  document.body.appendChild(uiPanel);

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
      if (e.key === 'Enter') {
        readAndEmit();
      }
    });
  };

  hook(inputX);
  hook(inputY);
  hook(inputZ);

  return {
    setVector(x: number, y: number, z: number) {
      internalUpdate = true;
      inputX.value = x.toFixed(2);
      inputY.value = y.toFixed(2);
      inputZ.value = z.toFixed(2);
      internalUpdate = false;
    },
    onVectorChanged(handler) {
      changeHandler = handler;
    },
  };
}
