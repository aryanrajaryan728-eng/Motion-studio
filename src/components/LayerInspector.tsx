import React from 'react';
import {
  Sliders,
  Type,
  Sparkles,
  Layers,
  Square,
  Activity,
  Palette,
  Diamond,
  Blend,
} from 'lucide-react';
import { Layer, BlendMode } from '../types/editor';

interface LayerInspectorProps {
  layer: Layer | null;
  onUpdateLayer: (updated: Layer) => void;
  onOpenCurveEditor: () => void;
  onAddKeyframe: () => void;
}

export const LayerInspector: React.FC<LayerInspectorProps> = ({
  layer,
  onUpdateLayer,
  onOpenCurveEditor,
  onAddKeyframe,
}) => {
  if (!layer) {
    return (
      <div className="w-80 border-l border-slate-800 bg-slate-950 p-6 flex flex-col items-center justify-center text-center text-slate-500 text-xs">
        <Layers className="w-8 h-8 mb-2 opacity-30 text-indigo-400" />
        <p className="font-semibold text-slate-400">No Layer Selected</p>
        <p className="mt-1 text-slate-600 text-[11px]">
          Click any clip on the canvas or timeline to edit its keyframes, motion curves, and visual styling.
        </p>
      </div>
    );
  }

  const handleTransformChange = (
    key: 'positionX' | 'positionY' | 'scale' | 'rotation' | 'opacity',
    val: number
  ) => {
    onUpdateLayer({
      ...layer,
      [key]: val,
    });
  };

  const blendModes: BlendMode[] = [
    'normal',
    'screen',
    'multiply',
    'overlay',
    'difference',
    'color-dodge',
  ];

  return (
    <div className="w-80 border-l border-slate-800 bg-slate-950 overflow-y-auto flex flex-col text-xs text-slate-300 select-none">
      {/* Header */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
        <div className="flex items-center gap-2 truncate">
          <Sliders className="w-4 h-4 text-cyan-400 shrink-0" />
          <input
            type="text"
            value={layer.name}
            onChange={(e) => onUpdateLayer({ ...layer, name: e.target.value })}
            className="bg-transparent font-bold text-white text-xs truncate focus:bg-slate-800 px-1 py-0.5 rounded outline-none"
          />
        </div>
        <span className="text-[10px] font-mono text-slate-500 uppercase px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800">
          {layer.type}
        </span>
      </div>

      <div className="p-4 flex flex-col gap-5">
        {/* Keyframe & Curve Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onAddKeyframe}
            className="flex-1 py-1.5 px-2 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/40 text-indigo-300 font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <Diamond className="w-3.5 h-3.5 fill-current text-indigo-400" />
            Add Keyframe
          </button>
          <button
            onClick={onOpenCurveEditor}
            className="flex-1 py-1.5 px-2 bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/40 text-cyan-300 font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            Curve Editor
          </button>
        </div>

        {/* 1. Transform Section */}
        <div className="flex flex-col gap-3">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3 h-3 text-cyan-400" />
            Transform
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Position X (%)</label>
              <input
                type="number"
                value={layer.positionX}
                onChange={(e) => handleTransformChange('positionX', parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono-nums"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Position Y (%)</label>
              <input
                type="number"
                value={layer.positionY}
                onChange={(e) => handleTransformChange('positionY', parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono-nums"
              />
            </div>
          </div>

          {/* Scale Slider */}
          <div>
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>Scale</span>
              <span className="font-mono-nums">{(layer.scale * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="2.5"
              step="0.05"
              value={layer.scale}
              onChange={(e) => handleTransformChange('scale', parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Rotation Slider */}
          <div>
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>Rotation</span>
              <span className="font-mono-nums">{layer.rotation}°</span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              step="1"
              value={layer.rotation}
              onChange={(e) => handleTransformChange('rotation', parseInt(e.target.value, 10))}
              className="w-full accent-indigo-400 cursor-pointer"
            />
          </div>

          {/* Opacity Slider */}
          <div>
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>Opacity</span>
              <span className="font-mono-nums">{(layer.opacity * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={layer.opacity}
              onChange={(e) => handleTransformChange('opacity', parseFloat(e.target.value))}
              className="w-full accent-pink-400 cursor-pointer"
            />
          </div>

          {/* Blend Mode */}
          <div>
            <label className="text-[10px] text-slate-500 block mb-1 flex items-center gap-1">
              <Blend className="w-3 h-3 text-slate-400" />
              Blend Mode
            </label>
            <select
              value={layer.blendMode}
              onChange={(e) => onUpdateLayer({ ...layer, blendMode: e.target.value as BlendMode })}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 capitalize font-medium"
            >
              {blendModes.map((bm) => (
                <option key={bm} value={bm}>
                  {bm}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. Specific Configurations based on Type */}

        {/* Kinetic Text Settings */}
        {layer.type === 'kinetic_text' && layer.textConfig && (
          <div className="flex flex-col gap-3 pt-3 border-t border-slate-800/80">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Type className="w-3 h-3 text-cyan-400" />
              Kinetic Typography
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Text Content</label>
              <textarea
                rows={2}
                value={layer.textConfig.text}
                onChange={(e) =>
                  onUpdateLayer({
                    ...layer,
                    textConfig: { ...layer.textConfig!, text: e.target.value },
                  })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white font-display focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Font Size</label>
                <input
                  type="number"
                  value={layer.textConfig.fontSize}
                  onChange={(e) =>
                    onUpdateLayer({
                      ...layer,
                      textConfig: {
                        ...layer.textConfig!,
                        fontSize: parseInt(e.target.value, 10) || 16,
                      },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Text Color</label>
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded p-1">
                  <input
                    type="color"
                    value={layer.textConfig.color}
                    onChange={(e) =>
                      onUpdateLayer({
                        ...layer,
                        textConfig: { ...layer.textConfig!, color: e.target.value },
                      })
                    }
                    className="w-6 h-5 rounded cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-[10px] font-mono text-slate-400">
                    {layer.textConfig.color}
                  </span>
                </div>
              </div>
            </div>

            {/* Neon Glow & Background Box */}
            <div className="flex items-center justify-between py-1">
              <label className="text-[10px] text-slate-400">Background Card</label>
              <input
                type="checkbox"
                checked={layer.textConfig.backgroundBox || false}
                onChange={(e) =>
                  onUpdateLayer({
                    ...layer,
                    textConfig: { ...layer.textConfig!, backgroundBox: e.target.checked },
                  })
                }
                className="accent-indigo-500 rounded"
              />
            </div>
          </div>
        )}

        {/* Motion Banner Settings */}
        {layer.type === 'motion_banner' && layer.bannerConfig && (
          <div className="flex flex-col gap-3 pt-3 border-t border-slate-800/80">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              Motion Banner Styling
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Primary Headline</label>
              <input
                type="text"
                value={layer.bannerConfig.primaryText}
                onChange={(e) =>
                  onUpdateLayer({
                    ...layer,
                    bannerConfig: { ...layer.bannerConfig!, primaryText: e.target.value },
                  })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Secondary Subtext</label>
              <input
                type="text"
                value={layer.bannerConfig.secondaryText || ''}
                onChange={(e) =>
                  onUpdateLayer({
                    ...layer,
                    bannerConfig: { ...layer.bannerConfig!, secondaryText: e.target.value },
                  })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Accent Glow</label>
                <input
                  type="color"
                  value={layer.bannerConfig.accentColor}
                  onChange={(e) =>
                    onUpdateLayer({
                      ...layer,
                      bannerConfig: { ...layer.bannerConfig!, accentColor: e.target.value },
                    })
                  }
                  className="w-full h-7 rounded bg-slate-900 border border-slate-800 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Badge Tag</label>
                <input
                  type="text"
                  value={layer.bannerConfig.badgeText || ''}
                  onChange={(e) =>
                    onUpdateLayer({
                      ...layer,
                      bannerConfig: { ...layer.bannerConfig!, badgeText: e.target.value },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* VFX Filter Settings */}
        {layer.type === 'vfx_filter' && layer.vfxConfig && (
          <div className="flex flex-col gap-3 pt-3 border-t border-slate-800/80">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3 h-3 text-pink-400" />
              Visual Effects &amp; Color Grading
            </div>

            {/* Glitch Intensity */}
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>Glitch &amp; Waveform Pulse</span>
                <span className="font-mono-nums">{layer.vfxConfig.glitch}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={layer.vfxConfig.glitch}
                onChange={(e) =>
                  onUpdateLayer({
                    ...layer,
                    vfxConfig: { ...layer.vfxConfig!, glitch: parseInt(e.target.value, 10) },
                  })
                }
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Camera Shake */}
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>Camera Shake (Bass Drop)</span>
                <span className="font-mono-nums">{layer.vfxConfig.cameraShake}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={layer.vfxConfig.cameraShake}
                onChange={(e) =>
                  onUpdateLayer({
                    ...layer,
                    vfxConfig: {
                      ...layer.vfxConfig!,
                      cameraShake: parseInt(e.target.value, 10),
                    },
                  })
                }
                className="w-full accent-rose-400 cursor-pointer"
              />
            </div>

            {/* LUT Preset */}
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Color Grade LUT</label>
              <select
                value={layer.vfxConfig.lut}
                onChange={(e) =>
                  onUpdateLayer({
                    ...layer,
                    vfxConfig: { ...layer.vfxConfig!, lut: e.target.value as any },
                  })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 capitalize"
              >
                <option value="none">Standard Flat</option>
                <option value="cyberpunk">Cyberpunk Neon</option>
                <option value="teal_orange">Teal &amp; Orange (Blockbuster)</option>
                <option value="warm_vintage">Warm Golden Hour</option>
                <option value="noir">High Contrast Noir</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
