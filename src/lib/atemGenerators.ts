import { ATEM_BOX_COUNT, ATEM_SOURCES, BOX_THEMES } from './constants';
import { computeAtemPosition, atemToCanvasPosition } from './atemMath';
import { clamp, cleanNumber } from './vmixMath';
import { formatXmlNumber } from './xmlGenerators';
import type { AtemExportSettings, BoxConfig } from '../types/layout';

const ANIMATED_MACRO_BASE_INDEX = 92;
const ANIMATION_STEPS = 8;

function escapeXmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeLuaString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function formatAnimNum(value: number): string {
  return cleanNumber(value).toFixed(2);
}

/**
 * Panel 1: Standard ATEM SuperSource V2 static macro XML.
 */
export function generateAtemStaticMacroXml(
  boxes: BoxConfig[],
  settings: AtemExportSettings,
): string {
  const ss = settings.superSource === 2 ? 1 : 0;
  const macroIndex = Math.max(0, Math.min(99, Math.round(settings.macroIndex)));
  const macroName = escapeXmlAttr(settings.macroName.trim() || 'SuperSource Macro');
  const atemBoxes = boxes.slice(0, ATEM_BOX_COUNT);

  const lines: string[] = [
    `<Macro index="${macroIndex}" name="${macroName}" description="Created with vMix &amp; ATEM Layout Builder">`,
  ];

  for (let i = 0; i < ATEM_BOX_COUNT; i++) {
    const box = atemBoxes[i];
    if (!box) continue;

    lines.push(
      `  <Op id="SuperSourceV2BoxEnable" superSource="${ss}" boxIndex="${i}" enable="${box.enabled ? 'True' : 'False'}" />`,
    );

    if (!box.enabled) continue;

    const { atemX, atemY } = computeAtemPosition(box.x, box.y);
    const size = formatXmlNumber(clamp(box.size, 0, 2));

    if (settings.setInputSources) {
      lines.push(
        `  <Op id="SuperSourceV2BoxInput" superSource="${ss}" boxIndex="${i}" input="${escapeXmlAttr(box.atemSource)}" />`,
      );
    }

    lines.push(
      `  <Op id="SuperSourceV2BoxSize" superSource="${ss}" boxIndex="${i}" size="${size}" />`,
      `  <Op id="SuperSourceV2BoxXPosition" superSource="${ss}" boxIndex="${i}" xPosition="${formatXmlNumber(atemX)}" />`,
      `  <Op id="SuperSourceV2BoxYPosition" superSource="${ss}" boxIndex="${i}" yPosition="${formatXmlNumber(atemY)}" />`,
      `  <Op id="SuperSourceV2BoxMaskEnable" superSource="${ss}" boxIndex="${i}" enable="True" />`,
      `  <Op id="SuperSourceV2BoxMaskLeft" superSource="${ss}" boxIndex="${i}" left="${formatXmlNumber(box.cropLeft)}" />`,
      `  <Op id="SuperSourceV2BoxMaskTop" superSource="${ss}" boxIndex="${i}" top="${formatXmlNumber(box.cropTop)}" />`,
      `  <Op id="SuperSourceV2BoxMaskRight" superSource="${ss}" boxIndex="${i}" right="${formatXmlNumber(box.cropRight)}" />`,
      `  <Op id="SuperSourceV2BoxMaskBottom" superSource="${ss}" boxIndex="${i}" bottom="${formatXmlNumber(box.cropBottom)}" />`,
    );
  }

  lines.push('</Macro>');
  return lines.join('\n');
}

