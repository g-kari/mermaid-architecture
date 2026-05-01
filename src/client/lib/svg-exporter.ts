import type { CanvasData } from "../types";

const CSS_VARS_TO_RESOLVE = [
  "--node-body",
  "--node-border",
  "--node-selected-border",
  "--edge-color",
  "--edge-selected",
  "--edge-label",
  "--port-color",
  "--port-target",
  "--text",
  "--grid-color",
  "--bg-canvas",
  "--bg-input",
  "--border-strong",
];

const PADDING = 40;

function computeContentBounds(data: CanvasData): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  const groupPadding = 24;
  const groupHeaderHeight = 28;

  const allRects: { x: number; y: number; w: number; h: number }[] = [];

  for (const node of data.nodes) {
    allRects.push({ x: node.x, y: node.y, w: node.width, h: node.height });
  }

  for (const group of data.groups) {
    const childNodes = data.nodes.filter(
      (n) => n.group === group.id || group.children.includes(n.id),
    );
    if (childNodes.length === 0) {
      if (group.x != null && group.y != null) {
        allRects.push({
          x: group.x,
          y: group.y,
          w: group.width ?? 300,
          h: group.height ?? 200,
        });
      }
      continue;
    }

    const minX = Math.min(...childNodes.map((n) => n.x)) - groupPadding;
    const minY = Math.min(...childNodes.map((n) => n.y)) - groupPadding - groupHeaderHeight;
    const maxX = Math.max(...childNodes.map((n) => n.x + n.width)) + groupPadding;
    const maxY = Math.max(...childNodes.map((n) => n.y + n.height)) + groupPadding;
    allRects.push({ x: minX, y: minY, w: maxX - minX, h: maxY - minY });
  }

  if (allRects.length === 0) {
    return { x: 0, y: 0, width: 400, height: 300 };
  }

  const minX = Math.min(...allRects.map((r) => r.x));
  const minY = Math.min(...allRects.map((r) => r.y));
  const maxX = Math.max(...allRects.map((r) => r.x + r.w));
  const maxY = Math.max(...allRects.map((r) => r.y + r.h));

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function getComputedCssVars(element: Element): Map<string, string> {
  const computed = getComputedStyle(element);
  const resolved = new Map<string, string>();
  for (const varName of CSS_VARS_TO_RESOLVE) {
    const value = computed.getPropertyValue(varName).trim();
    if (value) {
      resolved.set(varName, value);
    }
  }
  return resolved;
}

function resolveCssVarsInAttribute(value: string, vars: Map<string, string>): string {
  return value.replace(/var\(([^)]+)\)/g, (_match, varName: string) => {
    const trimmed = varName.trim();
    return vars.get(trimmed) ?? _match;
  });
}

function resolveCssVarsInElement(el: Element, vars: Map<string, string>): void {
  for (const attr of Array.from(el.attributes)) {
    if (attr.value.includes("var(")) {
      el.setAttribute(attr.name, resolveCssVarsInAttribute(attr.value, vars));
    }
  }

  if (el instanceof HTMLElement || el instanceof SVGElement) {
    const style = el.getAttribute("style");
    if (style?.includes("var(")) {
      el.setAttribute("style", resolveCssVarsInAttribute(style, vars));
    }
  }

  for (const child of Array.from(el.children)) {
    resolveCssVarsInElement(child, vars);
  }
}

function removeInteractiveElements(svg: SVGSVGElement): void {
  // Remove connection port circles (fill="var(--port-color)" or fill="var(--port-target)")
  // After CSS var resolution these will have the actual hex values
  const circles = svg.querySelectorAll("circle");
  for (const circle of circles) {
    circle.remove();
  }

  // Remove edge hit areas (transparent stroke paths used for click detection)
  const paths = svg.querySelectorAll('path[stroke="transparent"]');
  for (const path of paths) {
    path.remove();
  }

  // Remove EdgeCreator preview (dashed path with pointer-events="none" and opacity="0.7")
  const previewPaths = svg.querySelectorAll('path[pointer-events="none"]');
  for (const path of previewPaths) {
    path.remove();
  }

  // Remove remote cursors (g elements with pointer-events="none" that contain cursor shapes)
  const groups = svg.querySelectorAll('g[pointer-events="none"]');
  for (const group of groups) {
    group.remove();
  }

  // Remove inline editing inputs inside foreignObject
  const foreignObjects = svg.querySelectorAll("foreignObject");
  for (const fo of foreignObjects) {
    if (fo.querySelector("input")) {
      fo.remove();
    }
  }
}

