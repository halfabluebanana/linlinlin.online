# Browser frame (ono-mato-dada embed)

## What was wrong?

1. **Blank iframe in Chrome / Dia**  
   The slot (and iframe) used **percentage height** while the parent used **`aspect-ratio` only** or **`height: 0` + `padding-bottom`**. In Chromium, the **containing block height** for absolutely positioned children often resolved to **0**, so the iframe had **no height** and looked empty.

2. **Safari vs Chrome differences**  
   Same **percentage** + **ambiguous parent height** problem, plus **SVG-only** shadows and **`overflow`** could hide or clip shadows.

## Fix

- Wrap the chrome + iframe in **`.browser-frame__inner`** with **`position: relative`**.
- Put the frame SVG in **normal document flow** (`<img width="960" height="620">`, `width: 100%; height: auto`).
- **`syncBrowserFrameSlot()`** (inline script on `ono-mato-dada.html`) measures **`inner.offsetWidth/offsetHeight`** and sets **`top` / `width` / `height` in pixels** on `.browser-frame__slot`, with **ResizeObserver** + **resize** + **image load**. That avoids engines that still mis-resolve **% height** on abspos children.
- CSS keeps **`calc()`** values as a **no-JS / first-paint** fallback; inline px from JS override them.

## Shadow

**None** on **`.browser-frame`** (no `box-shadow` / `filter` on the embed). The wireframe SVG **must not** use a full-canvas **`#F2F2F2`** rect behind the chrome — that had read as a light strip next to the frame.

## Variants

Add **`browser-frame--blue`** on **`#standaloneVersion`** (`.browser-frame`). The inline script sets the single chrome `<img>` to the blue or wireframe SVG on load.

## Iframe URL

`iframe.src` is set with **`new URL(relative, document.baseURI)`** so the standalone app resolves correctly from any path (localhost, Netlify, subpaths).

## Single chrome image

There is **one** `<img>` for the frame art (not two hidden images) so the inner box height always equals that image—no stacked duplicate layout in Safari/Chrome/Dia.
