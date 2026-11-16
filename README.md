# vMix Layout Builder

Interactive 16:9 visual layout designer for **vMix Virtual Set** (`config.xml`) and **vMix Layers / MultiView** (`vMixLayout.xml`).

## Features

- **16:9 Interactive Canvas (`768×432`)**: Drag up to 9 layer boxes (`Box 1`–`Box 9`) with live coordinate readout and arrow-key nudging (`Shift + Arrow` = 10px, `Alt + Drag` = 1px).
- **Drag Precision & Broadcast Guides**: Switch between `Very precise (1px)`, `Medium (16:9)`, and `Coarse (16:9)` snapping, plus SVG overlays (`Center`, `Center + GFX`, `Center + Action safe`, `4x4`, `8x8`, `16x9`, `16x16`, `32x18`).
- **Position, Size & Symmetric/Independent Crop**: Adjust `X/Y`, uniform `Size`, and `Left/Right` (`0–16` / `32`) + `Top/Bottom` (`0–9` / `18`) cropping with chain-link toggles and `Copy / Paste` across boxes.
- **Presets & Bilingual UI**: Built-in broadcast layout presets and `繁中 / EN` language switch.
- **vMix Exports**:
  - **vMix Virtual Set (`.zip`)**: Generates `config.xml`, `back.png` (`1920×1080`), and `1.png`–`9.png` placeholders for enabled boxes.
  - **vMix Layers / Multiview (`.zip`)**: Generates 10-layer `<ArrayOfMatrixPosition>` `vMixLayout.xml` encoded as UTF-16LE with BOM.
  - **PNG Snapshot**: Exports a clean `768×432` layout preview image without guides or selection handles.

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — Start development server
- `npm test` — Run unit tests (Vitest)
- `npm run build` — Type-check and build production bundle
