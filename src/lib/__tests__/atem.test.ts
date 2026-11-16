import { describe, expect, it } from 'vitest';
import {
  generateAtemAnimatedMacrosXml,
  generateAtemStaticMacroXml,
  generateCompanionPageConfig,
  generateJustMacrosLua,
  parseAtemMacroXml,
} from '../atemGenerators';
import {
  atemToCanvasPosition,
  computeAtemPosition,
  getBoxesInDrawOrder,
} from '../atemMath';
import { DEFAULT_ATEM_SETTINGS, createDefaultBoxes } from '../constants';

describe('atemMath', () => {
  it('converts between 768x432 canvas pixels and ATEM (-16..16, -9..9) coordinates', () => {
    expect(computeAtemPosition(384, 216)).toEqual({ atemX: 0, atemY: 0 });
    expect(computeAtemPosition(0, 0)).toEqual({ atemX: -16, atemY: 9 });
    expect(computeAtemPosition(768, 432)).toEqual({ atemX: 16, atemY: -9 });
    expect(computeAtemPosition(192, 108)).toEqual({ atemX: -8, atemY: 4.5 });
    expect(computeAtemPosition(480, 264)).toEqual({ atemX: 4, atemY: -2 });

    expect(atemToCanvasPosition(-8, 4.5)).toEqual({ x: 192, y: 108 });
    expect(atemToCanvasPosition(4, -2)).toEqual({ x: 480, y: 264 });
  });

  it('orders ATEM boxes with Box 1 on top (drawn last) and limits to 4 boxes', () => {
    const boxes = createDefaultBoxes();
    boxes[1].enabled = true; // Box 2
    boxes[4].enabled = true; // Box 5 (vMix only)

    const atemOrder = getBoxesInDrawOrder(boxes, 'atem');
    expect(atemOrder.map((b) => b.id)).toEqual([2, 1]);

    const vmixOrder = getBoxesInDrawOrder(boxes, 'vmix');
    expect(vmixOrder.map((b) => b.id)).toEqual([1, 2, 5]);
  });
});