function buildSplitToBoxFullMacro(
  targetIdx: number,
  boxes: BoxConfig[],
  ss: number,
  description: string,
): string {
  const macroIndex = ANIMATED_MACRO_BASE_INDEX + targetIdx;
  const boxNum = targetIdx + 1;
  const targetBox = boxes[targetIdx];
  const { atemX, atemY } = computeAtemPosition(targetBox.x, targetBox.y);
  const startSize = clamp(targetBox.size, 0, 2);

  const lines: string[] = [
    `<!-- Split -> Box ${boxNum} full -->`,
    `<Macro index="${macroIndex}" name="Split -> Box ${boxNum} full" description="${escapeXmlAttr(description)}">`,
  ];

  for (let j = 0; j < ATEM_BOX_COUNT; j++) {
    if (j !== targetIdx) {
      lines.push(
        `  <Op id="SuperSourceV2BoxEnable" superSource="${ss}" boxIndex="${j}" enable="False" />`,
      );
    }
  }
  lines.push(
    `  <Op id="SuperSourceV2BoxEnable" superSource="${ss}" boxIndex="${targetIdx}" enable="True" />`,
  );

  for (let step = 1; step <= ANIMATION_STEPS; step++) {
    const t = step / ANIMATION_STEPS;
    const size = startSize + (1 - startSize) * t;
    const left = targetBox.cropLeft * (1 - t);
    const right = targetBox.cropRight * (1 - t);
    const top = targetBox.cropTop * (1 - t);
    const bottom = targetBox.cropBottom * (1 - t);
    const xPos = atemX * (1 - t);
    const yPos = atemY * (1 - t);

    lines.push(
      `  <Op id="SuperSourceV2BoxSize" superSource="${ss}" boxIndex="${targetIdx}" size="${formatAnimNum(size)}" />`,
      `  <Op id="SuperSourceV2BoxMaskLeft" superSource="${ss}" boxIndex="${targetIdx}" left="${formatAnimNum(left)}" />`,
      `  <Op id="SuperSourceV2BoxMaskRight" superSource="${ss}" boxIndex="${targetIdx}" right="${formatAnimNum(right)}" />`,
      `  <Op id="SuperSourceV2BoxMaskTop" superSource="${ss}" boxIndex="${targetIdx}" top="${formatAnimNum(top)}" />`,
      `  <Op id="SuperSourceV2BoxMaskBottom" superSource="${ss}" boxIndex="${targetIdx}" bottom="${formatAnimNum(bottom)}" />`,
      `  <Op id="SuperSourceV2BoxXPosition" superSource="${ss}" boxIndex="${targetIdx}" xPosition="${formatAnimNum(xPos)}" />`,
      `  <Op id="SuperSourceV2BoxYPosition" superSource="${ss}" boxIndex="${targetIdx}" yPosition="${formatAnimNum(yPos)}" />`,
      '  <Op id="MacroSleep" frames="1" />',
    );
  }

  lines.push(
    `  <Op id="SuperSourceV2BoxMaskEnable" superSource="${ss}" boxIndex="${targetIdx}" enable="True" />`,
    `  <Op id="SuperSourceV2BoxMaskLeft" superSource="${ss}" boxIndex="${targetIdx}" left="0" />`,
    `  <Op id="SuperSourceV2BoxMaskTop" superSource="${ss}" boxIndex="${targetIdx}" top="0" />`,
    `  <Op id="SuperSourceV2BoxMaskRight" superSource="${ss}" boxIndex="${targetIdx}" right="0" />`,
    `  <Op id="SuperSourceV2BoxMaskBottom" superSource="${ss}" boxIndex="${targetIdx}" bottom="0" />`,
    '</Macro>',
  );

  return lines.join('\n');
}