async function embedImages(svg: SVGSVGElement): Promise<void> {
  const images = svg.querySelectorAll("image");
  const cache = new Map<string, string>();

  const fetches: Promise<void>[] = [];
  for (const img of images) {
    const href =
      img.getAttribute("href") || img.getAttributeNS("http://www.w3.org/1999/xlink", "href");
    if (!href || href.startsWith("data:")) continue;

    if (!cache.has(href)) {
      cache.set(href, "");
      fetches.push(
        fetch(href)
          .then(async (res) => {
            if (!res.ok) throw new Error(`${res.status}`);
            const contentType = res.headers.get("content-type") || "";
            if (contentType.includes("svg") || href.endsWith(".svg")) {
              const svgText = await res.text();
              return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgText)))}`;
            }
            const buf = await res.arrayBuffer();
            const bytes = new Uint8Array(buf);
            let binary = "";
            for (const b of bytes) binary += String.fromCharCode(b);
            const mime = contentType.split(";")[0] || "image/png";
            return `data:${mime};base64,${btoa(binary)}`;
          })
          .then((dataUri) => {
            cache.set(href, dataUri);
          })
          .catch((err) => {
            console.warn(`[svg-exporter] Failed to embed image: ${href}`, err);
            cache.delete(href);
          }),
      );
    }
  }

  await Promise.all(fetches);

  for (const img of images) {
    const href =
      img.getAttribute("href") || img.getAttributeNS("http://www.w3.org/1999/xlink", "href");
    if (!href || href.startsWith("data:")) continue;
    const dataUri = cache.get(href);
    if (dataUri) {
      img.setAttribute("href", dataUri);
      img.removeAttributeNS("http://www.w3.org/1999/xlink", "href");
    }
  }
}

function removeGridBackground(svg: SVGSVGElement): void {
  const patterns = svg.querySelectorAll("pattern#grid");
  for (const pattern of patterns) {
    pattern.remove();
  }

  const rects = svg.querySelectorAll('rect[fill="url(#grid)"]');
  for (const rect of rects) {
    rect.remove();
  }
}

export async function exportSvg(svgElement: SVGSVGElement, data: CanvasData): Promise<string> {
  const vars = getComputedCssVars(svgElement);
  const clone = svgElement.cloneNode(true) as SVGSVGElement;

  removeGridBackground(clone);
  removeInteractiveElements(clone);
  resolveCssVarsInElement(clone, vars);

  const markers = clone.querySelectorAll("marker");
  for (const marker of markers) {
    resolveCssVarsInElement(marker, vars);
  }

  await embedImages(clone);

  const bounds = computeContentBounds(data);
  const vbX = bounds.x - PADDING;
  const vbY = bounds.y - PADDING;
  const vbW = bounds.width + PADDING * 2;
  const vbH = bounds.height + PADDING * 2;
  clone.setAttribute("viewBox", `${vbX} ${vbY} ${vbW} ${vbH}`);
  clone.setAttribute("width", String(vbW));
  clone.setAttribute("height", String(vbH));
  clone.removeAttribute("class");

  const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  bgRect.setAttribute("x", String(vbX));
  bgRect.setAttribute("y", String(vbY));
  bgRect.setAttribute("width", String(vbW));
  bgRect.setAttribute("height", String(vbH));
  bgRect.setAttribute("fill", "white");
  const defs = clone.querySelector("defs");
  if (defs?.nextSibling) {
    clone.insertBefore(bgRect, defs.nextSibling);
  } else {
    clone.insertBefore(bgRect, clone.firstChild);
  }

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(clone);

  return `<?xml version="1.0" encoding="UTF-8"?>\n${svgString}`;
}

export async function exportPng(
  svgElement: SVGSVGElement,
  data: CanvasData,
  scale = 2,
): Promise<Blob> {
  const svgString = await exportSvg(svgElement, data);
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth * scale;
      canvas.height = img.naturalHeight * scale;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas 2D context not available"));
        return;
      }

      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      canvas.toBlob((pngBlob) => {
        if (pngBlob) {
          resolve(pngBlob);
        } else {
          reject(new Error("PNG conversion failed"));
        }
      }, "image/png");
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("SVG image loading failed"));
    };

    img.src = url;
  });
}

export function downloadPng(pngBlob: Blob, filename = "architecture.png"): void {
  const url = URL.createObjectURL(pngBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadSvg(svgString: string, filename = "diagram.svg"): void {
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