describe('atemGenerators', () => {
  it('generates ATEM static V2 macro XML respecting superSource and setInputSources', () => {
    const boxes = createDefaultBoxes();
    boxes[0].x = 192;
    boxes[0].y = 108;
    boxes[0].cropLeft = 4;
    boxes[0].cropRight = 2;
    boxes[0].cropTop = 1;
    boxes[0].cropBottom = 3;
    boxes[0].atemSource = 'Camera5';
    boxes[1].enabled = true;

    const xmlWithInput = generateAtemStaticMacroXml(boxes, {
      ...DEFAULT_ATEM_SETTINGS,
      macroName: 'Host + Guest',
      macroIndex: 7,
      superSource: 2,
      setInputSources: true,
    });

    expect(xmlWithInput).toContain('<Macro index="7" name="Host + Guest"');
    expect(xmlWithInput).toContain('superSource="1" boxIndex="0" input="Camera5"');
    expect(xmlWithInput).toContain('xPosition="-8"');
    expect(xmlWithInput).toContain('yPosition="4.5"');
    expect(xmlWithInput).toContain('left="4"');
    expect(xmlWithInput).toContain('top="1"');
    expect(xmlWithInput).toContain('right="2"');
    expect(xmlWithInput).toContain('bottom="3"');
    expect(xmlWithInput).toContain('boxIndex="2" enable="False"');

    const xmlNoInput = generateAtemStaticMacroXml(boxes, {
      ...DEFAULT_ATEM_SETTINGS,
      setInputSources: false,
    });
    expect(xmlNoInput).not.toContain('SuperSourceV2BoxInput');
  });

  it('generates 8 animated macros (92..99) with 8 interpolation steps', () => {
    const boxes = createDefaultBoxes();
    boxes[0].x = 480;
    boxes[0].y = 264;
    boxes[0].cropLeft = 2;
    boxes[0].cropRight = 3;

    const animatedXml = generateAtemAnimatedMacrosXml(boxes, {
      ...DEFAULT_ATEM_SETTINGS,
      macroName: 'Panel Layout',
      superSource: 2,
    });

    for (let idx = 92; idx <= 99; idx++) {
      expect(animatedXml).toContain(`<Macro index="${idx}"`);
    }
    expect(animatedXml).toContain('description="Panel Layout"');
    expect(animatedXml).toContain('superSource="1"');
    expect(animatedXml).toContain('<Op id="MacroSleep" frames="1" />');
    expect(animatedXml).toContain('left="1.75"');
    expect(animatedXml).toContain('right="2.63"');
  });

  it('generates valid Companion page JSON config and JustMacros Lua snippet', () => {
    const boxes = createDefaultBoxes();
    boxes[0].atemSource = 'MediaPlayer1';

    const companion = generateCompanionPageConfig(boxes, {
      ...DEFAULT_ATEM_SETTINGS,
      macroName: 'Studio Split',
      superSource: 2,
    });
    expect(companion.version).toBe(2);
    expect(companion.type).toBe('page');
    expect((companion.page as { name: string }).name).toBe('Studio Split');
    const actions = companion.actions as Record<string, Array<{ options: Record<string, unknown> }>>;
    expect(actions['2'][0].options.input).toBe(6001);
    expect(actions['10'][0].options.macro).toBe(92);
    expect(actions['10'][1].options.input).toBe(3010);

    const lua = generateJustMacrosLua(boxes, 'Two Up', 4);
    expect(lua).toContain('elseif layout == 4 then');
    expect(lua).toContain('layoutname = "Two Up";');
    expect(lua).toContain('SetBox(1, 0.5, 0, 0, 0, 0, 0, 0);');
  });

  it('parses ATEM SuperSource V2 Macro XML round-trip and rejects invalid or V1 macros', () => {
    const boxes = createDefaultBoxes();
    boxes[0].x = 480;
    boxes[0].y = 264;
    boxes[0].size = 0.75;
    boxes[0].cropLeft = 2;
    boxes[0].cropRight = 3;
    boxes[0].cropTop = 1;
    boxes[0].cropBottom = 4;
    boxes[0].atemSource = 'Camera5';
    boxes[1].enabled = true;
    boxes[1].x = 240;
    boxes[1].y = 144;
    boxes[1].size = 0.4;

    const generated = generateAtemStaticMacroXml(boxes, {
      ...DEFAULT_ATEM_SETTINGS,
      macroName: 'RoundTrip Test',
      macroIndex: 12,
      superSource: 2,
    });

    const parsed = parseAtemMacroXml(generated);
    expect(parsed.ok).toBe(true);
    expect(parsed.macroName).toBe('RoundTrip Test');
    expect(parsed.macroIndex).toBe(12);
    expect(parsed.superSource).toBe(2);
    expect(parsed.boxPatches[1]).toMatchObject({
      enabled: true,
      x: 480,
      y: 264,
      size: 0.75,
      cropLeft: 2,
      cropRight: 3,
      cropTop: 1,
      cropBottom: 4,
      linkX: false,
      linkY: false,
      atemSource: 'Camera5',
    });
    expect(parsed.boxPatches[2]).toMatchObject({
      enabled: true,
      x: 240,
      y: 144,
      size: 0.4,
      linkX: true,
      linkY: true,
    });
    expect(parsed.boxPatches[3]).toEqual({ enabled: false });

    expect(parseAtemMacroXml('   ')).toEqual({ ok: false, error: 'EMPTY', boxPatches: {} });
    expect(parseAtemMacroXml('<Op id="Foo" />')).toEqual({
      ok: false,
      error: 'NO_MACRO_TAG',
      boxPatches: {},
    });
    expect(
      parseAtemMacroXml(
        '<Macro index="0" name="V1"><Op id="SuperSourceBoxEnable" boxIndex="0" enable="True" /></Macro>',
      ),
    ).toEqual({ ok: false, error: 'NO_V2_OPS', boxPatches: {} });
  });
});