function buildBoxFullToSplitMacro(
  targetIdx: number,
  boxes: BoxConfig[],
  ss: number,
  description: string,
): string {
  const macroIndex = ANIMATED_MACRO_BASE_INDEX + ATEM_BOX_COUNT + targetIdx;
  const boxNum = targetIdx + 1;
  const targetBox = boxes[targetIdx];
  const { atemX, atemY } = computeAtemPosition(targetBox.x, targetBox.y);
  const endSize = clamp(targetBox.size, 0, 2);

  const lines: string[] = [
    `<!-- Box ${boxNum} full -> Split -->`,
    `<Macro index="${macroIndex}" name="Box ${boxNum} full -> Split" description="${escapeXmlAttr(description)}">`,
    `  <Op id="SuperSourceV2BoxEnable" superSource="${ss}" boxIndex="${targetIdx}" enable="True" />`,
  ];

  // Restore all other boxes to their split state
  for (let j = 0; j < ATEM_BOX_COUNT; j++) {
    if (j === targetIdx) continue;
    const other = boxes[j];
    const otherPos = computeAtemPosition(other.x, other.y);
    lines.push(
      `  <Op id="SuperSourceV2BoxEnable" superSource="${ss}" boxIndex="${j}" enable="${other.enabled ? 'True' : 'False'}" />`,
      `  <Op id="SuperSourceV2BoxSize" superSource="${ss}" boxIndex="${j}" size="${formatXmlNumber(clamp(other.size, 0, 2))}" />`,
      `  <Op id="SuperSourceV2BoxXPosition" superSource="${ss}" boxIndex="${j}" xPosition="${formatXmlNumber(otherPos.atemX)}" />`,
      `  <Op id="SuperSourceV2BoxYPosition" superSource="${ss}" boxIndex="${j}" yPosition="${formatXmlNumber(otherPos.atemY)}" />`,
      `  <Op id="SuperSourceV2BoxMaskEnable" superSource="${ss}" boxIndex="${j}" enable="True" />`,
      `  <Op id="SuperSourceV2BoxMaskLeft" superSource="${ss}" boxIndex="${j}" left="${formatXmlNumber(other.cropLeft)}" />`,
      `  <Op id="SuperSourceV2BoxMaskTop" superSource="${ss}" boxIndex="${j}" top="${formatXmlNumber(other.cropTop)}" />`,
      `  <Op id="SuperSourceV2BoxMaskRight" superSource="${ss}" boxIndex="${j}" right="${formatXmlNumber(other.cropRight)}" />`,
      `  <Op id="SuperSourceV2BoxMaskBottom" superSource="${ss}" boxIndex="${j}" bottom="${formatXmlNumber(other.cropBottom)}" />`,
    );
  }

  for (let step = 1; step < ANIMATION_STEPS; step++) {
    const t = step / ANIMATION_STEPS;
    const size = 1 + (endSize - 1) * t;
    const left = targetBox.cropLeft * t;
    const right = targetBox.cropRight * t;
    const top = targetBox.cropTop * t;
    const bottom = targetBox.cropBottom * t;
    const xPos = atemX * t;
    const yPos = atemY * t;

    lines.push(
      `  <Op id="SuperSourceV2BoxYPosition" superSource="${ss}" boxIndex="${targetIdx}" yPosition="${formatAnimNum(yPos)}" />`,
      `  <Op id="SuperSourceV2BoxXPosition" superSource="${ss}" boxIndex="${targetIdx}" xPosition="${formatAnimNum(xPos)}" />`,
      `  <Op id="SuperSourceV2BoxMaskLeft" superSource="${ss}" boxIndex="${targetIdx}" left="${formatAnimNum(left)}" />`,
      `  <Op id="SuperSourceV2BoxMaskRight" superSource="${ss}" boxIndex="${targetIdx}" right="${formatAnimNum(right)}" />`,
      `  <Op id="SuperSourceV2BoxMaskTop" superSource="${ss}" boxIndex="${targetIdx}" top="${formatAnimNum(top)}" />`,
      `  <Op id="SuperSourceV2BoxMaskBottom" superSource="${ss}" boxIndex="${targetIdx}" bottom="${formatAnimNum(bottom)}" />`,
      `  <Op id="SuperSourceV2BoxSize" superSource="${ss}" boxIndex="${targetIdx}" size="${formatAnimNum(size)}" />`,
      '  <Op id="MacroSleep" frames="1" />',
    );
  }

  // Final exact target keyframe
  lines.push(
    `  <Op id="SuperSourceV2BoxSize" superSource="${ss}" boxIndex="${targetIdx}" size="${formatXmlNumber(endSize)}" />`,
    `  <Op id="SuperSourceV2BoxXPosition" superSource="${ss}" boxIndex="${targetIdx}" xPosition="${formatXmlNumber(atemX)}" />`,
    `  <Op id="SuperSourceV2BoxYPosition" superSource="${ss}" boxIndex="${targetIdx}" yPosition="${formatXmlNumber(atemY)}" />`,
    `  <Op id="SuperSourceV2BoxMaskEnable" superSource="${ss}" boxIndex="${targetIdx}" enable="True" />`,
    `  <Op id="SuperSourceV2BoxMaskLeft" superSource="${ss}" boxIndex="${targetIdx}" left="${formatXmlNumber(targetBox.cropLeft)}" />`,
    `  <Op id="SuperSourceV2BoxMaskTop" superSource="${ss}" boxIndex="${targetIdx}" top="${formatXmlNumber(targetBox.cropTop)}" />`,
    `  <Op id="SuperSourceV2BoxMaskRight" superSource="${ss}" boxIndex="${targetIdx}" right="${formatXmlNumber(targetBox.cropRight)}" />`,
    `  <Op id="SuperSourceV2BoxMaskBottom" superSource="${ss}" boxIndex="${targetIdx}" bottom="${formatXmlNumber(targetBox.cropBottom)}" />`,
    '</Macro>',
  );

  return lines.join('\n');
}

