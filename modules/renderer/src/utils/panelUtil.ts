import { AlignType } from '@/stores/alignState';

const minSize = { width: 320, height: 200 };
const fold = (v: number, min: number, max: number) => v < min ? min : v > max ? max : v;
const downMoveUp = (e: MouseEvent, move: (delta: Point) => void, up?: (e: MouseEvent) => void) => {
  const down = { x: e.clientX, y: e.clientY };
  const _move = (e: MouseEvent) => move({ x: e.clientX - down.x, y: e.clientY - down.y });
  const _up = (e: MouseEvent) => {
    if (up) up(e);
    window.removeEventListener('mousemove', _move);
    window.removeEventListener('mouseup', _up);
  };
  window.addEventListener('mousemove', _move);
  window.addEventListener('mouseup', _up);
};
export const setDrag = (e: MouseEvent, target: HTMLElement | null, afterDrag: () => void) => {
  if (!target) return;
  const offsetParent = target.offsetParent as HTMLElement;
  if (!offsetParent) return;
  const start = { x: target.offsetLeft, y: target.offsetTop };
  const min = { x: 100 - target.offsetWidth, y: 0 };
  const max = { x: offsetParent.offsetWidth - 100, y: offsetParent.offsetHeight - 100 };
  const drag = (delta: Point) => {
    target.style.left = fold(start.x + delta.x, min.x, max.x) + 'px';
    target.style.top =  fold(start.y + delta.y, min.y, max.y) + 'px';
  };
  downMoveUp(e, drag, afterDrag);
};
export const setResize = (e: MouseEvent, target: HTMLElement | null, afterResize: () => void) => {
  if (!target) return;
  const panel = target.parentElement!.parentElement!;
  const start = { width: target.offsetWidth, height: target.offsetHeight };
  const resize = (delta: Point) => {
    const width = fold(start.width + delta.x, minSize.width, window.innerWidth);
    target.style.width = width + 'px';
    panel.style.width = (width + 6) + 'px';
    target.style.height =  fold(start.height + delta.y, minSize.height, window.innerHeight) + 'px';
  };
  downMoveUp(e, resize, afterResize);
};

export const alignLogViews = (area: HTMLElement | null, align: AlignType) => {
  if (!area) return;
  const panels = area.querySelectorAll('[terminal-view].log');
  if (align === 'F') {
    let x = 0;
    let y = 0;
    for (const p of panels) {
      const panel = p as HTMLElement;
      panel.style.left = x + 'px';
      panel.style.top = y + 'px';
      x += 32;
      y += 32;
    }
  } else {
    const short = Math.sqrt(panels.length) >> 0;
    const rest = panels.length - short**2;
    const long = short + Math.ceil(rest / short);
    let h, v;
    if (align === 'V') {
      h = long;
      v = short;
    } else {
      h = short;
      v = long;
    }
    const width = (area.offsetWidth / h) >> 0;
    const height = (area.offsetHeight / v) >> 0;

    let i = 0;
    for (const p of panels) {
      const panel = p as HTMLElement;
      setPanelSize(width, height, panel);
      const l = i % h;
      const t = (i / h) >> 0;
      panel.style.left = l * width + 'px';
      panel.style.top = t * height + 'px';
      i += 1;
    }
  }
};

let shellOffset = 0;
export const setSinglePosition = (panel: HTMLElement | null) => {
  if (!panel) return;
  const parent = panel.offsetParent as HTMLElement;
  if (!parent) return;
  if (parent.querySelectorAll('[terminal-view].shell').length === 1) shellOffset = 0;
  const width = parent.offsetWidth >> 1;
  const height = parent.offsetHeight >> 1;
  setPanelSize(width, height, panel);
  panel.style.left = (width >> 1) + shellOffset + 'px';
  panel.style.top = (height >> 1) + shellOffset + 'px';
  shellOffset += 32;
};

export const setMaximize = (panel: HTMLElement | null) => {
  if (!panel) return;
  const parent = panel.offsetParent as HTMLElement;
  if (!parent) return;
  const width = parent.offsetWidth;
  const height = parent.offsetHeight;
  setPanelSize(width, height, panel);
  panel.style.left = '0px';
  panel.style.top = '0px';
};

const setPanelSize = (width: number, height: number, panel:HTMLElement) => {
  const box = panel.querySelector('.box') as HTMLElement;
  const boxWidth = width - 6;
  const boxHeight = height - 35;
  box.style.width = boxWidth + 'px';
  box.style.height = boxHeight + 'px';
  panel.style.width = width + 'px';
};