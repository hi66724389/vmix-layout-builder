# Broadcast Layout Builder (ATEM SuperSource & vMix)

Interactive 16:9 visual layout designer for **Blackmagic ATEM SuperSource** macros and **vMix Virtual Set / Layers (MultiView)**.

## Features

- **Dual Mode Switcher (`?mode=atem` / `?mode=vmix`)**: Switch seamlessly between **ATEM SuperSource** (4 foreground-to-background boxes) and **vMix Virtual Set** (9 layers).
- **16:9 Interactive Canvas (`768×432`)**: Drag boxes directly on the canvas with live coordinate readouts, optional custom background reference image, and arrow-key nudging (`Shift + Arrow` = 10px, `Alt + Drag` = 1px).
- **Drag Precision & Broadcast Guides**: Switch between `Very precise (1px)`, `Medium (16:9)`, and `Coarse (16:9)` snapping, plus crisp SVG overlays (`Center`, `Center + GFX`, `Center + Action safe`, `4x4`, `8x8`, `16x9`, `16x16`, `32x18`).
- **Position, Size, Crop & Source**: Adjust `X/Y`, uniform `Size`, `Left/Right` (`0–16` / `32`) and `Top/Bottom` (`0–9` / `18`) cropping with chain-link toggles, `Copy / Paste` across boxes, and ATEM `SOURCE` assignment (`Camera 1–12`, `Color 1–2`, `Media Player 1–4`).
- **ATEM SuperSource Exports & Importer**:
  - **ATEM SuperSource Macro XML**: Static SuperSource V2 `<Macro>` generator with `SuperSource 1/2` and `Set input sources` options.
  - **Import Macro**: Paste any existing ATEM SuperSource V2 `<Macro>` XML to edit visually on the canvas.
  - **ATEM Animated Macros + Companion Page**: Generates 8 transition macros (indices `92–99`) and a `.companionconfig` page export.
  - **JustMacros Lua**: Generates `SetBox(...)` script snippets.
- **vMix Exports**:
  - **vMix Virtual Set (`.zip`)**: Generates `config.xml`, `back.png` (`1920×1080`), and `1.png`–`9.png` placeholders for enabled boxes.
  - **vMix Layers / Multiview (`.zip`)**: Generates 10-layer `<ArrayOfMatrixPosition>` `vMixLayout.xml` encoded as UTF-16LE with BOM.
- **PNG Snapshot & Presets**: Built-in broadcast layout presets, `繁中 / EN` language switch, and clean `768×432` PNG export.

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — Start development server
- `npm test` — Run unit tests (Vitest)
- `npm run build` — Type-check and build production bundle