/**
 * Panel 2: Generate all 8 animated transition macros (indices 92..99).
 */
export function generateAtemAnimatedMacrosXml(
  boxes: BoxConfig[],
  settings: AtemExportSettings,
): string {
  const ss = settings.superSource === 2 ? 1 : 0;
  const description = settings.macroName.trim() || 'SuperSource Macro';
  const atemBoxes = boxes.slice(0, ATEM_BOX_COUNT);

  const chunks: string[] = [];
  for (let i = 0; i < ATEM_BOX_COUNT; i++) {
    chunks.push(buildSplitToBoxFullMacro(i, atemBoxes, ss, description));
  }
  for (let i = 0; i < ATEM_BOX_COUNT; i++) {
    chunks.push(buildBoxFullToSplitMacro(i, atemBoxes, ss, description));
  }
  return chunks.join('\n\n');
}

/**
 * Panel 2 Companion page export (.companionconf JSON v2) referencing macros 92..99.
 */
export function generateCompanionPageConfig(
  boxes: BoxConfig[],
  settings: AtemExportSettings,
): Record<string, unknown> {
  const atemInstanceId = 'atem_switcher';
  const ssrcInputId = settings.superSource === 2 ? 6001 : 6000;
  const pageName = settings.macroName.trim() || 'SuperSource Layout';

  const config: Record<string, unknown> = {
    '1': { style: 'pageup' },
    '2': {
      style: 'png',
      text: 'Super Source',
      size: 'auto',
      alignment: 'center:center',
      pngalignment: 'center:center',
      color: 16777215,
      bgcolor: 0,
      latch: false,
      relative_delay: false,
    },
    '9': { style: 'pagenum' },
    '17': { style: 'pagedown' },
  };

  const actions: Record<string, unknown[]> = {
    '2': [
      {
        id: 'ssrc-pgm',
        label: `${atemInstanceId}:program`,
        instance: atemInstanceId,
        action: 'program',
        options: { mixeffect: 0, input: ssrcInputId },
        delay: 0,
      },
      {
        id: 'ssrc-split-run',
        label: `${atemInstanceId}:macrorun`,
        instance: atemInstanceId,
        action: 'macrorun',
        options: { macro: ANIMATED_MACRO_BASE_INDEX + ATEM_BOX_COUNT, action: 'run' },
        delay: 100,
      },
    ],
  };

  const releaseActions: Record<string, unknown[]> = {};
  const feedbacks: Record<string, unknown[]> = {
    '2': [
      {
        id: 'ssrc-tally',
        type: 'program_tally',
        instance_id: atemInstanceId,
        options: { fg: 16777215, bg: 16711680, input: ssrcInputId },
      },
    ],
  };

  for (let slot = 1; slot <= 32; slot++) {
    releaseActions[String(slot)] = [];
  }

  for (let i = 0; i < ATEM_BOX_COUNT; i++) {
    const box = boxes[i];
    const theme = BOX_THEMES[i];
    const sourceMeta = ATEM_SOURCES.find((s) => s.value === box.atemSource) ?? ATEM_SOURCES[i];
    const fullBank = String(10 + i);
    const splitBank = String(18 + i);

    config[fullBank] = {
      style: 'png',
      text: `Box ${i + 1}\\nFull`,
      size: 'auto',
      alignment: 'center:center',
      pngalignment: 'center:center',
      color: 16777215,
      bgcolor: theme.companionRgbInt,
      latch: false,
      relative_delay: false,
    };

    actions[fullBank] = [
      {
        id: `box${i + 1}-full`,
        label: `${atemInstanceId}:macrorun`,
        instance: atemInstanceId,
        action: 'macrorun',
        options: { macro: ANIMATED_MACRO_BASE_INDEX + i, action: 'run' },
        delay: 0,
      },
      {
        id: `box${i + 1}-pgm`,
        label: `${atemInstanceId}:program`,
        instance: atemInstanceId,
        action: 'program',
        options: { mixeffect: 0, input: sourceMeta.companionInputId },
        delay: 250,
      },
    ];

    feedbacks[fullBank] = [
      {
        id: `box${i + 1}-tally`,
        type: 'program_tally',
        instance_id: atemInstanceId,
        options: { fg: 16777215, bg: 16711680, input: sourceMeta.companionInputId },
      },
    ];

    config[splitBank] = {
      style: 'png',
      text: `Box ${i + 1}\\nSplit`,
      size: 'auto',
      alignment: 'center:center',
      pngalignment: 'center:center',
      color: 16777215,
      bgcolor: 1973790,
      latch: false,
      relative_delay: false,
    };

    actions[splitBank] = [
      {
        id: `box${i + 1}-split`,
        label: `${atemInstanceId}:macrorun`,
        instance: atemInstanceId,
        action: 'macrorun',
        options: { macro: ANIMATED_MACRO_BASE_INDEX + ATEM_BOX_COUNT + i, action: 'run' },
        delay: 0,
      },
    ];
  }

  return {
    version: 2,
    type: 'page',
    page: { name: pageName },
    instances: {
      [atemInstanceId]: {
        instance_type: 'bmd-atem',
        product: 'ATEM',
        label: 'atem',
        _configIdx: 0,
        modelID: 16,
        presets: 0,
        fadeFps: 10,
        host: '192.168.10.240',
        import_to: atemInstanceId,
      },
      'bitfocus-companion': {
        instance_type: 'bitfocus-companion',
        label: 'internal',
        id: 'bitfocus-companion',
        _configIdx: 2,
      },
    },
    config,
    actions,
    release_actions: releaseActions,
    feedbacks,
  };
}

/**
 * Panel 3: JustMacros Lua SetBox snippet.
 */
export function generateJustMacrosLua(
  boxes: BoxConfig[],
  layoutName: string,
  layoutIndex: number,
): string {
  const safeIndex = Math.max(0, Math.min(99, Math.round(layoutIndex)));
  const safeName = escapeLuaString(layoutName.trim() || 'SuperSource Layout');
  const atemBoxes = boxes.slice(0, ATEM_BOX_COUNT);

  const lines: string[] = [
    `elseif layout == ${safeIndex} then`,
    `  layoutname = "${safeName}";`,
  ];

  for (const box of atemBoxes) {
    if (!box.enabled) continue;
    const { atemX, atemY } = computeAtemPosition(box.x, box.y);
    lines.push(
      `  SetBox(${box.id}, ${formatXmlNumber(clamp(box.size, 0, 2))}, ${formatXmlNumber(atemX)}, ${formatXmlNumber(atemY)}, ${formatXmlNumber(box.cropLeft)}, ${formatXmlNumber(box.cropRight)}, ${formatXmlNumber(box.cropTop)}, ${formatXmlNumber(box.cropBottom)});`,
    );
  }

  return lines.join('\n');
}

export interface ParsedAtemMacroResult {
  ok: boolean;
  error?: string;
  macroName?: string;
  macroIndex?: number;
  superSource?: 1 | 2;
  boxPatches: Record<number, Partial<BoxConfig>>;
}

function parseXmlAttributes(attrText: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const attrRegex = /([A-Za-z_][\w:-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  let match: RegExpExecArray | null;
  while ((match = attrRegex.exec(attrText)) !== null) {
    attrs[match[1]] = match[2] ?? match[3] ?? '';
  }
  return attrs;
}

/**
 * Pure parser for ATEM SuperSource V2 Macro XML (<Macro> + <Op id="SuperSourceV2Box..." />).
 */
export function parseAtemMacroXml(xmlText: string): ParsedAtemMacroResult {
  const trimmed = xmlText.trim();
  if (!trimmed) {
    return { ok: false, error: 'EMPTY', boxPatches: {} };
  }

  const macroMatch = /<Macro\b([^>]*)>/i.exec(trimmed);
  if (!macroMatch) {
    return { ok: false, error: 'NO_MACRO_TAG', boxPatches: {} };
  }

  const macroAttrs = parseXmlAttributes(macroMatch[1]);
  const parsedName = macroAttrs.name;
  const parsedIdxRaw = Number(macroAttrs.index);
  const macroIndex = Number.isFinite(parsedIdxRaw) ? clamp(Math.round(parsedIdxRaw), 0, 99) : undefined;

  const boxPatches: Record<number, Partial<BoxConfig>> = {};
  const atemCoordsByBox: Record<number, { x?: number; y?: number }> = {};
  let detectedSuperSource: 1 | 2 | undefined;
  let matchedV2Ops = 0;

  const opRegex = /<Op\b([^>]*?)\/?>/gi;
  let opMatch: RegExpExecArray | null;
  while ((opMatch = opRegex.exec(trimmed)) !== null) {
    const attrs = parseXmlAttributes(opMatch[1]);
    const id = attrs.id;
    if (!id || !id.startsWith('SuperSourceV2Box')) continue;

    const boxIdx = Number(attrs.boxIndex);
    if (!Number.isInteger(boxIdx) || boxIdx < 0 || boxIdx >= ATEM_BOX_COUNT) continue;
    const boxId = boxIdx + 1;
    matchedV2Ops++;

    if (attrs.superSource === '1') detectedSuperSource = 2;
    else if (attrs.superSource === '0' && !detectedSuperSource) detectedSuperSource = 1;

    if (!boxPatches[boxId]) boxPatches[boxId] = {};
    if (!atemCoordsByBox[boxId]) atemCoordsByBox[boxId] = {};

    switch (id) {
      case 'SuperSourceV2BoxEnable': {
        boxPatches[boxId].enabled = attrs.enable?.toLowerCase() === 'true';
        break;
      }
      case 'SuperSourceV2BoxInput': {
        if (attrs.input) {
          boxPatches[boxId].atemSource = attrs.input;
        }
        break;
      }
      case 'SuperSourceV2BoxSize': {
        const val = Number(attrs.size);
        if (Number.isFinite(val)) {
          boxPatches[boxId].size = cleanNumber(clamp(val, 0, 2));
        }
        break;
      }
      case 'SuperSourceV2BoxXPosition': {
        const val = Number(attrs.xPosition);
        if (Number.isFinite(val)) atemCoordsByBox[boxId].x = val;
        break;
      }
      case 'SuperSourceV2BoxYPosition': {
        const val = Number(attrs.yPosition);
        if (Number.isFinite(val)) atemCoordsByBox[boxId].y = val;
        break;
      }
      case 'SuperSourceV2BoxMaskLeft': {
        const val = Number(attrs.left);
        if (Number.isFinite(val)) boxPatches[boxId].cropLeft = cleanNumber(clamp(val, 0, 32));
        break;
      }
      case 'SuperSourceV2BoxMaskRight': {
        const val = Number(attrs.right);
        if (Number.isFinite(val)) boxPatches[boxId].cropRight = cleanNumber(clamp(val, 0, 32));
        break;
      }
      case 'SuperSourceV2BoxMaskTop': {
        const val = Number(attrs.top);
        if (Number.isFinite(val)) boxPatches[boxId].cropTop = cleanNumber(clamp(val, 0, 18));
        break;
      }
      case 'SuperSourceV2BoxMaskBottom': {
        const val = Number(attrs.bottom);
        if (Number.isFinite(val)) boxPatches[boxId].cropBottom = cleanNumber(clamp(val, 0, 18));
        break;
      }
    }
  }

  if (matchedV2Ops === 0) {
    return { ok: false, error: 'NO_V2_OPS', boxPatches: {} };
  }

  for (const boxIdStr of Object.keys(boxPatches)) {
    const boxId = Number(boxIdStr);
    const coords = atemCoordsByBox[boxId];
    if (coords && (coords.x !== undefined || coords.y !== undefined)) {
      const converted = atemToCanvasPosition(coords.x ?? 0, coords.y ?? 0);
      if (coords.x !== undefined) boxPatches[boxId].x = converted.x;
      if (coords.y !== undefined) boxPatches[boxId].y = converted.y;
    }

    const patch = boxPatches[boxId];
    if (patch.cropLeft !== undefined || patch.cropRight !== undefined) {
      patch.linkX = (patch.cropLeft ?? 0) === (patch.cropRight ?? 0);
    }
    if (patch.cropTop !== undefined || patch.cropBottom !== undefined) {
      patch.linkY = (patch.cropTop ?? 0) === (patch.cropBottom ?? 0);
    }
  }

  return {
    ok: true,
    macroName: parsedName,
    macroIndex,
    superSource: detectedSuperSource,
    boxPatches,
  };
}
